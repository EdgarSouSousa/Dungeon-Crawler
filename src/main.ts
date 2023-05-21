import * as THREE from 'three'
import Level from './Level'
import Player from './player';
import { Enemy, EnemyState } from './Enemy';


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
const enemy = new Enemy('/public/assets/zombie.glb',10);
await enemy.load();
enemy.model.position.set(0, 0, 0);
scene.add(enemy.model);


//add light to player
const light = new THREE.PointLight(0xffffff, 1, 100)
light.position.set(0, 2, 0)
if (player.model)
player.model.add(light)



//declare clock
const clock = new THREE.Clock()



function tick()
{	
	const playerPosition = player.controls.getObject().position;
	const deltaTime = clock.getDelta();
    player.update(deltaTime);
		
	renderer.render(scene, mainCamera)
	requestAnimationFrame(tick)
	checkCollisions();
	enemy.update(deltaTime,playerPosition );
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



