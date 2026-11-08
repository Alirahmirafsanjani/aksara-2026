import { Router } from "express";
import { sheetsClient, loadMahasiswa, findMahasiswaByNo, KOLOM_LOGBOOK } from "../drive.js";

const router = Router();

async function sheetTitle(spreadsheetId) {
  const sheets = sheetsClient();
  const meta = await sheets.spreadsheets.get({ spreadsheetId, fields: "sheets.properties" });
  const t = meta.data.sheets?.[0]?.properties?.title;
  if (!t) throw Object.assign(new Error("Sheet tidak ditemukan di spreadsheet"), { status: 404 });
  return t;
}

function splitBukti(cell) {
  const s = String(cell ?? "").trim();
  const i = s.indexOf("|");
  if (i < 0) return { bukti: s, keteranganBukti: "" };
  return { bukti: s.slice(0, i).trim(), keteranganBukti: s.slice(i + 1).trim() };
}
function rowToEntry(r, rowIndex) {
  // r: array hingga 10 kolom (I=bukti, J=keterangan). Sel lama gabungan "url | keterangan" tetap dibaca.
  const [no, tanggal, waktu, durasi, lokasi, rincian, hasil, capaian, buktiCell, ketCell] = [
    r?.[0] ?? "", r?.[1] ?? "", r?.[2] ?? "", r?.[3] ?? "", r?.[4] ?? "", r?.[5] ?? "", r?.[6] ?? "", r?.[7] ?? "", r?.[8] ?? "", r?.[9] ?? "",
  ];
  let { bukti, keteranganBukti } = splitBukti(buktiCell);
  const ket = String(ketCell ?? "").trim();
  if (ket) keteranganBukti = ket; // kolom J menang atas gabungan lama
  const filled = [waktu, durasi, lokasi, rincian, hasil, capaian, buktiCell, ketCell].some((x) => String(x).trim() !== "");
  return { rowIndex, no: String(no ?? "").trim(), tanggal: String(tanggal ?? "").trim(), waktu: String(waktu ?? "").trim(), durasi: String(durasi ?? "").trim(), lokasi: String(lokasi ?? "").trim(), rincian: String(rincian ?? "").trim(), hasil: String(hasil ?? "").trim(), capaian: String(capaian ?? "").trim(), bukti, keteranganBukti, filled };
}

function entryToRow(e) {
  // I = tautan saja (ter-klik), J = keterangan teks biasa. Bukan dicampur.
  return [String(e.no ?? "").trim(), String(e.tanggal ?? "").trim(), String(e.waktu ?? "").trim(), String(e.durasi ?? "").trim(), String(e.lokasi ?? "").trim(), String(e.rincian ?? "").trim(), String(e.hasil ?? "").trim(), String(e.capaian ?? "").trim(), String(e.bukti ?? "").trim(), String(e.keteranganBukti ?? "").trim()];
}
function validateEntry(e) {
  if (!e.no || !e.tanggal) return "No dan Tanggal wajib diisi";
  if (String(e.bukti || "").length > 1000) return "Tautan bukti terlalu panjang";
  if (String(e.keteranganBukti || "").length > 500) return "Keterangan bukti terlalu panjang (maks 500)";
  return null;
}

// GET /api/logbook/prodi
router.get("/prodi", (_req, res) => {
  res.json({ programStudi: loadMahasiswa().programStudi || ["Sistem Informasi", "PGSD", "Gizi"] });
});

// GET /api/logbook/mahasiswa?prodi=Sistem+Informasi
router.get("/mahasiswa", (req, res) => {
  const prodi = String(req.query.prodi || "").trim();
  const cfg = loadMahasiswa();
  const list = (cfg.mahasiswa || [])
    .filter((m) => !prodi || m.programStudi === prodi)
    .map(({ no, nama, programStudi, spreadsheetId }) => ({ no, nama, programStudi, spreadsheetId }));
  res.json({ mahasiswa: list });
});

// GET /api/logbook/:no/entries
router.get("/:no/entries", async (req, res, next) => {
  try {
    const m = findMahasiswaByNo(req.params.no);
    if (!m) return res.status(404).json({ error: "Mahasiswa tidak ditemukan" });
    const title = await sheetTitle(m.spreadsheetId);
    const sheets = sheetsClient();
    const vals = await sheets.spreadsheets.values.get({ spreadsheetId: m.spreadsheetId, range: `'${title}'!A1:J100` });
    const rows = vals.data.values || [];
    const entries = rows.slice(1).map((r, i) => rowToEntry(r, i + 2)).filter((e) => e.no !== "" || e.filled);
    res.json({ mahasiswa: { no: m.no, nama: m.nama, programStudi: m.programStudi }, sheet: title, entries });
  } catch (e) { next(e); }
});

// POST /api/logbook/:no/entries  — buat BARU atau ISI baris sesuai No (mengikuti template, anti-duplikat)
router.post("/:no/entries", async (req, res, next) => {
  try {
    const m = findMahasiswaByNo(req.params.no);
    if (!m) return res.status(404).json({ error: "Mahasiswa tidak ditemukan" });
    const e = { no: req.body?.no, tanggal: req.body?.tanggal, waktu: req.body?.waktu, durasi: req.body?.durasi, lokasi: req.body?.lokasi, rincian: req.body?.rincian, hasil: req.body?.hasil, capaian: req.body?.capaian, bukti: req.body?.bukti || "", keteranganBukti: req.body?.keteranganBukti || "" };
    const err = validateEntry(e);
    if (err) return res.status(400).json({ error: err });
    const title = await sheetTitle(m.spreadsheetId);
    const sheets = sheetsClient();
    // cari baris dengan No sama
    const vals = await sheets.spreadsheets.values.get({ spreadsheetId: m.spreadsheetId, range: `'${title}'!A1:J100` });
    const rows = vals.data.values || [];
    let targetRow = -1;
    for (let i = 1; i < rows.length; i++) {
      if (String(rows[i]?.[0] ?? "").trim() === String(e.no).trim()) { targetRow = i + 1; break; }
    }
    if (targetRow === -1) targetRow = rows.length + 1; // append row baru
    const values = [entryToRow(e)];
    await sheets.spreadsheets.values.update({
      spreadsheetId: m.spreadsheetId,
      range: `'${title}'!A${targetRow}:J${targetRow}`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values },
    });
    res.status(201).json({ ok: true, entry: { ...e, rowIndex: targetRow } });
  } catch (e) { next(e); }
});

// PUT /api/logbook/:no/entries/:rowIndex — edit baris tepat
router.put("/:no/entries/:rowIndex", async (req, res, next) => {
  try {
    const m = findMahasiswaByNo(req.params.no);
    if (!m) return res.status(404).json({ error: "Mahasiswa tidak ditemukan" });
    const rowIndex = Number(req.params.rowIndex);
    if (!Number.isInteger(rowIndex) || rowIndex < 2 || rowIndex > 200) return res.status(400).json({ error: "rowIndex tidak valid" });
    const e = { no: req.body?.no, tanggal: req.body?.tanggal, waktu: req.body?.waktu, durasi: req.body?.durasi, lokasi: req.body?.lokasi, rincian: req.body?.rincian, hasil: req.body?.hasil, capaian: req.body?.capaian, bukti: req.body?.bukti || "", keteranganBukti: req.body?.keteranganBukti || "" };
    const err = validateEntry(e);
    if (err) return res.status(400).json({ error: err });
    const title = await sheetTitle(m.spreadsheetId);
    const sheets = sheetsClient();
    await sheets.spreadsheets.values.update({
      spreadsheetId: m.spreadsheetId,
      range: `'${title}'!A${rowIndex}:J${rowIndex}`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [entryToRow(e)] },
    });
    res.json({ ok: true, entry: { ...e, rowIndex } });
  } catch (e) { next(e); }
});

export default router;
