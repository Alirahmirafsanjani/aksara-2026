export const API = "";
async function parse(res) {
  const text = await res.text();
  let data; try { data = JSON.parse(text); } catch { data = { error: text }; }
  if (!res.ok) throw new Error(data?.error || `Gagal (${res.status})`);
  return data;
}
export async function listFolders(signal) {
  const r = await fetch(`${API}/api/docs/folders`, { signal }); return parse(r);
}
export async function createFolder(name, signal) {
  const r = await fetch(`${API}/api/docs/folders`, { signal, method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) }); return parse(r);
}
export async function listFiles(folderId, signal) {
  const r = await fetch(`${API}/api/docs/folders/${encodeURIComponent(folderId)}/files`, { signal }); return parse(r);
}
export async function uploadPhotos(folderId, files, onFile) {
  const fd = new FormData();
  files.forEach((f) => fd.append("photos", f));
  const r = await fetch(`${API}/api/docs/folders/${encodeURIComponent(folderId)}/upload`, { method: "POST", body: fd });
  const data = await parse(r);
  onFile?.(files.length);
  return data;
}
export async function deleteFile(fileId, signal) {
  const r = await fetch(`${API}/api/docs/files/${encodeURIComponent(fileId)}`, { signal, method: "DELETE" }); return parse(r);
}

// --- Logbook ---
export async function listProdi(signal) {
  const r = await fetch(`${API}/api/logbook/prodi`, { signal }); return parse(r);
}
export async function listMahasiswa(prodi, signal) {
  const q = prodi ? `?prodi=${encodeURIComponent(prodi)}` : "";
  const r = await fetch(`${API}/api/logbook/mahasiswa${q}`, { signal }); return parse(r);
}
export async function listEntries(no, signal) {
  const r = await fetch(`${API}/api/logbook/${encodeURIComponent(no)}/entries`, { signal }); return parse(r);
}
export async function saveEntry(no, entry, rowIndex, signal) {
  const isEdit = Number.isInteger(rowIndex) && rowIndex >= 2;
  const url = `${API}/api/logbook/${encodeURIComponent(no)}/entries${isEdit ? `/${rowIndex}` : ""}`;
  const r = await fetch(url, { signal, method: isEdit ? "PUT" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(entry) }); return parse(r);
}
