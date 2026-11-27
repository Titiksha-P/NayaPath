type Req = { method?: string; body?: any };
type Res = { status: (code: number) => Res; json: (value: unknown) => void };

const SPEECH_LANGS = new Set(["en-IN","hi-IN","bn-IN","ta-IN","te-IN","kn-IN","ml-IN","mr-IN","gu-IN","pa-IN","or-IN"]);
const MAYURA_LANGS = new Set(["en-IN","hi-IN","bn-IN","ta-IN","te-IN","kn-IN","ml-IN","mr-IN","gu-IN","pa-IN"]);

async function translateText(apiKey: string, text: string, source: string, target: string) {
  if (source === target || !text.trim()) return text;
  const sourceCode = source === "or-IN" ? "od-IN" : source;
  const targetCode = target === "or-IN" ? "od-IN" : target;
  const model = MAYURA_LANGS.has(sourceCode) && MAYURA_LANGS.has(targetCode) ? "mayura:v1" : "sarvam-translate:v1";
  const payload: Record<string, unknown> = {
    input: text.slice(0, 1900),
    source_language_code: sourceCode,
    target_language_code: targetCode,
    model
  };
  if (model === "mayura:v1") payload.mode = "modern-colloquial";
  const response = await fetch("https://api.sarvam.ai/translate", {
    method: "POST",
    headers: { "Content-Type": "application/json", "api-subscription-key": apiKey },
    body: JSON.stringify(payload)
  });
  const data: any = await response.json();
  if (!response.ok || typeof data.translated_text !== "string") {
    throw new Error("Sarvam translation failed (" + response.status + ").");
  }
  return data.translated_text.trim();
}

function parseAssistant(content: string) {
  const match = content.match(/\{[\s\S]*\}/);
  if (!match) return { reply: content.trim(), profile_patch: {}, done: false };
  try {
    const value = JSON.parse(match[0]);
    return {
      reply: typeof value.reply === "string" ? value.reply.trim() : "",
      profile_patch: value.profile_patch && typeof value.profile_patch === "object" ? value.profile_patch : {},
      done: value.done === true
    };
  } catch {
    return { reply: content.trim(), profile_patch: {}, done: false };
  }
}

function safePatch(value: Record<string, any>) {
  const result: Record<string, string> = {};
  const allowed = ["occupation","goal","hours","daysOff","energy","skills","location","contract","literacy"];
  for (const key of allowed) {
    const v = value[key];
    if (typeof v !== "string" || !v.trim()) continue;
    const text = v.trim().slice(0, 300);
    if (key === "goal" && !["better","extra","business","skills","both"].includes(text)) continue;
    if (key === "energy" && !["good","low","exhausted","unknown"].includes(text)) continue;
    if (key === "contract" && !["allowed","approval","restricted","unknown"].includes(text)) continue;
    if (key === "literacy" && !["literate","spoken_only","unknown"].includes(text)) continue;
    if (key === "hours" && (!/^\d{1,2}(?:\.\d)?$/.test(text) || Number(text) > 24)) continue;
    if (key === "daysOff" && (!/^\d$/.test(text) || Number(text) > 7)) continue;
    result[key] = text;
  }
  return result;
}

export default async function handler(req: Req, res: Res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  const apiKey = process.env.SARVAM_API_KEY;
  if (!apiKey) return res.status(503).json({ error: "SARVAM_API_KEY is not configured. Save it in Vercel and redeploy." });

  const { transcript, language, history = [], profile = {} } = req.body || {};
  if (typeof transcript !== "string" || !transcript.trim() || transcript.length > 3000) {
    return res.status(400).json({ error: "A non-empty transcript under 3,000 characters is required." });
  }
  if (typeof language !== "string" || !/^[a-z]{2,3}-IN$/i.test(language)) {
    return res.status(400).json({ error: "A detected Indian language code is required." });
  }
  const safeHistory = Array.isArray(history) ? history.slice(-10).filter((m: any) =>
    (m?.role === "user" || m?.role === "assistant") && typeof m?.content === "string"
  ).map((m: any) => ({ role: m.role, content: m.content.slice(0, 2000) })) : [];
  const currentProfile = profile && typeof profile === "object" ? profile : {};

  try {
    const englishTranscript = language === "en-IN"
      ? transcript.trim()
      : await translateText(apiKey, transcript.trim(), language, "en-IN");

    const system = `You are NayaPath, a warm, respectful livelihood-discovery conversation partner. Speak like a thoughtful human guide, not a form, survey, call-centre script, or chatbot. You are speaking to someone who may be under financial pressure. Be kind, practical, patient, and never judgmental.

The person is using voice only. Never ask them to type, read a form, select an option, or press a button. Ask exactly ONE short, natural question per turn. Do not repeat information already provided. Let the person tell their story in their own words; acknowledge what they said before asking the next useful question. Keep every spoken reply concise (usually 1–3 sentences).

This is the first voice-led discovery. On the first assistant turn, after acknowledging their opening story, ask whether they can read and write in the language they speak or whether they mainly speak it. This helps us adapt accessibility; it does not change the voice-only interaction.

Gradually collect only facts the person explicitly provides:
- occupation/current work
- goal: better pay/steadier work (better), additional income (extra), own business (business), learning for another opportunity (skills), or exploring several (both)
- hours worked per day (0–24)
- days off per week (0–7)
- energy after work: good, low, exhausted, unknown
- practical skills/experience
- city or district
- outside-work contract status: allowed, approval, restricted, unknown
- literacy: literate, spoken_only, unknown

Do not infer unknown values. Do not convert vague answers into precise numbers. If the person does not know or declines, leave the field absent and continue with another important field. Do not ask all fields mechanically; choose the most relevant missing detail based on what they have said. Do not give livelihood recommendations until enough profile information is collected. Never advise quitting a job, taking debt, paying a recruiter, working during safety-critical duties, or ignoring employer restrictions.

Internally reason and maintain the conversation in English. The server will translate your reply into the person's language. Return ONLY valid JSON, no markdown, in this exact shape:
{"reply":"short natural reply in English","profile_patch":{"occupation":"","goal":"","hours":"","daysOff":"","energy":"","skills":"","location":"","contract":"","literacy":""},"done":false}
Only include profile_patch keys when the latest utterance clearly supports a value. Use the allowed enum values above. Set done=true only when the key profile facts are collected or the person explicitly declines the remaining questions. If done, give a brief warm spoken acknowledgement and say NayaPath will now prepare their opportunity map.`;

    const messages = [
      { role: "system", content: system + "\nCurrent known profile (do not overwrite with guesses): " + JSON.stringify(currentProfile) },
      ...safeHistory,
      { role: "user", content: englishTranscript }
    ];
    const completion = await fetch("https://api.sarvam.ai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "api-subscription-key": apiKey },
      body: JSON.stringify({
        model: "sarvam-105b-conversations",
        messages,
        temperature: 0.4,
        max_tokens: 320
      })
    });
    const chatData: any = await completion.json();
    if (!completion.ok) {
      return res.status(completion.status === 429 ? 429 : 502).json({
        error: completion.status === 403 ? "Sarvam rejected the API key." : "NayaPath's conversation model could not respond (" + completion.status + ")."
      });
    }
    const rawReply = chatData?.choices?.[0]?.message?.content;
    if (typeof rawReply !== "string" || !rawReply.trim()) return res.status(502).json({ error: "The conversation model returned an empty response." });
    const parsed = parseAssistant(rawReply);
    if (!parsed.reply) return res.status(502).json({ error: "The conversation model did not provide a spoken reply." });

    const assistantEnglish = parsed.reply;
    const assistantReply = language === "en-IN"
      ? assistantEnglish
      : await translateText(apiKey, assistantEnglish, "en-IN", language);

    let audioContent: string | null = null;
    let speechSupported = SPEECH_LANGS.has(language);
    if (speechSupported) {
      const ttsLanguage = language === "or-IN" ? "od-IN" : language;
      const speech = await fetch("https://api.sarvam.ai/text-to-speech", {
        method: "POST",
        headers: { "Content-Type": "application/json", "api-subscription-key": apiKey },
        body: JSON.stringify({
          text: assistantReply.slice(0, 2400),
          language_code: ttsLanguage,
          model: "bulbul:v3",
          speaker: "ishita",
          output_audio_codec: "wav",
          pace: 0.96
        })
      });
      const speechData: any = await speech.json();
      if (speech.ok && Array.isArray(speechData.audios) && typeof speechData.audios[0] === "string") {
        audioContent = speechData.audios[0];
      } else {
        speechSupported = false;
      }
    }

    return res.status(200).json({
      transcript: transcript.trim(),
      englishTranscript,
      assistantReply,
      assistantEnglish,
      audioContent,
      speechSupported,
      language,
      profilePatch: safePatch(parsed.profile_patch),
      done: parsed.done,
      provider: "Sarvam",
      models: { stt: "saaras:v4", chat: "sarvam-105b-conversations", translation: "sarvam-translate:v1 / mayura:v1", tts: "bulbul:v3" }
    });
  } catch (error: any) {
    return res.status(502).json({ error: error?.message || "The live conversation could not be completed. Please try speaking again." });
  }
}
