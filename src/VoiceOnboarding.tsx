import { useEffect, useRef, useState } from "react";
import { AudioLines, Mic, Volume2 } from "lucide-react";
import { INDIC_LANGUAGES } from "./languageService";

type Language = { name: string; code: string; locale: string };
type Values = {
  occupation: string; goal: string; hours: string; daysOff: string;
  energy: string; skills: string; location: string; contract: string;
};
type HistoryMessage = { role: "user" | "assistant"; content: string };
type Props = { onComplete: (values: Values, locale: string) => void };
const languages = INDIC_LANGUAGES as Language[];
const empty: Values = {
  occupation: "", goal: "extra", hours: "", daysOff: "",
  energy: "", skills: "", location: "", contract: "unknown"
};

function pcmToBase64(input: Float32Array, sampleRate: number) {
  const ratio = sampleRate / 16000;
  const length = Math.floor(input.length / ratio);
  const pcm = new Int16Array(length);
  for (let i = 0; i < length; i++) {
    const start = Math.floor(i * ratio);
    const end = Math.min(input.length, Math.floor((i + 1) * ratio));
    let sum = 0;
    for (let j = start; j < end; j++) sum += input[j];
    const sample = end > start ? sum / (end - start) : 0;
    pcm[i] = Math.max(-1, Math.min(1, sample)) < 0
      ? Math.max(-32768, Math.round(sample * 32768))
      : Math.min(32767, Math.round(sample * 32767));
  }
  const bytes = new Uint8Array(pcm.buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

export default function VoiceOnboarding({ onComplete }: Props) {
  const [language, setLanguage] = useState<Language | null>(null);
  const [status, setStatus] = useState("Preparing your voice conversation…");
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [thinking, setThinking] = useState(false);
  const [partial, setPartial] = useState("");
  const [lastTranscript, setLastTranscript] = useState("");
  const [englishTranscript, setEnglishTranscript] = useState("");
  const [assistantReply, setAssistantReply] = useState("");
  const [error, setError] = useState("");
  const [configurationMissing, setConfigurationMissing] = useState(false);
  const [retryAvailable, setRetryAvailable] = useState(false);
  const [retryLabel, setRetryLabel] = useState("Retry voice connection");
  const [retryToken, setRetryToken] = useState(0);
  const [profile, setProfile] = useState<Values>(empty);
  const onCompleteRef = useRef(onComplete);
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);
  const socketRef = useRef<WebSocket | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const contextRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const acceptAudioRef = useRef(false);
  const historyRef = useRef<HistoryMessage[]>([]);
  const profileRef = useRef<Values>(empty);
  const completedRef = useRef(false);
  const mountedRef = useRef(true);
  const turnRef = useRef(false);

  useEffect(() => { profileRef.current = profile; }, [profile]);

  useEffect(() => {
    mountedRef.current = true;
    let disposed = false;

    const stopAudioGraph = () => {
      if (processorRef.current) processorRef.current.onaudioprocess = null;
      try { processorRef.current?.disconnect(); } catch {}
      try { sourceRef.current?.disconnect(); } catch {}
      processorRef.current = null;
      sourceRef.current = null;
      if (contextRef.current && contextRef.current.state !== "closed") void contextRef.current.close();
      contextRef.current = null;
      streamRef.current?.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    };

    const playBrowserFallback = (text: string, locale: string, done: () => void) => {
      if (!("speechSynthesis" in window)) {
        setError("This device does not have a supported spoken voice for this language.");
        done();
        return;
      }
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = locale;
      utterance.rate = 0.94;
      utterance.onstart = () => { setSpeaking(true); setStatus("NayaPath is speaking…"); };
      utterance.onend = () => { setSpeaking(false); done(); };
      utterance.onerror = () => {
        setSpeaking(false);
        setError("Your device does not have a voice installed for this language. The original speech and English meaning are still shown.");
        done();
      };
      window.speechSynthesis.speak(utterance);
    };

    const handleTurn = async (transcript: string, locale: string) => {
      if (turnRef.current || disposed) return;
      turnRef.current = true;
      acceptAudioRef.current = false;
      setListening(false);
      setThinking(true);
      setStatus("Understanding what you said…");
      setPartial("");
      setError("");
      try {
        const response = await fetch("/api/voice-turn", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            transcript,
            language: locale,
            history: historyRef.current,
            profile: profileRef.current
          })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "NayaPath could not process that reply.");
        if (disposed) return;

        setLastTranscript(transcript);
        setEnglishTranscript(data.englishTranscript || "");
        setAssistantReply(data.assistantReply || "");
        const nextProfile = { ...profileRef.current, ...(data.profilePatch || {}) };
        profileRef.current = nextProfile;
        setProfile(nextProfile);
        if (data.englishTranscript) historyRef.current.push({ role: "user", content: data.englishTranscript });
        if (data.assistantEnglish) historyRef.current.push({ role: "assistant", content: data.assistantEnglish });
        historyRef.current = historyRef.current.slice(-12);

        if (data.done && !completedRef.current) {
          completedRef.current = true;
          onCompleteRef.current(nextProfile, locale);
        }

        setThinking(false);
        const resume = () => {
          if (disposed || completedRef.current) {
            setStatus("Your first conversation is complete.");
            setListening(false);
            return;
          }
          turnRef.current = false;
          acceptAudioRef.current = true;
          setListening(true);
          setStatus("Listening — speak naturally. I’m here.");
        };

        if (typeof data.audioContent === "string" && data.audioContent.length > 0) {
          const audio = new Audio("data:audio/wav;base64," + data.audioContent);
          audioRef.current = audio;
          setSpeaking(true);
          setStatus("NayaPath is speaking…");
          audio.onended = () => { setSpeaking(false); resume(); };
          audio.onerror = () => { setSpeaking(false); playBrowserFallback(data.assistantReply, locale, resume); };
          try { await audio.play(); }
          catch { setSpeaking(false); playBrowserFallback(data.assistantReply, locale, resume); }
        } else {
          playBrowserFallback(data.assistantReply, locale, resume);
        }
      } catch (err) {
        setThinking(false);
        turnRef.current = false;
        setError(err instanceof Error ? err.message : "The voice assistant could not respond. Please try again.");
        setStatus("I’m ready to listen again.");
        acceptAudioRef.current = true;
        setListening(true);
      }
    };

    const start = async () => {
      setRetryAvailable(false);
      try {
        const configResponse = await fetch("/api/config", { cache: "no-store" });
        if (configResponse.ok) {
          const config = await configResponse.json();
          if (config?.sarvamConfigured === false) {
            setConfigurationMissing(true);
            setListening(false);
            setStatus("Live voice is unavailable in this local demo.");
            setError("SARVAM_API_KEY not set. Add the key to enable live multilingual voice conversations.");
            return;
          }
        }
        if (!navigator.mediaDevices?.getUserMedia) throw new Error("Microphone access requires a secure HTTPS connection and a supported browser.");
        let stream: MediaStream;
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true, autoGainControl: true }
          });
        } catch (permissionError) {
          const name = permissionError instanceof DOMException ? permissionError.name : "";
          setRetryAvailable(true);
          setRetryLabel("Enable Microphone / Retry");
          if (name === "NotAllowedError" || name === "PermissionDeniedError") {
            setError("Microphone permission was dismissed or blocked. Select Enable Microphone / Retry to ask again. If your browser has permanently blocked access, allow the microphone for this site in its address-bar permissions first.");
            setStatus("Waiting for microphone access.");
          } else if (name === "NotFoundError" || name === "DevicesNotFoundError") {
            setError("No microphone was found. Connect or enable a microphone, then select Retry.");
            setStatus("Microphone not found.");
          } else {
            setError(permissionError instanceof Error ? permissionError.message : "Microphone access failed. Select Retry to try again.");
            setStatus("Waiting for microphone access.");
          }
          return;
        }
        if (disposed) { stream.getTracks().forEach(track => track.stop()); return; }
        streamRef.current = stream;

        const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
        const socket = new WebSocket(protocol + "//" + window.location.host + "/api/voice");
        socketRef.current = socket;

        socket.onopen = () => setStatus("Connecting securely to Sarvam live speech…");
        socket.onerror = () => {
          if (!disposed) {
            setListening(false);
            setStatus("Live voice connection unavailable.");
            setError("Could not connect to the live voice service. Check that the API server is running and SARVAM_API_KEY is configured.");
            setRetryAvailable(true);
            setRetryLabel("Retry voice connection");
          }
        };
        socket.onclose = () => {
          if (!disposed && !completedRef.current) {
            setListening(false);
            setStatus("Live voice connection unavailable.");
            setError("The live speech service is not available. Check the server and SARVAM_API_KEY configuration.");
            setRetryAvailable(true);
            setRetryLabel("Retry voice connection");
          }
        };
        socket.onmessage = async (event) => {
          let message: any;
          try { message = JSON.parse(String(event.data)); } catch { return; }
          if (disposed) return;

          if (message.event === "session.ready") {
            const context = new AudioContext();
            await context.resume();
            contextRef.current = context;
            const source = context.createMediaStreamSource(stream);
            const processor = context.createScriptProcessor(4096, 1, 1);
            const silent = context.createGain();
            silent.gain.value = 0;
            processor.onaudioprocess = (audioEvent) => {
              if (!acceptAudioRef.current || socket.readyState !== WebSocket.OPEN) return;
              const input = audioEvent.inputBuffer.getChannelData(0);
              const audio = pcmToBase64(input, context.sampleRate);
              socket.send(JSON.stringify({ event: "audio_input", audio }));
            };
            source.connect(processor);
            processor.connect(silent);
            silent.connect(context.destination);
            sourceRef.current = source;
            processorRef.current = processor;
            acceptAudioRef.current = true;
            setListening(true);
            setStatus("Listening — tell me what is happening in your work or life.");
            return;
          }
          if (message.event === "error") {
            acceptAudioRef.current = false;
            setListening(false);
            setError(message.message || "Live speech recognition returned an error.");
            setStatus("Voice service needs attention.");
            setRetryAvailable(true);
            setRetryLabel("Retry voice connection");
            return;
          }
          if (message.event === "vad.speech_start") {
            if (!turnRef.current && !completedRef.current) {
              setListening(true);
              setStatus("Listening to you…");
            }
            return;
          }
          if (message.event === "vad.speech_end") {
            if (!turnRef.current) setStatus("I’m listening to the end of your thought…");
            return;
          }
          if (message.event === "transcript.partial") {
            if (typeof message.text === "string") setPartial(message.text);
            if (typeof message.language === "string") {
              const detected = languages.find(item => item.locale.toLowerCase() === message.language.toLowerCase());
              if (detected) setLanguage(detected);
            }
            return;
          }
          if (message.event === "transcript.final") {
            const text = String(message.text || "").trim();
            const locale = String(message.language || language?.locale || "").toLowerCase();
            const detected = languages.find(item => item.locale.toLowerCase() === locale);
            if (detected) setLanguage(detected);
            setPartial("");
            if (!text) return;
            if (!detected) {
              setError("I heard speech, but Sarvam did not return a supported language code. Please try again in one of the listed languages.");
              return;
            }
            setLastTranscript(text);
            void handleTurn(text, detected.locale);
          }
        };
      } catch (err) {
        if (!disposed) {
          setError(err instanceof Error ? err.message : "Please allow microphone access to begin.");
          setStatus("Microphone or voice service unavailable.");
          setMicrophoneRetryAvailable(true);
        }
      }
    };

    void start();
    return () => {
      disposed = true;
      mountedRef.current = false;
      acceptAudioRef.current = false;
      socketRef.current?.close();
      socketRef.current = null;
      audioRef.current?.pause();
      window.speechSynthesis?.cancel();
      stopAudioGraph();
    };
  }, [retryToken]);

  return (
    <section className="voice-onboarding voice-first voice-only" id="voice-start" aria-label="NayaPath live voice assistant">
      <div className="voice-intro">
        <span>YOUR VOICE COMES FIRST</span>
        <h2>Tell me what is <i>happening.</i></h2>
        <p>No forms and no typing. Just speak naturally. NayaPath will listen, understand, and talk with you.</p>
      </div>
      <div className="voice-console">
        <div className="voice-top">
          <div><b>NayaPath Voice Assistant</b><small>Live conversation · automatic language detection · voice replies</small></div>
          <label>YOUR LANGUAGE
            <select aria-label="Detected speech language" value={language?.locale || ""} disabled>
              <option value="">{status.startsWith("Listening") ? "Detecting your language…" : "Waiting for speech…"}</option>
              {languages.map(item => <option key={item.locale} value={item.locale}>{item.name}</option>)}
            </select>
          </label>
        </div>
        <div className={"voice-orb " + (listening ? "is-listening" : speaking ? "is-speaking" : "")}>
          <AudioLines size={40}/>
          <b>{thinking ? "Understanding your words…" : speaking ? "Talking with you" : listening ? "Listening to you" : "Starting your conversation"}</b>
          <small>{language ? language.name + " · " + language.locale : "I will detect the language you speak"}</small>
        </div>
        <div className="voice-prompt voice-prompt-primary">
          <small>LIVE CONVERSATION</small>
          <p>{assistantReply || "Tell me, in your own words, what is happening in your work or life and what kind of help you need. I’m listening."}</p>
        </div>
        <div className="voice-live-transcripts" aria-live="polite">
          <section className="voice-transcript voice-original">
            <b>{listening ? "You are saying" : "What you said"} · {language?.name || "Detecting spoken language"}</b>
            <p>{partial || lastTranscript || "Your words will appear here as you speak."}</p>
          </section>
          <section className="voice-transcript voice-english">
            <b>English meaning</b>
            <p>{englishTranscript || "Your English translation will appear here after each turn."}</p>
          </section>
        </div>
        {error && <div className="voice-error" role="alert"><p>{error}</p>{retryAvailable && !configurationMissing && <button type="button" className="voice-retry" style={{ display: "inline-flex", alignItems: "center", gap: 8, marginTop: 10, padding: "11px 16px", border: 0, borderRadius: 999, background: "#214a37", color: "#fff", fontWeight: 700, cursor: "pointer" }} onClick={() => { setError(""); setStatus("Retrying voice connection…"); setRetryToken(value => value + 1); }}><Mic size={16}/>{retryLabel}</button>}</div>}
        {configurationMissing && <div className="voice-config-fallback" role="status"><b>Demo mode — no API key required</b><p>You can still explore NayaPath without connecting to an external AI service. The opportunity planner and livelihood feasibility checks work locally.</p><a className="cta" href="#income-planner">Explore NayaPath without a key</a></div>}
        <div className="voice-foot"><span>{status}</span><span><Mic size={14}/> Voice-only mode</span></div>
      </div>
    </section>
  );
}
