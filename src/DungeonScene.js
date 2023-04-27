import * as THREE from 'three'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'




export default class DungeonScene extends THREE.Scene{


    keyDown = new Set<string>()

    objLoader = new OBJLoader()

    camera= new THREE.PerspectiveCamera()

    directionVector = new THREE.Vector3()

	atackState = false

	torchState = false

    frame = 0
	
    constructor(camera) {
        super()
        this.camera = camera
    }


    async initialize() {


    }

    update() {
        //print to console to see if the scene is updating
        if (!this.player)
		{
			return
		}

		if (!this.map)
		{
			return
		}

        //this.updateInput()
		//this.updatePlayer()
		
		
    }




 	
}