import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';
import { createGarage } from './map';

function Camera() {
    const mountRef = useRef(null);

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
        const modelLoader = new GLTFLoader();
        modelLoader.load('/model/voiture.glb', (gltf) => {
            const model = gltf.scene;
            model.scale.set(4, 4, 4);
            model.position.set(0, 1.3, 0);
            scene.add(model);
        });

        modelLoader.load('/model/AK-47.glb', (gltf) => {
            const modelAK47 = gltf.scene;
            modelAK47.scale.set(1, 1, 1);
            modelAK47.position.set(4, 1.3, 0);
            scene.add(modelAK47);
        });

        modelLoader.load('/model/gangster.glb', (gltf) => {
            const modelGangster = gltf.scene;
            modelGangster.scale.set(2, 2, 2);
            modelGangster.position.set(-3.5, 2, 0);
            scene.add(modelGangster);
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
    }, []);

    return <div ref={mountRef} />;
}

export default Camera;
