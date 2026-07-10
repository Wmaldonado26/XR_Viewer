import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import authService from "../../api/services/authService";
import landingService from "../../api/services/landingService";
import cotecmarLogo from "../../assets/images/logo.png";
import cotecmarLogoColored from "../../assets/images/cotecmar-logo.png";
import xrlabLogo from "../../assets/images/xrlab.png";
import xrlabLogoAZ from "../../assets/images/logoAZ.png";
import fondoVideo from "../../assets/images/fondo.mp4";
import "./LandingPage.css";
import "../../components/features/projects/ProjectManager.css";

const LandingPage = () => {
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();
  const isAuthenticated = authService.isAuthenticated();
  const scrollSectionRef = useRef(null);
  const logoStageRef = useRef(null);
  const logoFrameRef = useRef(null);
  const logoImageRef = useRef(null);
  const videoBgRef = useRef(null);
  const scrollArrowRef = useRef(null);
  const [stackingCards, setStackingCards] = useState([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLightMode, setIsLightMode] = useState(false);

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const data = await landingService.getCards();
        setStackingCards(data);
      } catch (err) {
        console.error("Error fetching landing cards:", err);
      }
    };
    fetchCards();
  }, []);
  const primaryAction = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    navigate((currentUser?.role === "admin" || currentUser?.role === "project_admin") ? "/admin" : "/gallery");
  };

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    let ctx = gsap.context(() => {
      gsap.set(logoFrameRef.current, {
        scale: 0.9,
        opacity: 2,
        yPercent: 0,
      });

      gsap.set(logoImageRef.current, {
        scale: 1,
        opacity: 0.5,
      });

      gsap.set(videoBgRef.current, {
        scale: 1,
        opacity: 0.8,
        filter: "blur(0px)",
      });

      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: scrollSectionRef.current,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
          pin: logoStageRef.current,
        },
      });

      timeline
        .to(
          scrollArrowRef.current,
          {
            opacity: 0,
            y: 30,
            duration: 0.1,
            ease: "power1.out",
          },
          0
        )
        // Primer scroll: El video hace efecto de 'profundidad de campo' (blur out)
        .to(
          videoBgRef.current,
          {
            opacity: 0,
            scale: 1, // Zoom de cámara hacia adentro
            filter: "blur(2px)", // Se desenfoca fuertemente
            duration: 0.5, 
            ease: "power2.inOut",
          },
          0
        )
        // Segundo scroll: El logotipo 'entra en foco' y hace un sutil avance
        .to(
          logoImageRef.current,
          {
            opacity: 1, 
            duration: 0.2, // Rápido
            ease: "power2.out",
          },
          0.5 
        );
        
    }, scrollSectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className={`landing-page ${isLightMode ? 'light-theme' : ''}`}>
      <header className="landing-header w-full px-6 md:px-12 py-4 flex justify-between items-center transition-all duration-300" role="banner">
        <div className="flex items-center gap-4">
          {/* Logo cambia según el tema */}
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
          {/* BOTÓN MODO CLARO/OSCURO */}
          <button
            onClick={() => setIsLightMode(!isLightMode)}
            className="transition-colors hover:opacity-70 p-2"
            title="Toggle theme"
          >
            {isLightMode ? (
              /* Moon icon */
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            ) : (
              /* Sun icon */
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

          {/* DROPDOWN MENU */}
          <div 
            className={`absolute bg-transparent flex gap-4 transition-all duration-300 top-full right-0 mt-2 flex-col lg:top-1/2 lg:right-full lg:mt-0 lg:mr-4 lg:flex-row ${isMenuOpen ? 'opacity-100 visible translate-y-0 translate-x-0 lg:-translate-y-1/2' : 'opacity-0 invisible -translate-y-2 translate-x-0 lg:translate-x-4 lg:-translate-y-1/2'}`}
          >
            <button 
              className="landing-btn w-48 justify-center"
              onClick={() => {
                setIsMenuOpen(false);
                navigate("/login");
              }}
            >
              Acceso
            </button>
            
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
        {/* HERO SECTION */}
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

        {/* VERTICAL STACKING CARDS SECTION (SPACEX STYLE) */}
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
                      <p>{card.description}</p>
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

export default LandingPage;
