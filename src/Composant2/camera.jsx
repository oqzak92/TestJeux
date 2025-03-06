import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';
import { createGarage } from './map';
import { loadModels } from './loadModels';

function Camera({ setHealth }) {
    const mountRef = useRef(null);  // Référence pour le montage du renderer
    const gangsterRef = useRef(null);  // Référence pour le gangster chargé

    useEffect(() => {
        const scene = new THREE.Scene();

        // Charger la texture de fond (ciel)
        const loader = new THREE.TextureLoader();
        const skyTexture = loader.load('/Texture/skyTexture.jpg');
        scene.background = skyTexture;

        // Création de la caméra
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 3, 10);

        // Création du renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        mountRef.current.appendChild(renderer.domElement); // Attacher le renderer au DOM

        // Lumières
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(2, 5, 2);
        scene.add(directionalLight);

        // Ajouter le garage
        const garage = createGarage();
        scene.add(garage);

        // Charger les modèles
        loadModels(scene).then(models => {
            if (models.gangster) {
                gangsterRef.current = models.gangster;
                console.log("Gangster chargé :", gangsterRef.current);
            }
        });

        // Contrôles
        const controls = new PointerLockControls(camera, renderer.domElement);
        scene.add(controls.getObject());
        document.addEventListener('click', () => controls.lock());

        // Variables de déplacement
        let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false, moveSpeedButton = false, moveSquat = false;
        let prevTime = performance.now();
        const moveSpeed = 5, moveSpeedRun = 10;
        const Squat = camera.position.set(0, 1.5, 10);

        const onKeyDown = (event) => {
            switch (event.key) {
                case 'w': moveForward = true; break;
                case 's': moveBackward = true; break;
                case 'a': moveLeft = true; break;
                case 'd': moveRight = true; break;
                case 'Shift': moveSpeedButton = true; break;
                case 'c': moveSquat = true; break;
            }
        };

        const onKeyUp = (event) => {
            switch (event.key) {
                case 'w': moveForward = false; break;
                case 's': moveBackward = false; break;
                case 'a': moveLeft = false; break;
                case 'd': moveRight = false; break;
                case 'Shift': moveSpeedButton = false; break;
                case 'c': moveSquat = false; break;
            }
        };

        // Ajouter les événements pour le déplacement
        document.addEventListener('keydown', onKeyDown);
        document.addEventListener('keyup', onKeyUp);

        // Intervalle pour l'attaque ou d'autres comportements réguliers
        const Julien = setInterval(() => {
            console.log("Ce message s'affiche toutes les 2 secondes !");
        }, 2000);

        // Animation
        const animate = () => {
            requestAnimationFrame(animate);

            const time = performance.now();
            const deltaTime = (time - prevTime) / 1000;
            const velocity = moveSpeed * deltaTime;
            const velocityRun = moveSpeedRun * deltaTime;

            // Déplacement du joueur
            if (moveForward) controls.moveForward(velocity);
            if (moveBackward) controls.moveForward(-velocity);
            if (moveLeft) controls.moveRight(-velocity);
            if (moveRight) controls.moveRight(velocity);
            if (moveSpeedButton) {
                if (moveForward) controls.moveForward(velocityRun);
                if (moveBackward) controls.moveForward(-velocityRun);
                if (moveLeft) controls.moveRight(-velocityRun);
                if (moveRight) controls.moveRight(velocityRun);
            }

            prevTime = time;
            renderer.render(scene, camera);
        };
        animate();

        // Nettoyage à la destruction du composant
        return () => {
            // Supprimer les écouteurs d'événements
            document.removeEventListener('keydown', onKeyDown);
            document.removeEventListener('keyup', onKeyUp);

            // Vérifier si mountRef.current existe avant de tenter de manipuler le DOM
            if (mountRef.current && renderer.domElement) {
                mountRef.current.removeChild(renderer.domElement); // Supprimer l'élément du DOM
            }

            // Nettoyage du renderer
            renderer.dispose();

            // Nettoyage de l'intervalle
            clearInterval(Julien);

            // Nettoyage de la scène (dispose des géométries et matériaux)
            scene.traverse((object) => {
                if (object.geometry) object.geometry.dispose();
                if (object.material) {
                    if (Array.isArray(object.material)) {
                        object.material.forEach((mat) => mat.dispose());
                    } else {
                        object.material.dispose();
                    }
                }
            });

            // Désactiver les contrôles (si nécessaire)
            controls.unlock();
        };
    }, []); // Pas de dépendance pour éviter les re-renders infinis

    return <div ref={mountRef} />; // Attacher le div de montage au DOM
}

export default Camera;
