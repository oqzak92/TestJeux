// models.js
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

export function loadModels(scene) {
    const modelLoader = new GLTFLoader();

    // Charger les modèles
    let gangster;
    modelLoader.load('/model/gangster.glb', (gltf) => {
        gangster = gltf.scene;
        gangster.scale.set(2, 2, 2);
        gangster.position.set(-3.5, 2, 0);
        scene.add(gangster);
    });



    let voiture;
    modelLoader.load('/model/voiture.glb', (gltf) => {
        voiture = gltf.scene;
        voiture.scale.set(4, 4, 4);
        voiture.position.set(0, 1.3, 0);
        scene.add(voiture);
    });





    let modelAK47;
    modelLoader.load('/model/AK-47.glb', (gltf) => {
        modelAK47 = gltf.scene;
        modelAK47.scale.set(1, 1, 1);
        modelAK47.position.set(4, 1.3, 0);
        scene.add(modelAK47);
    });





    return { gangster };
    return { voiture };
    return { modelAK47 };



    
}
