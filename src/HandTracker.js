import {
    HandLandmarker,
    FilesetResolver
} from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest";


// Tentar ver como implementar isso no javascript
// Pegar a posição da mão e passar para a cena do three.js para controlar o fogo
//  usar os gestos para controlar a animação do fogo


export class HandTracker {

  constructor(video) {
    this.video = video;
    this.handLandmarker = null;
    this.lastVideoTime = -1;
  }

  async init() {
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
    ); // Carregar o modelo de detecção de mãos

    this.handLandmarker = await HandLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath:
          "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task"
      },
      runningMode: "VIDEO",
      numHands: 2
    }); // Criar uma instância do detector de mãos 
    }

    getIndexFinger() {
        if (!this.handLandmarker) return null; // Verificar se o modelo de detecção de mãos foi carregado

        const now = performance.now();

        if (this.video.currentTime !== this.lastVideoTime) {
        this.lastVideoTime = this.video.currentTime;

        const results = this.handLandmarker.detectForVideo(this.video, now);
        // console.log("resultados:", results);
        if (results.landmarks.length > 0) {
            // console.log("results",results.landmarks); // Imprimir as coordenadas do dedo indicador
            return results.landmarks[0][8]; // dedo indicador
        }
        }

        return null;
    }

    fingers_up() {


      if (!this.results || 
        !this.results.landmarks || 
        this.results.landmarks.length === 0) {
        return [];
      }

      let fingers=[];
      let tipIds=[4,8,12,16,20];
      if (this.results.landmarks.length > 0) {
        let handLms=this.results.landmarks[0];
        if(handLms[tipIds[0]].x < handLms[tipIds[0]-1].x){
          fingers.push(1);
        } 
        for(let id=1; id<5; id++){
          if(handLms[tipIds[id]].y < handLms[tipIds[id]-2].y){
            fingers.push(1);
          } 
        }
      }
      // if (fingers.length == 0){
      //   return "Dedos Levantados";
      // }
      return fingers
    }
  update() {
    this.results = this.handLandmarker.detectForVideo(
        this.video,
        performance.now()
    );
  }
};