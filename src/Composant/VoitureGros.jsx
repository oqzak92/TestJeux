import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';

function VoitureGros() {

    


    // creation de la sceane
    useEffect(() => {
        const scene = new THREE.Scene();

        // Charger la texture de fond (ciel)
        const loader = new THREE.TextureLoader();
        const skyTexture = loader.load('/Texture/skyTexture.jpg');
        scene.background = skyTexture;

        // Création de la caméra
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 3, 10);
        camera.lookAt(new THREE.Vector3(0, 3, 0)); // Regarde droit devant


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

        // Créer et ajouter le garage
        const garage = createGarage();
        scene.add(garage);

        // Charger le modèle de la voiture
        const modelLoader = new GLTFLoader();
        modelLoader.load('/model/voiture.glb', (gltf) => {
            const model = gltf.scene;
            model.scale.set(4, 4, 4);
            model.position.set(0, 1.30, 0);
            scene.add(model);
        });




        // Charger le modèle de la voiture
        const modelLoaderAK47 = new GLTFLoader();
        modelLoaderAK47.load('/model/AK-47.glb', (gltf) => {
            const modelAK47 = gltf.scene;
            modelAK47.scale.set(1, 1, 1); // Redimensionner la voiture
            modelAK47.position.set(4, 1.30, 0); // Positionner la voiture
            scene.add(modelAK47);
        });




        // Charger le modèle de la Gangster
        const modelLoaderGangster = new GLTFLoader();
        modelLoaderGangster.load('/model/gangster.glb', (gltf) => {
            const modelGangster = gltf.scene;
            modelGangster.scale.set(2, 2, 2); // Redimensionner la voiture
            modelGangster.position.set(-3.5, 2, 0); // Positionner la voiture
            scene.add(modelGangster);
        });




        // Ajouter les contrôles PointerLock
        const controls = new PointerLockControls(camera, renderer.domElement);
        scene.add(controls.getObject());
        controls.getObject().position.set(0, 3, 10); // Centre bien le joueur


        // Activer le contrôle en cliquant sur la page
        document.addEventListener('click', () => controls.lock());

        // **Optimisation des déplacements**
        const moveSpeed = 5; // Ajuster la vitesse
        const moveSpeedRun = 10; // Ajuster la vitesse de course
        let moveForward = false;
        let moveBackward = false;
        let moveLeft = false;
        let moveRight = false;
        let moveSpeedButton = false; // Vitesse de déplacement
        let prevTime = performance.now(); // Pour le calcul du deltaTime

        // Gestion des touches pressées
        const onKeyDown = (event) => {
            switch (event.key) {
                case 'w': moveForward = true; break;
                case 's': moveBackward = true; break;
                case 'a': moveLeft = true; break;
                case 'd': moveRight = true; break;
                case 'Shift': moveSpeedButton = true; break;
            }
        };

        // Gestion des touches relâchées
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

        // Animation et mise à jour
        const animate = () => {
            requestAnimationFrame(animate);

            const time = performance.now();
            const deltaTime = (time - prevTime) / 1000; // Calcul du temps écoulé
            const velocity = moveSpeed * deltaTime; // Ajuster la vitesse selon deltaTime
            const velocityRun = moveSpeedRun * deltaTime; // Ajuster la vitesse de course


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

            



            prevTime = time; // Mettre à jour le temps de référence
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









    // **Créer le garage avec un sol en carreaux**
    const createGarage = () => {
        const garage = new THREE.Group();

        // Charger la texture du sol
        const floorTexture = new THREE.TextureLoader().load('/Texture/TextureSol.jpg');
        floorTexture.wrapS = THREE.RepeatWrapping;
        floorTexture.wrapT = THREE.RepeatWrapping;
        floorTexture.repeat.set(4, 4); // Répéter la texture 4x4 fois

        const floorMaterial = new THREE.MeshBasicMaterial({ map: floorTexture, side: THREE.DoubleSide });
        const floor = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        garage.add(floor);

        // Charger la texture des murs
        const wallTexture = new THREE.TextureLoader().load('/Texture/MurTexture.jpg');
        const wallMaterial = new THREE.MeshBasicMaterial({ map: wallTexture });

        // Création des murs
        const backWall = new THREE.Mesh(new THREE.BoxGeometry(20, 5, 0.5), wallMaterial);
        backWall.position.set(0, 2.5, -10);
        garage.add(backWall);

        const sideWallLeft = new THREE.Mesh(new THREE.BoxGeometry(10, 5, 0.5), wallMaterial);
        sideWallLeft.position.set(-5, 2.5, 0);
        sideWallLeft.rotation.y = Math.PI / 2;
        garage.add(sideWallLeft);

        const sideWallRight = new THREE.Mesh(new THREE.BoxGeometry(10, 5, 0.5), wallMaterial);
        sideWallRight.position.set(5, 2.5, 0);
        sideWallRight.rotation.y = -Math.PI / 2;
        garage.add(sideWallRight);

        return garage;
    };

    return (
        <div>
            <div ref={mountRef} />;
        </div>
    );
        


    


}

export default VoitureGros;
