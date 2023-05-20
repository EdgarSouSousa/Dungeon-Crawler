import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls';

interface IPlayerOptions {
  scene: THREE.Scene;
  camera: THREE.Camera;
  renderer: THREE.WebGLRenderer;
}

class Player {
  private scene: THREE.Scene;
  private camera: THREE.Camera;
  private renderer: THREE.WebGLRenderer;
  private model: THREE.Object3D | null;
  private controls: PointerLockControls | null;
  private keysPressed: Set<string>;

  constructor({ scene, camera, renderer }: IPlayerOptions) {
    this.scene = scene;
    this.camera = camera;
    this.renderer = renderer;
    this.model = null;
    this.controls = null;
    this.keysPressed = new Set();
    this.setupKeyListeners();
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
    this.model.scale.set(0.008, 0.01, 0.01);
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
  }

  update(){
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
        lookAtDirection.add(this.model.position);
        //default rotation vector of moder
        const defaultRotation = new THREE.Vector3(0, 0.5, 0);

        // Update the model's rotation to point towards the pointer lock
        lookAtDirection.add(defaultRotation);
        this.model.lookAt(lookAtDirection);

        //log the model rotation
        console.log(this.model.rotation);
        }

    }
  }
}

export default Player;