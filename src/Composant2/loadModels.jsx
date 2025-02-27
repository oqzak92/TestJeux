import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

// Fonction pour charger un modèle GLB
export function loadModel(scene, path, scale, position) {
    const loader = new GLTFLoader();
    loader.load(path, (gltf) => {
        const model = gltf.scene;
        model.scale.set(scale, scale, scale);
        model.position.set(...position);
        scene.add(model);
    });
}

