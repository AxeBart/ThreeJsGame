import * as THREE from 'three';

import { CharacterManager } from './src/CharterManager';
import { MapManager } from './src/MapManager';

// Configuration Three.js
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const characterManager = new CharacterManager();
const mapManager = new MapManager(scene);

// Lumières
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(0, 20, 10);
scene.add(directionalLight);

// Variable pour stocker le joueur
let player;

// Création de l'UI
const healthDiv = document.createElement('div');
healthDiv.style.position = 'absolute';
healthDiv.style.top = '10px';
healthDiv.style.left = '10px';
healthDiv.style.color = 'white';
healthDiv.style.fontSize = '24px';
document.body.appendChild(healthDiv);

const scoreDiv = document.createElement('div');
scoreDiv.style.position = 'absolute';
scoreDiv.style.top = '40px';
scoreDiv.style.left = '10px';
scoreDiv.style.color = 'white';
scoreDiv.style.fontSize = '24px';
document.body.appendChild(scoreDiv);

// Chargement du modèle 3D
characterManager.loadModel('public/human.glb').then(model => {
    player = model;
    scene.add(player);
    characterManager.playAnimation('Idle');
});

// Création des ennemis
const enemies = [];
for (let i = 0; i < 5; i++) {
    const enemyGeometry = new THREE.BoxGeometry(1, 2, 1);
    const enemyMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
    const enemy = new THREE.Mesh(enemyGeometry, enemyMaterial);
    enemy.position.set(
        Math.random() * 40 - 20,
        1,
        Math.random() * 40 - 20
    );
    scene.add(enemy);
    enemies.push(enemy);
}

// Position initiale de la caméra
camera.position.set(0, 10, 20);
camera.lookAt(0, 1, 0);

// Variables de contrôle
let health = 100;
let score = 0;
const moveSpeed = 0.2;
let mouseX = 0;
const cameraHeight = 10;
const cameraDistance = 20;
let currentRotation = 0;
let clock = new THREE.Clock();
const keys = {
    q: false,
    z: false,
    s: false,
    d: false
};

// Gestionnaires d'événements
document.addEventListener('keydown', (event) => {
    switch (event.key.toLowerCase()) {
        case 'z':
            keys.z = true;
            if (!characterManager.animations['Walk'].isRunning()) {
                characterManager.playAnimation('Walk');
            }
            break;
        case 's':
            keys.s = true;
            if (!characterManager.animations['Walk'].isRunning()) {
                characterManager.playAnimation('Walk');
            }
            break;
        case 'q':
            keys.q = true;
            if (!characterManager.animations['Walk'].isRunning()) {
                characterManager.playAnimation('Walk');
            }
            break;
        case 'd':
            keys.d = true;
            if (!characterManager.animations['Walk'].isRunning()) {
                characterManager.playAnimation('Walk');
            }
            break;
        case ' ':
            attack();
            characterManager.playAnimation('Attack', false);
            break;
    }
});

document.addEventListener('keyup', (event) => {
    switch (event.key.toLowerCase()) {
        case 'z':
            keys.z = false;
            if (!keys.s && !keys.q && !keys.d) characterManager.playAnimation('Idle');
            break;
        case 's':
            keys.s = false;
            if (!keys.z && !keys.q && !keys.d) characterManager.playAnimation('Idle');
            break;
        case 'q':
            keys.q = false;
            if (!keys.z && !keys.s && !keys.d) characterManager.playAnimation('Idle');
            break;
        case 'd':
            keys.d = false;
            if (!keys.z && !keys.s && !keys.q) characterManager.playAnimation('Idle');
            break;
    }
});

document.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX / window.innerWidth) * 3 - 1;
});

function attack() {
    enemies.forEach((enemy, index) => {
        const distance = characterManager.model.position.distanceTo(enemy.position);
        if (distance < 3) {
            scene.remove(enemy);
            enemies.splice(index, 1);
            score += 10;
            updateUI();
        }
    });
}

function updateUI() {
    healthDiv.textContent = `Santé: ${health}`;
    scoreDiv.textContent = `Score: ${score}`;
}

// Boucle de jeu
function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();

    // Mise à jour des animations
    characterManager.update(delta);

    if (!characterManager.model) return;

    // Mise à jour de la rotation du joueur et de la caméra
    currentRotation = mouseX * Math.PI;

    // Rotation du joueur basée sur la direction du mouvement
    const moveVector = new THREE.Vector3();
    let targetRotation = currentRotation;

    if (keys.z) {
        moveVector.x -= Math.sin(currentRotation) * moveSpeed;
        moveVector.z -= Math.cos(currentRotation) * moveSpeed;
        targetRotation = currentRotation + Math.PI;
    }
    if (keys.s) {
        moveVector.x += Math.sin(currentRotation) * moveSpeed;
        moveVector.z += Math.cos(currentRotation) * moveSpeed;
        targetRotation = currentRotation;
    }
    if (keys.q) {
        moveVector.x -= Math.cos(currentRotation) * moveSpeed;
        moveVector.z += Math.sin(currentRotation) * moveSpeed;
        targetRotation = currentRotation - Math.PI / 2;
    }
    if (keys.d) {
        moveVector.x += Math.cos(currentRotation) * moveSpeed;
        moveVector.z -= Math.sin(currentRotation) * moveSpeed;
        targetRotation = currentRotation + Math.PI / 2;
    }

    // Rotation progressive du joueur vers la direction du mouvement
    if (moveVector.length() > 0) {
        // Calcul de la différence d'angle
        let angleDiff = targetRotation - characterManager.model.rotation.y;

        // Normalisation de la différence d'angle entre -PI et PI
        while (angleDiff > Math.PI) angleDiff -= 2 * Math.PI;
        while (angleDiff < -Math.PI) angleDiff += 2 * Math.PI;

        // Application d'une rotation progressive
        const rotationSpeed = 0.3;
        characterManager.model.rotation.y += angleDiff * rotationSpeed;
    }

    // Position de la caméra derrière le joueur
    camera.position.x = characterManager.model.position.x + cameraDistance * Math.sin(currentRotation);
    camera.position.y = characterManager.model.position.y + cameraHeight;
    camera.position.z = characterManager.model.position.z + cameraDistance * Math.cos(currentRotation);
    camera.lookAt(characterManager.model.position);

    characterManager.model.position.add(moveVector);

    // Collision avec les ennemis
    enemies.forEach((enemy) => {
        const distance = characterManager.model.position.distanceTo(enemy.position);
        if (distance < 1.5) {
            health -= 1;
            updateUI();
            if (health <= 0) {
                alert('Game Over!');
                location.reload();
            }
        }

        enemy.position.x += Math.sin(Date.now() * 0.001) * 0.02;
        enemy.position.z += Math.cos(Date.now() * 0.001) * 0.02;
    });

    renderer.render(scene, camera);
}

animate();
