import { FireScene } from "./fireScene";
import { HandTracker } from "./HandTracker";

async function initVideo(){
    const video = document.createElement('video');
    video.autoplay = true;
    video.playsInline = true;

    await navigator.mediaDevices.getUserMedia({video: true})
        .then(stream => video.srcObject = stream)
        .catch(err => console.error("Erro ao acessar a webcam:", err));
    
    // await video.play();
    return video;
}

async function main(){
    const video = await initVideo();

    video.onloadedmetadata = async () => {
        const fireScene = new FireScene(video);
        await fireScene.init(); // Aguardar a inicialização da cena antes de renderizar
        await fireScene.init_Mesh(); // Aguardar a inicialização da malha antes de renderizar
        
        const videoAspect = video.videoWidth/ video.videoHeight;
        fireScene.camera.aspect = videoAspect;
        fireScene.camera.updateProjectionMatrix();
        fireScene.camera.position.z = 10;
        
        // console.log(innerWidth, innerHeight)
        // console.log(video.videoWidth, video.videoHeight)
        fireScene.renderer.setSize(video.videoWidth,video.videoHeight)
        
        const handTracker = new HandTracker(video);
        await handTracker.init();
        
        // console.log("Modelo carregado?", handTracker.handLandmarker);

    function animate() {
        requestAnimationFrame(animate);
        handTracker.update();

        // const indexFingerPos = handTracker.getIndexFinger();
        let fingersUp = handTracker.fingers_up();
        if (fingersUp.length >= 4) {
            fireScene.showMesh();
        } else {
            fireScene.hideMesh();
        }
        // console.log("Coordenadas do dedo indicador:",indexFingerPos);
        fireScene.render();

    }
    animate();
}

}

main();






