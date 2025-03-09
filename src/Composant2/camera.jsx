import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';
import { createGarage } from './map';
import { loadModels } from './loadModels';
import * as CANNON from 'cannon-es';  // Importer cannon.js

function Camera({ setHealth }) {
    const mountRef = useRef(null);  // Référence pour le montage du renderer
    const gangsterRef = useRef(null);  // Référence pour le gangster chargé
    const playerBodyRef = useRef(null);  // Référence pour le corps du joueur dans cannon.js

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

        // Partie physique
        const world = new CANNON.World();
        world.gravity.set(0, -9.82, 0);

        // Ajout d'un sol physique
        const groundBody = new CANNON.Body({
            mass: 0,  // Statique (ne bouge pas)
            shape: new CANNON.Plane(),  // Un sol infini
            position: new CANNON.Vec3(0, 2, 0)  // Position sous les pieds du joueur
        });
        groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
        world.addBody(groundBody);  // Ajouter le sol au monde physique

        // Physique joueur
        const playerBody = new CANNON.Body({
            mass: 1,  // Il subit la gravité
            shape: new CANNON.Sphere(0.5),  // Forme simplifiée du joueur
            position: new CANNON.Vec3(0, 3, 10)  // Position de départ
        });
        world.addBody(playerBody);

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
        let moveSpeed = 5, moveSpeedRun = 10, squatSpeed = 3;
        const normalHeight = 3, squatHeight = 1.5;

        const onKeyDown = (event) => {
            switch (event.key) {
                case 'w': moveForward = true; break;
                case 's': moveBackward = true; break;
                case 'a': moveLeft = true; break;
                case 'd': moveRight = true; break;
                case 'Shift': moveSpeedButton = true;
                    UpdateSpeed()
                    break;
                case 'c': moveSquat = true;
                    camera.position.y = squatHeight;
                    UpdateSpeed()
                    break;
            }
        };

        const onKeyUp = (event) => {
            switch (event.key) {
                case 'w': moveForward = false; break;
                case 's': moveBackward = false; break;
                case 'a': moveLeft = false; break;
                case 'd': moveRight = false; break;
                case 'Shift': moveSpeedButton = false;
                    UpdateSpeed()
                    break;
                case 'c': moveSquat = false;
                    camera.position.y = normalHeight;
                    UpdateSpeed()
                    break;
            }
        };

        const UpdateSpeed = () => {
            if (moveSquat) {
                moveSpeed = squatSpeed;
            } else if (moveSpeedButton) {
                moveSpeed = moveSpeedRun;
            } else {
                moveSpeed = 5;
            }
        }

        // Ajouter les événements pour le déplacement
        document.addEventListener('keydown', onKeyDown);
        document.addEventListener('keyup', onKeyUp);

        // Intervalle pour l'attaque ou d'autres comportements réguliers
        const Julien = setInterval(() => {
            console.log("Ce message s'affiche toutes les 2 secondes !");
        }, 2000);

        const velocityVec = new CANNON.Vec3(0, 0, 0);

        const animate = () => {
            requestAnimationFrame(animate);

            const time = performance.now();
            const deltaTime = (time - prevTime) / 1000;
            prevTime = time;

            // Mise à jour de la physique
            world.step(1 / 60);

            // Vitesse de déplacement
            const moveForce = 250; // Augmenter la vitesse de base
            let currentSpeed = moveSpeedButton ? moveForce * 2 : moveForce; // Sprint x2

            let moveX = 0, moveZ = 0;

            if (moveBackward) moveZ -= currentSpeed * deltaTime;
            if (moveForward) moveZ += currentSpeed * deltaTime;
            if (moveRight) moveX -= currentSpeed * deltaTime;
            if (moveLeft) moveX += currentSpeed * deltaTime;

            // Appliquer une force dans la direction de la caméra
            const direction = new THREE.Vector3();
            camera.getWorldDirection(direction);

            const forceX = direction.x * moveZ + direction.z * moveX;
            const forceZ = direction.z * moveZ - direction.x * moveX;

            playerBody.velocity.set(forceX, playerBody.velocity.y, forceZ);

            // Synchroniser la caméra avec le corps du joueur
            controls.object.position.copy(playerBody.position);
            controls.object.position.y += 0.5;  // Décalage pour positionner la caméra au sommet de la sphère

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
