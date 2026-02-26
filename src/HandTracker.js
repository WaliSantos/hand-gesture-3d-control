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
    this.hand_zero = 0;
    this.hand_one = 1;
    this.results = null;
    
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

    get_handcoordinates(hand) {
       let lmList = [];
       if (this.results && this.results.landmarks && this.results.landmarks.length > 0) {
        // console.log("results", this.results);

        const handLms = this.results.landmarks[hand];
        for (let i=0; i <handLms.length; i++){
          const x = handLms[i].x;
          const y = handLms[i].y;
          const z = handLms[i].z;

          const videoWidth = this.video.videoWidth;
          const videoHeight = this.video.videoHeight;

          const cx = x * videoWidth;
          const cy = y * videoHeight;
          const ndcx =  -((cx / videoWidth)* 2 -1); 
          const ndcy = -((cy / videoHeight) * 2 -1 );
          lmList.push({i, x, y, z, cx, cy, ndcx, ndcy});
        }
    }
    return lmList;
  }
  get_handrotation(hand){
    if (!this.results || !this.results.landmarks || this.results.landmarks.length === 0) {
        return null;
      }
    const handLms = this.results.landmarks[hand];
    const p1 = handLms[5];
    const p2= handLms[17];

    const deltaX = p2.x - p1.x;
    const deltaY = p2.y - p1.y;

    const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);

    return angle;
    
  }

    fingers_up(hand) {


      if (!this.results || 
        !this.results.landmarks || 
        this.results.landmarks.length === 0) {
        return [];
      }

      let fingers=[];
      let tipIds=[4,8,12,16,20];
      if (this.results.landmarks.length > 0) {
        let handLms=this.results.landmarks[hand];
        // console.log("handLms", handLms);
        if(handLms[tipIds[0]].x < handLms[tipIds[0]-1].x){
          fingers.push(1);
        } 
        for(let id=1; id<5; id++){
          if(handLms[tipIds[id]].y < handLms[tipIds[id]-2].y){
            fingers.push(1);
          } 
        }
      }
      
      return fingers
    }
  update() {
    this.results = this.handLandmarker.detectForVideo(
        this.video,
        performance.now()
    );
  }
};