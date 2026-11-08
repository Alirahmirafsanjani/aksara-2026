import { google } from "googleapis";
import { readdirSync, existsSync, readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const serverDir = join(dirname(fileURLToPath(import.meta.url)), "..");
const rootDir = join(serverDir, "..");

export const DOC_ROOT_ID = process.env.GOOGLE_DRIVE_DOC_PARENT_FOLDER_ID || "1T3Ll14UO5ux7fsG9XmHnMimPMb9qW0Ce";
export const LOG_ROOT_ID = process.env.GOOGLE_DRIVE_LOG_BOOK_PARENT_FOLDER_ID || "1KPltSlYvp8gboHi69aC7FzyDW98mjJPm";

let _auth = null;
let _drive = null;
let _sheets = null;
function getAuth() {
  if (_auth) return _auth;
  const envPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  let keyPath = null;
  if (envPath) {
    const candidates = [envPath, join(serverDir, envPath), join(process.cwd(), envPath)];
    keyPath = candidates.find((p) => existsSync(p)) || envPath;
  } else {
    const credDir = join(serverDir, "credentials");
    const files = existsSync(credDir) ? readdirSync(credDir).filter((f) => f.endsWith(".json")) : [];
    if (files.length) keyPath = join(credDir, files[0]);
  }
  if (!keyPath) throw new Error("Kredensial Google tidak ditemukan. Isi GOOGLE_APPLICATION_CREDENTIALS atau taruh *.json di server/credentials/.");
  _auth = new google.auth.JWT({ keyFile: keyPath, scopes: ["https://www.googleapis.com/auth/drive", "https://www.googleapis.com/auth/spreadsheets"] });
  return _auth;
}
export function driveClient() {
  if (_drive) return _drive;
  _drive = google.drive({ version: "v3", auth: getAuth() });
  return _drive;
}

// Klien Drive untuk UPLOAD: pakai OAuth user (punya kuota) bila server/.tokens.json ada,
// selain itu fallback ke service account (tanpa kuota → upload ditolak Google).
export const TOKEN_PATH = join(serverDir, ".tokens.json");
export function isOAuthConnected() {
  try {
    const raw = JSON.parse(readFileSync(TOKEN_PATH, "utf8"));
    return Boolean(raw.refresh_token && process.env.GOOGLE_OAUTH_CLIENT_ID && process.env.GOOGLE_OAUTH_CLIENT_SECRET);
  } catch { return false; }
}
export function uploadDriveClient() {
  if (!isOAuthConnected()) return driveClient();
  const raw = JSON.parse(readFileSync(TOKEN_PATH, "utf8"));
  const oauth2 = new google.auth.OAuth2(process.env.GOOGLE_OAUTH_CLIENT_ID, process.env.GOOGLE_OAUTH_CLIENT_SECRET, process.env.GOOGLE_OAUTH_REDIRECT_URI || "http://localhost:3000/api/auth/callback");
  oauth2.setCredentials({ refresh_token: raw.refresh_token });
  return google.drive({ version: "v3", auth: oauth2 });
}
export function sheetsClient() {
  if (_sheets) return _sheets;
  _sheets = google.sheets({ version: "v4", auth: getAuth() });
  return _sheets;
}

// --- Daftar mahasiswa (whitelist) ---
let _mahasiswa = null;
export function loadMahasiswa() {
  if (_mahasiswa) return _mahasiswa;
  const p = join(rootDir, "config", "mahasiswa.json");
  _mahasiswa = JSON.parse(readFileSync(p, "utf8"));
  return _mahasiswa;
}
export function findMahasiswaByNo(no) {
  const cfg = loadMahasiswa();
  return (cfg.mahasiswa || []).find((m) => String(m.no) === String(no)) || null;
}
export const KOLOM_LOGBOOK = ["No", "Tanggal Pelaksanaan", "Waktu Pelaksanaan", "Durasi", "Lokasi Pelaksanaan", "Rincian Pelaksanaan Kegiatan", "Hasil Pelaksanaan Kegiatan", "Capaian Kompetensi Mahasiswa", "Bukti Pelaksanaan Kegiatan"];

export const IMAGE_MIMES = ["image/jpeg", "image/png", "image/heic", "image/heif", "image/webp"];
export const IMAGE_EXTS = ["jpg", "jpeg", "png", "heic", "heif", "webp"];
const MAX_BYTES = 15 * 1024 * 1024; // 15MB

export function validateImage(file) {
  const name = file.originalname || "";
  const ext = name.split(".").pop()?.toLowerCase();
  const mime = file.mimetype;
  if (file.size > MAX_BYTES) return `File ${name} melebihi 15MB`;
  if (mime && !IMAGE_MIMES.includes(mime)) return `Format tidak didukung: ${name} (${mime}). Gunakan JPG/PNG/HEIC/WEBP.`;
  if (!ext || !IMAGE_EXTS.includes(ext)) return `Ekstensi tidak didukung: ${name}. Gunakan JPG/PNG/HEIC/WEBP.`;
  return null;
}
