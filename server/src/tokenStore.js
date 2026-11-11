// Cadangan token OAuth di Google Drive.
//
// Render Free mematikan service setelah 15 menit idle dan menghapus filesystem-nya,
// jadi .tokens.json hilang setiap kali server tidur/redeploy. Agar tidak perlu login
// ulang, refresh token disalin ke file kecil di Drive (folder "Aksara Config" di
// dalam folder logbook). Saat server bangun, token dibaca kembali memakai service
// account (membaca file tidak butuh kuota storage).
//
// Catatan: file backup berisi refresh token. Jangan bagikan folder "Aksara Config"
// ke orang yang tidak berhak.
import { google } from "googleapis";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { dirname } from "path";
import { LOG_ROOT_ID, TOKEN_PATH, driveClient } from "./drive.js";

export const TOKEN_BACKUP_NAME = "aksara-oauth-token.json";
export const CONFIG_FOLDER_NAME = "Aksara Config";

function oauthUploadClient(tokens) {
  const id = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const secret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  if (!id || !secret) throw new Error("GOOGLE_OAUTH_CLIENT_ID/SECRET belum diatur");
  const redirect = process.env.GOOGLE_OAUTH_REDIRECT_URI || "http://localhost:3000/api/auth/callback";
  const oauth2 = new google.auth.OAuth2(id, secret, redirect);
  oauth2.setCredentials({
    refresh_token: tokens.refresh_token,
    access_token: tokens.access_token,
    expiry_date: tokens.expiry_date,
  });
  return google.drive({ version: "v3", auth: oauth2 });
}

async function ensureConfigFolder(drive) {
  const q = `name='${CONFIG_FOLDER_NAME}' and '${LOG_ROOT_ID}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`;
  const { data } = await drive.files.list({ q, fields: "files(id,name)", pageSize: 1 });
  if (data.files?.length) return data.files[0].id;
  const { data: created } = await drive.files.create({
    requestBody: { name: CONFIG_FOLDER_NAME, mimeType: "application/vnd.google-apps.folder", parents: [LOG_ROOT_ID] },
    fields: "id",
  });
  return created.id;
}

// Simpan/segarkan backup token memakai OAuth user (punya kuota upload).
export async function backupOAuthToken(tokens) {
  if (!tokens?.refresh_token) throw new Error("refresh_token tidak ada");
  const drive = oauthUploadClient(tokens);
  const folderId = await ensureConfigFolder(drive);
  const payload = JSON.stringify(
    { refresh_token: tokens.refresh_token, obtained_at: new Date().toISOString() },
    null,
    2
  );
  const media = { mimeType: "application/json", body: payload };
  const { data: found } = await drive.files.list({
    q: `name='${TOKEN_BACKUP_NAME}' and '${folderId}' in parents and trashed=false`,
    fields: "files(id,name,modifiedTime)",
    orderBy: "modifiedTime desc",
    pageSize: 1,
  });
  let fileId;
  if (found.files?.length) {
    fileId = found.files[0].id;
    await drive.files.update({ fileId, media });
  } else {
    const { data: created } = await drive.files.create({
      requestBody: { name: TOKEN_BACKUP_NAME, parents: [folderId] },
      media,
      fields: "id",
    });
    fileId = created.id;
  }
  return { folderId, fileId };
}

// Pulihkan .tokens.json dari Drive saat server start (bila belum ada).
export async function restoreOAuthToken() {
  if (existsSync(TOKEN_PATH)) return { restored: false, reason: "token lokal sudah ada" };
  const drive = driveClient();
  const { data } = await drive.files.list({
    q: `name='${TOKEN_BACKUP_NAME}' and trashed=false`,
    fields: "files(id,name,modifiedTime)",
    orderBy: "modifiedTime desc",
    pageSize: 1,
  });
  const file = data.files?.[0];
  if (!file) return { restored: false, reason: "backup belum ada di Drive" };
  const { data: content } = await drive.files.get({ fileId: file.id, alt: "media" }, { responseType: "text" });
  const parsed = typeof content === "string" ? JSON.parse(content) : content;
  if (!parsed?.refresh_token) throw new Error("backup token tidak berisi refresh_token");
  mkdirSync(dirname(TOKEN_PATH), { recursive: true });
  writeFileSync(
    TOKEN_PATH,
    JSON.stringify(
      { refresh_token: parsed.refresh_token, obtained_at: parsed.obtained_at || new Date().toISOString(), restored_from_drive: true },
      null,
      2
    ),
    { mode: 0o600 }
  );
  return { restored: true, fileId: file.id };
}

// Versi aman untuk start server: gagal restore tidak boleh menghalangi API hidup.
export async function restoreOAuthTokenSafe() {
  try {
    const r = await Promise.race([
      restoreOAuthToken(),
      new Promise((resolve) => setTimeout(() => resolve({ restored: false, reason: "timeout" }), 10000)),
    ]);
    return r;
  } catch (e) {
    return { restored: false, reason: e.message };
  }
}

// Dipakai untuk diagnosa status tanpa membocorkan isi token.
export function readLocalTokenMeta() {
  try {
    const raw = JSON.parse(readFileSync(TOKEN_PATH, "utf8"));
    return { hasToken: Boolean(raw.refresh_token), obtainedAt: raw.obtained_at || null, restoredFromDrive: Boolean(raw.restored_from_drive) };
  } catch {
    return { hasToken: false, obtainedAt: null, restoredFromDrive: false };
  }
}
