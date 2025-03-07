import * as THREE from 'three';

export class MapManager {
    constructor(scene) {
        // Création du sol
        const groundGeometry = new THREE.PlaneGeometry(50, 50);
        const groundMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x808080,
            side: THREE.DoubleSide
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = Math.PI / 2;
        scene.add(ground);

        // Création des murs
        const wallGeometry = new THREE.BoxGeometry(50, 5, 1);
        const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });

        // Mur Nord
        const wallNorth = new THREE.Mesh(wallGeometry, wallMaterial);
        wallNorth.position.set(0, 2.5, -25);
        scene.add(wallNorth);

        // Mur Sud
        const wallSouth = new THREE.Mesh(wallGeometry, wallMaterial);
        wallSouth.position.set(0, 2.5, 25);
        scene.add(wallSouth);

        // Mur Est
        const wallEast = new THREE.Mesh(wallGeometry, wallMaterial);
        wallEast.rotation.y = Math.PI / 2;
        wallEast.position.set(25, 2.5, 0);
        scene.add(wallEast);

        // Mur Ouest
        const wallWest = new THREE.Mesh(wallGeometry, wallMaterial);
        wallWest.rotation.y = Math.PI / 2;
        wallWest.position.set(-25, 2.5, 0);
        scene.add(wallWest);

        // Ajout d'obstacles
        const obstacleGeometry = new THREE.BoxGeometry(2, 4, 2);
        const obstacleMaterial = new THREE.MeshStandardMaterial({ color: 0x4a4a4a });

        for (let i = 0; i < 10; i++) {
            const obstacle = new THREE.Mesh(obstacleGeometry, obstacleMaterial);
            obstacle.position.set(
                Math.random() * 40 - 20,
                2,
                Math.random() * 40 - 20
            );
            scene.add(obstacle);
        }
    }
}
