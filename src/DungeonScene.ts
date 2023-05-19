import * as THREE from 'three'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
//import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'


export default class DungeonScene extends THREE.Scene{

    private readonly keyDown = new Set<string>()

    private readonly objLoader = new OBJLoader()

    private readonly camera: THREE.PerspectiveCamera

    public player?: THREE.Object3D

	private map = new THREE.Object3D()

    private directionVector = new THREE.Vector3()

	private atackState = false

	private torchState = false

	private defaultState = true

	private frame = 0

	public playerColider = new THREE.Box3()

	public mapColider = new THREE.Box3()

    constructor(camera: THREE.PerspectiveCamera) {
        super()
        this.camera = camera
    }


    async initialize() {


		//add dim ambient light
		const ambientLight = new THREE.AmbientLight(0xffffff, 0)
		this.add(ambientLight)

	        
        this.player = await this.loadPlayer()
        this.map = await this.loadmap()

		const rightHand = await this.loadRightHand()
		const leftHand = await this.loadLeftHand()
		const torch = await this.loadTorch()
        this.add(this.player)

		//add bounding boxes for player and map
		this.playerColider = new THREE.Box3().setFromObject(this.player)

		


		
		//add map
        this.add(this.map)
		this.mapColider = new THREE.Box3().setFromObject(this.map)

        this.map.scale.set(2,2,2)
        this.map.position.set(0, -8, 0)
        this.map.rotation.set(0, 0, 0)

		

		this.player.add(torch)

		torch.scale.set(0.07, 0.07, 0.07)
		torch.position.set(2, 0, -10)
		this.player.children[2].visible= false
		
		
        
        this.player.add(this.camera)
		this.player.rotation.set(0, 0, 0)
		this.player.position.set(0,0,0)

        this.camera.position.set(0, 3, -5)
        this.camera.rotation.set(0, 0, 0)

		rightHand.rotation.set(0, 0, 3.14)
		rightHand.scale.set(0.5, 0.5, 0.5)
		rightHand.position.set(2, 3, -10)

		leftHand.rotation.set(0, 3.14, 0)
		leftHand.scale.set(0.3, 0.3, 0.3)
		leftHand.position.set(-4, -4, -10)





		this.player.add(leftHand)
		this.player.add(rightHand)



       

        //add torchlight to player position
        const torchlight = new THREE.PointLight(0xffffff, 1, 200)
        torchlight.position.set(0, 0, 0)
        this.player.add(torchlight)

        document.addEventListener('keydown', this.handleKeyDown)
		document.addEventListener('keyup', this.handleKeyUp)

       
    }

    private handleKeyDown = (event: KeyboardEvent) => {
		this.keyDown.add(event.key.toLowerCase())
	}

	private handleKeyUp = (event: KeyboardEvent) => {
		this.keyDown.delete(event.key.toLowerCase())

		if (event.key === ' ')
		{
			//here we would add the attack animation
			this.atackState = true
		}

		//holding torch state on pressing Q
		if (event.key === 'q')
		{
			this.torchState = !this.torchState
		}
	}


    private async loadPlayer() {
		

		const modelroot= await this.objLoader.loadAsync('./assets/hands.obj')
        return modelroot
    }

    private async loadmap() {
            
            const map= await this.objLoader.loadAsync('./assets/map.obj')
    
            return map
    }

	private async loadRightHand() {
		const weapon = await this.objLoader.loadAsync('./assets/Mace.OBJ')


		return weapon

	}

	private async loadLeftHand() {
		const weapon = await this.objLoader.loadAsync('./assets/Shield.obj')

		return weapon

	}

	private async loadTorch() {
		const torch = await this.objLoader.loadAsync('./assets/Torch.obj')

		return torch

	}

	

	private async updatePlayer() {

		if (!this.player)
		{
			return
		}

		if (this.atackState)
		{	
			if (this.frame <= 7)
			{
				//rotate right hand
				this.player.children[5].rotation.set(3.14 - (this.frame * 0.2), 0, 0)

				//lower y position slighty
				this.player.children[5].position.set(2, 3 - (this.frame * 0.4), -10 - (this.frame * 0.2))


				

				this.frame++
			}
			else if (this.frame <= 28)
			{
				//smothly rotate back
				this.player.children[5].rotation.set(1.74 + ((this.frame * 0.1)/2), 0, 0)

				this.player.children[5].position.set(2, 0.2 + ((this.frame * 0.2)/2), -11.4 + ((this.frame * 0.1)/2))

				this.frame++
				
			}
			else
			{
				//reset
				this.player.children[5].position.set(2, 3, -10)

				this.frame = 0
				this.atackState = false
			}
		}

		if(this.torchState){
			this.player.children[5].visible = false
			this.player.children[2].visible = true
			
			
		}

		else{
			this.player.children[5].visible=true
			this.player.children[2].visible = false
			


		}

	}



    private updateInput()
	{

        if (!this.player)
		{
			return
		}
		

		const shiftKey = this.keyDown.has('shift')

		if (!shiftKey)
		{
			if (this.keyDown.has('a') || this.keyDown.has('arrowleft'))
			{
				this.player.rotateY(0.02)
			}
			else if (this.keyDown.has('d') || this.keyDown.has('arrowright'))
			{
				this.player.rotateY(-0.02)
			}
		}

		const dir = this.directionVector

		this.camera.getWorldDirection(dir)

		const speed = 0.5

		if (this.keyDown.has('w') || this.keyDown.has('arrowup'))
		{
			this.player.position.add(dir.clone().multiplyScalar(speed))
		}
		else if (this.keyDown.has('s') || this.keyDown.has('arrowdown'))
		{
			this.player.position.add(dir.clone().multiplyScalar(-speed))
		}

		if (shiftKey)
		{
			const strafeDir = dir.clone()
			const upVector = new THREE.Vector3(0, 1, 0)

			if (this.keyDown.has('a') || this.keyDown.has('arrowleft'))
			{
				this.player.position.add(
					strafeDir.applyAxisAngle(upVector, Math.PI * 0.5)
						.multiplyScalar(speed)
				)
			}
			else if (this.keyDown.has('d') || this.keyDown.has('arrowright'))
			{
				this.player.position.add(
					strafeDir.applyAxisAngle(upVector, Math.PI * -0.5)
						.multiplyScalar(speed)
				)
			}
		}
	}

	

	
    update() {
        //print to console to see if the scene is updating

		//check if bounding box is null	
		if (this.playerColider == null)
		{
			return
		}

		//check if player is defined
		if (this.player == null)
		{
			return
		}

        this.updateInput()
		this.updatePlayer()
		this.checkCollision();

		//update the bounding box position
		this.playerColider.setFromObject(this.player)
    }

	private checkCollision()
	{
		//check if bounding box is null
		if (this.playerColider == null)
		{
			return
		}

		//check if player is defined
		if (this.player == null)
		{
			return
		}


		//check if player is colliding with any of the objects
		if(this.playerColider.intersectsBox(this.mapColider))
		{
			//print to console that a collision has occured
			console.log("collision")

		}
		
		

	}


	
}