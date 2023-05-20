import * as THREE from 'three'
import DungeonScene from './DungeonScene'
import Player from './player';


const width = window.innerWidth
const height = window.innerHeight


const renderer = new THREE.WebGLRenderer({
	canvas: document.getElementById('app') as HTMLCanvasElement
})
renderer.setSize(width, height)

const mainCamera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000)
//setupCameraControls();

//set background color as clear
renderer.setClearColor(0xffffff, 1)


const scene = new DungeonScene()
await scene.initialize()
const player = new Player({ scene , camera: mainCamera, renderer: renderer });
await player.loadModel('/assets/Player.glb');
player.setupControls();

//declare clock
const clock = new THREE.Clock()



function tick()
{
	scene.update()
	const deltaTime = clock.getDelta();
    player.update(deltaTime);
		
	renderer.render(scene, mainCamera)
	requestAnimationFrame(tick)
}

tick()

function setupCameraControls() {
	document.addEventListener('keydown', onDocumentKeyDown, false);
  
	function onDocumentKeyDown(event: { keyCode: any }) {
	  const delta = 2;
	  const keycode = event.keyCode;
  
	  switch (keycode) {
		case 37: // left arrow
		  mainCamera.position.x -= delta;
		  break;
		case 38: // up arrow
		mainCamera.position.z -= delta;
		  break;
		case 39: // right arrow
		mainCamera.rotation.y += delta/100;
		  break;
		case 40: // down arrow
		mainCamera.position.z += delta;
		  break;
	  }
	}
  }



