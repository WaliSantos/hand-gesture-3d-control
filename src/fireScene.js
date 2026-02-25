import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export class FireScene {
    constructor(video){
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer();
        this.video = video;
        this.firePivot= null;
        this.clock = new THREE.Clock();
        this.mixer = null;
        this.pivot = null;
    }
    async init() {
            document.body.appendChild(this.renderer.domElement);

            // const 	rendSize 		= new THREE.Vector2();
            // rendSize.x = window.innerWidth - 20.0;
            // rendSize.y = window.innerHeight - 20.0

            // this.renderer.setSize(rendSize.x,rendSize.y);

            const videoTexture = new THREE.VideoTexture(this.video);
            videoTexture.repeat.set(-1, 1);
            videoTexture.offset.set(1, 0);

            this.scene.background = videoTexture;
            this.camera.position.z = 10;
        

        }

  async init_Mesh() {
    const gltfLoader = new GLTFLoader();

    return new Promise((resolve) => {
        gltfLoader.load('./models/fire/scene.gltf', (loadedMesh) => {

            let fire = loadedMesh.scene;

            const bbox = new THREE.Box3().setFromObject(fire);
            const center = new THREE.Vector3();
            bbox.getCenter(center);
            fire.position.sub(center); 

            this.pivot = new THREE.Group();
            this.scene.add(this.pivot);
            this.pivot.add(fire);
            this.pivot.scale.setScalar(5); 
            this.pivot.position.set(4, 0, 0); 

            this.mixer = new THREE.AnimationMixer(fire);

            loadedMesh.animations.forEach((clip) =>{  
                this.mixer.clipAction(clip).play()
            });

            this.pivot.visible = false; 

            resolve();
        });
    });
}
    showMesh() {
        if (this.pivot) {
            this.pivot.visible = true;
        }
    }

    hideMesh() {
        if (this.pivot) {
            this.pivot.visible = false;
        }
    }
    render() {
        const delta = this.clock.getDelta(); 
        if (this.mixer){
            this.mixer.update(delta)
        }
        this.renderer.render(this.scene, this.camera);
    }
    
}

