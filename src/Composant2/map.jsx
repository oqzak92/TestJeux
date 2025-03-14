import * as THREE from 'three';
import * as CANNON from 'cannon-es';



export let groundBody; // Déclare la variable à exporter


export function createGarage(physicsWorld) {
    const garage = new THREE.Group();

    // =======================
    // 🔹 Création du Sol
    // =======================
    const floorTexture = new THREE.TextureLoader().load('/Texture/TextureSol.jpg');
    floorTexture.wrapS = THREE.RepeatWrapping;
    floorTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.repeat.set(40, 40);

    const floorMaterial = new THREE.MeshBasicMaterial({ map: floorTexture, side: THREE.DoubleSide });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    garage.add(floor);

    // ✅ Ajout du sol dans la physique



    const groundBody = new CANNON.Body({
        mass: 0,
        shape: new CANNON.Plane(),
        position: new CANNON.Vec3(0, 2, 0)
    });
    groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
    physicsWorld.addBody(groundBody);

    // =======================
    // 🔹 Création des Murs
    // =======================
    const wallTexture = new THREE.TextureLoader().load('/Texture/MurTexture.jpg');
    const wallMaterial = new THREE.MeshBasicMaterial({ map: wallTexture });

    const walls = [
        { size: [20, 5, 0.5], position: [0, 2.5, -10], rotation: [0, 0, 0] },  // Mur arrière
        { size: [10, 5, 0.5], position: [-10, 2.5, 0], rotation: [0, Math.PI / 2, 0] }, // Mur gauche
        { size: [10, 5, 0.5], position: [10, 2.5, 0], rotation: [0, -Math.PI / 2, 0] }, // Mur droit
        { size: [10, 5, 0.5], position: [20, 5, -10], rotation: [0, Math.PI / 2, 0] }, // Mur squat
        { size: [10, 1, 1.5], position: [0, 1, 20], rotation: [0, 0, 0] }// mur aleatoire 
    ];

    walls.forEach(({ size, position, rotation }) => {
        // 🏗 Mur Three.js
        const wallMesh = new THREE.Mesh(new THREE.BoxGeometry(...size), wallMaterial);
        wallMesh.position.set(...position);
        wallMesh.rotation.set(...rotation);
        garage.add(wallMesh);

        // ✅ Mur physique avec correction de la position
        const wallBody = new CANNON.Body({
            mass: 0, // Statique
            shape: new CANNON.Box(new CANNON.Vec3(size[0] / 2, size[1] / 2, size[2] / 2)), // Taille divisée par 2 (Cannon utilise des demi-tailles)
        });

        // 📌 Correction : Ajuster la position
        wallBody.position.set(position[0], position[1], position[2]);

        // 📌 Correction : Appliquer la rotation si nécessaire
        if (rotation[1] !== 0) {
            wallBody.quaternion.setFromEuler(rotation[0], rotation[1], rotation[2]);
        }

        physicsWorld.addBody(wallBody);
    });




    //✅ Creation Du toit
    const roof = new THREE.Mesh(new THREE.BoxGeometry(20, 0.5, 20), wallMaterial);
    roof.position.set(0, 5.25, -5);
    garage.add(roof);



    //✅ Creation De la porte
    const roofBody = new CANNON.Body({
        mass: 0,
        shape: new CANNON.Box(new CANNON.Vec3(10, 0.25, 10)),
        position: new CANNON.Vec3(0, 5.25, -5)
    });
    physicsWorld.addBody(roofBody);




    const door = new THREE.Mesh(new THREE.BoxGeometry(3, 4, 0.5), wallMaterial);
    door.position.set(0, 2, -20);

    const DoorBody = new CANNON.Body({
        mass: 0,
        shape: new CANNON.Box(new CANNON.Vec3(3, 4, 0.5)),
        position: new CANNON.Vec3(0, 2, -20)
    })
    physicsWorld.addBody(DoorBody)

    garage.add(door);


    return garage;
}



// =======================
// 🔹 Rappel X, Y, Z :
// =======================


// Position -X : Gauche
// Position X : Droite

// Position Y : Haut/Bas

// Position -Z : Devant, Avancer
// Position Z : Arrière, Reculer



// ============================================
// 🔹 Rappel Des Tailles Creation Des Murs :
// ============================================

// Size X : Longueur Du Rectangle
// Size Y : Largeur Du Rectangle
// Size Z : Base, Volume Rectangle




