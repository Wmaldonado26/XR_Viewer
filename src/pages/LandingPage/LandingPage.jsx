import React from "react";
import cotecmarLogo from "../../assets/images/logo.png";
import cotecmarLogoColored from "../../assets/images/cotecmar-logo.png";
import xrlabLogo from "../../assets/images/xrlab.png";
import xrlabLogoAZ from "../../assets/images/logoAZ.png";
import fondoVideo from "../../assets/images/fondo.mp4";
import "./LandingPage.css";
import "../../components/features/projects/ProjectManager/ProjectManager.css";

export const LandingPageTemplate = ({
  navigate,
  isAuthenticated,
  currentUser,
  scrollSectionRef,
  logoStageRef,
  logoFrameRef,
  logoImageRef,
  videoBgRef,
  scrollArrowRef,
  stackingCards,
  isMenuOpen,
  setIsMenuOpen,
  isLightMode,
  setIsLightMode,
  primaryAction
}) => {
  return (
    <div className={`landing-page ${isLightMode ? 'light-theme' : ''}`}>
      <header className="landing-header w-full px-6 md:px-12 py-4 flex justify-between items-center transition-all duration-300" role="banner">
        <div className="flex items-center gap-4">
          <img 
            src={isLightMode ? cotecmarLogoColored : cotecmarLogo} 
            alt="COTECMAR" 
            className="landing-brand-logo transition-all duration-500" 
          />
          <div className="landing-brand-copy">
            <span>Portal RV360</span>
            <p>Sistema de Visualización 360°</p>
          </div>
        </div>

        <div className="flex items-center relative gap-4">
          <button
            onClick={() => setIsLightMode(!isLightMode)}
            className="transition-colors hover:opacity-70 p-2"
            title="Toggle theme"
          >
            {isLightMode ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
            )}
          </button>

          <button 
            className="hover:opacity-70 transition-colors z-50 p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            ) : (
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            )}
          </button>

          <div 
            className={`absolute bg-transparent flex gap-4 transition-all duration-300 top-full right-0 mt-2 flex-col lg:top-1/2 lg:right-full lg:mt-0 lg:mr-4 lg:flex-row ${isMenuOpen ? 'opacity-100 visible translate-y-0 translate-x-0 lg:-translate-y-1/2' : 'opacity-0 invisible -translate-y-2 translate-x-0 lg:translate-x-4 lg:-translate-y-1/2'}`}
          >
            <button 
              className="landing-btn w-48 justify-center" 
              onClick={() => {
                setIsMenuOpen(false);
                primaryAction();
              }}
            >
              {isAuthenticated
                ? (currentUser?.role === "admin" || currentUser?.role === "project_admin")
                  ? "Ir al panel"
                  : "Ir a la galeria"
                : "Iniciar sesión"}
            </button>
          </div>
        </div>
      </header>

      <main className="w-full">
        <section 
          className="landing-logo-scroll w-full" 
          ref={scrollSectionRef}
        >
          <div 
            className="landing-logo-stage w-full bg-cover bg-center" 
            ref={logoStageRef}
            style={{ backgroundImage: "url('')" }}
          >
            <div className="landing-scanline"></div>

            <video 
              ref={videoBgRef}
              src={fondoVideo} 
              className="absolute inset-0 w-full h-full object-cover z-0" 
              autoPlay 
              loop 
              muted 
              playsInline 
            />
            <div className={`absolute inset-0 z-0 transition-colors duration-500 ${isLightMode ? 'bg-white bg-opacity-10' : 'bg-black bg-opacity-10'}`}></div>
            
            <div className="landing-logo-layer -translate-y-1 z-10 relative">
              <div className="landing-logo-frame" ref={logoFrameRef}>
                <div className="animate-float">
                  <img
                    ref={logoImageRef}
                    src={isLightMode ? xrlabLogoAZ : xrlabLogo}
                    alt="XR Lab"
                    className="landing-logo-showcase w-full max-w-lg md:max-w-x1 mx-auto h-auto object-contain transition-all duration-500"
                  />
                </div>
              </div>
            </div>
            
            <div 
              ref={scrollArrowRef}
              className="absolute bottom-36 left-1/2 transform -translate-x-1/2 text-center z-20 w-full px-4 flex flex-col items-center gap-4"
            >
              <span className="landing-eyebrow"></span>
              <div className="landing-scroll-arrow">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="landing-arrow-3d">
                  <polyline points="7 13 12 18 17 13"></polyline>
                  <polyline points="7 6 12 11 17 6"></polyline>
                </svg>
              </div>
            </div>
          </div>
        </section>

        <section className="landing-stack-section w-full relative">
          <div className="max-w-7xl mx-auto px-6 py-12 text-center">
            <span className="landing-eyebrow mb-2 block">Servicios especializados</span>
            <h2 className={`text-2xl md:text-3xl font-bold tracking-widest uppercase transition-colors duration-300 ${isLightMode ? 'text-[#1e3a8a]' : 'text-white'}`}>
              Tecnología al servicio del ciclo naval
            </h2>
          </div>
          
          <div className="w-full">
            <div className="landing-stack-cards" style={{ "--numcards": stackingCards.length || 1 }}>
              {stackingCards.map((card, index) => (
                <div 
                  key={card.id} 
                  className="landing-stack-card group cursor-pointer"
                  style={{ "--index0": index, "--index": index + 1 }}
                >
                  <div className="landing-stack-card-content">
                    <div className="landing-stack-card-copy">
                      <span className="landing-eyebrow mb-4 block">Capa {card.layer}</span>
                      <h3>{card.title}</h3>
                      <p className="mb-6">{card.description}</p>
                      <button 
                        className="landing-btn mt-6"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate("/public-tour/businu/bridge");
                        }}
                      >
                        Recorrido 360
                      </button>
                    </div>
                    <div className="landing-stack-card-media">
                        <img
                          src={card.image || '/images/default_image.png'}
                          alt={card.title}
                          className="w-full h-full object-cover"
                        />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};
