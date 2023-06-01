import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

class Torch {
  model: THREE.Object3D;
  light: THREE.PointLight;
  fireParticles: THREE.Group;

  constructor() {
    this.model = new THREE.Object3D();
    this.light = new THREE.PointLight(0xffa500, 1000, 1000);
    this.fireParticles = new THREE.Group();

    this.loadModel();
  }

  async loadModel() {
    const loader = new GLTFLoader();

    
    loader.load('public/assets/torch.glb', (gltf) => {
      gltf.scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      const torchMesh = gltf.scene.getObjectByName('Torch');
      if (torchMesh) {
        torchMesh.add(this.light);
        this.createFireParticles(torchMesh);
      }

      this.model.add(gltf.scene);
    });
  }

  createFireParticles(torchMesh: THREE.Object3D) {
    const geometry = new THREE.SphereGeometry(0.1, 8, 8);
    const material = new THREE.MeshBasicMaterial({ color: 0xffa500 });

    for (let i = 0; i < 20; i++) {
      const particle = new THREE.Mesh(geometry, material);
      particle.position.copy(torchMesh.position);
      particle.position.y += 0.5;
      this.fireParticles.add(particle);
    }

    this.model.add(this.fireParticles);
  }

  update(deltaTime: number) {
    this.fireParticles.children.forEach((particle, index) => {
      particle.position.y += 0.01 * deltaTime * (index % 5 + 1);
      particle.position.x += 0.005 * deltaTime * (Math.random() - 0.5);
      particle.position.z += 0.005 * deltaTime * (Math.random() - 0.5);

      if (particle.position.y > 1) {
        particle.position.y = 0.5;
      }
    });

    this.light.intensity = 1 + 0.2 * Math.sin(Date.now() * 0.005);
  }
}

export default Torch;

