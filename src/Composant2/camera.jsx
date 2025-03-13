import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';
import { createGarage } from './map';
import { loadModels } from './loadModels';
import * as CANNON from 'cannon-es';

function Camera({ setHealth }) {
    const mountRef = useRef(null);
    const gangsterRef = useRef(null);
    const playerBodyRef = useRef(null);
    const controlsRef = useRef(null);
    const cameraHeightRef = useRef(0.9);

    useEffect(() => {
        // ===== INITIALISATION DE BASE =====
        const scene = new THREE.Scene();
        const loader = new THREE.TextureLoader();
        const skyTexture = loader.load('/Texture/skyTexture.jpg');
        scene.background = skyTexture;

        // Configuration de la caméra
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.set(0, 3, 10);

        // Configuration du renderer
        const renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.shadowMap.enabled = true;
        mountRef.current.appendChild(renderer.domElement);

        // Redimensionnement de la fenêtre
        const handleResize = () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        };
        window.addEventListener('resize', handleResize);

        // Éclairage
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        scene.add(ambientLight);
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(2, 5, 2);
        directionalLight.castShadow = true;
        scene.add(directionalLight);

        // ===== PHYSIQUE =====
        const world = new CANNON.World();
        world.gravity.set(0, -30, 0); // Gravité plus forte pour éviter le flottement
        world.allowSleep = false;
        world.solver.iterations = 20; // Plus d'itérations pour une meilleure stabilité

        // Matériaux
        const groundMaterial = new CANNON.Material("groundMaterial");
        const playerMaterial = new CANNON.Material("playerMaterial");
        const contactMaterial = new CANNON.ContactMaterial(playerMaterial, groundMaterial, {
            friction: 0.5,           // Plus de friction pour éviter le glissement
            restitution: 0.0,        // Pas de rebond
            contactEquationStiffness: 1e8,
            contactEquationRelaxation: 3,
            frictionEquationStiffness: 1e8 // Meilleure adhérence
        });
        world.addContactMaterial(contactMaterial);

        // Sol physique
        const groundBody = new CANNON.Body({
            mass: 0,
            type: CANNON.Body.STATIC,
            shape: new CANNON.Plane(),
            material: groundMaterial
        });
        groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
        world.addBody(groundBody);

        // Corps du joueur (cylindre)
        const playerShape = new CANNON.Cylinder(0.4, 0.4, 1.0, 16);
        const playerBody = new CANNON.Body({
            mass: 80,
            material: playerMaterial,
            shape: playerShape,
            position: new CANNON.Vec3(0, 5, 10),
            linearDamping: 0.7,       // Plus d'amortissement pour limiter la glisse
            angularDamping: 0.99,
            fixedRotation: true,      // Empêche le cylindre de tomber
            allowSleep: false
        });

        // Ajouter une forte friction pour éviter la glisse
        playerBody.material = playerMaterial;

        // Ajouter des détecteurs de collision
        playerBody.addEventListener("collide", (e) => {
            // Optionnellement, tu peux ajouter un son ou un effet visuel lors des collisions
            console.log("Collision détectée");
        });

        world.addBody(playerBody);
        playerBodyRef.current = playerBody;

        // ===== CRÉATION DE L'ENVIRONNEMENT =====
        const garage = createGarage(world);
        scene.add(garage);

        loadModels(scene).then(models => {
            if (models.gangster) {
                gangsterRef.current = models.gangster;
            }
        });

        // ===== CONTRÔLES =====
        const controls = new PointerLockControls(camera, renderer.domElement);
        controlsRef.current = controls;
        scene.add(controls.getObject());

        document.addEventListener('click', () => controls.lock());

        // État des mouvements
        const movement = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            sprint: false,
            crouch: false,
            jumping: false
        };

        // Vitesses et paramètres de déplacement
        const SPEED = {
            walk: 7,         // Vitesse de marche réduite
            run: 140,          // Vitesse de course réduite
            crouch: 15,       // Vitesse accroupie réduite
            jump: 1300,        // Force de saut réduite
            airControl: 0.2,   // Contrôle en l'air limité
            jumpAirSpeed: 7
        };

        // Variables d'état
        let canJump = false;
        let isCrouching = false;
        let prevTime = performance.now();
        let diagonalSpeed = 0.7071; // 1/sqrt(2) pour normaliser la vitesse diagonale

        // Fonction pour vérifier si le joueur touche le sol
        const checkGround = () => {
            // Réduisez légèrement la longueur du rayon pour une détection plus précise
            const rayLength = 0.6; // Distance depuis le centre du joueur jusqu'au bas du cylindre + une petite marge
            const start = new CANNON.Vec3(playerBody.position.x, playerBody.position.y, playerBody.position.z);
            const end = new CANNON.Vec3(playerBody.position.x, playerBody.position.y - rayLength, playerBody.position.z);
            const result = new CANNON.RaycastResult();
            world.raycastClosest(start, end, {}, result);
            return result.hasHit;
        };

        // Gestion de l'accroupissement
        const crouch = () => {
            if (!isCrouching) {
                isCrouching = true;
                cameraHeightRef.current = 0.150;

                // Modifier la forme du corps (plus petit)
                const crouchShape = new CANNON.Cylinder(0.4, 0.4, 0.4, 16);
                playerBody.shapes[0] = crouchShape;
                playerBody.updateMassProperties();
            }
        };

        const standUp = () => {
            if (isCrouching) {
                isCrouching = false;
                cameraHeightRef.current = 0.9;

                // Revenir à la forme normale
                const standShape = new CANNON.Cylinder(0.4, 0.4, 1.0, 16);
                playerBody.shapes[0] = standShape;
                playerBody.updateMassProperties();
            }
        };

        // Gestion des contrôles clavier
        const onKeyDown = (event) => {
            // Éviter que les événements se déclenchent pendant la saisie de texte
            if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') return;

            switch (event.code) {
                case 'KeyW':
                    movement.forward = true;
                    break;
                case 'KeyS':
                    movement.backward = true;
                    break;
                case 'KeyA':
                    movement.left = true;
                    break;
                case 'KeyD':
                    movement.right = true;
                    break;
                case 'ShiftLeft':
                    if (!isCrouching) {
                        movement.sprint = true;
                    }
                    break;
                case 'KeyC':
                    crouch();
                    movement.crouch = true;
                    break;
                case 'Space':
                    // Vérifiez explicitement que le joueur touche le sol avant d'autoriser un saut
                    if (checkGround() && !movement.jumping && !isCrouching) {
                        movement.jumping = true;
                        playerBody.velocity.y = 0; // Réinitialiser la vitesse verticale avant le saut
                        playerBody.applyImpulse(
                            new CANNON.Vec3(0, SPEED.jump, 0),
                            playerBody.position
                        );
                    }
                    break;
            }
        };

        const onKeyUp = (event) => {
            if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') return;

            switch (event.code) {
                case 'KeyW':
                    movement.forward = false;
                    break;
                case 'KeyS':
                    movement.backward = false;
                    break;
                case 'KeyA':
                    movement.left = false;
                    break;
                case 'KeyD':
                    movement.right = false;
                    break;
                case 'ShiftLeft':
                    movement.sprint = false;
                    break;
                case 'KeyC':
                    standUp();
                    movement.crouch = false;
                    break;
            }
        };

        document.addEventListener('keydown', onKeyDown);
        document.addEventListener('keyup', onKeyUp);

        // Intervalle pour l'attaque ou d'autres comportements réguliers
        const Julien = setInterval(() => {
            console.log("Ce message s'affiche toutes les 2 secondes !");
        }, 2000);




        // ===== BOUCLE D'ANIMATION =====
        const animate = () => {
            requestAnimationFrame(animate);

            const deltaTime = Math.min((performance.now() - prevTime) / 1000, 0.1);
            prevTime = performance.now();

            // Mise à jour de la physique
            world.step(1 / 60, deltaTime, 3);

            // Vérification du sol
            canJump = checkGround();
            if (canJump) {
                movement.jumping = false;
            }

            // Calcul de la direction de déplacement
            const direction = new THREE.Vector3();
            controls.getObject().getWorldDirection(direction);
            direction.y = 0;
            direction.normalize();

            const right = new THREE.Vector3();
            right.crossVectors(new THREE.Vector3(0, 1, 0), direction);
            right.normalize();

            const moveDir = new THREE.Vector3(0, 0, 0);
            let movementCount = 0;

            if (movement.forward) {
                moveDir.add(direction);
                movementCount++;
            }
            if (movement.backward) {
                moveDir.sub(direction);
                movementCount++;
            }
            if (movement.left) {
                moveDir.add(right);
                movementCount++;
            }
            if (movement.right) {
                moveDir.sub(right);
                movementCount++;
            }

            // Normaliser le vecteur de mouvement pour éviter d'aller plus vite en diagonale
            if (moveDir.length() > 0) {
                moveDir.normalize();

                // Vitesse en fonction de l'état
                let speed;
                if (movement.crouch) {
                    speed = SPEED.crouch;
                } else if (movement.sprint && canJump) {
                    speed = SPEED.run;
                } else {
                    speed = SPEED.walk;
                }

                // Contrôle limité en l'air
                if (!canJump) {
                    // Appliquer moins de force en l'air pour un meilleur contrôle
                    speed *= SPEED.airControl;


                    // Appliquer une impulsion douce plutôt que de modifier directement la vélocité
                    const impulse = new CANNON.Vec3(
                        moveDir.x * speed * deltaTime,
                        0,
                        moveDir.z * speed * deltaTime
                    );
                    playerBody.applyImpulse(impulse, playerBody.position);
                } else {
                    // Au sol, contrôle direct de la vélocité
                    playerBody.velocity.x = moveDir.x * speed;
                    playerBody.velocity.z = moveDir.z * speed;
                }
            } else if (canJump) {
                // Arrêt du mouvement horizontal seulement si on est au sol
                playerBody.velocity.x *= 0.9; // Décélération progressive
                playerBody.velocity.z *= 0.9;

                // Si la vitesse est très faible, l'arrêter complètement
                if (Math.abs(playerBody.velocity.x) < 0.1) playerBody.velocity.x = 0;
                if (Math.abs(playerBody.velocity.z) < 0.1) playerBody.velocity.z = 0;
            }

            // Limiter la vitesse maximale pour éviter les bugs physiques
            const horizontalVelocity = Math.sqrt(
                playerBody.velocity.x * playerBody.velocity.x +
                playerBody.velocity.z * playerBody.velocity.z
            );

            const maxSpeed = movement.sprint ? SPEED.run * 1.2 : SPEED.walk * 1.2;

            if (horizontalVelocity > maxSpeed) {
                const scale = maxSpeed / horizontalVelocity;
                playerBody.velocity.x *= scale;
                playerBody.velocity.z *= scale;
            }

            // Mise à jour de la position de la caméra
            camera.position.copy(playerBody.position);
            camera.position.y += cameraHeightRef.current;
            controls.getObject().position.copy(camera.position);

            // Rendu de la scène
            renderer.render(scene, camera);
        };

        animate();

        // Nettoyage lors du démontage
        return () => {
            document.removeEventListener('keydown', onKeyDown);
            document.removeEventListener('keyup', onKeyUp);
            window.removeEventListener('resize', handleResize);
            if (mountRef.current && renderer.domElement) {
                mountRef.current.removeChild(renderer.domElement);
            }
        };
    }, [setHealth]);

    return <div ref={mountRef} style={{ width: '100%', height: '100vh' }} />;
}

export default Camera;