import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
export class CharacterManager {
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
        this.collisionObjects = [];
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

    addCollisionObject(object) {
        this.collisionObjects.push(object);
    }

    checkCollision(position, radius = 1) {
        for (const collider of this.collisionObjects) {
            const distance = position.distanceTo(collider.position);
            const minDistance = radius + 1; // 1 est la taille approximative des obstacles
            if (distance < minDistance) {
                return true;
            }
        }
        return false;
    }

    moveWithCollision(moveVector) {
        const nextPosition = this.model.position.clone().add(moveVector);
        if (!this.checkCollision(nextPosition)) {
            this.model.position.copy(nextPosition);
            return true;
        }
        return false;
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