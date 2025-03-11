import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';
import { createGarage } from './map';
import { loadModels } from './loadModels';
import * as CANNON from 'cannon-es';  // Importer cannon.js

function Camera({ setHealth }) {
    const mountRef = useRef(null);
    const gangsterRef = useRef(null);
    const playerBodyRef = useRef(null);

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






        // Monde physique
        const world = new CANNON.World();
        world.gravity.set(0, -9.82, 0);





        // Sol physique
        const groundBody = new CANNON.Body({
            mass: 0,
            shape: new CANNON.Plane(),
            position: new CANNON.Vec3(0, 2, 0)
        });
        groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
        world.addBody(groundBody);





        // Physique joueur
        const playerShape = new CANNON.Cylinder(0.5, 0.5, 1, 8); // Cylindre hauteur 1, rayon 0.5
        const playerShape2 = new CANNON.Sphere(1)
        const playerBody = new CANNON.Body({
            mass: 1,
            position: new CANNON.Vec3(0, 3, 10),
            fixedRotation: true,  // Empêche les rotations
            angularDamping: 1,    // Évite qu'il ne tourne en glissant
        });
        playerBody.addShape(playerShape);
        world.addBody(playerBody);







        let canJump = false;
        const jumpStrength = 20;




        // Détection de collision avec le sol
        playerBody.addEventListener('collide', (event) => {
            if (event.body === groundBody) {
                canJump = true;
            }
        });




        // Ajouter le garage avec la physique
        const garage = createGarage(world);
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
        let moveSpeed = 5, moveSpeedRun = 15, squatSpeed = 2.5;





        const onKeyDown = (event) => {
            switch (event.key) {
                case 'w': moveForward = true; break;
                case 's': moveBackward = true; break;
                case 'a': moveLeft = true; break;
                case 'd': moveRight = true; break;
                case 'Shift': moveSpeedButton = true; UpdateSpeed(); break;
                case 'c': moveSquat = true; UpdateSpeed(); break;
                case ' ':
                    if (canJump) {
                        playerBody.velocity.y = jumpStrength;
                        canJump = false;
                    }
                    break;
            }
        };






        const onKeyUp = (event) => {
            switch (event.key) {
                case 'w': moveForward = false; break;
                case 's': moveBackward = false; break;
                case 'a': moveLeft = false; break;
                case 'd': moveRight = false; break;
                case 'Shift': moveSpeedButton = false; UpdateSpeed(); break;
                case 'c': moveSquat = false; UpdateSpeed(); break;
            }
        };




        const setPlayerShape = (height) => {
            // Récupérer l'ancienne hauteur
            const oldHeight = playerBody.shapes[0].height;

            // Créer une nouvelle forme
            const newShape = new CANNON.Cylinder(0.5, 0.5, height, 8);

            // Supprimer l’ancienne et ajouter la nouvelle
            playerBody.shapes = [];
            playerBody.addShape(newShape);
            playerBody.updateBoundingRadius();

            // Ajuster la hauteur sans provoquer de saut
            playerBody.position.y -= (oldHeight - height) * 0.5;

            // Empêcher la vélocité de provoquer un rebond
            playerBody.velocity.y = 0;
        };






        const UpdateSpeed = () => {
            if (moveSquat) {
                moveSpeed = squatSpeed;
                setPlayerShape(0.5)
            } else if (moveSpeedButton) {
                moveSpeed = moveSpeedRun;
                setPlayerShape(1)
            } else {
                moveSpeed = 5;
                setPlayerShape(1)
            }
        };

        document.addEventListener('keydown', onKeyDown);
        document.addEventListener('keyup', onKeyUp);

        // Intervalle "Julien"
        const Julien = setInterval(() => {
            console.log("Ce message s'affiche toutes les 2 secondes !");
        }, 2000);

        const animate = () => {
            requestAnimationFrame(animate);

            const time = performance.now();
            const deltaTime = (time - prevTime) / 1000;
            prevTime = time;

            world.step(1 / 60);

            // Gestion des déplacements
            const moveForce = 250;
            let currentSpeed = moveSpeedButton ? moveForce * 2 : moveForce;

            let moveX = 0, moveZ = 0;
            if (moveBackward) moveZ -= currentSpeed * deltaTime;
            if (moveForward) moveZ += currentSpeed * deltaTime;
            if (moveRight) moveX -= currentSpeed * deltaTime;
            if (moveLeft) moveX += currentSpeed * deltaTime;

            const direction = new THREE.Vector3();
            camera.getWorldDirection(direction);

            const forceX = direction.x * moveZ + direction.z * moveX;
            const forceZ = direction.z * moveZ - direction.x * moveX;

            playerBody.velocity.set(forceX, playerBody.velocity.y, forceZ);

            // Synchroniser la caméra avec le joueur
            controls.object.position.copy(playerBody.position);
            controls.object.position.y += 0.5;

            renderer.render(scene, camera);
        };

        animate();

        // Nettoyage à la destruction du composant
        return () => {
            document.removeEventListener('keydown', onKeyDown);
            document.removeEventListener('keyup', onKeyUp);
            if (mountRef.current && renderer.domElement) {
                mountRef.current.removeChild(renderer.domElement);
            }
            renderer.dispose();
            clearInterval(Julien);

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

            world.removeBody(playerBody);
            world.removeBody(groundBody);
        };
    }, []);

    return <div ref={mountRef} />;
}

export default Camera;
