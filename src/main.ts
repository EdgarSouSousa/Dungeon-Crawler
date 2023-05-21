import * as THREE from 'three'
import Level from './Level'
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


const scene = new Level()
await scene.initialize()
const player = new Player({ scene , camera: mainCamera, renderer: renderer });
await player.loadModel('/assets/Player.glb');
player.setupControls();

//add light to player
const light = new THREE.PointLight(0xffffff, 1, 100)
light.position.set(0, 2, 0)
if (player.model)
player.model.add(light)



//declare clock
const clock = new THREE.Clock()



function tick()
{
	const deltaTime = clock.getDelta();
    player.update(deltaTime);
		
	renderer.render(scene, mainCamera)
	requestAnimationFrame(tick)
	checkCollisions();
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

  function checkCollisions() {
	//save position of player controls in the moment of collision


	if(!player){
		return;
	}
	else if (player.colider.intersectsBox(scene.colliders[0]) ){
			console.log("collision");
			const playerCosPos = player.controls.getObject().position;
			player.controls.getObject().position.set(playerCosPos.x, playerCosPos.y, -18);
		}
	
	else if (player.colider.intersectsBox(scene.colliders[1]) ){
			console.log("collision");
			const playerCosPos = player.controls.getObject().position;
			player.controls.getObject().position.set(playerCosPos.x, playerCosPos.y, 12);

	}

	else if (player.colider.intersectsBox(scene.colliders[2]) ){
			console.log("collision");
			const playerCosPos = player.controls.getObject().position;
			player.controls.getObject().position.set(-12, playerCosPos.y, playerCosPos.z);
	}

	else if (player.colider.intersectsBox(scene.colliders[3]) ){
			console.log("collision");
			const playerCosPos = player.controls.getObject().position;
			player.controls.getObject().position.set(12, playerCosPos.y, playerCosPos.z);
	}

	  }	



