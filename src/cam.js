import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

let scene, camera, renderer;

const 	rendSize 		= new THREE.Vector2();
let fire;
let mixer; 
let clock = new THREE.Clock();  

function init() {
    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(new THREE.Color(0.878,1.,1.));

    rendSize.x = window.innerWidth - 20.0;
    rendSize.y = window.innerHeight - 20.0

    renderer.setSize(rendSize.x,rendSize.y);

    document.body.appendChild(renderer.domElement); 

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1000)
    
    const video = document.createElement('video');
    video.autoplay = true;
    video.playsInline = true;

    navigator.mediaDevices.getUserMedia({video: true})
        .then(stream =>{
            video.srcObject= stream;

            const videoTexture = new THREE.VideoTexture(video);
            videoTexture.repeat.set(-1, 1);
            videoTexture.offset.set(1, 0);
            scene.background = videoTexture;
        })
        .catch(err => {
            console.error("Erro ao acessar a webcam:", err);
        });
    
    video.onloadedmetadata = () => {
        const videoAspect = video.videoWidth/ video.videoHeight;

        camera.aspect = videoAspect;
        camera.updateProjectionMatrix();
        camera.position.z = 10;
        
       
        console.log(innerWidth, innerHeight)
        console.log(video.videoWidth, video.videoHeight)
        renderer.setSize(video.videoWidth,video.videoHeight)
    };

    const gltfLoader = new GLTFLoader();
    gltfLoader.load('./models/fire/scene.gltf', onLoadMesh);

    renderer.clear()
    render();
};

// ************************
function onLoadMesh(loadedMesh){
    fire = loadedMesh.scene;
    // 1. Calcula a "caixa" que envolve o fogo para achar o centro real
    const bbox = new THREE.Box3().setFromObject(fire);
    const center = new THREE.Vector3();
    bbox.getCenter(center);

    // 2. Subtrai o centro da posição do fogo
    // Isso move a "malha" para que o meio da chama seja o novo 0,0,0
    fire.position.sub(center);

    // 3. Cria um Grupo para servir como o novo "pai" centralizado
    const pivot = new THREE.Group();
    scene.add(pivot);
    pivot.add(fire);
    pivot.scale.setScalar(5); // Pode aumentar quanto quiser, ele crescerá do centro
    pivot.position.set(4, 0, 0); 

    mixer = new THREE.AnimationMixer(fire); 
    loadedMesh.animations.forEach((clip) =>{  
        mixer.clipAction(clip).play()
    })
    render();
}

// ************************
function render(){

    requestAnimationFrame(render); 
    const delta = clock.getDelta(); 
    if (mixer){
        mixer.update(delta)
    }
    renderer.render(scene,camera);
};

// ************************
init();
