type Req = { method?: string };
type Res = { status: (code: number) => Res; json: (value: unknown) => void; setHeader?: (name: string, value: string) => void };

export default function handler(req: Req, res: Res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });
  res.setHeader?.("Cache-Control", "no-store, max-age=0");
  return res.status(200).json({
    sarvamConfigured: Boolean(process.env.SARVAM_API_KEY),
    mode: process.env.SARVAM_API_KEY ? "live" : "demo"
  });
}
