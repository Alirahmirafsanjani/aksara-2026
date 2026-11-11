import { Router } from "express";
import { google } from "googleapis";
import { writeFileSync, existsSync, readFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import { TOKEN_PATH, isOAuthConnected } from "../drive.js";
import { backupOAuthToken, readLocalTokenMeta } from "../tokenStore.js";

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
  res.json({ connected: isOAuthConnected(), token: readLocalTokenMeta() });
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
    let refresh = tokens.refresh_token;
    if (!refresh) {
      try { refresh = JSON.parse(readFileSync(TOKEN_PATH, "utf8")).refresh_token; } catch { /* belum ada */ }
    }
    if (!refresh) {
      return res.status(502).json({ error: "Google tidak mengirim refresh_token. Buka https://myaccount.google.com/permissions, hapus akses aplikasi ini, lalu login ulang." });
    }
    mkdirSync(dirname(TOKEN_PATH), { recursive: true });
    writeFileSync(TOKEN_PATH, JSON.stringify({ refresh_token: refresh, obtained_at: new Date().toISOString() }, null, 2), { mode: 0o600 });
    let backupHtml = "<p>Backup token ke Drive: <b>gagal</b> (token lokal tetap aktif).</p>";
    try {
      await backupOAuthToken({ ...tokens, refresh_token: refresh });
      backupHtml = "<p>Token dicadangkan ke Drive — tidak perlu login ulang saat server bangun/redeploy.</p>";
    } catch (e) {
      console.error("Backup token OAuth gagal:", e.message);
    }
    res.type("html").send(`<h1>OAuth tersambung</h1><p>Kembali ke aplikasi. Token tersimpan di server.</p>${backupHtml}<script>location.href="/"</script>`);
  } catch (e) { next(e); }
});

export default router;
