import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';
import { AnimationMixer, AnimationAction } from 'three';

interface IPlayerOptions {
  scene: THREE.Scene;
  camera: THREE.Camera;
  renderer: THREE.WebGLRenderer;
}

class Player {
  private scene: THREE.Scene;
  private camera: THREE.Camera;
  private renderer: THREE.WebGLRenderer;
  public model: THREE.Object3D | null;
  private animations: THREE.AnimationClip[];
  private mixer: AnimationMixer | null;
  public controls: PointerLockControls | null;
  private keysPressed: Set<string>;
  private state: string;
  public colider: THREE.Box3;

  constructor({ scene, camera, renderer }: IPlayerOptions) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.model = null;
    this.animations = [];
    this.mixer = null;
    this.controls = null;
    this.keysPressed = new Set();
    this.state = 'Idle';
    this.setupKeyListeners();
    this.colider = new THREE.Box3();
  }

  private setupKeyListeners(): void {
    window.addEventListener("keydown", this.onKeyDown.bind(this));
    window.addEventListener("keyup", this.onKeyUp.bind(this));
  }

  private onKeyDown(event: KeyboardEvent): void {
    this.keysPressed.add(event.key);
  }

  private onKeyUp(event: KeyboardEvent): void {
    this.keysPressed.delete(event.key);
  }

  async loadModel(url: string): Promise<void> {
    const loader = new GLTFLoader();
    const gltf = await loader.loadAsync(url);
    this.model = gltf.scene;
    this.scene.add(this.model);
    this.animations = gltf.animations;
    this.mixer = new AnimationMixer(this.model);
    this.scene.add(this.model);
    this.model.scale.set(0.005, 0.005, 0.005);
    console.log("Animation names:", this.animations.map(clip => clip.name));
    const skinnedMesh = findSkinnedMesh(this.model);
    if (skinnedMesh && skinnedMesh.skeleton) {
      // Access the skeleton object and bones
      const skeleton = skinnedMesh.skeleton;
      console.log(skeleton);
      //load the sword
      const sword = await loader.loadAsync('/assets/sword.glb');
      const handBone = skeleton.getBoneByName('thumb_01_r_035');
      if (handBone) {
        handBone.add(sword.scene);
        sword.scene.scale.set(3, 3, 3);
        sword.scene.position.set(-2,0.2, -1);
        sword.scene.rotation.set(0, -0.5, 0);
      }

      //add colider
      const colider = new THREE.Box3().setFromObject(this.model);
      this.colider = colider;

    }

    
  }

  setupControls(): void {
    this.controls = new PointerLockControls(this.camera, this.renderer.domElement);
    this.controls.getObject().position.set(0, 0, 10);
    this.scene.add(this.controls.getObject());

    // Set up the click event listener to lock the pointer
    this.renderer.domElement.addEventListener("click", () => {
      if (!document.pointerLockElement) {
        this.renderer.domElement.requestPointerLock();
      }
    });

     // Set up the mousedown event listener to trigger the attack function
    this.renderer.domElement.addEventListener("mousedown", (event) => {
      if (event.button === 0) { // Left mouse button
        this.attack();
        //log("Attacking!");
        console.log("Attacking!");
      }
    });
  }

  attack(): void {
    if (this.mixer && this.state !== 'Attacking') {
      const attackAnimation = this.animations.find(clip => clip.name === 'Attack');
      if (attackAnimation) {
        const action = this.mixer.clipAction(attackAnimation);
        action.reset();
        action.play();
        this.state = 'Attacking';
        action.clampWhenFinished = true;
        action.loop = THREE.LoopOnce;
  
        // Add an event listener for the 'finished' event on the mixer
        this.mixer.addEventListener('finished', (e: any) => {
          // Check if the finished action is the attack action
          if (e.action === action) {
            this.state = 'Idle';
          }
        });
      }
    }
  }
  
  
  

  update(deltaTime: number): void {
    if (this.model) {
      const moveSpeed = 0.5;
      const direction = new THREE.Vector3();

      direction.set(0, 0, 0);
      if (this.keysPressed.has("w") || this.keysPressed.has("W")) {
        direction.z += 1;
      }
      if (this.keysPressed.has("s") || this.keysPressed.has("S")) {
        direction.z -= 1;
      }
      if (this.keysPressed.has("a") || this.keysPressed.has("A")) {
        direction.x -= 1;
      }
      if (this.keysPressed.has("d") || this.keysPressed.has("D")) {
        direction.x += 1;
      }

      direction.normalize();
      direction.multiplyScalar(moveSpeed);
      if (this.controls) {
        this.controls.moveRight(direction.x);
        this.controls.moveForward(direction.z);
        // this.model.position.copy(this.controls.getObject().position);
        this.model.position.x = this.controls.getObject().position.x;
        this.model.position.y = this.controls.getObject().position.y;
        this.model.position.z = this.controls.getObject().position.z;

        // Calculate the direction the model should be looking at
        const lookAtDirection = new THREE.Vector3();
        this.camera.getWorldDirection(lookAtDirection);
        //if y value of lookAtDirection not equal to 1 or -1
        lookAtDirection.add(this.model.position);
        if (lookAtDirection.y !== 1 && lookAtDirection.y !== -1) {
          this.model.lookAt(lookAtDirection);
        }

        //update colider
        this.colider.setFromObject(this.model);
        
        
        

        // Update the model's rotation to point towards the pointer lock
        //lookAtDirection.add(defaultRotation);
        
        if (this.mixer) {
          this.mixer.update(deltaTime);
        }

        }

    }
  }
  
}

function findSkinnedMesh(object: THREE.Object3D): THREE.SkinnedMesh | null {
  if (object instanceof THREE.SkinnedMesh) {
    return object;
  }

  for (let i = 0; i < object.children.length; i++) {
    const result = findSkinnedMesh(object.children[i]);
    if (result) {
      return result;
    }
  }

  return null;
}




export default Player;