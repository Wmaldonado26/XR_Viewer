// src/helpers/buildAttachmentTree.js
export function buildAttachmentTree(attachments = []) {
  // Nodo raíz
  const root = { name: "root", children: new Map(), files: [] };

  const safeArr = Array.isArray(attachments) ? attachments : [];

  for (const att of safeArr) {
    if (!att?.url) continue;

    const name =
      att.originalName ||
      att.filename ||
      att.name ||
      att.title ||
      "archivo";

    // folder puede ser: "Motor/Manuales" o "Planos"
    const folderRaw = String(att.folder || att.path || "Adjuntos").trim();
    const parts = folderRaw
      .split("/")
      .map((p) => p.trim())
      .filter(Boolean);

    let node = root;
    for (const part of parts) {
      if (!node.children.has(part)) {
        node.children.set(part, { name: part, children: new Map(), files: [] });
      }
      node = node.children.get(part);
    }

    node.files.push({
      ...att,
      __name: name,
    });
  }

  // Convertir Map -> Array recursivo y ordenar
  const toArray = (n) => {
    const children = Array.from(n.children.values())
      .map(toArray)
      .sort((a, b) => a.name.localeCompare(b.name));

    const files = (n.files || []).slice().sort((a, b) =>
      String(a.__name || "").localeCompare(String(b.__name || ""))
    );

    return { name: n.name, children, files };
  };

  return toArray(root);
}

export function detectFileType(att) {
  const name = String(att?.__name || att?.originalName || att?.filename || "")
    .toLowerCase()
    .trim();

  const mime = String(att?.mimetype || "").toLowerCase();

  const isPdf = mime.includes("pdf") || name.endsWith(".pdf") || String(att?.url || "").toLowerCase().includes(".pdf");
  const isImage =
    mime.startsWith("image/") ||
    name.endsWith(".png") ||
    name.endsWith(".jpg") ||
    name.endsWith(".jpeg") ||
    name.endsWith(".webp") ||
    name.endsWith(".gif");
  const isVideo =
    mime.startsWith("video/") ||
    name.endsWith(".mp4") ||
    name.endsWith(".webm") ||
    name.endsWith(".mov");

  return { isPdf, isImage, isVideo };
}
