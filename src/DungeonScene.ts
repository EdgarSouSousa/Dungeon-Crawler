import * as THREE from 'three'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'


export default class DungeonScene extends THREE.Scene{

    private readonly keyDown = new Set<string>()

    private readonly objLoader = new OBJLoader()

	private readonly gltfLoader = new GLTFLoader()

    public player = new THREE.Object3D()

	private map = new THREE.Object3D()

	public mapColider = new THREE.Box3()

    constructor() {
        super()
    }


    async initialize() {


		//add radial light to scene
		const light = new THREE.PointLight(0xffffff, 10, 100)
		light.position.set(0, 0, 0)
		this.add(light)

        this.map = await this.loadmap()

		//add bounding boxes map
		//add map
        this.add(this.map)
		this.mapColider = new THREE.Box3().setFromObject(this.map)
        this.map.scale.set(2,2,2)
        this.map.position.set(0, -8, 0)
        this.map.rotation.set(0, 0, 0)

    }

    private async loadmap() {
            
            const map= await this.objLoader.loadAsync('./assets/map.obj')
    
            return map
    }

	
    update() {

    }

}