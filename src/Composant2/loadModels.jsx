import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

// Fonction pour charger un modèle GLB et retourner une promesse
const loadModel = (path, scene, scale = 1, position = { x: 0, y: 0, z: 0 }) => {
    return new Promise((resolve, reject) => {
        const loader = new GLTFLoader();
        loader.load(path, (gltf) => {
            const model = gltf.scene;
            model.scale.set(scale, scale, scale);
            model.position.set(position.x, position.y, position.z);
            scene.add(model);
            resolve(model);
        }, undefined, reject);
    });
};

// Charger tous les modèles et retourner une promesse avec les modèles chargés
export const loadModels = async (scene) => {
    try {
        const models = await Promise.all([
            loadModel('/model/gangster.glb', scene, 2, { x: -3.5, y: 2, z: 0 }),
            loadModel('/model/voiture.glb', scene, 4, { x: 0, y: 1.3, z: 0 }),
            loadModel('/model/AK-47.glb', scene, 1, { x: 4, y: 1.3, z: 0 }),
        ]);

        return {
            gangster: models[0],
            voiture: models[1],
            modelAK47: models[2],
        };
    } catch (error) {
        console.error("Erreur lors du chargement des modèles :", error);
        return {};
    }
};
