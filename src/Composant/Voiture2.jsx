import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';

function Voiture3() {
    const mountRef = useRef(null);

    useEffect(() => {
        // Création de la scène
        const scene = new THREE.Scene();

        // Ajouter une texture de ciel
        const loader = new THREE.TextureLoader();
        const skyTexture = loader.load('/Texture/skyTexture.jpg'); // Assure-toi que le chemin est correct
        scene.background = skyTexture; // Applique l'image comme fond de la scène

        // Création de la caméra
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 3, 10);
        camera.lookAt(0, 1, 0);

        // Création du renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        mountRef.current.appendChild(renderer.domElement);

        // Ajouter les lumières
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
            model.scale.set(4, 4, 4); // Redimensionner la voiture
            model.position.set(0, 1.30, 0); // Positionner la voiture
            scene.add(model);
        });

        // Contrôles de la caméra (PointerLock)
        const controls = new PointerLockControls(camera, renderer.domElement);
        scene.add(controls.getObject());

        // Ajouter les contrôles de la souris pour pointer et déplacer la caméra
        document.addEventListener('click', () => {
            controls.lock(); // Verrouille la souris quand l'utilisateur clique
        });

        // Fonction pour gérer le mouvement du joueur
        const moveSpeed = 0.1; // Vitesse de déplacement
        const onKeyDown = (event) => {
            const movementSpeed = moveSpeed;

            switch (event.code) {
                case 'KeyW': // Avancer
                    controls.moveForward(movementSpeed);
                    break;
                case 'KeyS': // Reculer
                    controls.moveForward(-movementSpeed);
                    break;
                case 'KeyA': // Aller à gauche
                    controls.moveRight(-movementSpeed);
                    break;
                case 'KeyD': // Aller à droite
                    controls.moveRight(movementSpeed);
                    break;
            }
        };

        document.addEventListener('keydown', onKeyDown);

        // Fonction d'animation
        const animate = () => {
            requestAnimationFrame(animate);
            renderer.render(scene, camera);
        };
        animate();

        // Nettoyage lors du démontage du composant
        return () => {
            document.removeEventListener('keydown', onKeyDown);
            mountRef.current.removeChild(renderer.domElement);
            renderer.dispose();
        };

    }, []);

    const createGarage = () => {
        const garage = new THREE.Group();

        // Sol du garage
        const floorGeometry = new THREE.PlaneGeometry(20, 20); // Sol de 20x20
        const floorTexture = new THREE.TextureLoader().load('/Texture/TextureSol.jpg'); // Assure-toi que le chemin est correct
        const floorMaterial = new THREE.MeshBasicMaterial({ map: floorTexture, side: THREE.DoubleSide });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = Math.PI / 2; // Rotation du sol pour le rendre horizontal
        garage.add(floor);

        // Murs du garage (avec épaisseur)
        const wallThickness = 0.5; // Épaisseur des murs

        // Texture des murs
        const wallTexture = new THREE.TextureLoader().load('/Texture/MurTexture.jpg'); // Assure-toi que le chemin est correct
        const wallMaterial = new THREE.MeshBasicMaterial({ map: wallTexture });

        // Mur arrière (avec épaisseur)
        const backWall = new THREE.Mesh(new THREE.BoxGeometry(20, 5, wallThickness), wallMaterial);
        backWall.position.set(0, 2.5, -10);
        garage.add(backWall);

        // Murs latéraux gauche et droit (avec épaisseur)
        const sideWallGeometry = new THREE.BoxGeometry(10, 5, wallThickness); // Utilise BoxGeometry pour épaisseur
        const sideWallLeft = new THREE.Mesh(sideWallGeometry, wallMaterial);
        sideWallLeft.position.set(-5, 2.5, 0);
        sideWallLeft.rotation.y = Math.PI / 2; // Mur gauche
        garage.add(sideWallLeft);

        const sideWallRight = new THREE.Mesh(sideWallGeometry, wallMaterial);
        sideWallRight.position.set(5, 2.5, 0);
        sideWallRight.rotation.y = -Math.PI / 2; // Mur droit
        garage.add(sideWallRight);

        // Mur avant (optionnel, si tu veux aussi un mur devant)
        const frontWall = new THREE.Mesh(new THREE.BoxGeometry(20, 5, wallThickness), wallMaterial);
        frontWall.position.set(0, 2.5, 10);
        garage.add(frontWall);

        return garage;
    };

    return <div ref={mountRef} />;
}

export default Voiture3;
