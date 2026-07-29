import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import authService from "../../api/services/authService";
import landingService from "../../api/services/landingService";

export const useLandingPageLogic = () => {
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
        .to(
          videoBgRef.current,
          {
            opacity: 0,
            scale: 1, 
            filter: "blur(2px)", 
            duration: 0.5, 
            ease: "power2.inOut",
          },
          0
        )
        .to(
          logoImageRef.current,
          {
            opacity: 1, 
            duration: 0.2, 
            ease: "power2.out",
          },
          0.5 
        );
        
    }, scrollSectionRef);

    return () => ctx.revert();
  }, []);

  return {
    navigate,
    currentUser,
    isAuthenticated,
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
  };
};
