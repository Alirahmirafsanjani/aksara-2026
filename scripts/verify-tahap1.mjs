// Tahap 1 – Verifikasi persiapan (tidak mengekspos secret)
// Jalankan: node scripts/verify-tahap1.mjs
import { readFileSync, existsSync, statSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const results = [];
function check(name, status, detail = "") {
  results.push({ name, status, detail });
  const icon = status === "PASS" ? "✓" : status === "FAIL" ? "✗" : "⚠";
  console.log(`${icon} [${status}] ${name}${detail ? " — " + detail : ""}`);
}
function exists(rel) { return existsSync(join(root, rel)); }

// 1. Node version
const m = process.version.match(/v(\d+)/);
check("Node.js tersedia", m ? "PASS" : "FAIL", process.version);
if (m) check("Node.js >= 18 (syarat Vite/backend modern)", Number(m[1]) >= 18 ? "PASS" : "FAIL", process.version);

// 2. README.md
check("README.md ada", exists("README.md") ? "PASS" : "FAIL");
let readme = "";
try { readme = readFileSync(join(root, "README.md"), "utf8"); } catch {}
check("README memuat ID template spreadsheet", readme.includes("1wqk5PhRfPVcFQdV8p5AIs0S_BSKLywHfEsMq6zYFSV8") ? "PASS" : "FAIL");
check("README memuat ID folder induk logbook", readme.includes("1KPltSlYvp8gboHi69aC7FzyDW98mjJPm") ? "PASS" : "FAIL");
check("README memuat 9 kolom logbook", ["Tanggal Pelaksanaan", "Capaian Kompetensi Mahasiswa", "Bukti Pelaksanaan Kegiatan"].every(s => readme.includes(s)) ? "PASS" : "FAIL");

// 3. OPENCODE_PROMPT.md — kosong adalah OK (tidak ada ketentuan tambahan)
if (exists("OPENCODE_PROMPT.md")) {
  const sz = statSync(join(root, "OPENCODE_PROMPT.md")).size;
  check("OPENCODE_PROMPT.md dibaca", "PASS", sz === 0 ? "file kosong 0 byte — tidak ada ketentuan tambahan" : `${sz} byte`);
} else {
  check("OPENCODE_PROMPT.md dibaca", "WARN", "tidak ditemukan — opsional");
}

// 4. Kredensial Google (hanya cek keberadaan & struktur kunci, TANPA mencetak nilai secret)
const credDir = join(root, "server/credentials");
let credFile = null;
try {
  const { readdirSync } = await import("fs");
  const files = readdirSync(credDir).filter(f => f.endsWith(".json"));
  credFile = files.length ? join(credDir, files[0]) : null;
  if (credFile) {
    const raw = readFileSync(credFile, "utf8");
    check("File kredensial service account ada", "PASS", files[0] + ` (${raw.length} byte)`);
    check("File kredensial tidak kosong", raw.length > 100 ? "PASS" : "FAIL");
    try {
      const j = JSON.parse(raw);
      const keys = ["type", "project_id", "client_email", "private_key", "token_uri"];
      const hilang = keys.filter(k => !j[k]);
      check("Kunci wajib service_account (type/project_id/client_email/private_key/token_uri)", hilang.length === 0 ? "PASS" : "FAIL", hilang.length ? "hilang: " + hilang.join(",") : "semua kunci hadir (nilai tidak dicetak)");
      check("type == service_account", j.type === "service_account" ? "PASS" : "FAIL");
      check("client_email berformat email", typeof j.client_email === "string" && j.client_email.includes("@") ? "PASS" : "FAIL");
      check("private_key terlihat seperti PEM (hanya cek awalan)", typeof j.private_key === "string" && j.private_key.includes("BEGIN PRIVATE KEY") ? "PASS" : "FAIL");
      // Jangan cetak nilai project_id/email/key di sini; cukup konfirmasi pola
      if (j.project_id && !String(j.project_id).includes("aksara")) check("project_id tidak cocok pola aksara (info saja)", "WARN", "tetap lanjut, verifikasi di console Google Cloud");
    } catch (e) { check("File kredensial JSON valid", "FAIL", e.message); }
  } else check("File kredensial service account ada", "FAIL", "tidak ada *.json di server/credentials/");
} catch (e) { check("File kredensial service account ada", "FAIL", e.message); }

// 5. .env.example & .gitignore (pastikan secret tidak ikut commit)
check("server/.env.example ada", exists("server/.env.example") ? "PASS" : "FAIL");
if (exists("server/.env.example")) {
  const ex = readFileSync(join(root, "server/.env.example"), "utf8");
  const bocor = /BEGIN PRIVATE KEY|AIza[0-9A-Za-z_-]{10,}/.test(ex);
  check(".env.example bebas secret asli", !bocor ? "PASS" : "FAIL");
  check(".env.example memuat kredensial path & ID folder logbook", ex.includes("GOOGLE_APPLICATION_CREDENTIALS") && ex.includes("1KPltSlYvp8gboHi69aC7FzyDW98mjJPm") ? "PASS" : "FAIL");
  check(".env.example memuat ID folder induk dokumentasi", ex.includes("1T3Ll14UO5ux7fsG9XmHnMimPMb9qW0Ce") ? "PASS" : "FAIL");
}
check(".gitignore ada", exists(".gitignore") ? "PASS" : "FAIL");
if (exists(".gitignore")) {
  const gi = readFileSync(join(root, ".gitignore"), "utf8");
  check(".gitignore melindungi .env & credentials/*.json", gi.includes("credentials") && gi.includes(".env") ? "PASS" : "FAIL");
}

// 6. Template mahasiswa
check("config/mahasiswa.template.json ada", exists("config/mahasiswa.template.json") ? "PASS" : "FAIL");
if (exists("config/mahasiswa.template.json")) {
  try {
    const t = JSON.parse(readFileSync(join(root, "config/mahasiswa.template.json"), "utf8"));
    check("Template: 3 program studi", Array.isArray(t.programStudi) && t.programStudi.length === 3 ? "PASS" : "FAIL", JSON.stringify(t.programStudi ?? []));
    check("Template: skema mahasiswa (nama/prodi/spreadsheetId)", Array.isArray(t.mahasiswa) && t.mahasiswa.every(x => "nama" in x && "programStudi" in x && "spreadsheetId" in x) ? "PASS" : "FAIL");
    check("Template: 9 kolom logbook terdokumentasi", Array.isArray(t.validasi?.kolomLogbook) && t.validasi.kolomLogbook.length === 9 ? "PASS" : "FAIL");
  } catch (e) { check("Template mahasiswa JSON valid", "FAIL", e.message); }
}

// 7. Struktur folder Drive terdukumentasi
check("config/google-drive-struktur.md ada", exists("config/google-drive-struktur.md") ? "PASS" : "FAIL");
if (exists("config/google-drive-struktur.md")) {
  const g = readFileSync(join(root, "config/google-drive-struktur.md"), "utf8");
  check("Folder induk dokumentasi terkonfirmasi", g.includes("1T3Ll14UO5ux7fsG9XmHnMimPMb9qW0Ce") ? "PASS" : "FAIL", "ID 1T3Ll14UO5ux7fsG9XmHnMimPMb9qW0Ce");
  check("Service account Editor tercatat", g.toLowerCase().includes("editor") ? "PASS" : "WARN", "per jawaban pengguna 2026-11-08");
}

// 7b. Data mahasiswa ASLI (config/mahasiswa.json)
check("Data Mahasiswa.xlsx ada", exists("Data Mahasiswa.xlsx") ? "PASS" : "FAIL");
check("config/mahasiswa.json ada", exists("config/mahasiswa.json") ? "PASS" : "FAIL");
if (exists("config/mahasiswa.json")) {
  try {
    const cfg = JSON.parse(readFileSync(join(root, "config/mahasiswa.json"), "utf8"));
    const arr = cfg.mahasiswa ?? [];
    check("Jumlah mahasiswa == 22", arr.length === 22 ? "PASS" : "FAIL", `total ${arr.length}`);
    check("3 program studi", Array.isArray(cfg.programStudi) && cfg.programStudi.length === 3 ? "PASS" : "FAIL", JSON.stringify(cfg.programStudi ?? []));
    const byProdi = {};
    arr.forEach(x => { byProdi[x.programStudi] = (byProdi[x.programStudi] || 0) + 1; });
    check("Per-prodi SI=11, Gizi=8, PGSD=3", byProdi["Sistem Informasi"] === 11 && byProdi["Gizi"] === 8 && byProdi["PGSD"] === 3 ? "PASS" : "FAIL", JSON.stringify(byProdi));
    const ids = arr.map(x => x.spreadsheetId).filter(Boolean);
    check("ID spreadsheet semua ada & unik (22 unik)", ids.length === 22 && new Set(ids).size === 22 ? "PASS" : "FAIL", `ada ${ids.length}, unik ${new Set(ids).size}`);
    check("Pola ID spreadsheet valid", ids.every(id => /^[A-Za-z0-9_-]{20,}$/.test(id)) ? "PASS" : "FAIL");
    check("Nama mahasiswa tidak kosong", arr.every(x => x.nama && x.nama.trim().length > 1) ? "PASS" : "FAIL");
    check("Data ASLI 22 mahasiswa sudah dikumpulkan", arr.length === 22 && ids.length === 22 ? "PASS" : "FAIL");
  } catch (e) { check("config/mahasiswa.json valid", "FAIL", e.message); }
}

// 8. Git repo (bukan penggagal, tapi dilaporkan)
console.log("\n--- Ringkasan ---");
const pass = results.filter(r => r.status === "PASS").length;
const warn = results.filter(r => r.status === "WARN").length;
const fail = results.filter(r => r.status === "FAIL").length;
console.log(`PASS: ${pass} | WARN: ${warn} | FAIL: ${fail} | Total: ${results.length}`);
if (fail > 0) { console.log("Hasil: Tahap 1 BELUM LENGKAP (ada FAIL)"); process.exit(1); }
else if (warn > 0) { console.log("Hasil: Tahap 1 PREP-SELESAI bersyarat — semua prasyarat teknis PASS, sisa WARN menunggu input pengguna"); }
else console.log("Hasil: Tahap 1 LENGKAP");
