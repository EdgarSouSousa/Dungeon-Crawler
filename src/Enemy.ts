import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';


export enum EnemyState {
  Idle,
  Chasing,
  Attacking,
  Dead
}

export class Enemy {
  public model!: THREE.Object3D;
  private mixer!: THREE.AnimationMixer;
  private animations: { [key: string]: THREE.AnimationAction };
  public boundingBox!: THREE.Box3;
  public hp: number;
  public state: EnemyState; // Add the 'state' property
  private removed: boolean = false;

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
          this.model.scale.set(3, 3, 3);
          this.model.position.set(0, 0, 0);
          this.mixer = new THREE.AnimationMixer(this.model);
          this.animations = {};

          gltf.animations.forEach((animation) => {
            this.animations[animation.name] = this.mixer.clipAction(animation);
          });

          //log animations
            console.log(this.animations);

          //add bounding box
          this.boundingBox = new THREE.Box3().setFromObject(this.model);



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

    if(this.removed){
      //delete this.model;
      this.model.position.set(0, -100, 0);
    }
    
    console.log(this.removed);

    //update colider position
    this.boundingBox.setFromObject(this.model);
  
    this.updateAI(playerPosition);
  
    if (this.state === EnemyState.Chasing) {
      const lookAtVector = new THREE.Vector3(playerPosition.x, this.model.position.y, playerPosition.z);
      this.model.lookAt(lookAtVector);
    
      const moveSpeed = 0.05;
      const direction = new THREE.Vector3().subVectors(playerPosition, this.model.position).normalize();
      this.model.position.add(direction.multiplyScalar(moveSpeed));
      this.model.position.y = -4;
    }
  }

  
  setState(state: EnemyState): void {
    switch (state) {
      case EnemyState.Idle:
        this.playAnimation('Idle'); 
        break;
      case EnemyState.Chasing:
        this.playAnimation('Walk_InPlace'); 
        break;
      case EnemyState.Attacking:
        this.playAnimation('Attack'); 
        break;
      case EnemyState.Dead:
        this.playAnimation('FallingBack');
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
    const chaseThreshold = 30;
    const attackThreshold = 5;

    if (this.hp <= 0) {
        this.transitionToState(EnemyState.Dead);
    }
    else if ((distanceToPlayer < chaseThreshold) && (distanceToPlayer > attackThreshold)) {
      this.transitionToState(EnemyState.Chasing);
    } 
    else if (distanceToPlayer < attackThreshold) {
      // Attack the player
      this.transitionToState(EnemyState.Attacking);
    }
    else {
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
        // Play the desired animation in the Idle state
        this.playAnimation('idle');
        break;
  
      case EnemyState.Chasing:
        // Resume the desired animation in the Chasing state
        this.playAnimation('Walk_InPlace');
        //pause the attack animation
        this.animations['Attack'].stop();
        break;

      case EnemyState.Attacking:
        // Resume the desired animation in the Chasing state
        this.playAnimation('Attack');
        break;
      case EnemyState.Dead:
        // Play the desired animation in the Dead state
        //pause all animations
        this.animations['Walk_InPlace'].stop();
        this.animations['Attack'].stop();
        this.animations['Idle'].stop();
        this.playAnimation('FallingBack');
        //wait for animation to finish
        setTimeout(() => {

        this.removed = true;
        }, 1350);
        break;

    }
  }
}

