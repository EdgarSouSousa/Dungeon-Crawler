import * as THREE from 'three'
import DungeonScene from './DungeonScene'
import * as CANNON from 'cannon';


  // Movement and jumping
  const velocity = new CANNON.Vec3();
  const speed = 5;
  const jumpHeight = 10;
  let canJump = false;

const width = window.innerWidth
const height = window.innerHeight

//declare player cannon object
var player = new CANNON.Body({mass: 1});

const world = new CANNON.World();
world.gravity.set(0, -9.82, 0);

const renderer = new THREE.WebGLRenderer({
	canvas: document.getElementById('app') as HTMLCanvasElement
})
renderer.setSize(width, height)

const mainCamera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000)

//set background color as clear
renderer.setClearColor(0xffffff, 1)


const scene = new DungeonScene(mainCamera)
scene.initialize()





//main game loop
function tick()
{
	//update scene
	scene.update()
	renderer.render(scene, mainCamera)
	updatePlayer();
	updatePhysics()
	requestAnimationFrame(tick)
}

tick()

function threeToCannon(object: THREE.Object3D, options: { mass: number }): CANNON.Body {
	const box = new THREE.Box3().setFromObject(object);
	const size = box.getSize(new THREE.Vector3());
	const shape = new CANNON.Box(new CANNON.Vec3(size.x / 2, size.y / 2, size.z / 2));
	const body = new CANNON.Body({ mass: options.mass, shape: shape });
  
	body.position.set(object.position.x, object.position.y, object.position.z);
    body.quaternion.set(object.quaternion.x, object.quaternion.y, object.quaternion.z, object.quaternion.w);

	//add coliders to player and map
	if(object.name == "player"){
		body.addEventListener('collide', (event: CANNON.ICollisionEvent) => {
			console.log('Body1 collided with:', event.body);
		  });
	}

	if(object.name == "map"){
		body.addEventListener('collide', (event: CANNON.ICollisionEvent) => {
			console.log('Body2 collided with:', event.body);
		});
	}
  
	return body;
  }


  function updatePhysics() {
	// Step the Cannon.js world
	world.step(1 / 60);
  
	// Update the Three.js objects' transforms
	scene.traverse((object) => {
	  if (object instanceof THREE.Mesh) {
		const body = world.bodies.find((b) => b.shapes[0].boundingSphereRadius === object.geometry.boundingSphere.radius);
		if (body) {
		  object.position.copy(body.position as any);
		  object.quaternion.copy(body.quaternion as any);
		}
	  }
	});
  }




document.addEventListener('keydown', (event) => {
  switch (event.key) {
    case 'w':
      velocity.z = -speed;
      break;
    case 's':
      velocity.z = speed;
      break;
    case 'a':
      velocity.x = -speed;
      break;
    case 'd':
      velocity.x = speed;
      break;
    case ' ':
      if (canJump) {
        player.velocity.y = jumpHeight;
        canJump = false;
      }
      break;
  }
});

document.addEventListener('keyup', (event) => {
  switch (event.key) {
    case 'w':
    case 's':
      velocity.z = 0;
      break;
    case 'a':
    case 'd':
      velocity.x = 0;
      break;
  }
});


// Update the player's velocity based on input
function updatePlayer() {
  player.velocity.x = velocity.x;
  player.velocity.z = velocity.z;
}



  

  

  