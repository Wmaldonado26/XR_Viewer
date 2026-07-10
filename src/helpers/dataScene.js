import insideOne from "../assets/images/PuenteDeGobierno.jpg";
import insideTwo from "../assets/images/CubiertaBoteCrujiaProa.jpg";
import insideThree from "../assets/images/CubiertaBoteCrujiaProaBabor.jpg";
import insideFour from "../assets/images/ProaCostadoBabor.jpg";
import insideFive from "../assets/images/ProaCostadoEstribor.jpg";
import insideSix from "../assets/images/CubiertaPrincipalCostadoBabor.jpg";
import insideSeven from "../assets/images/CubiertaPrincipalCostadoEstribor.jpg";
import insideEight from "../assets/images/CubiertaDeTrabajo.jpg";
import insideNine from "../assets/images/CabrestanteCostadoBabor.jpg";
import insideTen from "../assets/images/CabrestanteCostadoEstribor.jpg";
import insideEleven from "../assets/images/CubiertaBoteCostadoBaborProa.jpg";
import insideTwelve from "../assets/images/CubiertaBoteCostadoBabor.jpg";
import insideThirteen from "../assets/images/CuartoMaquinasCostadoBaborPopa.jpg";
import insideFourteen from "../assets/images/CuartoMaquinasCostadoBaborProa.jpg";
import insideFifteen from "../assets/images/CubiertaSuperiorCuartoMaquinas.jpg";
import insideSixteen from "../assets/images/CuartoMaquinasCostadoEstribor.jpg";
import insideSeventeen from "../assets/images/ServoMotorCrujia.jpg";
import insideEighteen from "../assets/images/ServoMotorCostadoBabor.jpg";
import insideNineteen from "../assets/images/ServoMotorCostadoEstribor.jpg";

const Scene = {
  insideOne: {
    title: "Puente De Gobierno",
    image: insideOne,
    pitch: -1.22,
    yaw: 1.17,

    hotSpots: {
      caja1: {
        type: "custom",
        pitch: 18.28,
        yaw: 40.12,
        cssClass: "hotSpotElement",
      },
      caja2: {
        type: "custom",
        pitch: 25.77,
        yaw: 159.3,
        cssClass: "hotSpotElement",
      },
      cajaroja: {
        type: "custom",
        pitch: 26.05,
        yaw: 98.77,
        cssClass: "hotSpotElement",
        previewImage: insideTwo,
      },

      nextScene: {
        type: "custom",
        pitch: -14.6,
        yaw: 0.5,
        cssClass: "moveScene",
        scene: "insideTwo",
        previewImage: insideTwo,
        label: "Ir a Cubierta Bote Crujia Proa",
      },

      nextScene1: {
        type: "custom",
        pitch: -9.46,
        yaw: 179.2,
        cssClass: "moveScene",
        scene: "insideThree",
        previewImage: insideThree,
        label: "Ir a Cubierta Bote Crujia Proa Babor",
      },
    },
  },

  insideTwo: {
    title: "Cubierta Bote_Crujia Proa",
    image: insideTwo,
    pitch: -0.85,
    yaw: -8.3,
    hotSpots: {
      nextScene: {
        type: "custom",
        pitch: -31.3,
        yaw: 29.4,
        cssClass: "moveScene",
        scene: "insideFive",
        previewImage: insideFive,
        label: "Ir a Proa Costado Estribor",
      },

      nextScene1: {
        type: "custom",
        pitch: -29.3,
        yaw: -59.9,
        cssClass: "moveScene",
        scene: "insideFour",
        previewImage: insideFour,
        label: "Ir a Proa Costado Babor",
      },
      nextScene2: {
        type: "custom",
        pitch: 11.96,
        yaw: -178.1,
        cssClass: "moveScene",
        scene: "insideOne",
        previewImage: insideOne,
        label: "Ir a Puente De Gobierno",
      },
      nextScene3: {
        type: "custom",
        pitch: -6.95,
        yaw: -150,
        cssClass: "moveScene",
        scene: "insideEleven",
        previewImage: insideEleven,
        label: "Ir a Cubierta Bote Costado Babor Proa",
      },
    },
  },

  insideThree: {
    title: "Cubierta Bote_crujia Proa_Babor",
    image: insideThree,
    pitch: -8.7,
    yaw: -173,
    hotSpots: {
      nextScene: {
        type: "custom",
        pitch: 5.0,
        yaw: 30.0,
        cssClass: "moveScene",
        scene: "insideOne",
        previewImage: insideOne,
        label: "Ir a Puente De Gobierno",
      },

      nextScene1: {
        type: "custom",
        pitch: -28.79,
        yaw: 179,
        cssClass: "moveScene",
        scene: "insideEight",
        previewImage: insideEight,
        label: "Ir a Cubierta De Trabajo",
      },

      nextScene2: {
        type: "custom",
        pitch: -48.5,
        yaw: 136,
        cssClass: "moveScene",
        scene: "insideTen",
        previewImage: insideTen,
        label: "Ir a Cabrestante Costado Estribor",
      },

      nextScene3: {
        type: "custom",
        pitch: -43.1,
        yaw: -135,
        cssClass: "moveScene",
        scene: "insideTwelve",
        previewImage: insideTwelve,
        label: "Ir a Cubierta Bote Costado Babor",
      },
    },
  },

  insideFour: {
    title: "Proa Costado Babor",
    image: insideFour,
    pitch: 18.3,
    yaw: 40.12,
    hotSpots: {
      nextScene: {
        type: "custom",
        pitch: 25.5,
        yaw: 141.7,
        cssClass: "moveScene",
        scene: "insideTwo",
        previewImage: insideTwo,
        label: "Ir a Cubierta Bote Crujia Proa",
      },

      nextScene1: {
        type: "custom",
        pitch: -0.61,
        yaw: 105.9,
        cssClass: "moveScene",
        scene: "insideFive",
        previewImage: insideFive,
        label: "Ir a Proa Costado Estribor",
      },

      nextScene2: {
        type: "custom",
        pitch: -8.13,
        yaw: -138.0,
        cssClass: "moveScene",
        scene: "insideSeven",
        previewImage: insideSeven,
        label: "Ir a Cubierta Principal Costado Estribor",
      },
    },
  },

  insideFive: {
    title: "Proa Costado Estribor",
    image: insideFive,
    pitch: 17.7,
    yaw: 10.1,
    hotSpots: {
      nextScene: {
        type: "custom",
        pitch: 22.4,
        yaw: -129,
        cssClass: "moveScene",
        scene: "insideTwo",
        previewImage: insideTwo,
        label: "Ir a Cubierta Bote Crujia Proa",
      },

      nextScene1: {
        type: "custom",
        pitch: -3.81,
        yaw: -89.0,
        cssClass: "moveScene",
        scene: "insideFour",
        previewImage: insideFour,
        label: "Ir a Proa Costado Babor",
      },

      nextScene2: {
        type: "custom",
        pitch: -10.0,
        yaw: 155.5,
        cssClass: "moveScene",
        scene: "insideSix",
        previewImage: insideSix,
        label: "Ir a Cubierta Principal Costado Babor",
      },
    },
  },

  insideSix: {
    title: "Cubierta Principal Costado Babor",
    image: insideSix,
    pitch: 2.34,
    yaw: -0.25,
    hotSpots: {
      nextScene1: {
        type: "custom",
        pitch: -0.08,
        yaw: 163,
        cssClass: "moveScene",
        scene: "insideFive",
        previewImage: insideFive,
        label: "Ir a Proa Costado Estribor",
      },
    },
  },

  insideSeven: {
    title: "Cubierta Principal Costado Estribor",
    image: insideSeven,
    pitch: 9.42,
    yaw: 14.33,
    hotSpots: {
      nextScene: {
        type: "custom",
        pitch: 0.65,
        yaw: -164.2,
        cssClass: "moveScene",
        scene: "insideFour",
        previewImage: insideFour,
        label: "Ir a Proa Costado Babor",
      },
    },
  },

  insideEight: {
    title: "Cubierta De Trabajo",
    image: insideEight,
    pitch: 11.7,
    yaw: 156,
    hotSpots: {
      nextScene: {
        type: "custom",
        pitch: 27.6,
        yaw: 176,
        cssClass: "moveScene",
        scene: "insideThree",
        previewImage: insideThree,
        label: "Ir a Cubierta Bote Crujia Proa Babor",
      },
      nextScene1: {
        type: "custom",
        pitch: 7.6,
        yaw: -167,
        cssClass: "moveScene",
        scene: "insideTen",
        previewImage: insideTen,
        label: "Ir a Cabrestante Costado Estribor",
      },
      nextScene2: {
        type: "custom",
        pitch: 7.22,
        yaw: 164,
        cssClass: "moveScene",
        scene: "insideNine",
        previewImage: insideNine,
        label: "Ir a Cabrestante Costado Babor",
      },
      nextScene3: {
        type: "custom",
        pitch: 19.33,
        yaw: 161,
        cssClass: "moveScene",
        scene: "insideTwelve",
        previewImage: insideTwelve,
        label: "Ir a Cubierta Bote Costado Babor",
      },
      nextScene4: {
        type: "custom",
        pitch: 4.82,
        yaw: 81.9,
        cssClass: "moveScene",
        scene: "insideThirteen",
        previewImage: insideThirteen,
        label: "Ir a Cuarto De Maquinas",
      },
    },
  },

  insideNine: {
    title: "Cabrestante Costado Babor",
    image: insideNine,
    pitch: 3.09,
    yaw: 71.0,
    hotSpots: {
      nextScene: {
        type: "custom",
        pitch: 1.02,
        yaw: -10.7,
        cssClass: "moveScene",
        scene: "insideTen",
        previewImage: insideTen,
        label: "Ir a Cabrestante Costado Estribor",
      },

      nextScene1: {
        type: "custom",
        pitch: 1.45,
        yaw: 96.6,
        cssClass: "moveScene",
        scene: "insideEight",
        previewImage: insideEight,
        label: "Ir a Cubierta De Trabajo",
      },

      nextScene2: {
        type: "custom",
        pitch: 59.53,
        yaw: -53.8,
        cssClass: "moveScene",
        scene: "insideThree",
        previewImage: insideThree,
        label: "Ir a Cubierta Bote Crujia Proa Babor",
      },
    },
  },

  insideTen: {
    title: "Cabrestante Costado Estribor",
    image: insideTen,
    pitch: 4.97,
    yaw: -111,
    hotSpots: {
      nextScene: {
        type: "custom",
        pitch: 48.7,
        yaw: 57.4,
        cssClass: "moveScene",
        scene: "insideThree",
        previewImage: insideThree,
        label: "Ir a Cubierta Bote Crujia Proa Babor",
      },

      nextScene1: {
        type: "custom",
        pitch: -2.65,
        yaw: -88,
        cssClass: "moveScene",
        scene: "insideEight",
        previewImage: insideEight,
        label: "Ir a Cubierta De Trabajo",
      },

      nextScene2: {
        type: "custom",
        pitch: 9.64,
        yaw: 36.1,
        cssClass: "moveScene",
        scene: "insideNine",
        previewImage: insideNine,
        label: "Ir a Cabrestante Costado Babor",
      },

      nextScene3: {
        type: "custom",
        pitch: -6.58,
        yaw: -132,
        cssClass: "moveScene",
        scene: "insideOne",
        previewImage: insideOne,
        label: "Ir a Puente De Gobierno",
      },
    },
  },

  insideEleven: {
    title: "Cubierta Bote Costado Babor Proa",
    image: insideEleven,
    pitch: 0.41,
    yaw: -141,
    hotSpots: {
      nextScene: {
        type: "custom",
        pitch: -5.97,
        yaw: -113,
        cssClass: "moveScene",
        scene: "insideTwo",
        previewImage: insideTwo,
        label: "Ir a Cubierta Bote Crujia Proa",
      },

      nextScene1: {
        type: "custom",
        pitch: 36.4,
        yaw: -54.2,
        cssClass: "moveScene",
        scene: "insideOne",
        previewImage: insideOne,
        label: "Ir a Puente De Gobierno",
      },
    },
  },

  insideTwelve: {
    title: "Cubierta Bote Costado Babor",
    image: insideTwelve,
    pitch: 3.95,
    yaw: 156,
    hotSpots: {
      nextScene: {
        type: "custom",
        pitch: -18.7,
        yaw: 159,
        cssClass: "moveScene",
        scene: "insideEight",
        previewImage: insideEight,
        label: "Ir a Cubierta De Trabajo",
      },

      nextScene1: {
        type: "custom",
        pitch: 19.71,
        yaw: 54.7,
        cssClass: "moveScene",
        scene: "insideThree",
        previewImage: insideThree,
        label: "Ir a Cubierta Bote Crujia Proa Babor",
      },

      nextScene2: {
        type: "custom",
        pitch: -21,
        yaw: 84.4,
        cssClass: "moveScene",
        scene: "insideTen",
        previewImage: insideTen,
        label: "Ir a Cabrestante Costado Estribor",
      },
    },
  },

  insideThirteen: {
    title: "Cuarto de Maquinas Costado Babor Popa",
    image: insideThirteen,
    pitch: -1.05,
    yaw: 115,
    hotSpots: {
      nextScene: {
        type: "custom",
        pitch: 30.5,
        yaw: -61.13,
        cssClass: "moveScene",
        scene: "insideEight",
        previewImage: insideEight,
        label: "Ir a Cubierta De Trabajo",
      },

      nextScene1: {
        type: "custom",
        pitch: -3.49,
        yaw: 87.22,
        cssClass: "moveScene",
        scene: "insideFourteen",
        previewImage: insideFourteen,
        label: "Ir a Cuarto De Maquinas Costado Babor Proa",
      },

      nextScene2: {
        type: "custom",
        pitch: 2.91,
        yaw: -179,
        cssClass: "moveScene",
        scene: "insideSixteen",
        previewImage: insideSixteen,
        label: "Ir a Cuarto De Maquinas Costado Estribor",
      },
    },
  },

  insideFourteen: {
    title: "Cuarto De Maquinas Costado Babor Proa",
    image: insideFourteen,
    pitch: 3.95,
    yaw: 156,
    hotSpots: {
      nextScene: {
        type: "custom",
        pitch: 8.35,
        yaw: -178,
        cssClass: "moveScene",
        scene: "insideThirteen",
        previewImage: insideThirteen,
        label: "Ir a Cuarto De Maquinas Costado Babor Popa",
      },

      nextScene1: {
        type: "custom",
        pitch: 25.8,
        yaw: -169,
        cssClass: "moveScene",
        scene: "insideEight",
        previewImage: insideEight,
        label: "Ir a Cubierta De Trabajo",
      },

      nextScene2: {
        type: "custom",
        pitch: 31.69,
        yaw: 42.74,
        cssClass: "moveScene",
        scene: "insideFifteen",
        previewImage: insideFifteen,
        label: "Ir a Cubierta Superior Cuarto De Maquinas",
      },

      // Hotspots informativos del motor Niigata
      niigataMotorPhoto: {
        type: "info",
        pitch: 18.0,
        yaw: 95.0,
        cssClass: "infoHotspot",
        key: "niigataMotorPhoto",
        label: "Motor Foto",
      },

      niigataSelectionGuide: {
        type: "info",
        pitch: 18.0,
        yaw: 110.0,
        cssClass: "infoHotspot",
        key: "niigataSelectionGuide",
        label: "Guía Niigata",
      },

      shaftingArrangement: {
        type: "info",
        pitch: 18.0,
        yaw: 80.0,
        cssClass: "infoHotspot",
        key: "shaftingArrangement",
        label: "Arreglo de Eje",
      },
    },
  },

  insideFifteen: {
    title: "Cubierta Superior Cuarto De Maquinas",
    image: insideFifteen,
    pitch: -5.79,
    yaw: 33.6,
    hotSpots: {
      nextScene: {
        type: "custom",
        pitch: -50.4,
        yaw: 0.5,
        cssClass: "moveScene",
        scene: "insideFourteen",
        previewImage: insideFourteen,
        label: "Ir a Cuarto De Maquinas Costado Babor Proa",
      },
    },
  },

  insideSixteen: {
    title: "Cuarto De Maquinas Costado Estribor",
    image: insideSixteen,
    pitch: -12.4,
    yaw: 99.35,
    hotSpots: {
      nextScene: {
        type: "custom",
        pitch: 2.25,
        yaw: 133.3,
        cssClass: "moveScene",
        scene: "insideThirteen",
        previewImage: insideThirteen,
        label: "Ir a Cuarto De Maquinas Costado Babor Popa",
      },

      nextScene1: {
        type: "custom",
        pitch: 0.63,
        yaw: 82.4,
        cssClass: "moveScene",
        scene: "insideSeventeen",
        previewImage: insideSeventeen,
        label: "Ir a Servo Motor Crujia",
      },
    },
  },

  insideSeventeen: {
    title: "Servo Motor Crujia",
    image: insideSeventeen,
    pitch: -12.4,
    yaw: 99.35,
    hotSpots: {
      nextScene: {
        type: "custom",
        pitch: 2.25,
        yaw: 133.3,
        cssClass: "moveScene",
        scene: "insideEighteen",
        previewImage: insideEighteen,
        label: "Ir a Servo Motor Costado Babor",
      },

      nextScene1: {
        type: "custom",
        pitch: 4.35,
        yaw: 47.89,
        cssClass: "moveScene",
        scene: "insideNineteen",
        previewImage: insideNineteen,
        label: "Ir a Servo Motor Costado Estribor",
      },
    },
  },

  insideEighteen: {
    title: "Servo Motor Costado Babor",
    image: insideEighteen,
    pitch: 0.58,
    yaw: 143.9,
    hotSpots: {
      nextScene: {
        type: "custom",
        pitch: 2.25,
        yaw: 133.3,
        cssClass: "moveScene",
        scene: "insideSeventeen",
        previewImage: insideSeventeen,
        label: "Ir a Servo Motor Crujia",
      },

      nextScene1: {
        type: "custom",
        pitch: -0.0831,
        yaw: -161.18,
        cssClass: "moveScene",
        scene: "insideNineteen",
        previewImage: insideNineteen,
        label: "Ir a Servo Motor Costado Estribor",
      },
    },
  },

  insideNineteen: {
    title: "Servo Motor Costado Estribor",
    image: insideNineteen,
    pitch: 1.72,
    yaw: -145,
    hotSpots: {
      nextScene: {
        type: "custom",
        pitch: 4.53,
        yaw: 175.8,
        cssClass: "moveScene",
        scene: "insideEighteen",
        previewImage: insideEighteen,
        label: "Ir a Servo Motor Costado Babor",
      },

      nextScene1: {
        type: "custom",
        pitch: -3.43,
        yaw: -101,
        cssClass: "moveScene",
        scene: "insideSeventeen",
        previewImage: insideSeventeen,
        label: "Ir a Servo Motor Crujia",
      },
    },
  },
};
export default Scene;

