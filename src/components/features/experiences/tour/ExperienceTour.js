import './ExperienceTour.css';

const LOCAL_STORAGE_KEY = 'cotecmar360_experience_tour_v1';

const i18n = {
  es: {
    welcomeTitle: "Bienvenido a COTECMAR 360",
    welcomeText: "Te guiaremos rápidamente por las principales funciones del recorrido para que puedas explorar la experiencia 360°.",
    zonesTitle: "Explora las zonas",
    zonesText: "Desde aquí puedes seleccionar las diferentes zonas disponibles del proyecto y desplazarte entre sus espacios.",
    scenesTitle: "Cambia de escena",
    scenesText: "Selecciona una escena para desplazarte rápidamente entre los diferentes puntos del recorrido 360°.",
    mapsTitle: "Consulta los mapas",
    mapsText: "Utiliza los mapas para conocer la ubicación de las escenas y orientarte dentro de la zona que estás explorando.",
    hotspotsTitle: "Descubre los hotspots",
    hotspotsText: "Los hotspots contienen información adicional y accesos interactivos que te permiten descubrir más detalles de la experiencia.",
    viewerTitle: "Explora en 360°",
    viewerText: "Arrastra la vista para explorar el entorno y descubre todos los detalles del espacio.",
    skip: "Saltar",
    prev: "Anterior",
    next: "Siguiente",
    done: "Entendido"
  },
  en: {
    welcomeTitle: "Welcome to COTECMAR 360",
    welcomeText: "We will quickly guide you through the main features of the experience so you can explore the 360° tour.",
    zonesTitle: "Explore the zones",
    zonesText: "From here you can select the different zones available in the project and move between their spaces.",
    scenesTitle: "Change scene",
    scenesText: "Select a scene to quickly move between the different points of the 360° tour.",
    mapsTitle: "View the maps",
    mapsText: "Use the maps to see the location of scenes and orient yourself within the zone you are exploring.",
    hotspotsTitle: "Discover the hotspots",
    hotspotsText: "Hotspots contain additional information and interactive access points that let you discover more details about the experience.",
    viewerTitle: "Explore in 360°",
    viewerText: "Drag the view to explore the environment and discover all the details of the space.",
    skip: "Skip",
    prev: "Previous",
    next: "Next",
    done: "Got it"
  }
};

export class ExperienceTour {
  constructor(lang = 'es') {
    this.lang = i18n[lang] ? lang : 'es';
    this.t = i18n[this.lang];
    this.currentStep = 0;
    this.steps = [];
    this.overlay = null;
    this.spotlight = null;
    this.tooltip = null;
    this.isActive = false;
    this.resizeHandler = this.updatePositions.bind(this);
    this.keyDownHandler = this.handleKeyDown.bind(this);
  }

  isCompleted() {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem(LOCAL_STORAGE_KEY) === 'completed';
  }

  markCompleted() {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_KEY, 'completed');
    }
  }

  init() {
    if (this.isCompleted()) return;

    // Define steps based on data-tour attributes
    const potentialSteps = [
      {
        id: 'welcome',
        selector: '[data-tour="viewer"]',
        title: this.t.welcomeTitle,
        text: this.t.welcomeText,
        useCenterFallback: true // First step doesn't need to highlight perfectly, just be visible
      },
      {
        id: 'zones',
        selector: '[data-tour="zones"]',
        title: this.t.zonesTitle,
        text: this.t.zonesText
      },
      {
        id: 'scenes',
        selector: '[data-tour="scenes"]',
        title: this.t.scenesTitle,
        text: this.t.scenesText
      },
      {
        id: 'maps',
        selector: '[data-tour="maps"]',
        title: this.t.mapsTitle,
        text: this.t.mapsText
      },
      {
        id: 'hotspots',
        selector: '.pnlm-hotspotBase, .pnlm-hotspot',
        title: this.t.hotspotsTitle,
        text: this.t.hotspotsText,
        fallbackSelector: '[data-tour="viewer"]' // If hotspots container not found, use viewer
      },
      {
        id: 'viewer',
        selector: '[data-tour="viewer"]',
        title: this.t.viewerTitle,
        text: this.t.viewerText
      }
    ];

    // Filter available steps
    this.steps = potentialSteps.filter(step => {
      let el = document.querySelector(step.selector);
      if (!el && step.fallbackSelector) {
        el = document.querySelector(step.fallbackSelector);
      }
      return !!el || step.useCenterFallback;
    });

    if (this.steps.length === 0) return;

    this.render();
    this.isActive = true;
    this.currentStep = 0;
    
    window.addEventListener('resize', this.resizeHandler);
    document.addEventListener('keydown', this.keyDownHandler);

    // Give a short delay before showing to ensure DOM is settled
    requestAnimationFrame(() => {
      this.showStep(this.currentStep);
    });
  }

  render() {
    // Create elements
    this.overlay = document.createElement('div');
    this.overlay.className = 'experience-tour-overlay interactive';
    
    this.spotlight = document.createElement('div');
    this.spotlight.className = 'experience-tour-spotlight';
    
    this.tooltip = document.createElement('div');
    this.tooltip.className = 'experience-tour-tooltip';
    this.tooltip.setAttribute('role', 'dialog');
    this.tooltip.setAttribute('aria-modal', 'true');
    this.tooltip.setAttribute('aria-label', 'Tutorial interactivo');

    document.body.appendChild(this.overlay);
    document.body.appendChild(this.spotlight);
    document.body.appendChild(this.tooltip);

    // Setup event delegation for tooltip buttons
    this.tooltip.addEventListener('click', (e) => {
      if (e.target.closest('.experience-tour-btn-skip') || e.target.closest('.experience-tour-close')) {
        this.close(true);
      } else if (e.target.closest('.experience-tour-btn-prev')) {
        this.prev();
      } else if (e.target.closest('.experience-tour-btn-next')) {
        this.next();
      } else if (e.target.closest('.experience-tour-btn-done')) {
        this.close(true);
      }
    });
  }

  getTargetElement(step) {
    let el = document.querySelector(step.selector);
    if (!el && step.fallbackSelector) {
      el = document.querySelector(step.fallbackSelector);
    }
    return el;
  }

  showStep(index) {
    if (index < 0 || index >= this.steps.length) return;

    const step = this.steps[index];
    const targetElement = this.getTargetElement(step);

    if (!targetElement && !step.useCenterFallback) {
      // Element not found, skip to next
      if (index > this.currentStep) {
        this.currentStep++;
        this.showStep(this.currentStep);
      } else {
        this.currentStep--;
        this.showStep(this.currentStep);
      }
      return;
    }

    this.currentStep = index;
    this.updateTooltipContent(step);
    
    // Show elements with animation
    requestAnimationFrame(() => {
      this.overlay.classList.add('visible');
      this.updatePositions();
      this.tooltip.classList.add('visible');
    });
  }

  updateTooltipContent(step) {
    const isFirst = this.currentStep === 0;
    const isLast = this.currentStep === this.steps.length - 1;

    let dotsHtml = '';
    for (let i = 0; i < this.steps.length; i++) {
      dotsHtml += `<div class="experience-tour-dot ${i === this.currentStep ? 'active' : ''}"></div>`;
    }

    this.tooltip.innerHTML = `
      <div class="experience-tour-header">
        <h3 class="experience-tour-title">${step.title}</h3>
        <button class="experience-tour-close" aria-label="Cerrar tutorial">&times;</button>
      </div>
      <p class="experience-tour-content">${step.text}</p>
      <div class="experience-tour-footer">
        <div class="experience-tour-progress">
          ${dotsHtml}
        </div>
        <div class="experience-tour-buttons">
          ${!isLast ? `<button class="experience-tour-btn experience-tour-btn-skip">${this.t.skip}</button>` : ''}
          ${!isFirst ? `<button class="experience-tour-btn experience-tour-btn-prev">${this.t.prev}</button>` : ''}
          ${!isLast ? `<button class="experience-tour-btn experience-tour-btn-next">${this.t.next}</button>` : ''}
          ${isLast ? `<button class="experience-tour-btn experience-tour-btn-next experience-tour-btn-done">${this.t.done}</button>` : ''}
        </div>
      </div>
    `;
  }

  updatePositions() {
    if (!this.isActive) return;

    const step = this.steps[this.currentStep];
    const targetElement = this.getTargetElement(step);

    if (targetElement) {
      const rect = targetElement.getBoundingClientRect();
      const padding = 10;
      
      // Update spotlight
      this.spotlight.style.width = `${rect.width + padding * 2}px`;
      this.spotlight.style.height = `${rect.height + padding * 2}px`;
      this.spotlight.style.top = `${rect.top - padding}px`;
      this.spotlight.style.left = `${rect.left - padding}px`;
      this.spotlight.style.opacity = '1';

      // Position tooltip
      this.positionTooltip(rect);
    } else if (step.useCenterFallback) {
      this.spotlight.style.opacity = '0'; // Hide spotlight
      this.positionTooltipCenter();
    }
  }

  positionTooltipCenter() {
    const tooltipRect = this.tooltip.getBoundingClientRect();
    const top = (window.innerHeight - tooltipRect.height) / 2;
    const left = (window.innerWidth - tooltipRect.width) / 2;
    this.tooltip.style.top = `${top}px`;
    this.tooltip.style.left = `${left}px`;
  }

  positionTooltip(targetRect) {
    const tooltipRect = this.tooltip.getBoundingClientRect();
    const margin = 20;
    
    let top, left;

    // Default: try bottom
    top = targetRect.bottom + margin;
    left = targetRect.left + (targetRect.width / 2) - (tooltipRect.width / 2);

    // If no space at bottom, try top
    if (top + tooltipRect.height > window.innerHeight) {
      top = targetRect.top - tooltipRect.height - margin;
    }

    // If still no space (or it's negative), just center it on screen or place it safely
    if (top < 0) {
      top = 20;
    }

    // Keep horizontally in bounds
    if (left < margin) {
      left = margin;
    } else if (left + tooltipRect.width > window.innerWidth - margin) {
      left = window.innerWidth - tooltipRect.width - margin;
    }

    this.tooltip.style.top = `${top}px`;
    this.tooltip.style.left = `${left}px`;
  }

  next() {
    if (this.currentStep < this.steps.length - 1) {
      this.showStep(this.currentStep + 1);
    }
  }

  prev() {
    if (this.currentStep > 0) {
      this.showStep(this.currentStep - 1);
    }
  }

  handleKeyDown(e) {
    if (!this.isActive) return;
    
    if (e.key === 'Escape') {
      this.close(true);
    } else if (e.key === 'ArrowRight') {
      this.next();
    } else if (e.key === 'ArrowLeft') {
      this.prev();
    }
  }

  close(markCompleted = false) {
    if (!this.isActive) return;
    this.isActive = false;

    if (markCompleted) {
      this.markCompleted();
    }

    if (this.overlay) this.overlay.classList.remove('visible');
    if (this.tooltip) this.tooltip.classList.remove('visible');
    if (this.spotlight) this.spotlight.style.opacity = '0';

    setTimeout(() => {
      this.cleanup();
    }, 300); // match css transition
  }

  cleanup() {
    window.removeEventListener('resize', this.resizeHandler);
    document.removeEventListener('keydown', this.keyDownHandler);
    
    if (this.overlay && this.overlay.parentNode) this.overlay.parentNode.removeChild(this.overlay);
    if (this.spotlight && this.spotlight.parentNode) this.spotlight.parentNode.removeChild(this.spotlight);
    if (this.tooltip && this.tooltip.parentNode) this.tooltip.parentNode.removeChild(this.tooltip);

    this.overlay = null;
    this.spotlight = null;
    this.tooltip = null;
  }
}
