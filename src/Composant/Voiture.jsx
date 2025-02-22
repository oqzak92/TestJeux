import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

function Voiture() {
    const mountRef = useRef(null);

    useEffect(() => {
        // 📌 1. Création de la scène
        const scene = new THREE.Scene();

        // 📌 2. Création de la caméra
        const camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 0, 4); // Position de la caméra

        // 📌 3. Création du renderer
        const renderer = new THREE.WebGLRenderer();
        renderer.setSize(window.innerWidth, window.innerHeight);
        mountRef.current.appendChild(renderer.domElement);


        // 📌 Ajout de la lumière (obligatoire pour `MeshPhongMaterial`)
        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(1, 1, 1);
        scene.add(light);


        // 📌 4. Création du cube
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const materiel = new THREE.MeshPhongMaterial({ color: 0xffffff }); // Couleur Bleu
        const cube = new THREE.Mesh(geometry, materiel);
        scene.add(cube);






        // 📌 5. Fonction d’animation
        function animate() {
            requestAnimationFrame(animate);
            cube.rotation.x += 0.01; // Rotation du cube sur l'axe X
            cube.rotation.y += 0.01; // Rotation du cube sur l'axe Y
            renderer.render(scene, camera); // Rendu de la scène avec la caméra
        }
        animate();

        // 📌 6. Nettoyage (évite les fuites de mémoire)
        return () => {
            mountRef.current.removeChild(renderer.domElement);
            renderer.dispose();
        };
    }, []);

    return <div ref={mountRef} />; // Attache la scène à ce div
}

export default Voiture;
