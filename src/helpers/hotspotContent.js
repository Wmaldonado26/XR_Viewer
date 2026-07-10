import caja2img from "../assets/images/caja2.png";
import motor1img from "../assets/images/motor1.png";
import niigataPdfPreview from "../assets/images/niigatapdf1.png";
import shaftingPdfPreview from "../assets/images/planopdf2.png";

const hotspotContent = {
  caja2: {
    image: caja2img,
    text: "Caja de distribución secundaria.",
  },

  niigataMotorPhoto: {
    title: "Motor NIIGATA - Foto",
    description:
      "Vista detallada del motor principal NIIGATA verde desde diferentes ángulos. Esta imagen muestra la configuración completa del motor, sus placas identificativas rojas con el nombre NIIGATA y todos sus componentes auxiliares.",
    image: motor1img,
    specifications: [
      "Configuración: En línea",
      "Refrigeración: Por agua de mar",
      "Sistema de arranque: Neumático",
      "Control: Electrónico",
      "Monitoreo: Sensores digitales",
      "Identificación: Placas rojas NIIGATA",
      "Color distintivo: Verde característico",
      "Acceso: Plataforma amarilla lateral",
    ],
  },

  niigataSelectionGuide: {
    title: "Guía de Selección Niigata",
    description:
      "Guía técnica completa para la selección de motores marinos IHI Niigata. Este documento contiene especificaciones técnicas, parámetros de rendimiento y recomendaciones de uso para diferentes aplicaciones marinas.",
    image: niigataPdfPreview,
    specifications: [
      "Potencia: 2,000 kW",
      "Velocidad: 750 rpm",
      "Cilindros: 8 en línea",
      "Combustible: Diésel marino",
      "Peso: 15,000 kg",
      "Longitud: 4.2 m",
      "Altura: 2.8 m",
      "Color: Verde característico",
      "Fabricante: NIIGATA",
      "Tipo: Motor diésel marino",
    ],
    pdfUrl: "/pdfs/IHI_Niigata Marine Selection Guide_DN1907OM008.pdf",
    pdfName: "IHI_Niigata Marine Selection Guide_DN1907OM008.pdf",
  },

  shaftingArrangement: {
    title: "Arreglo de Eje",
    description:
      "Diagrama técnico del arreglo de eje del sistema de propulsión. Muestra la configuración completa del sistema de transmisión de potencia desde el motor principal hasta la hélice, incluyendo todos los componentes intermedios.",
    image: shaftingPdfPreview,
    specifications: [
      "Panel de control: Electrónico digital",
      "Sensores: Temperatura, presión, velocidad",
      "Válvulas de control: Automáticas",
      "Sistema de seguridad: Parada de emergencia",
      "Monitoreo: Tiempo real",
      "Alarmas: Visuales y sonoras",
      "Conexión: Motor NIIGATA principal",
    ],
    pdfUrl: "/pdfs/SHAFTING ARRANGEMENT (2).pdf",
    pdfName: "SHAFTING ARRANGEMENT (2).pdf",
  },
};

export default hotspotContent;

