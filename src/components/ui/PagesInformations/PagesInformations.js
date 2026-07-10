import { useMemo, useState, useRef, useEffect, useCallback } from "react";
import { FaChevronLeft, FaChevronRight, FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import DynamicNavbar from "../../layout/Navbar/DynamicNavbar";
import projectService from "../../../api/services/projectService";
import "./PagesInformations.css";

const STATIC_BUSINU = {
  name: "BUSINU",
  description:
    "Embarcacion disenada en casco de acero naval para el transporte de pasajeros en el rio Sinu - Monteria, cuenta con equipos y estandares de calidad que aseguran una navegacion segura y confortable. Su diseno de baja complejidad simplifica su mantenimiento y operacion brindando una alta disponibilidad al usuario. Este proyecto busca mejorar el transporte por via fluvial en la capital del departamento de Cordoba. 'BUSINU', un proyecto de beneficio social, tendra un alto impacto en la economia de la region Caribe y el pais, ya que permitira la generacion de 320 empleos directos y 960 empleos indirectos, asi como tambien, 35.595 horas hombre y la integracion de empresas nacionales como proveedoras de los equipos e insumos requeridos durante el constructivo.",
  tags: [],
  highlights: [
    { label: "Velocidad maxima", value: "7.50 Nudos" },
    { label: "CAPACIDADES", value: "(317Gal) 1,20 m3" },
    { label: "Paneles Solar", value: "04 paneles fotovoltaicos" },
    { label: "Colado plena carga", value: "0.75 m" },
  ],
  specs: {
    Dimensiones: [
      { k: "Eslora", v: "15.60 m" },
      { k: "Manga", v: "4.50 m" },
      { k: "Puntal", v: "1.30 m" },
      { k: "Calado maxima carga", v: "0.75 m" },
      { k: "Calado aereo", v: "3.30 m" },
    ],
    ACOMODACIONES: [
      { k: "Pasajeros", v: "36 Personas" },
      { k: "Tripulacion", v: "02 Personas" },
      { k: "Especial", v: "02 x Sillas de Rueda" },
    ],
    PROPULSION: [
      { k: "Motores", v: "02 x Fuera de borda, 4 tiempos" },
      { k: "Potencia", v: "02 x 200 HP Gasolina" },
    ],
    EQUIPOS_ELECTRICOS: [
      { k: "Generador", v: "02 x Fuera de borda, 4 tiempos" },
      { k: "Baterias", v: "04 x bancos - 150A/h@12VDC" },
    ],
    EQUIPOS_AUXILIARES: [
      { k: "A/A", v: "03 x 15000BTU, Dometic, 115V" },
      { k: "Winche", v: "02 x manuales para rampas" },
      { k: "Rampa", v: "02 x rampas de acceso (2,0x0,9m)" },
    ],
  },
  gallery: [
    { id: "businu-01", src: "/images/BUSINU.png", title: "Principal" },
    { id: "businu-02", src: "/images/BUSINU_02.png", title: "Render 2" },
    { id: "businu-03", src: "/images/BUSINU_03.png", title: "Render 3" },
    { id: "businu-04", src: "/images/BUSINU_04.png", title: "Detalle 1" },
    { id: "businu-05", src: "/images/BUSINU_05.png", title: "Detalle 2" },
  ],
  attachments: [
    {
      id: "att-01",
      title: "Hoja tecnica",
      category: "Ficha tecnica",
      description: "Especificaciones generales del proyecto",
      format: "PDF",
      size: "2.4 MB",
      updatedAt: "2026-01-27",
      url: "/docs/HT-4209-B%201.pdf",
    },
    {
      id: "att-02",
      title: "Arreglo General de la embarcacion",
      category: "Manuales",
      description: "Disposicion general de la embarcacion AS BUILT",
      format: "PDF",
      size: "6.1 MB",
      updatedAt: "2026-01-10",
      url: "/docs/MER-250-601-01_Disposicion general_AS BUILT.pdf",
    },
    {
      id: "att-03",
      title: "Render exterior",
      category: "Renders",
      description: "Vista general exterior (alta resolucion)",
      format: "PNG",
      size: "4.8 MB",
      updatedAt: "2026-01-05",
      url: "/images/BUSINU.png",
    },
  ],
};

const PagesInformations = () => {
  const navigate = useNavigate();
  const [ship, setShip] = useState({
    name: "Cargando...",
    description: "Cargando información del proyecto...",
    tags: [],
    highlights: [],
    specs: {},
    gallery: [{ id: "loading", src: "/images/default_image.png", title: "Cargando" }],
    attachments: []
  });

  const [idx, setIdx] = useState(0);

  const getShipFromProject = (active) => {
    let highlights = [];
    if (active.highlights && active.highlights.length > 0) {
      highlights = active.highlights;
    } else {
      const firstCat = Object.keys(active.specs || {})[0];
      if (firstCat && active.specs[firstCat]?.length > 0) {
        highlights = active.specs[firstCat].slice(0, 4).map(s => ({
          label: s.k,
          value: s.v
        }));
      } else {
        highlights = [
          { label: "Tipo", value: active.vesselType || "Embarcación" },
          { label: "Estado", value: active.status === "active" ? "Activo" : "Borrador" }
        ];
      }
    }

    let gallery = [];
    if (active.gallery && active.gallery.length > 0) {
      gallery = active.gallery;
    } else {
      gallery = [
        { id: "thumb", src: active.thumbnail || "/images/default_image.png", title: "Principal" }
      ];
    }

    return {
      name: active.name || "Sin nombre",
      description: active.description || "Sin descripción",
      tags: active.tags || [],
      highlights: highlights,
      specs: active.specs || {},
      gallery: gallery,
      attachments: active.attachments || []
    };
  };

  useEffect(() => {
    (async () => {
      try {
        const active = await projectService.getActiveProject();
        if (active) {
          setShip(getShipFromProject(active));
          setIdx(0);
        } else {
          setShip(STATIC_BUSINU);
          setIdx(0);
        }
      } catch (error) {
        console.error("Error loading active project in PagesInformations:", error);
        setShip(STATIC_BUSINU);
        setIdx(0);
      }
    })();
  }, []);

  const [mounted, setMounted] = useState(false);
  const [expandedSpecs, setExpandedSpecs] = useState([]);
  const [attachmentCategory, setAttachmentCategory] = useState("Todos");
  const specTrackRef = useRef(null);

  useEffect(() => {
    const timeoutId = setTimeout(() => setMounted(true), 50);
    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    const elements = Array.from(document.querySelectorAll(".pi-spec-card"));
    if (!elements.length || typeof IntersectionObserver === "undefined") return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const element = entry.target;
          if (entry.isIntersecting) {
            const elementIndex = elements.indexOf(element);
            element.style.animationDelay = `${(elementIndex % 6) * 80}ms`;
            element.classList.add("pi-inview");
          }
        });
      },
      { threshold: 0.15 }
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [ship.specs]);

  const toggleSpec = useCallback((group) => {
    setExpandedSpecs((prev) =>
      prev.includes(group) ? prev.filter((item) => item !== group) : prev.concat(group)
    );
  }, []);

  const categories = useMemo(() => {
    const base = ["Todos"];
    const unique = Array.from(
      new Set((ship.attachments || []).map((attachment) => attachment.category).filter(Boolean))
    );
    return base.concat(unique);
  }, [ship.attachments]);

  const filteredAttachments = useMemo(() => {
    const list = ship.attachments || [];
    if (attachmentCategory === "Todos") return list;
    return list.filter((attachment) => attachment.category === attachmentCategory);
  }, [ship.attachments, attachmentCategory]);

  const prev = () => {
    setIdx((prevIdx) => (prevIdx - 1 + ship.gallery.length) % ship.gallery.length);
  };

  const next = () => {
    setIdx((prevIdx) => (prevIdx + 1) % ship.gallery.length);
  };

  const scrollSpecs = (direction) => {
    const element = specTrackRef.current;
    if (!element) return;

    const card = element.querySelector(".pi-spec-card");
    const cardWidth = card ? card.getBoundingClientRect().width : 320;
    const step = cardWidth + 12;
    element.scrollBy({ left: direction * step, behavior: "smooth" });
  };

  return (
    <div className="pi-page">
      <header className="pi-header">
        <DynamicNavbar
          showBackButton={false}
          darkMode={false}
          onToggleDarkMode={() => {}}
          scenes={{}}
          currentScene={null}
          onSceneSelect={() => {}}
        />
        
        <div style={{ width: '100%', padding: '0 40px', marginTop: '-12px', display: 'flex', justifyContent: 'flex-start' }}>
          <button 
            onClick={() => navigate(-1)} 
            style={{ padding: '10px 20px', borderRadius: '10px', background: '#ffffff', color: '#334155', border: '1px solid rgba(0,0,0,0.1)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '8px', fontWeight: 'bold', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}
          >
            <FaArrowLeft /> Volver
          </button>
        </div>
      </header>

      <main className="pi-container">
        <div className={`pi-card ${mounted ? "pi-entered" : "pi-entering"}`}>
          <section className="pi-left">
            <div className="pi-hero">
              <img
                className="pi-hero-img"
                src={ship.gallery[idx].src}
                alt={ship.gallery[idx].title || `img-${idx}`}
              />

              <button
                className="pi-nav pi-nav-left"
                onClick={prev}
                type="button"
                aria-label="Anterior"
              >
                <FaChevronLeft />
              </button>
              <button
                className="pi-nav pi-nav-right"
                onClick={next}
                type="button"
                aria-label="Siguiente"
              >
                <FaChevronRight />
              </button>
            </div>

            <div className="pi-thumbs">
              {ship.gallery.map((img, index) => (
                <button
                  key={img.id}
                  className={`pi-thumb ${index === idx ? "active" : ""}`}
                  onClick={() => setIdx(index)}
                  type="button"
                  aria-label={`mini-${index}`}
                >
                  <img src={img.src} alt={img.title || `thumb-${index}`} />
                </button>
              ))}
            </div>

            <div className="pi-dots" aria-hidden="true">
              {ship.gallery.map((_, index) => (
                <span
                  key={index}
                  className={`pi-dot ${index === idx ? "active" : ""}`}
                />
              ))}
            </div>
          </section>

          <section className="pi-right">
            <h1 className="pi-title">{ship.name}</h1>
            <p className="pi-desc">{ship.description}</p>

            <div className="pi-tags">
              {ship.tags.map((tag, index) => (
                <span className="pi-tag" key={index}>
                  <span className="pi-tag-ico">{tag.icon}</span>
                  {tag.label}
                </span>
              ))}
            </div>
          </section>

          <section className="pi-tech pi-tech--full">
            <h2 className="pi-subtitle">Especificaciones Tecnicas</h2>

            <div className="pi-highlight">
              {ship.highlights.map((highlight) => (
                <div className="pi-hi" key={highlight.label}>
                  <div className="pi-hi-value">{highlight.value}</div>
                  <div className="pi-hi-label">{highlight.label}</div>
                </div>
              ))}
            </div>

            <h2 className="pi-subtitle" style={{ marginTop: 10 }}>
              Caracteristicas
            </h2>

            <div className="pi-spec-carousel">
              <button
                type="button"
                className="pi-spec-arrow pi-spec-arrow--left"
                onClick={() => scrollSpecs(-1)}
                aria-label="Anterior"
              >
                <FaChevronLeft />
              </button>

              <div className="pi-spec-track" ref={specTrackRef}>
                {Object.entries(ship.specs).map(([group, rows]) => {
                  const isExpanded = expandedSpecs.includes(group);

                  return (
                    <div
                      className={`pi-spec-card ${isExpanded ? "expanded" : ""}`}
                      key={group}
                      role="button"
                      tabIndex={0}
                      aria-expanded={isExpanded}
                      onClick={() => toggleSpec(group)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                          event.preventDefault();
                          toggleSpec(group);
                        }
                      }}
                    >
                      <div className="pi-spec-title">{group}</div>
                      <div className="pi-spec-rows">
                        {rows.map((row, rowIndex) => (
                          <div className="pi-spec-row" key={`${group}-${row.k}-${rowIndex}`}>
                            <span className="pi-spec-k">{row.k}</span>
                            <span className="pi-spec-v">{row.v}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                className="pi-spec-arrow pi-spec-arrow--right"
                onClick={() => scrollSpecs(1)}
                aria-label="Siguiente"
              >
                <FaChevronRight />
              </button>
            </div>
          </section>

          <section className="pi-attachments pi-attachments--full">
            <div className="pi-att-head">
              <h2 className="pi-subtitle" style={{ margin: 0 }}>
                Archivos adjuntos
              </h2>

              <div className="pi-att-tabs" role="tablist" aria-label="Categorias">
                {categories.map((category) => (
                  <button
                    key={category}
                    type="button"
                    className={`pi-att-tab ${attachmentCategory === category ? "active" : ""}`}
                    onClick={() => setAttachmentCategory(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            <div className="pi-att-table" role="table" aria-label="Tabla de adjuntos">
              <div className="pi-att-row pi-att-row--head" role="row">
                <div className="pi-att-cell pi-att-title" role="columnheader">
                  Documento
                </div>
                <div className="pi-att-cell pi-att-meta" role="columnheader">
                  Detalles
                </div>
                <div className="pi-att-cell pi-att-actions" role="columnheader">
                  Acciones
                </div>
              </div>

              {filteredAttachments.length === 0 ? (
                <div className="pi-att-empty">No hay archivos en esta categoria.</div>
              ) : (
                filteredAttachments.map((attachment, index) => (
                  <div
                    key={attachment.id || `${attachment.title}-${index}`}
                    className="pi-att-row"
                    role="row"
                  >
                    <div className="pi-att-cell pi-att-title" role="cell">
                      <div className="pi-att-doc">
                        <div className="pi-att-doc-title">{attachment.title}</div>
                        <div className="pi-att-doc-desc">{attachment.description}</div>
                        <div className="pi-att-doc-chip">
                          <span className="pi-att-chip">{attachment.category}</span>
                          <span className="pi-att-chip">{attachment.format}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pi-att-cell pi-att-meta" role="cell">
                      <div className="pi-att-meta-grid">
                        <div className="pi-att-meta-item">
                          <span className="pi-att-meta-k">Tamano</span>
                          <span className="pi-att-meta-v">{attachment.size}</span>
                        </div>
                        <div className="pi-att-meta-item">
                          <span className="pi-att-meta-k">Actualizacion</span>
                          <span className="pi-att-meta-v">{attachment.updatedAt}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pi-att-cell pi-att-actions" role="cell">
                      <a
                        className="pi-att-btn pi-att-btn--ghost"
                        href={attachment.url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Ver
                      </a>
                      <a className="pi-att-btn" href={attachment.url} download={attachment.title}>
                        Descargar
                      </a>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        <div className="pi-footer">
          <span>Powered by</span>
          <strong style={{ marginLeft: 6 }}>COTECMAR</strong>
        </div>
      </main>
    </div>
  );
};

export default PagesInformations;
