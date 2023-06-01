import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

class Level extends THREE.Scene {
  colliders: THREE.Box3[];
  constructor() {
    super();
    //add coliders array
    this.colliders = [];
  }

  async initialize() {
    const loader = new GLTFLoader();

    try {
      const wall = await loader.loadAsync('/public/assets/wall.glb');
      wall.scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      //load floor and ceiling as clone of floor
      const floor = await loader.loadAsync('/public/assets/floor.glb');
      floor.scene.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.castShadow = true;
          child.receiveShadow = true;
        }
      });

      floor.scene.position.y = -5;
      floor.scene.scale.set(6, 6, 6);

      const ceiling = floor.scene.clone();
      ceiling.position.y = 8;
      ceiling.rotation.x = Math.PI;
      ceiling.position.z = -6;
      this.add(ceiling);

      //add floor
      this.add(floor.scene);





      //add 4 walls
      //double the size of the wall
      wall.scene.scale.set(6, 6, 1);
      const wall1 = wall.scene.clone();
      wall1.position.set(0, -5, -20);
      this.add(wall1);
      //add wall2
      const wall2 = wall.scene.clone();
      wall2.position.set(0, -5, 14);
      this.add(wall2);
      wall2.rotation.y = Math.PI;
      //add wall3
      const wall3 = wall.scene.clone();
      wall3.position.set(-14, -5, -3);
      wall3.rotation.y = Math.PI / 2;
      this.add(wall3);

      //add wall4
      const wall4 = wall.scene.clone();
      wall4.position.set(14, -5, -3);
      wall4.rotation.y = -Math.PI / 2;
      this.add(wall4);

      //add colliders for walls
      const wall1Box = new THREE.Box3().setFromObject(wall1);
      this.colliders.push(wall1Box);
      const wall2Box = new THREE.Box3().setFromObject(wall2);
      this.colliders.push(wall2Box);
      const wall3Box = new THREE.Box3().setFromObject(wall3);
      this.colliders.push(wall3Box);
      const wall4Box = new THREE.Box3().setFromObject(wall4);
      this.colliders.push(wall4Box);

     
    } catch (error) {
      console.error('Error loading map:', error);
    }
  }
}

export default Level;