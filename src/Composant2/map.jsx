import * as THREE from 'three';

export function createGarage() {
    const garage = new THREE.Group();

    // Charger la texture du sol
    const floorTexture = new THREE.TextureLoader().load('/Texture/TextureSol.jpg');
    floorTexture.wrapS = THREE.RepeatWrapping;
    floorTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.repeat.set(40, 40);

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
    sideWallLeft.position.set(-10, 2.5, 0);
    sideWallLeft.rotation.y = Math.PI / 2;
    garage.add(sideWallLeft);

    const sideWallRight = new THREE.Mesh(new THREE.BoxGeometry(10, 5, 0.5), wallMaterial);
    sideWallRight.position.set(10, 2.5, 0);
    sideWallRight.rotation.y = -Math.PI / 2;
    garage.add(sideWallRight);

    return garage;
}
