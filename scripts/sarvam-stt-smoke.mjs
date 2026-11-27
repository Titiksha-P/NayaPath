import { createReadStream, existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { SarvamAIClient } from "sarvamai";

// Minimal .env loader: no dotenv dependency. Existing shell variables take precedence.
const envPath = resolve(process.cwd(), ".env");
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
    if (match && !match[1].startsWith("#") && !process.env[match[1]]) {
      process.env[match[1]] = match[2].replace(/^["']|["']$/g, "");
    }
  }
}

const apiKey = process.env.SARVAM_API_KEY;
const audioPath = process.argv[2] || process.env.SARVAM_AUDIO_FILE;
if (!apiKey) {
  console.error("Missing SARVAM_API_KEY. Add it to your local .env file (never commit .env).");
  process.exit(1);
}
if (!audioPath || !existsSync(resolve(audioPath))) {
  console.error("Provide a short audio file: npm run sarvam:stt -- ./sample.wav");
  process.exit(1);
}

const client = new SarvamAIClient({ apiSubscriptionKey: apiKey });
try {
  const response = await client.speechToText.transcribe({
    file: createReadStream(resolve(audioPath)),
    model: "saaras:v4",
    mode: "transcribe",
  });
  console.log(JSON.stringify({
    transcript: response.transcript,
    language_code: response.language_code ?? null,
    request_id: response.request_id ?? null,
    model: "saaras:v4",
  }, null, 2));
} catch (error) {
  const status = error?.statusCode ?? error?.status ?? "unknown";
  console.error("Sarvam transcription failed:", status);
  console.error(error?.message || "No additional error details.");
  process.exit(1);
}
