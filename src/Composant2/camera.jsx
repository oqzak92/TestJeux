import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';
import { moveGangsterRandomly, moveGangsterTowardsPlayer } from './IaGangster';
import { createGarage } from './map';
import { loadModels } from './loadModels';
import { AttakIa } from './Attak'

function Camera({ setHealth }) {
    const mountRef = useRef(null);
    const gangsterRef = useRef(null); // Utiliser un ref pour éviter les re-renders

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
        mountRef.current.appendChild(renderer.domElement);

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

                // Lancer le mouvement initial
                moveGangsterRandomly(gangsterRef.current);
            }
        });

        // Contrôles
        const controls = new PointerLockControls(camera, renderer.domElement);
        scene.add(controls.getObject());
        document.addEventListener('click', () => controls.lock());

        // Déplacement
        let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false, moveSpeedButton = false;
        let prevTime = performance.now();
        const moveSpeed = 5, moveSpeedRun = 10;

        const onKeyDown = (event) => {
            switch (event.key) {
                case 'w': moveForward = true; break;
                case 's': moveBackward = true; break;
                case 'a': moveLeft = true; break;
                case 'd': moveRight = true; break;
                case 'Shift': moveSpeedButton = true; break;
            }
        };

        const onKeyUp = (event) => {
            switch (event.key) {
                case 'w': moveForward = false; break;
                case 's': moveBackward = false; break;
                case 'a': moveLeft = false; break;
                case 'd': moveRight = false; break;
                case 'Shift': moveSpeedButton = false; break;
            }
        };

        document.addEventListener('keydown', onKeyDown);
        document.addEventListener('keyup', onKeyUp);


        let lastAttackTime = 0; // Moment de la dernière attaque
        const attackDelay = 2300; // Délai en millisecondes entre les attaques

        // Animation
        const animate = () => {
            requestAnimationFrame(animate);
            const time = performance.now();
            const deltaTime = (time - prevTime) / 1000;
            const velocity = moveSpeed * deltaTime;
            const velocityRun = moveSpeedRun * deltaTime;

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




            // Vérifier si le modèle du gangster est chargé avant de calculer la distance
            if (gangsterRef.current) {
                const distance = gangsterRef.current.position.distanceTo(camera.position);
                console.log("Distance du gangster au joueur :", distance);

                if (distance <= 10) {
                    moveGangsterTowardsPlayer(gangsterRef.current, camera);
                    if (distance <= 2) {
                        console.log("il frappe ")
                        // Vérifie si le délai entre les attaques est écoulé
                        if (time - lastAttackTime >= attackDelay) {
                            lastAttackTime = time; // Mise à jour du moment de la dernière attaque
                            AttakIa({ setHealth });
                        }
                    }
                }
            } else {
                console.log("Gangster pas encore chargé...");
            }

            prevTime = time;
            renderer.render(scene, camera);
        };
        animate();

        return () => {
            document.removeEventListener('keydown', onKeyDown);
            document.removeEventListener('keyup', onKeyUp);
            mountRef.current.removeChild(renderer.domElement);
            renderer.dispose();
        };
    }, []); // Pas de dépendance pour éviter les re-renders infinis

    return <div ref={mountRef} />;
}

export default Camera;
