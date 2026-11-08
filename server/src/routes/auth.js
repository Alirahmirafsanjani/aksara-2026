import { Router } from "express";
import { google } from "googleapis";
import { writeFileSync, existsSync, readFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { TOKEN_PATH, isOAuthConnected } from "../drive.js";

const router = Router();
const SCOPES = ["https://www.googleapis.com/auth/drive"];

function oauthClient() {
  const id = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const secret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  const redirect = process.env.GOOGLE_OAUTH_REDIRECT_URI || "http://localhost:3000/api/auth/callback";
  if (!id || !secret) throw Object.assign(new Error("GOOGLE_OAUTH_CLIENT_ID/SECRET belum diatur di server/.env (lihat docs/OAUTH-SETUP.md)"), { status: 503 });
  return new google.auth.OAuth2(id, secret, redirect);
}

// GET /api/auth/status
router.get("/status", (_req, res) => {
  res.json({ connected: isOAuthConnected() });
});

// GET /api/auth/login → redirect ke Google
router.get("/login", (req, res, next) => {
  try {
    const oauth2 = oauthClient();
    const url = oauth2.generateAuthUrl({ access_type: "offline", prompt: "consent", scope: SCOPES });
    res.redirect(url);
  } catch (e) { next(e); }
});

// GET /api/auth/callback?code=...
router.get("/callback", async (req, res, next) => {
  try {
    const code = req.query.code;
    if (!code) return res.status(400).json({ error: "Kode OAuth tidak ada" });
    const oauth2 = oauthClient();
    const { tokens } = await oauth2.getToken(String(code));
    mkdirSync(dirname(TOKEN_PATH), { recursive: true });
    writeFileSync(TOKEN_PATH, JSON.stringify({ refresh_token: tokens.refresh_token, obtained_at: new Date().toISOString() }, null, 2), { mode: 0o600 });
    res.type("html").send(`<h1>OAuth tersambung</h1><p>Kembali ke aplikasi. Token tersimpan di server.</p><script>location.href="/"</script>`);
  } catch (e) { next(e); }
});

export default router;
