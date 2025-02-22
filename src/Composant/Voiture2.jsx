import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

function Voiture2() {
    const mountRef = useRef(null);

    useEffect(() => {
        // ✅ Création de la scène
        const scene = new THREE.Scene();

        // ✅ Création de la caméra
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 2, 5);

        // ✅ Création du renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        mountRef.current.appendChild(renderer.domElement);

        // ✅ Ajout de lumières
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(2, 2, 2);
        scene.add(directionalLight);

        // ✅ Chargement du modèle `.glb`
        const loader = new GLTFLoader();
        loader.load('/model/voiture.glb', (gltf) => {
            const model = gltf.scene;
            model.scale.set(1, 1, 1); // Ajuste la taille du modèle
            scene.add(model);

            // ✅ Animation du modèle
            function animate() {
                requestAnimationFrame(animate);
                model.rotation.y += 0.01; // Rotation automatique
                renderer.render(scene, camera);
            }
            animate();
        });

        // ✅ Nettoyage lors du démontage du composant
        return () => {
            mountRef.current.removeChild(renderer.domElement);
            renderer.dispose();
        };
    }, []);

    return <div ref={mountRef} />;
}

export default Voiture2;
