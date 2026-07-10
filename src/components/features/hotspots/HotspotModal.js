import React, { useEffect, useMemo, useState } from "react";
import {
  FaTimes,
  FaChevronDown,
  FaChevronRight,
  FaFolder,
  FaFilePdf,
  FaImage,
  FaVideo,
  FaPaperclip,
  FaExternalLinkAlt,
  FaInfoCircle,
} from "react-icons/fa";
import "./HotspotModal.css";
import { buildAttachmentTree, detectFileType } from "../../../helpers/buildAttachmentTree";

/* =========================
   Tree
========================= */
function TreeNode({ node, level = 0 }) {
  const [open, setOpen] = useState(level <= 1);

  const hasChildren = (node.children?.length || 0) > 0;
  const hasFiles = (node.files?.length || 0) > 0;

  if (!hasChildren && !hasFiles) return null;

  const padLeft = 12 + level * 14;

  return (
    <div className="hs-tree-node">
      {node.name !== "root" && (
        <button
          type="button"
          className="hs-tree-folder"
          onClick={() => setOpen(v => !v)}
          style={{ paddingLeft: padLeft }}
        >
          <span className="hs-tree-folder__chev">
            {open ? <FaChevronDown /> : <FaChevronRight />}
          </span>
          <span className="hs-tree-folder__icon">
            <FaFolder />
          </span>
          <span className="hs-tree-folder__name">{node.name}</span>
        </button>
      )}

      {(node.name === "root" || open) && (
        <div className="hs-tree-children">
          {hasChildren &&
            node.children.map(child => (
              <TreeNode
                key={`${node.name}-${child.name}`}
                node={child}
                level={node.name === "root" ? level : level + 1}
              />
            ))}

          {hasFiles &&
            node.files.map((att, idx) => {
              const { isPdf, isImage, isVideo } = detectFileType(att);

              const icon = isPdf ? (
                <FaFilePdf />
              ) : isVideo ? (
                <FaVideo />
              ) : isImage ? (
                <FaImage />
              ) : (
                <FaPaperclip />
              );

              return (
                <div
                  className="hs-tree-file"
                  key={`${att.url}_${idx}`}
                  style={{ paddingLeft: padLeft + 26 }}
                >
                  <div className={`hs-tree-file__icon ${isPdf ? "pdf" : ""}`}>
                    {icon}
                  </div>

                  <div className="hs-tree-file__meta">
                    <div className="hs-tree-file__name">{att.__name}</div>
                    <div className="hs-tree-file__sub">
                      {att.mimetype || "archivo"}
                      {att.size ? ` · ${Math.round(att.size / 1024)} KB` : ""}
                    </div>
                  </div>

                  <a
                    className="hs-tree-file__btn"
                    href={att.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <FaExternalLinkAlt /> Abrir
                  </a>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}

/* =========================
   Modal
========================= */
export default function HotspotModal({ isOpen, onClose, content }) {
  const [visible, setVisible] = useState(false);

  /* 🔒 Hooks SIEMPRE arriba */
  useEffect(() => {
    setVisible(!!isOpen);
  }, [isOpen]);

  const type = content?.hotspotType || content?.type || "info";
  const isInfo = type === "info";

  const title = content?.title || (isInfo ? "Información" : "Elemento");
  const description = content?.description || "";

  const attachments = useMemo(() => {
    if (!isOpen) return [];
    const a = Array.isArray(content?.attachments) ? content.attachments : [];
    return a.map(x => ({
      ...x,
      __name: x.originalName || x.filename || x.name || "archivo",
    }));
  }, [content, isOpen]);

  const tree = useMemo(() => {
    if (attachments.length === 0) return null;
    return buildAttachmentTree(attachments);
  }, [attachments]);

  /* 🔑 El return temprano VA DESPUÉS de los hooks */
  if (!isOpen) return null;

  return (
    <div className={`hs-modal-overlay ${visible ? "visible" : ""}`}>
      <div
        className={`hs-modal ${isInfo ? "hs-modal--info" : "hs-modal--element"}`}
        onClick={e => e.stopPropagation()}
      >
        <button className="hs-modal-close" onClick={onClose}>
          <FaTimes />
        </button>

        {/* HEADER */}
        <div className="hs-modal-header">
          <div className="hs-modal-title-row">
            <span className={`hs-pill ${isInfo ? "info" : "element"}`}>
              {isInfo ? <FaInfoCircle /> : <FaPaperclip />}
              {isInfo ? "Info" : "Elemento"}
            </span>
            <h2 className="hs-modal-title">{title}</h2>
          </div>

          {description && (
            <p className="hs-modal-description">{description}</p>
          )}
        </div>

        {/* BODY SOLO PARA ELEMENT */}
        {!isInfo && (
          <div className="hs-modal-section">
            <h4 className="hs-modal-h4">Anexos</h4>

            {attachments.length === 0 ? (
              <div className="hs-empty">
                No hay anexos todavía.
              </div>
            ) : (
              <div className="hs-tree">
                <TreeNode node={tree} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
