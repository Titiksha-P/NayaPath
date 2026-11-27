import { SarvamAIClient } from "sarvamai";

type VercelRequest = { method?: string; body: any };
type VercelResponse = {
  status: (code: number) => VercelResponse;
  json: (body: unknown) => void;
};

const MAX_AUDIO_BYTES = 4_000_000;
const ALLOWED_TYPES = new Set([
  "audio/webm",
  "audio/webm;codecs=opus",
  "audio/ogg",
  "audio/ogg;codecs=opus",
  "audio/wav",
  "audio/mpeg",
  "audio/mp4",
  "audio/aac",
]);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.SARVAM_API_KEY;
  if (!apiKey) {
    return res.status(503).json({
      error: "Speech recognition is not configured. Add SARVAM_API_KEY to the server environment.",
      code: "SARVAM_NOT_CONFIGURED",
    });
  }

  const { audioContent, mimeType, mode = "transcribe" } = req.body || {};
  if (typeof audioContent !== "string" || !audioContent.trim()) {
    return res.status(400).json({ error: "Provide a base64-encoded audioContent field." });
  }
  if (!["transcribe", "translate"].includes(mode)) {
    return res.status(400).json({ error: "mode must be transcribe or translate." });
  }

  const normalizedMime = typeof mimeType === "string" ? mimeType.split(";")[0].toLowerCase() : "audio/webm";
  if (!ALLOWED_TYPES.has(normalizedMime) && !ALLOWED_TYPES.has(mimeType)) {
    return res.status(415).json({ error: "Unsupported audio format. Use WebM, OGG, WAV, MP3, MP4 or AAC." });
  }

  let audio: Buffer;
  try {
    audio = Buffer.from(audioContent, "base64");
  } catch {
    return res.status(400).json({ error: "audioContent must be valid base64." });
  }
  if (!audio.length) return res.status(400).json({ error: "The audio recording is empty." });
  if (audio.length > MAX_AUDIO_BYTES) {
    return res.status(413).json({ error: "Recording is too large. Keep the first test under 30 seconds." });
  }

  const filename = normalizedMime === "audio/wav" ? "recording.wav"
    : normalizedMime === "audio/ogg" ? "recording.ogg"
    : normalizedMime === "audio/mpeg" ? "recording.mp3"
    : normalizedMime === "audio/mp4" ? "recording.m4a"
    : normalizedMime === "audio/aac" ? "recording.aac"
    : "recording.webm";

  try {
    const client = new SarvamAIClient({ apiSubscriptionKey: apiKey });
    const result = await client.speechToText.transcribe({
      file: {
        data: audio,
        filename,
        contentType: normalizedMime,
        contentLength: audio.length,
      },
      model: "saaras:v4",
      mode,
    });

    const transcript = typeof result.transcript === "string" ? result.transcript.trim() : "";
    if (!transcript) {
      return res.status(502).json({ error: "Sarvam returned an empty transcript." });
    }

    return res.status(200).json({
      transcript,
      language: result.language_code || null,
      requestId: result.request_id || null,
      provider: "Sarvam",
      model: "saaras:v4",
      mode,
    });
  } catch (error: any) {
    const status = Number(error?.statusCode || error?.status || 502);
    const safeStatus = [400, 401, 402, 403, 413, 422, 429].includes(status) ? status : 502;
    return res.status(safeStatus).json({
      error: safeStatus === 403 || safeStatus === 401
        ? "Sarvam rejected the API key. Check SARVAM_API_KEY in the server environment."
        : safeStatus === 402
          ? "The Sarvam account needs available credits before it can transcribe audio."
          : safeStatus === 429
            ? "Sarvam rate limit reached. Wait briefly and try again."
            : "Sarvam speech recognition failed. Check the audio format and API configuration.",
      providerStatus: safeStatus,
    });
  }
}
