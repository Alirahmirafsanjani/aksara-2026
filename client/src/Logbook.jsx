import { useCallback, useEffect, useState } from "react";
import { listProdi, listMahasiswa, listEntries, saveEntry, listFolders, listFiles } from "./api.js";

const EMPTY = { no: "", tanggal: "", waktu: "", durasi: "", lokasi: "", rincian: "", hasil: "", capaian: "", bukti: "" };

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
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [docFolders, setDocFolders] = useState([]);
  const [docFolderId, setDocFolderId] = useState("");
  const [docFiles, setDocFiles] = useState([]);
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
  useEffect(() => { if (docFolderId) listFiles(docFolderId).then((d) => setDocFiles(d.files || [])).catch(() => setDocFiles([])); }, [docFolderId]);

  const open = (e) => {
    setForm({ no: e.no, tanggal: e.tanggal, waktu: e.waktu, durasi: e.durasi, lokasi: e.lokasi, rincian: e.rincian, hasil: e.hasil, capaian: e.capaian, bukti: e.bukti });
    setFormRow(e.rowIndex);
    setEditing(true);
    setMsg(""); setErr("");
  };
  const openNew = () => {
    if (!no) return setErr("Pilih mahasiswa dulu");
    setForm(EMPTY); setFormRow(null); setEditing(true); setMsg(""); setErr("");
  };
  const close = () => setEditing(false);

  const save = async () => {
    if (!no) return setErr("Pilih mahasiswa dulu");
    if (!form.no || !form.tanggal) return setErr("No dan Tanggal wajib diisi");
    setLoading(true); setErr(""); setMsg("");
    try {
      await saveEntry(no, form, formRow);
      setEditing(false);
      setMsg(`Tersimpan ke spreadsheet (baris ${formRow || "-"})`);
      await loadAll(prodi, no);
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
        {sheet && <p className="hint">Sheet: {sheet} · {entries.filter((e) => e.filled).length} terisi / {entries.length} baris</p>}
      </section>

      {entries.length > 0 && (
        <section className="card">
          <div className="row between"><h3>Daftar kegiatan ({entries.length}) — ketuk untuk edit</h3><button className="primary" onClick={openNew} disabled={loading || !no}>+ Baru</button></div>
          <ul className="entries">
            {entries.map((e) => (
              <li key={e.rowIndex} className={"entry" + (e.filled ? " filled" : "")} onClick={() => open(e)} role="button" tabIndex={0} onKeyDown={(ev) => ev.key === "Enter" && open(e)}>
                <div className="e-head"><b>No {e.no || "-"} · {e.tanggal || "-"}</b><span className={"chip" + (e.filled ? " on" : "")}>{e.filled ? "Terisi" : "Belum"}</span></div>
                <div className="e-meta">{e.waktu || "—"} · {e.lokasi || "—"}</div>
                <div className="e-rincian">{e.rincian || <i>belum diisi — ketuk untuk mengisi</i>}</div>
                {e.bukti && e.bukti.startsWith("http") && <span className="e-bukti" onClick={(ev) => { ev.stopPropagation(); window.open(e.bukti, "_blank"); }}>Bukti foto ↗</span>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {editing && (
        <div className="modal" onClick={close}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="row between"><h3>{formRow ? `Edit baris ${formRow}` : "Catatan baru"}</h3><button className="x" onClick={close} aria-label="Tutup">✕</button></div>
            {err && <p className="error">{err}</p>}
            <div className="form">
              {field("No", "no")}
              {field("Tanggal Pelaksanaan", "tanggal")}
              {field("Waktu Pelaksanaan", "waktu")}
              {field("Durasi", "durasi")}
              {field("Lokasi Pelaksanaan", "lokasi")}
              {field("Rincian Pelaksanaan Kegiatan", "rincian", true)}
              {field("Hasil Pelaksanaan Kegiatan", "hasil", true)}
              {field("Capaian Kompetensi Mahasiswa", "capaian", true)}
              <label>Bukti Pelaksanaan Kegiatan (satu tautan foto)
                <input value={form.bukti} onChange={(e) => setForm({ ...form, bukti: e.target.value })} placeholder="Tempel tautan atau pilih dari Dokumentasi di bawah" />
              </label>
              <div className="photo-picker">
                <p className="pp-title">Pilih satu foto bukti dari Dokumentasi</p>
                <p className="hint">Keterangan bukti: hanya <strong>satu foto</strong> per catatan, diambil dari folder Dokumentasi (JPG/PNG/HEIC/WEBP; video tidak bisa jadi bukti). Foto harus menunjukkan kegiatan ini. Tautan tersimpan di kolom Bukti. Bila foto dihapus dari Drive, tautan bukti tidak lagi berlaku — ganti bukti lewat form ini.</p>
                <div className="chips" role="tablist" aria-label="Folder dokumentasi">
                  {docFolders.map((f) => <button type="button" key={f.id} className={"chip-folder" + (f.id === docFolderId ? " on" : "")} onClick={() => setDocFolderId(f.id)}>{f.name}</button>)}
                </div>
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
              <div className="row">
                <button className="primary" onClick={save} disabled={loading || !no}>Simpan logbook</button>
                <button onClick={close} disabled={loading}>Batal</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
