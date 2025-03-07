import * as THREE from 'three';
import Phaser from 'phaser';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

// Configuration Phaser pour l'UI
const phaserConfig = {
  type: Phaser.AUTO,
  width: window.innerWidth,
  height: window.innerHeight,
  transparent: true,
  scene: {
    create: createUI
  }
};

const game = new Phaser.Game(phaserConfig);

// Configuration Three.js
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement); 

// Gestionnaire de modèles et animations
class CharacterManager {
  constructor() {
    this.loader = new GLTFLoader();
    this.mixer = null;
    this.animations = {
      'Idle': null,
      'Walk': null, 
      'Run': null,
      'Attack': null
    };
    this.currentAnimation = null;
    this.model = null;
  }

  async loadModel(url) {
    return new Promise((resolve, reject) => {
      this.loader.load(url, 
        (gltf) => {
          this.model = gltf.scene;
          this.model.scale.set(1, 1, 1);
          this.model.position.y = 1;
          
          this.mixer = new THREE.AnimationMixer(this.model);
          
          // Association directe des animations
          this.animations['Idle'] = this.mixer.clipAction(gltf.animations[2]);
          this.animations['Walk'] = this.mixer.clipAction(gltf.animations[6]); 
          this.animations['Run'] = this.mixer.clipAction(gltf.animations[5]);
          this.animations['Attack'] = this.mixer.clipAction(gltf.animations[4]);
          
          // Démarrage de l'animation Idle
          this.animations['Idle'].play();
          this.currentAnimation = this.animations['Idle'];
          
          resolve(this.model);
        },
        undefined,
        (error) => reject(error)
      );
    });
  }

  playAnimation(name, loop = true) {
    if (this.currentAnimation) {
      this.currentAnimation.fadeOut(0.3);
    }
    
    const anim = this.animations[name];
    if (anim) {
      anim.reset();
      anim.setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce);
      anim.fadeIn(0.3);
      anim.play();
      this.currentAnimation = anim;
    }
  }

  update(delta) {
    if (this.mixer) {
      this.mixer.update(delta);
    }
  }
}

const characterManager = new CharacterManager();

// Lumières
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(0, 20, 10);
scene.add(directionalLight);

// Création du sol
const groundGeometry = new THREE.PlaneGeometry(50, 50);
const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x3a8c3a });
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

// Variable pour stocker le joueur
let player;

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
  switch(event.key.toLowerCase()) {
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
  switch(event.key.toLowerCase()) {
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

function createUI() {
  this.add.text(10, 10, 'Santé:', { fontSize: '24px', fill: '#fff' });
  this.healthText = this.add.text(100, 10, health, { fontSize: '24px', fill: '#fff' });
  this.add.text(10, 40, 'Score:', { fontSize: '24px', fill: '#fff' });
  this.scoreText = this.add.text(100, 40, score, { fontSize: '24px', fill: '#fff' });
}

function updateUI() {
  if (game.scene.scenes[0].healthText) {
    game.scene.scenes[0].healthText.setText(health);
    game.scene.scenes[0].scoreText.setText(score);
  }
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
