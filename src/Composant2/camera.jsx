import React, { useEffect, useRef , useState} from 'react';
import * as THREE from 'three';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';
import { createGarage } from './map';
import { loadModels } from './loadModels';
import * as CANNON from 'cannon-es';
import { createBuilding } from './Map/Bulding';

function Camera({ setHealth, setPlayerY   }) {
    const mountRef = useRef(null);
    const gangsterRef = useRef(null);
    const playerBodyRef = useRef(null);
    const controlsRef = useRef(null);
    const cameraHeightRef = useRef(0.9);
    // Ajout d'une référence pour suivre si le joueur est au sol
    const isOnGroundRef = useRef(false);
    // Ajouter un compteur pour stabiliser la détection du sol
    const groundContactCount = useRef(0);
    const isJumpingRef = useRef(false);






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
        const PLAYER_GROUP = 1;  // Groupe du joueur
        const GROUND_GROUP = 2;  // Groupe du sol

        const world = new CANNON.World();
        world.gravity.set(0, -30, 0); // Gravité plus forte pour éviter le flottement
        world.allowSleep = false;
        world.solver.iterations = 20; // Plus d'itérations pour une meilleure stabilité

        // Matériaux
        const playerMaterial = new CANNON.Material("playerMaterial");
        const groundMaterial = new CANNON.Material("groundMaterial");
        const contactMaterial = new CANNON.ContactMaterial(playerMaterial, groundMaterial, {
            friction: 0.7,           // Augmenté pour une meilleure adhérence
            restitution: 0.0,        // Pas de rebond
            contactEquationStiffness: 1e7, // Moins rigide pour une meilleure stabilité
            contactEquationRelaxation: 5,  // Plus de relaxation
            frictionEquationStiffness: 1e7 // Meilleure adhérence
        });
        world.addContactMaterial(contactMaterial);

        // ===== CRÉATION DU SOL =====
        const groundShape = new CANNON.Plane();
        const groundBody = new CANNON.Body({
            mass: 0, 
            shape: groundShape,
            material: groundMaterial,
            position: new CANNON.Vec3(0, 0, 0), // Position Y = 0 pour le sol
            collisionFilterGroup: GROUND_GROUP,
            collisionFilterMask: PLAYER_GROUP
        });
        groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0); // Rotation pour être horizontal
        world.addBody(groundBody);

        // ===== CRÉATION DU JOUEUR =====
        // La hauteur du cylindre a été ajustée à 5, donc le centre est à 2.5 unités du sol
        const playerHeight = 5; // Hauteur explicite pour utiliser dans les calculs
        const playerRadius = 0.4;
        
        const playerShape = new CANNON.Cylinder(playerRadius, playerRadius, playerHeight, 16);
        const playerBody = new CANNON.Body({
            mass: 80,
            material: playerMaterial,
            shape: playerShape,
            position: new CANNON.Vec3(0, 6, 10), // Position initiale
            linearDamping: 0.7, 
            angularDamping: 0.99,
            fixedRotation: true, 
            allowSleep: false,
            collisionFilterGroup: PLAYER_GROUP,
            collisionFilterMask: GROUND_GROUP
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









        // ===== Fonction Divers =====


















        // ===== SYSTÈME DE DÉTECTION DU SOL AMÉLIORÉ =====






        
        // Fonction simplifiée mais fiable pour détecter le sol
        const isGrounded = () => {
            const expectedGroundHeight = 2.5;
            const tolerance = 0.2;
        
            const isNearGround = Math.abs(playerBody.position.y - expectedGroundHeight) < tolerance;
            const isNotFalling = Math.abs(playerBody.velocity.y) < 0.5;
        
            const rayFrom = new CANNON.Vec3(
                playerBody.position.x, 
                playerBody.position.y - (playerHeight / 2) + 0.05, 
                playerBody.position.z
            );
        
            const rayTo = new CANNON.Vec3(
                playerBody.position.x, 
                playerBody.position.y - (playerHeight / 2) - 0.3, 
                playerBody.position.z
            );
        
            const result = new CANNON.RaycastResult();
            world.raycastClosest(rayFrom, rayTo, { collisionFilterMask: GROUND_GROUP }, result);
        
            if (result.hasHit) {
                groundContactCount.current = 5;
            } else if (isNearGround && isNotFalling) {
                groundContactCount.current = Math.min(groundContactCount.current + 1, 5);
            } else {
                groundContactCount.current = Math.max(groundContactCount.current - 2, 0);
            }
        
            isOnGroundRef.current = groundContactCount.current > 1;
        
        
            return isOnGroundRef.current;
        };
        
        
        // Détection des collisions avec le sol via événements
        playerBody.addEventListener("collide", (event) => {
            if (event.body.collisionFilterGroup === GROUND_GROUP) {
                // On compte la collision comme possible contact avec le sol
                groundContactCount.current = Math.min(groundContactCount.current + 1, 5);
                isOnGroundRef.current = true;
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
            walk: 70,
            run: 140,
            crouch: 15,
            jump: 1300,
            airControl: 0.2, // Revenu à la valeur originale
            jumpAirSpeed: 7
        };

        // Variables d'état
        let prevTime = performance.now();
        let isCrouching = false;
        let frameCount = 0;



        const Melissa = () => {
            if (isGrounded()) {
                console.log("Saut initié!");
                isOnGroundRef.current = false;
                isJumpingRef.current = true; // Marquer comme en train de sauter
                
                const jumpForce = new CANNON.Vec3(0, SPEED.jump, 0);
                playerBody.applyImpulse(jumpForce, playerBody.position);
                
                // Réinitialiser l'état de saut après un délai
                setTimeout(() => {
                    isJumpingRef.current = false;
                }, 300); // 300ms est généralement suffisant pour le début du saut
            } else {
                console.log("Impossible de sauter - pas au sol");
            }
        };
        


        // Gestion de l'accroupissement
        const crouch = () => {
            if (!isCrouching) {
                isCrouching = true;
                cameraHeightRef.current = 0.150;

                // Modifier la forme du corps (plus petit)
                const crouchShape = new CANNON.Cylinder(0.4, 0.4, 2.5, 16);
                playerBody.shapes[0] = crouchShape;
                playerBody.updateMassProperties();
            }
        };





        const standUp = () => {
            if (isCrouching) {
                isCrouching = false;
                cameraHeightRef.current = 0.9;

                // Revenir à la forme normale
                const standShape = new CANNON.Cylinder(0.4, 0.4, playerHeight, 16);
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
                        Melissa();
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

        // Mise à jour de la position Y du joueur
        const updatePlayerY = setInterval(() => {
            if (playerBody) {
                setPlayerY(playerBody.position.y);
            }
        }, 10);

















        // ===== BOUCLE D'ANIMATION =====
        const animate = () => {
            requestAnimationFrame(animate);
            frameCount++;

            


            const deltaTime = Math.min((performance.now() - prevTime) / 1000, 0.1);
            prevTime = performance.now();

            // Mise à jour de la physique
            world.step(1 / 60, deltaTime, 3);
            
            // Vérification périodique du statut du sol
            isGrounded(); // Met à jour isOnGroundRef à chaque frame
            
            // console.log(isOnGroundRef.current ? "AU SOL" : "EN L'AIR");
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
                } else if (movement.sprint) {
                    speed = SPEED.run;
                } else {
                    speed = SPEED.walk;
                }

                console.log(isOnGroundRef.current)


                // Gestion du mouvement en l'air vs. au sol
                if ((!isOnGroundRef.current || isJumpingRef.current) && !isCrouching) {
                    // Contrôle en l'air (sauf si accroupi)
                    console.log("vitesse air controle");
                    speed *= SPEED.airControl;
                
                    // Appliquer une force directe (plus simple mais efficace)
                    playerBody.velocity.x += moveDir.x * speed * deltaTime;
                    playerBody.velocity.z += moveDir.z * speed * deltaTime;
                } else if (isOnGroundRef.current || isCrouching) {  
                    // Au sol ou accroupi, contrôle direct de la vélocité
                    console.log("vitesse nrml");
                    playerBody.velocity.x = moveDir.x * speed;
                    playerBody.velocity.z = moveDir.z * speed;
                }
            } else if (isOnGroundRef.current) {
                // Arrêt progressif lorsqu'aucune touche n'est pressée et que le joueur est au sol
                playerBody.velocity.x *= 0.9;
                playerBody.velocity.z *= 0.9;
            }

            // Limiter la vitesse maximale horizontale
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
                  clearInterval(updatePlayerY);
        };
    }, [setHealth, setPlayerY]);

    return <div ref={mountRef} style={{ width: '100%', height: '100vh' }} />;
}

export default Camera;