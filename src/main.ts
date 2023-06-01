import * as THREE from 'three'
import Level from './Level'
import Player from './player';
import { Enemy} from './Enemy';
import Torch from './Torch';


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
const enemy = new Enemy('/public/assets/zombie.glb',100);
await enemy.load();
enemy.model.position.set(0, 0, 0);
scene.add(enemy.model);
//add torch
const torch1 = new Torch();
torch1.model.position.set(0, 0, -19);
torch1.model.scale.set(0.02, 0.02, 0.02);
scene.add(torch1.model);
scene.add(torch1.light);
torch1.light.position.set(0, 0, -19);
scene.add(torch1.fireParticles);
torch1.fireParticles.position.set(0, 0, -19);





//declare clock
const clock = new THREE.Clock()
let Playerlight = new THREE.PointLight(0xffffff, 1, 100)
scene.add(Playerlight);
Playerlight.position.set(0, 0, 0);


			
function tick()
{	
	if (!player.controls){
		return;
	}
	const playerPosition = player.controls.getObject().position;
	const deltaTime = clock.getDelta();
    player.update(deltaTime);
		
	renderer.render(scene, mainCamera)
	requestAnimationFrame(tick)
	checkCollisions();
	checkAttack();
	enemy.update(deltaTime,playerPosition );
	torch1.update(deltaTime);
	playrTorchUpdate();
	console.log(player.state);

}

tick()

  function checkCollisions() {
	//save position of player controls in the moment of collision


	if(!player){
		return;
	}
	else if (!player.controls){
		return;
	}
	else if (player.colider.intersectsBox(scene.colliders[0]) ){
			const playerCosPos = player.controls.getObject().position;
			player.controls.getObject().position.set(playerCosPos.x, playerCosPos.y, -18);
		}
	
	else if (player.colider.intersectsBox(scene.colliders[1]) ){
			const playerCosPos = player.controls.getObject().position;
			player.controls.getObject().position.set(playerCosPos.x, playerCosPos.y, 12);

	}

	else if (player.colider.intersectsBox(scene.colliders[2]) ){
			const playerCosPos = player.controls.getObject().position;
			player.controls.getObject().position.set(-12, playerCosPos.y, playerCosPos.z);
	}

	else if (player.colider.intersectsBox(scene.colliders[3]) ){
			const playerCosPos = player.controls.getObject().position;
			player.controls.getObject().position.set(12, playerCosPos.y, playerCosPos.z);
	}

	}

	function checkAttack(){

		if(!player){
			return
		}
		else if (!player.controls){
			return;
		}

		//if player colider is currently intersecting with enemy colider
		else if ((player.colider.intersectsBox(enemy.boundingBox)) && (player.state === 'Attacking')){
			console.log("enemy hit");
			enemy.hp -= 1;
			console.log(enemy.hp);
		}
	}

	function playrTorchUpdate() {
		//if player.controls is not defined, return
		if (!player.controls) {
			return;
		}
		


		if (player.state != 'Torch') {
		  // Set the light intensity to 0 when the player is not holding the torch
		  Playerlight.intensity = 0;
		} else if (player.state === 'Torch') {
		  // Set the light intensity to a desired value when the player is holding the torch
		  Playerlight.intensity = 1;
	  
		  // Update the light position to match the player's position
		  const playerPosition = player.controls.getObject().position;
		  Playerlight.position.set(playerPosition.x, playerPosition.y, playerPosition.z);
		}
	  }