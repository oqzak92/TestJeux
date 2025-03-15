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
// 🔹 Création des Formes en Three.js
// =======================




    // =======================
    // 🔹 Cube / Boîte (BoxGeometry)
    // =======================
// 📌 Un cube est un objet 3D avec 6 faces carrées
    
    // const boxMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 }); // Rouge
    // const box = new THREE.Mesh(new THREE.BoxGeometry(5, 5, 5), boxMaterial);
    // box.position.set(-15, 3, 0);
    // shapesGroup.add(box);

    // =======================
    // 🔹 Sphère (SphereGeometry)
    // =======================
// 📌 Une sphère est définie par son rayon et son niveau de détail
    
    // const sphereMaterial = new THREE.MeshStandardMaterial({ color: 0x00ff00 }); // Vert
    // const sphere = new THREE.Mesh(new THREE.SphereGeometry(3, 32, 32), sphereMaterial);
    // sphere.position.set(-10, 3, 10);
    // shapesGroup.add(sphere);

    // =======================
    // 🔹 Cylindre (CylinderGeometry)
    // =======================
// 📌 Un cylindre possède un rayon haut, un rayon bas, une hauteur et des segments
    
    // const cylinderMaterial = new THREE.MeshStandardMaterial({ color: 0x0000ff }); // Bleu
    // const cylinder = new THREE.Mesh(new THREE.CylinderGeometry(2, 2, 6, 32), cylinderMaterial);
    // cylinder.position.set(-5, 3, 0);
    // shapesGroup.add(cylinder);

    // =======================
    // 🔹 Cône (ConeGeometry)
    // =======================
// 📌 Un cône est un cylindre avec un rayon supérieur de 0
    
    // const coneMaterial = new THREE.MeshStandardMaterial({ color: 0xffff00 }); // Jaune
    // const cone = new THREE.Mesh(new THREE.ConeGeometry(2, 5, 32), coneMaterial);
    // cone.position.set(0, 3, -10);
    // shapesGroup.add(cone);

    // =======================
    // 🔹 Tore (TorusGeometry)
    // =======================
// 📌 Un tore est un anneau en 3D avec un rayon et une épaisseur
    
    // const torusMaterial = new THREE.MeshStandardMaterial({ color: 0xff00ff }); // Rose
    // const torus = new THREE.Mesh(new THREE.TorusGeometry(5, 1, 16, 100), torusMaterial);
    // torus.position.set(5, 3, 10);
    // shapesGroup.add(torus);

    // =======================
    // 🔹 Plan (PlaneGeometry)
    // =======================
// 📌 Un plan est une surface plate utilisée comme sol ou mur
    
    // const planeMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff, side: THREE.DoubleSide }); // Blanc
    // const plane = new THREE.Mesh(new THREE.PlaneGeometry(20, 10), planeMaterial);
    // plane.rotation.x = -Math.PI / 2;
    // plane.position.set(0, 0, 0);
    // shapesGroup.add(plane);

    // =======================
    // 🔹 Cercle (CircleGeometry)
    // =======================
// 📌 Un cercle est un disque plat en 3D
    
    // const circleMaterial = new THREE.MeshStandardMaterial({ color: 0x00ffff, side: THREE.DoubleSide }); // Cyan
    // const circle = new THREE.Mesh(new THREE.CircleGeometry(3, 32), circleMaterial);
    // circle.position.set(10, 1, -10);
    // circle.rotation.x = -Math.PI / 2;
    // shapesGroup.add(circle);

    // =======================
    // 🔹 Anneau (RingGeometry)
    // =======================
// 📌 Un anneau est un cercle évidé (avec un trou au centre)
    
    // const ringMaterial = new THREE.MeshStandardMaterial({ color: 0xff8800, side: THREE.DoubleSide }); // Orange
    // const ring = new THREE.Mesh(new THREE.RingGeometry(2, 4, 32), ringMaterial);
    // ring.position.set(-10, 1, 10);
    // ring.rotation.x = -Math.PI / 2;
    // shapesGroup.add(ring);

    // =======================
    // 🔹 Icosaèdre (IcosahedronGeometry)
    // =======================
// 📌 Un polyèdre avec 20 faces triangulaires
    
    // const icosahedronMaterial = new THREE.MeshStandardMaterial({ color: 0x6600cc }); // Violet
    // const icosahedron = new THREE.Mesh(new THREE.IcosahedronGeometry(4), icosahedronMaterial);
    // icosahedron.position.set(15, 3, 0);
    // shapesGroup.add(icosahedron);

    // =======================
    // 🔹 Torus Knot (TorusKnotGeometry)
    // =======================
// 📌 Une forme de nœud tordu basé sur un tore
    
    // const torusKnotMaterial = new THREE.MeshStandardMaterial({ color: 0xffcc00 }); // Or
    // const torusKnot = new THREE.Mesh(new THREE.TorusKnotGeometry(3, 1, 100, 16), torusKnotMaterial);
    // torusKnot.position.set(10, 3, 10);
    // shapesGroup.add(torusKnot);



// =======================
// 🔹 Rappel X, Y, Z :
// =======================

// Position -X : Gauche
// Position X  : Droite

// Position Y  : Haut / Bas

// Position -Z : Devant (Avancer)
// Position Z  : Arrière (Reculer)

// ============================================
// 🔹 Rappel Des Tailles des Formes :
// ============================================

// BoxGeometry (Cube)        : Largeur, Hauteur, Profondeur
// SphereGeometry (Sphère)    : Rayon, Segments Horizontaux, Segments Verticaux
// CylinderGeometry (Cylindre): Rayon Haut, Rayon Bas, Hauteur, Segments
// ConeGeometry (Cône)       : Rayon Base, Hauteur, Segments
// TorusGeometry (Tore)      : Rayon Principal, Épaisseur
// PlaneGeometry (Plan)      : Largeur, Hauteur
// CircleGeometry (Cercle)   : Rayon, Segments
// RingGeometry (Anneau)     : Rayon Interne, Rayon Externe
// IcosahedronGeometry       : Rayon
// TorusKnotGeometry         : Rayon, Épaisseur





