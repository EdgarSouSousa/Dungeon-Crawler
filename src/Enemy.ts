import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

export enum EnemyState {
  Idle,
  Chasing,
}

export class Enemy {
  public model!: THREE.Object3D;
  private mixer!: THREE.AnimationMixer;
  private animations: { [key: string]: THREE.AnimationAction };
  private boundingBox!: THREE.Box3;
  private hp: number;
  private state: EnemyState; // Add the 'state' property

  constructor(private url: string, initialHp: number) {
    this.hp = initialHp;
    this.animations = {};
    this.state = EnemyState.Idle; // Initialize with a default value
  }


  async load(): Promise<THREE.Object3D> {
    const loader = new GLTFLoader(); // Instantiate GLTFLoader

    return new Promise((resolve, reject) => {
      loader.load(
        this.url,
        (gltf) => {
          this.model = gltf.scene;
          this.model.scale.set(2, 2, 2);
          this.mixer = new THREE.AnimationMixer(this.model);
          this.animations = {};

          gltf.animations.forEach((animation) => {
            this.animations[animation.name] = this.mixer.clipAction(animation);
          });

          //log animations
            console.log(this.animations);


          resolve(this.model);
        },
        undefined,
        (error) => {
          reject(error);
        }
      );
    });
  }

  update(deltaTime: number, playerPosition: THREE.Vector3): void {
    if (this.mixer) {
      this.mixer.update(deltaTime);
    }
  
    this.updateAI(playerPosition);
  
    if (this.state === EnemyState.Chasing) {
      const lookAtVector = new THREE.Vector3().copy(playerPosition);
      this.model.lookAt(lookAtVector);
  
      // Adjust the rotation of the enemy model to face the player
      this.model.rotation.y += Math.PI; // If the model is facing the wrong direction, you can adjust this value
  
      const moveSpeed = 0.05;
      const direction = new THREE.Vector3().subVectors(playerPosition, this.model.position).normalize();
      this.model.position.add(direction.multiplyScalar(moveSpeed));
    }
  }

  
  setState(state: EnemyState): void {
    switch (state) {
      case EnemyState.Idle:
        this.playAnimation('idle'); // Replace with the actual idle animation name
        break;
      case EnemyState.Chasing:
        this.playAnimation('run'); // Replace with the actual chasing animation name
        break;
    }
  }

  private playAnimation(name: string): void {
    const currentAnimation = this.animations[name];
    if (currentAnimation && !currentAnimation.isRunning()) {
      currentAnimation.reset().play();
    }
  }

  private updateAI(playerPosition: THREE.Vector3): void {
    const distanceToPlayer = this.model.position.distanceTo(playerPosition);
  
    // The distance at which the enemy starts chasing the player
    const chaseThreshold = 10;
  
    if (distanceToPlayer < chaseThreshold) {
      this.transitionToState(EnemyState.Chasing);
    } else {
      this.transitionToState(EnemyState.Idle);
    }
  }
  
  private transitionToState(targetState: EnemyState): void {
    // If the target state is the same as the current state, do nothing
    if (this.state === targetState) return;
  
    // Change the state
    this.state = targetState;
  
    switch (this.state) {
      case EnemyState.Idle:
        // Pause all animations in the Idle state
        for (const animationName in this.animations) {
          this.animations[animationName].paused = true;
        }
        break;
  
      case EnemyState.Chasing:
        // Resume the desired animation in the Chasing state
        this.playAnimation('ANIMATION ZOMBIE');
        break;
    }
  }
}

