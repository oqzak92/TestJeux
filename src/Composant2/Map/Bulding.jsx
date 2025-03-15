import * as THREE from 'three';
import * as CANNON from 'cannon-es';

export function createBuilding(physicsWorld) {
    const building = new THREE.Group();
    const wallMaterial = new THREE.MeshStandardMaterial({ color: 0xaaaaaa }); // Gris clair
    const glassMaterial = new THREE.MeshStandardMaterial({ color: 0x0000ff, opacity: 0.5, transparent: true }); // Bleu transparent
    const floorMaterial = new THREE.MeshStandardMaterial({ color: 0x555555 }); // Sol

    const floors = 4; // Nombre d'étages
    const heightPerFloor = 5;
    const width = 20;
    const depth = 15;

    // =======================
    // 🔹 Création des Étages & Murs
    // =======================
    for (let i = 0; i < floors; i++) {
        const floor = new THREE.Mesh(new THREE.BoxGeometry(width, 0.5, depth), floorMaterial);
        floor.position.set(30, i * heightPerFloor, 0);
        building.add(floor);

        const backWall = new THREE.Mesh(new THREE.BoxGeometry(width, heightPerFloor, 0.5), wallMaterial);
        backWall.position.set(30, i * heightPerFloor + heightPerFloor / 2, -depth / 2);
        building.add(backWall);

        const leftWall = new THREE.Mesh(new THREE.BoxGeometry(0.5, heightPerFloor, depth), wallMaterial);
        leftWall.position.set(30 - width / 2, i * heightPerFloor + heightPerFloor / 2, 0);
        building.add(leftWall);

        const rightWall = new THREE.Mesh(new THREE.BoxGeometry(0.5, heightPerFloor, depth), wallMaterial);
        rightWall.position.set(30 + width / 2, i * heightPerFloor + heightPerFloor / 2, 0);
        building.add(rightWall);
    }

    // =======================
    // 🔹 Création des Fenêtres
    // =======================
    for (let i = 0; i < floors; i++) {
        for (let j = -1; j <= 1; j += 2) {
            const windowMesh = new THREE.Mesh(new THREE.BoxGeometry(4, 2, 0.2), glassMaterial);
            windowMesh.position.set(30 + j * 6, i * heightPerFloor + 3, depth / 2);
            building.add(windowMesh);
        }
    }

    // =======================
    // 🔹 Création des Escaliers
    // =======================
    for (let i = 0; i < floors - 1; i++) {
        for (let step = 0; step < 10; step++) {
            const stair = new THREE.Mesh(new THREE.BoxGeometry(4, 0.5, 1), wallMaterial);
            stair.position.set(30 - width / 2 + 3, i * heightPerFloor + step * 0.5, -depth / 2 + step * 1.2);
            building.add(stair);
        }
    }

    // =======================
    // 🔹 Ajout de la Physique
    // =======================
    for (let i = 0; i < floors; i++) {
        const floorBody = new CANNON.Body({
            mass: 0,
            shape: new CANNON.Box(new CANNON.Vec3(width / 2, 0.25, depth / 2)),
            position: new CANNON.Vec3(30, i * heightPerFloor, 0)
        });
        physicsWorld.addBody(floorBody);
    }

    return building;
}
