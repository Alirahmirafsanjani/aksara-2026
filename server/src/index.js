import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import { existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import docsRouter from "./routes/docs.js";
import logbookRouter from "./routes/logbook.js";
import authRouter from "./routes/auth.js";
import { restoreOAuthTokenSafe } from "./tokenStore.js";

const serverDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const distDir = join(serverDir, "../client/dist");
// Muat server/.env (jangan hanya ./.env dari CWD)
dotenv.config({ path: join(serverDir, ".env") });
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => res.json({ ok: true, service: "aksara-backend" }));
app.use("/api/docs", docsRouter);
app.use("/api/logbook", logbookRouter);
app.use("/api/auth", authRouter);

// Frontend statik (production build). Dev: gunakan `npm run dev --prefix client`.
if (existsSync(join(distDir, "index.html"))) {
  app.use(express.static(distDir));
  app.get(/^(?!\/api\/).*/, (_req, res) => res.sendFile(join(distDir, "index.html")));
}

// error handler JSON
app.use((err, _req, res, _next) => {
  console.error(err?.message || err);
  const status = err?.status || Number(err?.code) || 500;
  const code = Number.isFinite(status) && status >= 400 && status < 600 ? status : 500;
  res.status(code).json({ error: err?.message || "Kesalahan server" });
});

const port = Number(process.env.PORT || 3000);
async function start() {
  // Render Free menghapus filesystem saat tidur/redeploy: pulihkan token OAuth dari Drive.
  const r = await restoreOAuthTokenSafe();
  if (r.restored) console.log("Token OAuth dipulihkan dari Drive.");
  else if (r.reason) console.log(`Restore token OAuth: ${r.reason}`);
  app.listen(port, () => console.log(`aksara-backend listening on :${port}`));
}
if (import.meta.url === `file://${process.argv[1]}`) {
  start();
}
export default app;
