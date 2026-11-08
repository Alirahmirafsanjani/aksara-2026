import { Router } from "express";
import multer from "multer";
import { driveClient, uploadDriveClient, isOAuthConnected, DOC_ROOT_ID, validateImage } from "../drive.js";
import { Readable } from "stream";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 15 * 1024 * 1024 } });

function toFile(f) {
  return {
    id: f.id,
    name: f.name,
    mimeType: f.mimeType,
    size: f.size ? Number(f.size) : null,
    createdTime: f.createdTime || f.modifiedTime || null,
    // thumbnailLink sudah URL publik-ish; backend proxy /content sebagai fallback
    thumbnailUrl: f.thumbnailLink || `/api/docs/files/${f.id}/content`,
    webViewLink: f.webViewLink || `https://drive.google.com/file/d/${f.id}/view`,
    parents: f.parents || [],
  };
}

async function assertFolder(drive, id) {
  const { data } = await drive.files.get({ fileId: id, fields: "id,name,mimeType" });
  if (data.mimeType !== "application/vnd.google-apps.folder") throw Object.assign(new Error("Bukan folder"), { status: 400 });
  return data;
}

// GET /api/docs/folders
router.get("/folders", async (req, res, next) => {
  try {
    const drive = driveClient();
    const q = `'${DOC_ROOT_ID}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed = false`;
    const { data } = await drive.files.list({ q, fields: "files(id,name,mimeType)", pageSize: 100, orderBy: "name" });
    res.json({ folders: (data.files || []).map((f) => ({ id: f.id, name: f.name })) });
  } catch (e) { next(e); }
});

// POST /api/docs/folders
router.post("/folders", async (req, res, next) => {
  try {
    const name = String(req.body?.name || "").trim();
    if (!name) return res.status(400).json({ error: "Nama folder wajib diisi" });
    const drive = driveClient();
    const { data } = await drive.files.create({
      requestBody: { name, mimeType: "application/vnd.google-apps.folder", parents: [DOC_ROOT_ID] },
      fields: "id,name",
    });
    res.status(201).json({ folder: { id: data.id, name: data.name } });
  } catch (e) { next(e); }
});

// GET /api/docs/folders/:id/files
router.get("/folders/:id/files", async (req, res, next) => {
  try {
    const drive = driveClient();
    const folder = await assertFolder(drive, req.params.id);
    const q = `'${req.params.id}' in parents and trashed = false and mimeType != 'application/vnd.google-apps.folder'`;
    const { data } = await drive.files.list({
      q, fields: "files(id,name,mimeType,size,createdTime,modifiedTime,thumbnailLink,webViewLink,parents)", pageSize: 200, orderBy: "createdTime desc",
    });
    const files = (data.files || []).map(toFile);
    res.json({ folder: { id: folder.id, name: folder.name }, files });
  } catch (e) { next(e); }
});

// POST /api/docs/folders/:id/upload
router.post("/folders/:id/upload", upload.array("photos", 20), async (req, res, next) => {
  try {
    const files = req.files || [];
    if (!files.length) return res.status(400).json({ error: "Tidak ada file foto. Pilih satu atau beberapa foto." });
    for (const f of files) {
      const err = validateImage(f);
      if (err) return res.status(400).json({ error: err });
    }
    const drive = uploadDriveClient();
    await assertFolder(drive, req.params.id);
    const uploaded = [];
    for (const f of files) {
      try {
        const { data } = await drive.files.create({
          requestBody: { name: f.originalname, parents: [req.params.id] },
          media: { mimeType: f.mimetype, body: Readable.from(f.buffer) },
          fields: "id,name,mimeType,size,createdTime,modifiedTime,thumbnailLink,webViewLink,parents",
        });
        uploaded.push(toFile(data));
      } catch (e) {
        if (/storage quota/i.test(e.message || "") && !isOAuthConnected()) {
          return res.status(400).json({ error: "Upload ditolak Google: service account tanpa kuota. Hubungkan akun Google (OAuth) di /api/auth/login — lihat docs/OAUTH-SETUP.md." });
        }
        throw e;
      }
    }
    res.status(201).json({ files: uploaded });
  } catch (e) { next(e); }
});

// GET /api/docs/files/:id/content
router.get("/files/:id/content", async (req, res, next) => {
  try {
    const drive = driveClient();
    const meta = await drive.files.get({ fileId: req.params.id, fields: "id,name,mimeType,size" });
    res.setHeader("Content-Type", meta.data.mimeType || "image/jpeg");
    res.setHeader("Content-Disposition", `inline; filename="${encodeURIComponent(meta.data.name || "foto")}"`);
    res.setHeader("Cache-Control", "public, max-age=86400");
    const stream = await drive.files.get({ fileId: req.params.id, alt: "media" }, { responseType: "stream" });
    stream.data.pipe(res);
  } catch (e) { next(e); }
});

// DELETE /api/docs/files/:id (trash)
router.delete("/files/:id", async (req, res, next) => {
  try {
    const drive = driveClient();
    await drive.files.update({ fileId: req.params.id, requestBody: { trashed: true } });
    res.json({ ok: true, trashed: true });
  } catch (e) { next(e); }
});

export default router;
