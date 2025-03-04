import * as THREE from 'three';
import gsap from 'gsap';

// Fonction pour obtenir une position aléatoire dans une plage donnée
const getRandomPosition = (min, max) => Math.random() * (max - min) + min;

// Déplacement aléatoire du gangster (plus fluide et naturel)
export const moveGangsterRandomly = (gangsterModelRef) => {
    if (!gangsterModelRef) return;

    const newX = gangsterModelRef.position.x + getRandomPosition(-3, 3); // Réduit l’amplitude des déplacements
    const newZ = gangsterModelRef.position.z + getRandomPosition(-3, 3);

    gsap.to(gangsterModelRef.position, {
        x: newX,
        z: newZ,
        duration: getRandomPosition(3, 5), // Mouvement plus lent et fluide
        ease: "power2.out", // Transition douce
        onComplete: () => moveGangsterRandomly(gangsterModelRef),
    });
};

// Déplacement du gangster vers le joueur (poursuite progressive et fluide)
export const moveGangsterTowardsPlayer = (gangsterModelRef, camera) => {
    if (!gangsterModelRef || !camera) return;

    const direction = new THREE.Vector3();
    direction.subVectors(camera.position, gangsterModelRef.position).normalize();

    // Réduction de la distance de déplacement pour éviter des déplacements trop brusques
    const stepSize = getRandomPosition(1.5, 3); // Moins agressif, plus réaliste
    const newX = gangsterModelRef.position.x + direction.x * stepSize;
    const newZ = gangsterModelRef.position.z + direction.z * stepSize;

    gsap.to(gangsterModelRef.position, {
        x: newX,
        z: newZ,
        duration: getRandomPosition(1.5, 2.5), // Plus fluide
        ease: "power2.out", // Accélération progressive et décélération douce
        onComplete: () => moveGangsterTowardsPlayer(gangsterModelRef, camera),
    });
};
