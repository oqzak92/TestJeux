import * as THREE from 'three';
import gsap from 'gsap';

// Fonction pour obtenir une position aléatoire dans une plage donnée
const getRandomPosition = (min, max) => Math.random() * (max - min) + min;

// Fonction pour ajouter une variation de vitesse
const getRandomSpeed = (min, max) => Math.random() * (max - min) + min;

// Déplacement aléatoire du gangster (plus fluide et naturel)
export const moveGangsterRandomly = (gangsterModelRef) => {
    if (!gangsterModelRef) return;

    // Créer une direction aléatoire (incluant X, Z et une légère variation en Y)
    const randomX = getRandomPosition(-3, 3);
    const randomZ = getRandomPosition(-3, 3);
    const randomY = getRandomPosition(-0.2, 0.2); // Mouvement vertical léger pour plus de réalisme

    const newX = gangsterModelRef.position.x + randomX;
    const newZ = gangsterModelRef.position.z + randomZ;
    const newY = gangsterModelRef.position.y + randomY;

    // Utilisation de gsap pour des mouvements fluides avec une vitesse et une courbe naturelles
    gsap.to(gangsterModelRef.position, {
        x: newX,
        y: newY,
        z: newZ,
        duration: getRandomSpeed(3, 5), // Durée plus longue pour un mouvement plus lent
        ease: "power2.out", // Transition douce et naturelle
        onComplete: () => moveGangsterRandomly(gangsterModelRef), // Répéter le mouvement aléatoire
    });
};

// Déplacement du gangster vers le joueur (poursuite progressive et fluide)
export const moveGangsterTowardsPlayer = (gangsterModelRef, camera) => {
    if (!gangsterModelRef || !camera) return;

    const direction = new THREE.Vector3();
    direction.subVectors(camera.position, gangsterModelRef.position).normalize();

    // Réduction de la distance de déplacement pour éviter des mouvements brusques
    const stepSize = getRandomPosition(1.5, 3); // Vitesse plus réaliste et fluide

    const newX = gangsterModelRef.position.x + direction.x * stepSize;
    const newZ = gangsterModelRef.position.z + direction.z * stepSize;

    // Légère variation aléatoire dans le mouvement pour éviter des déplacements trop linéaires
    const variationX = getRandomPosition(-0.5, 0.5);
    const variationZ = getRandomPosition(-0.5, 0.5);

    gsap.to(gangsterModelRef.position, {
        x: newX + variationX,
        z: newZ + variationZ,
        duration: getRandomSpeed(2, 3), // Déplacement plus fluide
        ease: "power2.out", // Mouvement progressif avec une accélération douce
        onComplete: () => moveGangsterTowardsPlayer(gangsterModelRef, camera), // Répéter la poursuite
    });
};
