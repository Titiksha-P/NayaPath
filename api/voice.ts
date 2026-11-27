import http from "node:http";
import { WebSocket, WebSocketServer } from "ws";

const server = http.createServer();
const sockets = new WebSocketServer({ server, maxPayload: 24_000 });
const MAX_SESSION_MS = 4 * 60 * 1000;
const activeByIp = new Map<string, number>();

function send(ws: WebSocket, payload: unknown) {
  if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(payload));
}

sockets.on("connection", (browser, request) => {
  const origin = request.headers.origin;
  const host = request.headers.host;
  if (!origin || !host || new URL(origin).host !== host) {
    browser.close(1008, "Origin not allowed");
    return;
  }

  const apiKey = process.env.SARVAM_API_KEY;
  if (!apiKey) {
    send(browser, { event: "error", message: "Sarvam is not configured. Add SARVAM_API_KEY and redeploy." });
    browser.close(1011, "Sarvam is not configured");
    return;
  }

  const ip = String(request.headers["x-forwarded-for"] || request.socket.remoteAddress || "unknown").split(",")[0].trim();
  const active = activeByIp.get(ip) || 0;
  if (active >= 2) {
    browser.close(1013, "Too many active voice sessions");
    return;
  }
  activeByIp.set(ip, active + 1);

  const params = new URLSearchParams({
    language_code: "auto",
    model: "saaras:v4",
    stream_type: "fast",
    mode: "transcribe",
    endpointing: "vad",
    encoding: "linear16",
    sample_rate: "16000",
    silence_duration_ms: "750",
    min_speech_duration_ms: "180",
    threshold: "0.35"
  });
  const upstream = new WebSocket("wss://api.sarvam.ai/speech-to-text-realtime/ws?" + params.toString(), {
    headers: { "api-subscription-key": apiKey },
    handshakeTimeout: 15000
  });

  let closed = false;
  const release = () => {
    if (closed) return;
    closed = true;
    activeByIp.set(ip, Math.max(0, (activeByIp.get(ip) || 1) - 1));
  };
  const sessionTimeout = setTimeout(() => {
    send(browser, { event: "session.timeout", message: "This voice session reached its four-minute limit. Reconnecting…" });
    browser.close(1000, "Session limit");
    upstream.close();
  }, MAX_SESSION_MS);

  upstream.on("open", () => send(browser, { event: "session.ready" }));
  upstream.on("message", (data) => {
    if (browser.readyState === WebSocket.OPEN) browser.send(data.toString());
  });
  upstream.on("error", () => {
    send(browser, { event: "error", message: "Could not connect to Sarvam live speech recognition. Check the API key, credits and account access." });
  });
  upstream.on("close", (code) => {
    if (browser.readyState === WebSocket.OPEN) {
      send(browser, { event: "session.closed", code });
      browser.close(1011, "Speech recognition connection closed");
    }
  });

  browser.on("message", (raw) => {
    if (upstream.readyState !== WebSocket.OPEN) return;
    try {
      const message = JSON.parse(raw.toString());
      if (message?.event === "audio_input" && typeof message.audio === "string" && message.audio.length <= 22000) {
        upstream.send(JSON.stringify(message));
      } else if (message?.event === "ping") {
        upstream.send(JSON.stringify({ event: "ping" }));
      } else if (message?.event === "end") {
        upstream.send(JSON.stringify({ event: "end" }));
      }
    } catch {
      send(browser, { event: "error", message: "Invalid live-audio message." });
    }
  });

  browser.on("close", () => {
    clearTimeout(sessionTimeout);
    release();
    if (upstream.readyState === WebSocket.OPEN || upstream.readyState === WebSocket.CONNECTING) upstream.close();
  });
  browser.on("error", () => {
    clearTimeout(sessionTimeout);
    release();
    upstream.close();
  });
});

server.on("close", () => sockets.close());
export default server;
