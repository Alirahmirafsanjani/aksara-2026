import { useCallback, useEffect, useState } from "react";
import { listProdi, listMahasiswa, listEntries, saveEntry, listFolders, listFiles } from "./api.js";

const EMPTY = { no: "", tanggal: "", waktu: "", durasi: "", lokasi: "", rincian: "", hasil: "", capaian: "", bukti: "", keteranganBukti: "" };

// No template 1–40 = urutan hari kegiatan. Sheet tetap menyimpan angka,
// label "Hari ke-N" hanya ditampilkan di UI.
const hariKe = (n) => {
  const m = String(n ?? "").match(/\d+/);
  if (!m) return "";
  const num = Number(m[0]);
  return num > 0 ? `Hari ke-${num}` : "";
};

// Draft logbook yang belum disimpan: disimpan di localStorage per mahasiswa + baris,
// supaya isian tetap ada saat modal ditutup / aplikasi dibuka kembali.
const DRAFT_PREFIX = "aksara:logbook-draft:v1";
const draftKey = (mhs, row) => `${DRAFT_PREFIX}:${mhs || "-"}:${row ?? "new"}`;
const readDraft = (mhs, row) => {
  try {
    const raw = localStorage.getItem(draftKey(mhs, row));
    if (!raw) return null;
    const d = JSON.parse(raw);
    return d && d.form ? d : null;
  } catch { return null; }
};
const writeDraft = (mhs, row, data) => {
  try { localStorage.setItem(draftKey(mhs, row), JSON.stringify({ ...data, savedAt: Date.now() })); } catch { /* penyimpanan penuh / mode privat */ }
};
const removeDraft = (mhs, row) => {
  try { localStorage.removeItem(draftKey(mhs, row)); } catch { /* abaikan */ }
};
const sameForm = (a, b) => {
  const keys = new Set([...Object.keys(a || {}), ...Object.keys(b || {})]);
  for (const k of keys) if (String(a?.[k] ?? "") !== String(b?.[k] ?? "")) return false;
  return true;
};
const fmtDraftTime = (t) => new Date(t).toLocaleString("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });

export default function Logbook() {
  const [prodis, setProdis] = useState(["Sistem Informasi", "PGSD", "Gizi"]);
  const [prodi, setProdi] = useState("");
  const [list, setList] = useState([]);
  const [no, setNo] = useState("");
  const [entries, setEntries] = useState([]);
  const [sheet, setSheet] = useState("");
  const [form, setForm] = useState(EMPTY);
  const [formRow, setFormRow] = useState(null);
  const [editing, setEditing] = useState(false);
  const [jamMulai, setJamMulai] = useState("");
  const [jamSelesai, setJamSelesai] = useState("");
  const [draftAt, setDraftAt] = useState(0);
  const [draftRows, setDraftRows] = useState({});
  const [baseline, setBaseline] = useState(null);
  const parseWaktu = (s) => {
    const t = String(s || "").match(/(\d{1,2})[.:](\d{2})/g) || [];
    return t.length >= 2 ? [t[0].replace(".", ":").padStart(5, "0"), t[1].replace(".", ":").padStart(5, "0")] : ["", ""];
  };
  const toDot = (t) => (t || "").replace(":", ".");
  const hitungDurasi = (a, b) => {
    const [ah, am] = a.split(":").map(Number);
    const [bh, bm] = b.split(":").map(Number);
    let diff = (bh * 60 + bm) - (ah * 60 + am);
    if (diff <= 0) diff += 24 * 60;
    const h = Math.floor(diff / 60);
    const m = diff % 60;
    if (h && m) return `${h} jam ${m} menit`;
    if (h) return `${h} jam`;
    return `${m} menit`;
  };
  const onJam = (which, val) => {
    const mulai = which === "mulai" ? val : jamMulai;
    const selesai = which === "selesai" ? val : jamSelesai;
    if (which === "mulai") setJamMulai(val); else setJamSelesai(val);
    if (mulai && selesai) {
      const waktu = `${toDot(mulai)} - ${toDot(selesai)}`;
      setForm((s) => ({ ...s, waktu, durasi: hitungDurasi(mulai, selesai) }));
    }
  };
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [docFolders, setDocFolders] = useState([]);
  const [docFolderId, setDocFolderId] = useState("");
  const [docFiles, setDocFiles] = useState([]);
  const [docSubs, setDocSubs] = useState([]);
  const [pickerPath, setPickerPath] = useState([]);
  const [pickFileId, setPickFileId] = useState("");
  const [visibleCount, setVisibleCount] = useState(48);
  const photoFiles = docFiles.filter((f) => String(f.mimeType || "").startsWith("image/"));
  useEffect(() => { setVisibleCount(48); setPickFileId(""); }, [docFolderId]);

  const thumbFallback = (ev, f) => {
    const mime = String(f.mimeType || "");
    // HEIC asli tidak bisa dirender <img>: tampilkan placeholder, jangan fallback ke binary HEIC
    if (mime === "image/heic" || mime === "image/heif") {
      ev.currentTarget.src = "data:image/svg+xml;utf8," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="140"><rect width="100%" height="100%" fill="#e2e8f0"/><text x="50%" y="50%" font-size="13" text-anchor="middle" fill="#64748b">HEIC — thumbnail belum termuat</text></svg>`);
      return;
    }
    if (!ev.currentTarget.dataset.fbk) { ev.currentTarget.dataset.fbk = "1"; ev.currentTarget.src = `/api/docs/files/${f.id}/content`; }
  };

  const loadAll = useCallback(async (pr, n) => {
    setErr(""); setLoading(true);
    try {
      if (pr) {
        const d = await listMahasiswa(pr);
        setList(d.mahasiswa || []);
      }
      if (n) {
        const d = await listEntries(n);
        setEntries(d.entries || []);
        setSheet(d.sheet || "");
      }
    } catch (e) { setErr(e.message); }
    setLoading(false);
  }, []);

  useEffect(() => {
    listProdi().then((d) => { setProdis(d.programStudi || prodis); setProdi(d.programStudi?.[0] || ""); }).catch((e) => setErr(e.message));
    listFolders().then((d) => { setDocFolders(d.folders || []); if (d.folders?.length) setDocFolderId(d.folders[0].id); }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { setNo(""); setEntries([]); if (prodi) loadAll(prodi, ""); }, [prodi, loadAll]);
  useEffect(() => { if (docFolderId) listFiles(docFolderId).then((d) => { setDocFiles(d.files || []); setDocSubs(d.subfolders || []); }).catch(() => { setDocFiles([]); setDocSubs([]); }); }, [docFolderId]);

  const refreshDraftRows = useCallback(() => {
    const map = {};
    try {
      const prefix = `${DRAFT_PREFIX}:${no}:`;
      for (let i = 0; i < localStorage.length; i += 1) {
        const k = localStorage.key(i);
        if (k && k.startsWith(prefix)) map[k.slice(prefix.length)] = true;
      }
    } catch { /* localStorage tidak tersedia */ }
    setDraftRows(map);
  }, [no]);

  useEffect(() => { refreshDraftRows(); }, [refreshDraftRows, entries]);

  // Autosave draft setiap ada perubahan di form (langsung, agar tidak hilang saat ditutup).
  useEffect(() => {
    if (!editing || !no) return undefined;
    const key = String(formRow ?? "new");
    const unchanged = !baseline
      || (sameForm(form, baseline.form) && jamMulai === baseline.jamMulai && jamSelesai === baseline.jamSelesai);
    if (unchanged) {
      removeDraft(no, formRow);
      setDraftAt(0);
      setDraftRows((m) => {
        if (!m[key]) return m;
        const next = { ...m };
        delete next[key];
        return next;
      });
      return undefined;
    }
    writeDraft(no, formRow, { form, jamMulai, jamSelesai });
    setDraftAt(Date.now());
    setDraftRows((m) => (m[key] ? m : { ...m, [key]: true }));
    return undefined;
  }, [editing, no, formRow, form, jamMulai, jamSelesai, baseline]);

  const open = (e) => {
    const asli = Object.fromEntries(Object.keys(EMPTY).map((k) => [k, String(e[k] ?? "")]));
    const d = readDraft(no, e.rowIndex);
    const src = d?.form ? { ...asli, ...d.form } : asli;
    setForm(src);
    const [a, b] = parseWaktu(src.waktu);
    setJamMulai(d?.jamMulai ?? a); setJamSelesai(d?.jamSelesai ?? b);
    setBaseline({ form: asli, jamMulai: a, jamSelesai: b });
    setFormRow(e.rowIndex);
    setEditing(true);
    setDraftAt(d?.savedAt || 0);
    setMsg(d?.savedAt ? `Draft tersimpan dipulihkan (${fmtDraftTime(d.savedAt)}).` : ""); setErr("");
  };
  const openNew = () => {
    if (!no) return setErr("Pilih mahasiswa dulu");
    const kosong = entries.find((e) => !e.filled);
    const d = readDraft(no, null);
    const base = { ...EMPTY, no: kosong?.no || "" };
    const src = d?.form ? { ...base, ...d.form } : base;
    setForm(src);
    setBaseline({ form: base, jamMulai: "", jamSelesai: "" });
    setFormRow(null);
    setJamMulai(d?.jamMulai || ""); setJamSelesai(d?.jamSelesai || "");
    setEditing(true);
    setDraftAt(d?.savedAt || 0);
    setMsg(d?.savedAt ? `Draft catatan baru dipulihkan (${fmtDraftTime(d.savedAt)}).` : ""); setErr("");
  };
  const close = () => {
    const berubah = editing && no && baseline
      && !(sameForm(form, baseline.form) && jamMulai === baseline.jamMulai && jamSelesai === baseline.jamSelesai);
    if (berubah) writeDraft(no, formRow, { form, jamMulai, jamSelesai });
    setEditing(false); setDraftAt(0); refreshDraftRows();
    setMsg(berubah ? "Draft tersimpan di perangkat ini — buka lagi barisnya untuk melanjutkan." : "");
  };
  const hapusDraft = () => {
    removeDraft(no, formRow);
    setDraftAt(0);
    setEditing(false);
    refreshDraftRows();
    setMsg("Draft dihapus. Data di spreadsheet tidak berubah.");
  };

  const save = async () => {
    if (!no) return setErr("Pilih mahasiswa dulu");
    if (!form.no || !form.tanggal) return setErr("Nomor hari dan Tanggal wajib diisi");
    setLoading(true); setErr(""); setMsg("");
    try {
      await saveEntry(no, form, formRow);
      removeDraft(no, formRow);
      setDraftAt(0);
      setEditing(false);
      setMsg(`Tersimpan ke spreadsheet (baris ${formRow || "-"})`);
      await loadAll(prodi, no);
      refreshDraftRows();
    } catch (e) { setErr(e.message); }
    setLoading(false);
  };

  const pickBukti = () => {
    const f = docFiles.find((x) => x.id === pickFileId);
    if (!f) return setErr("Pilih satu foto dulu");
    setForm((s) => ({ ...s, bukti: f.webViewLink }));
    setMsg(`Bukti dipilih: ${f.name} (hanya satu foto)`);
  };

  const field = (label, key, ta) => (
    <label>{label}
      {ta ? <textarea value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} rows={3} /> : <input value={form[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} />}
    </label>
  );

  return (
    <>
      <section className="card">
        <h2>Logbook</h2>
        {err && <p className="error">{err}</p>}
        {msg && <p className="ok">{msg}</p>}
        <div className="row">
          <label>Program studi
            <select value={prodi} onChange={(e) => setProdi(e.target.value)}>{prodis.map((p) => <option key={p} value={p}>{p}</option>)}</select>
          </label>
          <label>Mahasiswa
            <select value={no} onChange={(e) => { setNo(e.target.value); if (e.target.value) loadAll(prodi, e.target.value); else setEntries([]); }}>
              <option value="">— Pilih nama —</option>
              {list.map((m) => <option key={m.no} value={m.no}>{m.nama}</option>)}
            </select>
          </label>
          <button onClick={() => no && loadAll(prodi, no)} disabled={loading}>Muat ulang</button>
        </div>
        {sheet && <p className="hint">Sheet: {sheet} · {entries.filter((e) => e.filled).length} terisi / {entries.length} hari</p>}
        {Object.keys(draftRows).length > 0 && (
          <p className="hint"><span className="chip draft">Draft</span> {Object.keys(draftRows).length} isian belum disimpan masih tersimpan di perangkat ini — ketuk barisnya untuk melanjutkan.</p>
        )}
      </section>

      {entries.length > 0 && (
        <section className="card">
          <div className="row between"><h3>Daftar kegiatan — {entries.length} hari (ketuk untuk edit)</h3><button className="primary" onClick={openNew} disabled={loading || !no}>+ Baru</button></div>
          <ul className="entries">
            {entries.map((e) => (
              <li key={e.rowIndex} className={"entry" + (e.filled ? " filled" : "")} onClick={() => open(e)} role="button" tabIndex={0} onKeyDown={(ev) => ev.key === "Enter" && open(e)}>
                <div className="e-head"><b>{hariKe(e.no) || `No ${e.no || "-"}`}{hariKe(e.no) && <span className="e-no">No {e.no}</span>} · {e.tanggal || "-"}</b><span className="e-chips">{draftRows[String(e.rowIndex)] && <span className="chip draft">Draft</span>}<span className={"chip" + (e.filled ? " on" : "")}>{e.filled ? "Terisi" : "Belum"}</span></span></div>
                <div className="e-meta">{e.waktu || "—"} · {e.lokasi || "—"}</div>
                <div className="e-rincian">{e.rincian || <i>belum diisi — ketuk untuk mengisi</i>}</div>
                {e.keteranganBukti && <div className="e-meta">Keterangan bukti: {e.keteranganBukti}</div>}
                {e.bukti && e.bukti.startsWith("http") && <span className="e-bukti" onClick={(ev) => { ev.stopPropagation(); window.open(e.bukti, "_blank"); }}>Bukti foto ↗</span>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {editing && (
        <div className="modal" onClick={close}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="row between"><h3>{formRow ? `Edit ${hariKe(form.no) || `baris ${formRow}`}` : "Catatan baru"}</h3><button className="x" onClick={close} aria-label="Tutup">✕</button></div>
            {err && <p className="error">{err}</p>}
            {msg && <p className="ok">{msg}</p>}
            <div className="form">
              <label>No hari (1–40)
                <input value={form.no} onChange={(e) => setForm({ ...form, no: e.target.value })} inputMode="numeric" placeholder="Contoh: 3" />
                <span className="hint">{hariKe(form.no) ? `Akan tampil sebagai ${hariKe(form.no)} di daftar kegiatan.` : "Nomor ini menentukan Hari ke-N di daftar kegiatan."}</span>
              </label>
              {field("Tanggal Pelaksanaan", "tanggal")}
              <div className="row" style={{ alignItems: "flex-end" }}>
                <label>Jam mulai<input type="time" value={jamMulai} onChange={(e) => onJam("mulai", e.target.value)} /></label>
                <label>Jam selesai<input type="time" value={jamSelesai} onChange={(e) => onJam("selesai", e.target.value)} /></label>
                <span className="hint">Isi jam mulai &amp; selesai → Waktu &amp; Durasi terisi otomatis.</span>
              </div>
              {field("Waktu Pelaksanaan (otomatis)", "waktu")}
              {field("Durasi (otomatis)", "durasi")}
              {field("Lokasi Pelaksanaan", "lokasi")}
              {field("Rincian Pelaksanaan Kegiatan", "rincian", true)}
              {field("Hasil Pelaksanaan Kegiatan", "hasil", true)}
              {field("Capaian Kompetensi Mahasiswa", "capaian", true)}
              <div className="bukti-info">
                <strong>Keterangan bukti:</strong> hanya <strong>satu foto</strong> per catatan, diambil dari folder Dokumentasi (JPG/PNG/HEIC/WEBP; video tidak bisa jadi bukti). Foto harus menunjukkan kegiatan ini. Tautan tersimpan di kolom Bukti. Bila foto dihapus dari Drive, tautan bukti tidak lagi berlaku — ganti bukti lewat form ini.
              </div>
              <label>Bukti Pelaksanaan Kegiatan (satu tautan foto)
                <input value={form.bukti} onChange={(e) => setForm({ ...form, bukti: e.target.value })} placeholder="Tempel tautan atau pilih dari Dokumentasi di bawah" />
              </label>
              <label>Keterangan bukti
                <input value={form.keteranganBukti} onChange={(e) => setForm({ ...form, keteranganBukti: e.target.value })} placeholder="Contoh: Foto para peserta di Balai Kalurahan Salam" />
              </label>
              <div className="photo-picker">
                <p className="pp-title">Pilih satu foto bukti dari Dokumentasi</p>
                <div className="chips" role="tablist" aria-label="Folder dokumentasi">
                  {docFolders.map((f) => <button type="button" key={f.id} className={"chip-folder" + (f.id === docFolderId ? " on" : "")} onClick={() => { setPickerPath([]); setDocFolderId(f.id); }}>{f.name}</button>)}
                </div>
                {(pickerPath.length > 0 || docSubs.length > 0) && (
                  <div className="crumb">
                    <button type="button" onClick={() => { const p = [...pickerPath]; const prev = p.pop(); setPickerPath(p); if (prev) setDocFolderId(prev.id); }} disabled={pickerPath.length === 0}>Kembali</button>
                    <span>{docSubs.length > 0 ? `Subfolder: ${docSubs.map((s) => s.name).join(", ")}` : ""} — ketuk untuk masuk:</span>
                  </div>
                )}
                {docSubs.length > 0 && (
                  <div className="chips">
                    {docSubs.map((s) => <button type="button" key={s.id} className="chip-folder" onClick={() => { setPickerPath((p) => [...p, { id: docFolderId, name: "" }]); setDocFolderId(s.id); }}>{s.name}</button>)}
                  </div>
                )}
                <p className="hint">Menampilkan {Math.min(visibleCount, photoFiles.length)} dari {photoFiles.length} foto (hanya gambar; video disembunyikan).</p>
                {photoFiles.length === 0 && <p className="hint">Tidak ada foto di folder ini. Pilih folder lain atau unggah foto di menu Dokumentasi.</p>}
                <div className="thumb-grid">
                  {photoFiles.slice(0, visibleCount).map((f) => (
                    <button type="button" key={f.id} className={"thumb-item" + (f.id === pickFileId ? " sel" : "")} onClick={() => setPickFileId(f.id)} title={f.name} aria-pressed={f.id === pickFileId}>
                      <img src={f.thumbnailUrl} alt={f.name} loading="lazy" decoding="async" onError={(e) => thumbFallback(e, f)} />
                      <span>{f.name}</span>
                      {f.id === pickFileId && <span className="check">Terpilih</span>}
                    </button>
                  ))}
                </div>
                {visibleCount < photoFiles.length && <div className="row"><button type="button" onClick={() => setVisibleCount((n) => n + 48)}>Tampilkan 48 foto lagi</button></div>}
                {(() => {
                  const sel = docFiles.find((f) => f.id === pickFileId);
                  if (!sel) return null;
                  return (
                    <div className="bukti-preview">
                      <img src={sel.thumbnailUrl} alt={sel.name} onError={(e) => thumbFallback(e, sel)} />
                      <div>
                        <p><strong>Foto dipilih:</strong> {sel.name}</p>
                        <div className="row">
                          <button type="button" className="primary" onClick={pickBukti} disabled={loading}>Gunakan sebagai bukti</button>
                          <button type="button" onClick={() => setPickFileId("")}>Batalkan pilihan</button>
                        </div>
                      </div>
                    </div>
                  );
                })()}
                {form.bukti && (
                  <div className="bukti-saat-ini">
                    <p className="hint">Bukti saat ini: <a href={form.bukti} target="_blank" rel="noreferrer">Buka tautan foto</a></p>
                    <button type="button" onClick={() => setForm({ ...form, bukti: "" })}>Hapus bukti</button>
                  </div>
                )}
              </div>
              <p className="hint draft-note">{draftAt ? `Draft tersimpan otomatis di perangkat ini · ${fmtDraftTime(draftAt)}` : "Isian otomatis disimpan sebagai draft di perangkat ini sampai Anda menekan Simpan logbook."}</p>
              <div className="row">
                <button className="primary" onClick={save} disabled={loading || !no}>Simpan logbook</button>
                <button onClick={close} disabled={loading}>Tutup (draft disimpan)</button>
                <button onClick={hapusDraft} disabled={loading}>Hapus draft</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
