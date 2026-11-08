import { useCallback, useEffect, useRef, useState } from "react";
import { listFolders, createFolder, listFiles, uploadPhotos, deleteFile } from "./api.js";
import Logbook from "./Logbook.jsx";

const ACCEPT = ".jpg,.jpeg,.png,.heic,.heif,.webp";

export default function App() {
  const [tab, setTab] = useState("dokumentasi");
  const [folders, setFolders] = useState([]);
  const [folderId, setFolderId] = useState("");
  const [files, setFiles] = useState([]);
  const [folderName, setFolderName] = useState("");
  const [newFolder, setNewFolder] = useState("");
  const [selected, setSelected] = useState([]);
  const [lightbox, setLightbox] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const fileRef = useRef(null);

  const loadFolders = useCallback(async () => {
    setErr("");
    try {
      const d = await listFolders();
      setFolders(d.folders || []);
      if (!folderId && d.folders?.length) setFolderId(d.folders[0].id);
    } catch (e) { setErr(e.message); }
  }, [folderId]);

  const loadFiles = useCallback(async () => {
    if (!folderId) return;
    setLoading(true); setErr("");
    try {
      const d = await listFiles(folderId);
      setFiles(d.files || []);
      setFolderName(d.folder?.name || folders.find((f) => f.id === folderId)?.name || "");
    } catch (e) { setErr(e.message); setFiles([]); }
    setLoading(false);
  }, [folderId, folders]);

  useEffect(() => { loadFolders(); }, [loadFolders]);
  useEffect(() => { loadFiles(); }, [loadFiles]);

  const doCreate = async (e) => {
    e.preventDefault();
    const name = newFolder.trim(); if (!name) return setErr("Nama folder wajib diisi");
    setLoading(true); setErr(""); setMsg("");
    try { const d = await createFolder(name); setNewFolder(""); setMsg(`Folder "${d.folder.name}" dibuat`); await loadFolders(); setFolderId(d.folder.id); }
    catch (e2) { setErr(e2.message); }
    setLoading(false);
  };

  const onPick = (e) => {
    const list = [...e.target.files];
    const bad = list.filter((f) => !/image\/(jpeg|png|heic|heif|webp)/.test(f.type) && !/\.(jpe?g|png|heic|heif|webp)$/i.test(f.name));
    if (bad.length) setErr(`Format tidak didukung: ${bad.map((f) => f.name).join(", ")}. Gunakan JPG/PNG/HEIC/WEBP.`);
    else setErr("");
    setSelected(list);
  };

  const doUpload = async () => {
    if (!folderId) return setErr("Pilih folder dulu");
    if (!selected.length) return setErr("Pilih foto dulu");
    setLoading(true); setErr(""); setMsg(`Mengunggah ${selected.length} file...`);
    try { const d = await uploadPhotos(folderId, selected); setMsg(`Berhasil mengunggah ${d.files.length} foto`); setSelected([]); if (fileRef.current) fileRef.current.value = ""; await loadFiles(); }
    catch (e) { setErr(e.message); }
    setLoading(false);
  };

  const doDelete = async (f) => {
    if (!confirm(`Hapus "${f.name}"? File akan dipindah ke sampah Google Drive.\n\nCatatan: jika foto ini sedang dipakai sebagai bukti logbook, tautan bukti akan tidak valid. Catatan logbook TIDAK ikut terhapus.`)) return;
    setLoading(true); setErr("");
    try { await deleteFile(f.id); setMsg("Foto dihapus"); if (lightbox >= 0) setLightbox(-1); await loadFiles(); }
    catch (e) { setErr(e.message); }
    setLoading(false);
  };

  useEffect(() => {
    const h = (e) => {
      if (lightbox < 0) return;
      if (e.key === "Escape") setLightbox(-1);
      if (e.key === "ArrowRight") setLightbox((i) => (i + 1) % files.length);
      if (e.key === "ArrowLeft") setLightbox((i) => (i - 1 + files.length) % files.length);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [lightbox, files.length]);

  const cur = lightbox >= 0 ? files[lightbox] : null;

  return (
    <div className="app">
      <header>
        <div>
          <p className="kicker">Aplikasi Kegiatan</p>
          <h1>Aksara 2026</h1>
          <p className="sub">Logbook &amp; Dokumentasi · 22 mahasiswa · 3 prodi</p>
        </div>
        <nav aria-label="Menu utama">
          <button className={tab === "dokumentasi" ? "on" : ""} onClick={() => setTab("dokumentasi")}>Dokumentasi</button>
          <button className={tab === "logbook" ? "on" : ""} onClick={() => setTab("logbook")}>Logbook</button>
        </nav>
      </header>

      {tab === "logbook" && <Logbook />}

      {tab === "dokumentasi" && (
        <>
          <section className="card">
            <h2>Folder Dokumentasi</h2>
            {err && <p className="error">{err}</p>}
            {msg && <p className="ok">{msg}</p>}
            <div className="row">
              <select value={folderId} onChange={(e) => setFolderId(e.target.value)} aria-label="Pilih folder">
                {folders.length === 0 && <option value="">Tidak ada folder</option>}
                {folders.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
              <button onClick={loadFolders} disabled={loading}>Muat ulang</button>
            </div>
            <form className="row" onSubmit={doCreate}>
              <input value={newFolder} onChange={(e) => setNewFolder(e.target.value)} placeholder="Nama folder baru (mis. Day 5)" />
              <button type="submit" disabled={loading}>Buat folder</button>
            </form>
          </section>

          <section className="card">
            <h2>Unggah Foto ke {folderName ? `"${folderName}"` : "—"}</h2>
            <div className="row">
              <input ref={fileRef} type="file" multiple accept={ACCEPT} onChange={onPick} />
              <button onClick={doUpload} disabled={loading || !selected.length}>Unggah ({selected.length})</button>
            </div>
            {selected.length > 0 && <ul className="names">{selected.map((f, i) => <li key={i}>{f.name} · {(f.size / 1024).toFixed(0)} KB</li>)}</ul>}
            <p className="hint">Format: JPG/PNG/HEIC/WEBP, maks 15MB/file.</p>
          </section>

          <section className="card">
            <h2>{folderName ? `Foto — ${folderName}` : "Foto"} ({files.length})</h2>
            {loading && <p>Memuat...</p>}
            {!loading && files.length === 0 && <p className="hint">Tidak ada foto di folder ini.</p>}
            <div className="grid">
              {files.map((f, i) => {
                const isVideo = String(f.mimeType || "").startsWith("video/");
                return (
                <figure key={f.id} className="ph">
                  <button className="thumb" onClick={() => setLightbox(i)} aria-label={`Buka ${f.name}`}>
                    {isVideo ? <span className="vbadge">▶ Video</span> : <img src={f.thumbnailUrl} alt={f.name} loading="lazy" />}
                  </button>
                  <figcaption>{f.name}</figcaption>
                  <button className="danger" onClick={() => doDelete(f)} disabled={loading}>Hapus</button>
                </figure>
                );
              })}
            </div>
          </section>

          {cur && (
            <div className="lightbox" role="dialog" aria-modal="true" onClick={() => setLightbox(-1)}>
              <div className="lb-inner" onClick={(e) => e.stopPropagation()}>
                {(() => {
                  const mime = String(cur.mimeType || "");
                  if (mime.startsWith("video/")) return <video src={`/api/docs/files/${cur.id}/content`} controls autoPlay style={{ maxWidth: "100%", maxHeight: "75vh" }} />;
                  if (mime === "image/heic" || mime === "image/heif")
                    return (<>
                      <img src={cur.thumbnailUrl} alt={cur.name} style={{ maxWidth: "100%", maxHeight: "70vh" }} />
                      <p className="hint">HEIC asli tidak didukung pratinjau browser. Thumbnail Google ditampilkan; file asli tidak diubah. Buka di <a href={cur.webViewLink} target="_blank" rel="noreferrer">Google Drive</a> untuk resolusi penuh.</p>
                    </>);
                  return <img src={`/api/docs/files/${cur.id}/content`} alt={cur.name} />;
                })()}
                <div className="row between">
                  <span>{cur.name} · folder: {folderName}</span>
                  <span>
                    <button onClick={() => setLightbox((lightbox - 1 + files.length) % files.length)}>‹ Sebelumnya</button>
                    <button onClick={() => setLightbox((lightbox + 1) % files.length)}>Berikutnya ›</button>
                    <button onClick={() => setLightbox(-1)}>Tutup</button>
                  </span>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
