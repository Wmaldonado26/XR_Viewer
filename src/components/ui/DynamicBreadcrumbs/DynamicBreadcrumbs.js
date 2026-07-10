import React from "react";
import { useLocation, Link } from "react-router-dom";
import "./DynamicBreadcrumbs.css";

const DynamicBreadcrumbs = ({ customMappings = {}, customLinks = {}, customActions = {}, customDropdowns = {}, ignoreSegments = [] }) => {
  // 1. Obtenemos la ruta actual usando el hook de React Router DOM
  const location = useLocation();

  // 2. Separamos la ruta en segmentos y filtramos los vacíos y los ignorados
  const pathnames = location.pathname.split("/").filter((x) => x && !ignoreSegments.includes(x));

  // Función para formatear cada segmento de la ruta (Capitalizar y limpiar)
  const formatSegment = (segment) => {
    // Si pasamos un mapeo personalizado para IDs o nombres raros, lo usamos
    if (customMappings[segment]) {
      return customMappings[segment];
    }
    // Reemplazar guiones por espacios y capitalizar la primera letra
    const decoded = decodeURIComponent(segment).replace(/-/g, " ");
    return decoded.charAt(0).toUpperCase() + decoded.slice(1);
  };

  const [activeDropdown, setActiveDropdown] = React.useState(null);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.breadcrumb-dropdown-container')) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  return (
    <nav aria-label="breadcrumb" className="breadcrumb-container">
      <ul className="breadcrumb-list">
        {/* Iteramos sobre los segmentos de la ruta */}
        {pathnames.map((segment, index) => {
          // Construimos la URL acumulada por defecto
          let routeTo = `/${pathnames.slice(0, index + 1).join("/")}`;
          
          // Si el segmento tiene un link personalizado forzado, lo usamos
          if (customLinks[segment]) {
            routeTo = customLinks[segment];
          }
          
          // Determinamos si es el último segmento (página actual)
          const isLast = index === pathnames.length - 1;
          const hasDropdown = Boolean(customDropdowns && customDropdowns[segment]);
          const isDropdownOpen = activeDropdown === segment;

          return (
            <React.Fragment key={segment}>
              {index > 0 && <li className="breadcrumb-separator"> - </li>}
              <li className={`breadcrumb-item ${isLast ? "active" : ""} ${hasDropdown ? "breadcrumb-dropdown-container" : ""}`} style={hasDropdown ? { position: 'relative' } : {}}>
                {isLast ? (
                  // Si es el último, no es clickeable (a menos que tenga customAction o dropdown)
                  <span 
                    className="breadcrumb-current" 
                    onClick={(e) => {
                      if (hasDropdown) {
                        setActiveDropdown(isDropdownOpen ? null : segment);
                      } else if (customActions[segment]) {
                        customActions[segment]();
                      }
                    }}
                    style={(customActions[segment] || hasDropdown) ? { cursor: 'pointer' } : {}}
                  >
                    {formatSegment(segment)} {(customActions[segment] || hasDropdown) && <span style={{fontSize: '10px', marginLeft: '4px'}}>▼</span>}
                  </span>
                ) : (
                  // Si no es el último, revisamos si tiene dropdown, acción personalizada o enlace normal
                  hasDropdown ? (
                    <span className="breadcrumb-link" onClick={() => setActiveDropdown(isDropdownOpen ? null : segment)} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {formatSegment(segment)} <span style={{fontSize: '10px'}}>▼</span>
                    </span>
                  ) : customActions[segment] ? (
                    <span className="breadcrumb-link" onClick={customActions[segment]} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      {formatSegment(segment)} <span style={{fontSize: '10px'}}>▼</span>
                    </span>
                  ) : (
                    <Link to={routeTo} className="breadcrumb-link">
                      {formatSegment(segment)}
                    </Link>
                  )
                )}

                {hasDropdown && isDropdownOpen && (
                  <div className="breadcrumb-dropdown-menu">
                    {customDropdowns[segment].map((item, idx) => (
                      <div 
                        key={idx} 
                        className="breadcrumb-dropdown-item" 
                        onClick={() => {
                          setActiveDropdown(null);
                          if (item.onClick) item.onClick();
                        }}
                      >
                        {item.image && (
                          <div className="dropdown-item-image">
                            <img src={item.image} alt="" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                          </div>
                        )}
                        <div className="dropdown-item-content">
                          <div className="dropdown-item-title">{item.label}</div>
                          {item.sublabel && <div className="dropdown-item-subtitle">{item.sublabel}</div>}
                        </div>
                      </div>
                    ))}
                    {customDropdowns[segment].length === 0 && (
                      <div className="breadcrumb-dropdown-empty">No hay elementos</div>
                    )}
                  </div>
                )}
              </li>
            </React.Fragment>
          );
        })}
      </ul>
    </nav>
  );
};

export default DynamicBreadcrumbs;
