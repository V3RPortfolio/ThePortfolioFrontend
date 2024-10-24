import * as THREE from 'three';
import { OrbitControls } from "three-stdlib";
import { getFresnelMat } from './fresnel.material';


// Constants related to asteroid
export const asteroidModelPath = "/images/animation/wordpress/asteroid.glb";

// Constants related to planet
export const planetSurfaceMaterialPath = "/images/animation/wordpress/mars.jpg";
export const planetBumpMapPath = "/images/animation/wordpress/bump.jpg";
export const planetLogoPath = "/images/animation/wordpress/wordpress.png";
export const cloudPath = "/images/animation/wordpress/cloud.jpg";
export const cloudMapPath = "/images/animation/wordpress/cloudmap.jpg";


export class Planet {
    private _model: THREE.Object3D;
    private _surface: THREE.Mesh;
    private _logo: THREE.Mesh;
    private _clouds: THREE.Mesh;

    private _density = 0.5;
    private _widthSegments = 100;
    private _heightSegments = 100;
    private _debugEnabled = false;
    private _sunlightColor:number;
    private _massScaleFactor;

    constructor(
        private _radius: number,
        private _center: THREE.Vector3,
        private _tiltDegrees: number,
        private _rotationSpeed: number,
        {
            debugEnabled=false,
            massScaleFactor=1000,
            sunlightColor=0xffffff
        }:{
            debugEnabled?:boolean,
            massScaleFactor?:number,
            sunlightColor?:number
        }={}
    ){
        this._debugEnabled = debugEnabled;
        this._massScaleFactor = massScaleFactor;
        this._sunlightColor = sunlightColor;

        this._model = !this._debugEnabled ? this.create() : this.createForDebugMode();
        this._model.position.set(this._center.x, this._center.y, this._center.z);
        this._model.rotateX(-this.tiltToRadians());
    }

    get mass() {
        const mass = 4/3 * Math.PI * Math.pow(this._radius * this._massScaleFactor, 3) * this._density;
        return mass;
    }

    get radius() {
        return this._radius;
    }

    get position() {
        return this._center;
    }

    get x() {
        return this._center.x;
    }

    get y() {
        return this._center.y;
    }

    get z() {
        return this._center.z;
    }

    set debug(value:boolean) {
        this._debugEnabled = value;
    }

    get matrixWorld() {
        return this._model.matrixWorld;
    }

    get boundingBox():THREE.Box3 {
        const box = new THREE.Box3().setFromObject(this._model);
        return box;
    }

    private tiltToRadians() {
        return this._tiltDegrees * Math.PI / 180;
    }

    private createForDebugMode():THREE.Object3D {
        const geometry = new THREE.SphereGeometry(this._radius, this._widthSegments, this._heightSegments);
        const material = new THREE.PointsMaterial({color: 0xff0000, size: 0.01}); 
        const points = new THREE.Points(geometry, material);
        return points;
    }

    private create():THREE.Object3D {
        const planet = new THREE.Group();
        const geometry = new THREE.SphereGeometry(this._radius, this._widthSegments, this._heightSegments);

        const surfaceMaterial = new THREE.MeshPhongMaterial({
            map: new THREE.TextureLoader().load(planetSurfaceMaterialPath),
            bumpMap: new THREE.TextureLoader().load(planetBumpMapPath),
            bumpScale: 0.05,
        });
        this._surface = new THREE.Mesh(geometry, surfaceMaterial);
        planet.add(this._surface);

        const logoMaterial = new THREE.MeshPhongMaterial({
            map: new THREE.TextureLoader().load(planetLogoPath),
            transparent: true,
            opacity: 1,
            specular: 0x3f1f12,
            reflectivity: 0.5,
            blending: THREE.AdditiveBlending
            
        });
        this._logo = new THREE.Mesh(geometry, logoMaterial);
        planet.add(this._logo);

        // Add clouds
        const cloudMaterial = new THREE.MeshStandardMaterial({
            map: new THREE.TextureLoader().load(cloudPath),
            transparent: true,
            opacity: 0.1,
            blending: THREE.AdditiveBlending,
            alphaMap: new THREE.TextureLoader().load(cloudMapPath),

        });
        this._clouds = new THREE.Mesh(geometry, cloudMaterial);
        this._clouds.scale.setScalar(1.01);
        this._clouds.castShadow = true;
        planet.add(this._clouds);



        planet.rotateZ(-this.tiltToRadians());
        return planet;
    }

    rotate() {
        if(!this._debugEnabled) {
            this._surface.rotation.y += this._rotationSpeed;
            this._logo.rotation.y += this._rotationSpeed;
            this._clouds.rotation.y += this._rotationSpeed * 0.4;
        } else {
            this._model.rotation.y += this._rotationSpeed;
        }
    }
    addToScene(scene:THREE.Scene) {
        scene.add(this._model);
    }



}

export class Asteroid {
    private _model: THREE.Object3D;
    private _density = 1;
    private _initialPosition: THREE.Vector3;

    constructor(
        private _radius: number,
        private _spread: THREE.Vector3,
        private _referenceModel: THREE.Object3D,
        private _hostPlanet: Planet,
        private _rotationSpeed: number,
        private _revolutionSpeed: number,
        private _gravitationalConstant: number,
        private _maximumDistanceFromPlanet:number|null=null,
        private _massScaleFactor = 1000
    ) {
        this.loadModel();
        if(!this._maximumDistanceFromPlanet) this._maximumDistanceFromPlanet = this._hostPlanet.radius;
    }

    get mass() {        
        const mass = 4/3 * Math.PI * Math.pow(this._radius * this._massScaleFactor, 3) * this._density;
        return mass;
    }

    get radius() {
        return this._radius;
    }

    get position() {
        return this._model.position;
    }

    get x() {
        return this._model.position.x;
    }

    get y() {
        return this._model.position.y;
    }

    get z() {
        return this._model.position.z;
    }

    private getInitialPosition(): THREE.Vector3 {
        const position = new THREE.Vector3(
            Math.random() * this._spread.x  - 1,
            Math.random() * this._spread.y - 1,
            Math.random() * this._spread.z - 1            
        );
        if(Math.random() > 0.5) position.x *= -1;
        if(Math.random() > 0.5) position.y *= -1;
        if(Math.random() > 0.5) position.z *= -1;
        return position;
    }

    private createAsteroidMesh():THREE.Object3D {
        const asteroid = new THREE.Group();
        const geometry = new THREE.SphereGeometry(this._radius, 32, 32);
        const material = new THREE.MeshPhongMaterial({
            color: 0x888888,
            emissive: 0x444444,
            specular: 0x222222,
            shininess: 50
        });
        const mesh = new THREE.Mesh(geometry, material);
        asteroid.add(mesh);
        return asteroid;
    }

    private loadModel() {
        this._initialPosition = this.getInitialPosition();
        if(!this._referenceModel) {
            this._referenceModel = this.createAsteroidMesh();
        }
        this._model = this._referenceModel.clone();
        this._model.castShadow = true;
        this._model.position.set(this._initialPosition.x, this._initialPosition.y, this._initialPosition.z);
        this._model.scale.setScalar(this._radius);
    }

    private getDistanceFromPlanet(): number {
        return this._model.position.distanceTo(this._hostPlanet.position);
    }

    private getGravitationalForce(): THREE.Vector3 {
        const distance = this.getDistanceFromPlanet();
        // F = G * m1 * m2 / r^2
        const force = this._gravitationalConstant * this.mass * this._hostPlanet.mass / Math.pow(distance, 2) * this._density;
        // dx  = (center_planet - center_asteroid) * force
        const delta = this._hostPlanet.position.clone().sub(
            this._model.position
        ).multiplyScalar(force);
        return delta;
    }

    updateMatrix() {
        this._model.updateMatrix();
    }

    attract(isPlayingBackwards:boolean) {
        let force = this.getGravitationalForce();
        if(isPlayingBackwards) force = force.negate();
        // x_prime = x + force * speed
        let newPosition = new THREE.Vector3(this._model.position.x, this._model.position.y, this._model.position.z);
        newPosition.add(force);

        const newDistance = Math.abs(newPosition.distanceTo(this._hostPlanet.position));
        if(newDistance < this._maximumDistanceFromPlanet) {
            this._model.position.set(this._initialPosition.x, this._initialPosition.y, this._initialPosition.z);
        } else {
            this._model.position.set(newPosition.x, newPosition.y, newPosition.z);
        }
    }

    rotate() {
        const randomRotationDeltaX = Math.random() * this._rotationSpeed;
        const randomRotationDeltaY = Math.random() * this._rotationSpeed;
        const randomRotationDeltaZ = Math.random() * this._rotationSpeed;
        this._model.rotateX(randomRotationDeltaX);
        this._model.rotateY(randomRotationDeltaY);
        this._model.rotateZ(randomRotationDeltaZ);
    }

    revolve() {
        const newX = this._model.position.x * Math.cos(this._revolutionSpeed) - this._model.position.z * Math.sin(-this._revolutionSpeed);
        const newY = this._model.position.y;
        const newZ = this._model.position.x * Math.sin(-this._revolutionSpeed) + this._model.position.z * Math.cos(this._revolutionSpeed);
        this._model.position.set(newX, newY, newZ);
    }

    addToScene(scene:THREE.Scene) {
        scene.add(this._model);
    }
}

export interface ExternalModels {
    asteroid?:THREE.Object3D;
}

export class WordpressBannerAnimationService {
    /**
     * This class is used to handle the animation of the WordPress banner.
     * Animation Scene:
     * 1. The scene is of space with a planet and asteroids around it.
     * 2. The planet is rotating.
     * 3. The asteroids are moving in a circular path around the planet.
     * 4. The asteroids are being attracted towards the planet based on the gravity.
     * 
     * Camera Movement:
     * 1. The camera starts from a distance and as the user scrolls down it keeps zooming in.
     * 2. When the canvas reaches the center of the screen the camera movement stops and it reaches the closest point to the planet.
     * 3. When the user scrolls up, the camera keeps zooming out.
     * 4. When the canvas leaves the bottom of the screen, the camera returns to its original position.
     */

    // Variables
    private _debugEnabled:boolean = false;
    private _isConfigured:boolean = false;
    private _scene:THREE.Scene;
    private _renderer:THREE.WebGLRenderer;

    private _axisHelper:THREE.AxesHelper; // For debugging
    private _gridHelper:THREE.GridHelper; // For debugging
    private _orbitControls:OrbitControls; // For debugging

    public _camera:THREE.PerspectiveCamera;

    private _ambientLight:THREE.AmbientLight;
    private _sunLight:THREE.DirectionalLight;

    private _planet:Planet;
    private _asteroids:Asteroid[] = [];

    private _lastScrollPosition:number = 0;
    

    // Constants

    // animation
    private _animationSpeed = 5;
    private _animationScrollTopOffset = 200;
    private _massScaleFactor = 2;
    private _isPlayingBackwards = false;
    private _sceneBackgroundColor:number;

    // Camera
    private _initialCameraPosition: THREE.Vector3 = new THREE.Vector3(2, 2, 20.74);
    private _finalCameraPosition: THREE.Vector3 = new THREE.Vector3(0.4, -0.1, 0.7);
    private _hasCameraMovementEnded = false;

    // Planet
    private _planetRotationSpeed = 0.01;
    private _gravitationalConstant = 100 * this._animationSpeed;
    private _planetRadius = 0.2;
    private _planetPosition = new THREE.Vector3(0, 0, 0);
    private _planetTiltDegrees = 0;

    // asteroids
    private _totalAsteroids = 500;
    private _asteroidMinRadius = 0.005;
    private _asteroidMaxRadius = 0.01;
    private _asteroidSpread = new THREE.Vector3(5, 5, 5);
    private _asteroidRotationSpeed = 0.1 * this._planetRotationSpeed;
    private _asteroidRevolutionSpeed = 0.2 * this._planetRotationSpeed;
    private _asteroidMaxDistanceFromPlanet = this._planetRadius * 1.2;

    // Sunlight
    private _sunLightPosition = new THREE.Vector3(-2, 0.5, 1.5);
    private _sunLightIntensity = 2;
    private _sunLightColor = 0xc99c08;

    // Ambient light
    private _ambientLightIntensity = 1;



    constructor(
        private _canvasContainer: HTMLElement,
        private _externalModels: ExternalModels,
        {
            debugEnabled=false,
            sceneBackgroundColor=0xffffff
        }: {
            debugEnabled?:boolean,
            sceneBackgroundColor?:number
            
        }={}
    ) {
        this._debugEnabled = debugEnabled;
        this._sceneBackgroundColor = sceneBackgroundColor;
    }

    private print(message:any, type:'log'|'warn'|'error'="log") {
        if(this._debugEnabled) console[type](message);
    }

    private getNextCameraPosition(
        initialCameraPosition:number,
        finalCameraPosition:number,
        currentCameraPosition:number,
        initialCanvasPosition:number,
        finalCanvasPosition:number,
        currentCanvasPosition:number
    ):number {
        /**
         * For a single axis, get next position of the camera based on the current canvas position in the window.
         * @param initialCameraPosition: The initial position of the camera
         * @param finalCameraPosition: The final position of the camera
         * @param currentCameraPosition: The current position of the camera
         * @param initialCanvasPosition: The initial position of the canvas
         * @param finalCanvasPosition: The final position of the canvas
         * @param currentCanvasPosition: The current position of the canvas
         */        
        const distanceLeftByCanvas = finalCanvasPosition - currentCanvasPosition;
        const totalCanvasDistance = finalCanvasPosition - initialCanvasPosition;
        const totalCameraDistance = finalCameraPosition - initialCameraPosition;
        let distanceLeftByCamera = (distanceLeftByCanvas * totalCameraDistance) / totalCanvasDistance;

        const newPosition = finalCameraPosition - distanceLeftByCamera;
        if(newPosition < finalCameraPosition || newPosition > initialCameraPosition) {
            this._hasCameraMovementEnded = true;
            return currentCameraPosition;
        }
        this._hasCameraMovementEnded = false;
        return newPosition;
    }

    private isScrollingUp(currentScrollPosition):boolean {
        return currentScrollPosition > this._lastScrollPosition;
    }

    private moveCamera() {
        /**
         * Move the camera based on the scroll position of the canvas.
         */
        if(!this._camera) return;
        // Calculate distance based on the distance of container from window edge
        const currentCanvasPosition = this._canvasContainer.getBoundingClientRect().top;
        const initialCanvasPosition = window.screen.height;
        const finalCanvasPosition = this._animationScrollTopOffset;
        // Move along x-axis
        this._camera.position.setX(this.getNextCameraPosition(
        this._initialCameraPosition.x,
        this._finalCameraPosition.x,
        this._camera.position.x,
        initialCanvasPosition,
        finalCanvasPosition,
        currentCanvasPosition
        ));
        // Move along y-axis
        this._camera.position.setY(this.getNextCameraPosition(
        this._initialCameraPosition.y,
        this._finalCameraPosition.y,
        this._camera.position.y,
        initialCanvasPosition,
        finalCanvasPosition,
        currentCanvasPosition
        ));
        // Move along z-axis
        this._camera.position.setZ(this.getNextCameraPosition(
        this._initialCameraPosition.z,
        this._finalCameraPosition.z,
        this._camera.position.z,
        initialCanvasPosition,
        finalCanvasPosition,
        currentCanvasPosition
        ));
    }

    private animateAsteroids({rotate=false, move=false, revolve=false}={}) {
        /**
         * Animate the asteroids based on the parameters.
         */
        if((!rotate && !move && !revolve) || !this._asteroids) return;
        this.print(`Animating ${this._asteroids.length} asteroids with rotate: ${rotate}, move: ${move}, revolve: ${revolve}`);
        this._asteroids.forEach(asteroid => {
            if(move) asteroid.attract(this._isPlayingBackwards);
            if(rotate) asteroid.rotate();
            if(revolve) asteroid.revolve();
        });
    }    

    private animatePlanet() {
        /**
         * Animate the planet by rotating it.
         */
        if(this._planet) {
            this.print("Animating planet");
            this._planet.rotate();
        } else {
            this.print("Planet not found", 'warn');
        }
    }

    private configureEquipments() {
        /**
         * Configure the equipments like camera, lights, axis helpers, etc.
         */
        this.print("Configuring equipments");
        // Load the camera
        const cameraAspectRatio = window.innerWidth / window.innerHeight;
        this.print(`Configuring camera with aspect ratio: ${cameraAspectRatio} and position ${this._initialCameraPosition}`);
        this._camera = new THREE.PerspectiveCamera(75, cameraAspectRatio, 0.1, 1000);
        this._camera.position.set(this._initialCameraPosition.x, this._initialCameraPosition.y, this._initialCameraPosition.z);

        // Load the lights
        this.print("Configuring lights");
        this._ambientLight = new THREE.AmbientLight(0xffffff, this._ambientLightIntensity);
        this._sunLight = new THREE.DirectionalLight(this._sunLightColor, this._sunLightIntensity);
        this._sunLight.position.set(this._sunLightPosition.x, this._sunLightPosition.y, this._sunLightPosition.z);
        this._sunLight.castShadow = true;

        // Load axis helpers for debug mode
        if(this._debugEnabled) {
            this.print("Configuring axis helpers");
            this._axisHelper = new THREE.AxesHelper(5);
            this._axisHelper.setColors(0xff0000, 0x00ff00, 0x0000ff);

            this._gridHelper = new THREE.GridHelper(10, 10);
            this._gridHelper.position.y = -2;

            this.print("Configuring orbit controls");
            this._orbitControls = new OrbitControls(this._camera, this._renderer.domElement);
            this._orbitControls.enableDamping = true;
            this._orbitControls.dampingFactor = 0.25;
            this._orbitControls.enableZoom = true;
            this._orbitControls.enablePan = true;
            this._orbitControls.enableRotate = true;
        }
    }

    private configureActors() {
        /**
         * Create the planet and asteroids
         */
        // Load the planet
        this._planet = new Planet(
            this._planetRadius,
            this._planetPosition,
            this._planetTiltDegrees,
            this._planetRotationSpeed,
            {
                debugEnabled: this._debugEnabled,
                massScaleFactor: this._massScaleFactor
            }
        );

        this._asteroids = [];
        for(let i=0; i<this._totalAsteroids; i++) {
                
            const asteroid = new Asteroid(
                this._asteroidMinRadius + Math.random() * (this._asteroidMaxRadius - this._asteroidMinRadius),
                this._asteroidSpread,
                this._externalModels ? this._externalModels.asteroid : null,
                this._planet,
                this._asteroidRotationSpeed,
                this._asteroidRevolutionSpeed,
                this._gravitationalConstant,
                this._asteroidMaxDistanceFromPlanet,
                this._massScaleFactor
            );
            this._asteroids.push(asteroid);
        }

    }

    configureScene() {
        /**
         * Configure the scene with the equipments and actors.
         */
        this.print(`Configuring scene with canvas container of width ${this._canvasContainer.clientWidth} and height ${this._canvasContainer.clientHeight}`);
        this.print(this._canvasContainer);
        this._scene = new THREE.Scene();
        this._scene.background = new THREE.Color(this._sceneBackgroundColor);
        this._renderer = new THREE.WebGLRenderer();
        this._renderer.setSize(this._canvasContainer.clientWidth, this._canvasContainer.clientHeight);

        this.configureEquipments();
        this.configureActors();

        this.print("Adding equipments to scene");
        if(this._axisHelper) this._scene.add(this._axisHelper);   
        if(this._gridHelper) this._scene.add(this._gridHelper); 

        if(this._camera) this._scene.add(this._camera);
        if(this._ambientLight) this._scene.add(this._ambientLight);
        if(this._sunLight) this._scene.add(this._sunLight);

        this.print("Adding actors to scene");
        if(this._planet) this._planet.addToScene(this._scene);
        if(this._asteroids) this._asteroids.forEach(asteroid => asteroid.addToScene(this._scene));
        this._canvasContainer.appendChild(this._renderer.domElement);
        this._isConfigured = true;
    }

    resetCamera() {
        /**
         * Reset the camera to its initial position.
         */
        if(!this._camera) return;
        this._camera.position.copy(this._initialCameraPosition);
        this._camera.near = 0.1;
        this._camera.far = 1000;
    }

    handleScrollEvent() {
        /**
         * Handle the scroll event to move the camera and animate the scene.
         */
        // If the container is in view, animate
        const currentScrollPosition = window.pageYOffset || document.documentElement.scrollTop;
        const rect = this._canvasContainer.getBoundingClientRect();
        if(rect.top < window.innerHeight && rect.bottom > 0) {
            this._isPlayingBackwards = !this.isScrollingUp(currentScrollPosition);
            this.moveCamera(); // camera will move during scroll
            this.animateAsteroids({move: true, rotate: false, revolve: false});

        }
        this._lastScrollPosition = currentScrollPosition;
        this._renderer.render(this._scene, this._camera);
    }

    handleAnimation() {
        /**
         * Handle the animation of the scene.
         */
        if(!this._renderer || !this._scene || !this._camera) return;
        this.print("Handling animation");
        this.animatePlanet();
        this.animateAsteroids({rotate: true, revolve: true, move: false});
        this.print("Rendering scene");
        if(this._debugEnabled) this._camera.updateProjectionMatrix();
        if(this._debugEnabled && this._orbitControls) this._orbitControls.update();
        this._renderer.render(this._scene, this._camera);
        requestAnimationFrame(() => this.handleAnimation());
    }

    handleWindowResize() {
        /**
         * Handle the window resize event to update the camera aspect ratio and renderer size.
         */
        if(!this._renderer || !this._camera) return;
        this._camera.aspect = window.innerWidth / window.innerHeight;
        this._camera.updateProjectionMatrix();
        this._renderer.setSize(this._canvasContainer.clientWidth, this._canvasContainer.clientHeight);
        this.handleScrollEvent();
        this._renderer.render(this._scene, this._camera);
    }

    planetPositionRelativeToCanvas():number[] {
        /**
         * Get the position of the planet relative to the canvas.
         */
        if(!this._planet || !this._camera) return [];
        let position:number[] = [];
        if(!this._planet) return position;
        const vector = new THREE.Vector3();
        vector.setFromMatrixPosition(this._planet.matrixWorld);
        vector.x += this._planet.radius;
        vector.y += this._planet.radius/2;
        vector.project(this._camera);

        const canvasWidth = this._canvasContainer.clientWidth;
        const canvasHeight = this._canvasContainer.clientHeight;

        position.push((vector.x + 1) * canvasWidth / 2);
        position.push(-(vector.y - 1) * canvasHeight / 2);

        return position;
    }

    getPlanetSizeOnScreen(): number {
        if(!this._planet || !this._camera) return 0;
        const vector = new THREE.Vector3();
    
        // Get sphere bounding box
        
    
        // Get sphere size in world units
        const size = new THREE.Vector3();
        const boundingBox = this._planet.boundingBox;
        boundingBox.getSize(size);
    
        // Project the sphere's bounding box min and max points
        const difference = boundingBox.max.sub(boundingBox.min);
        const distance = difference.project(this._camera);

    
        const canvasWidth = this._canvasContainer.clientWidth;
        const canvasHeight = this._canvasContainer.clientHeight;
    
        // Calculate screen-space size
        const width = distance.x * canvasWidth;
        const height = distance.y * canvasHeight;
    
        // Return the larger dimension (width or height)
        return Math.max(width/2, height/2); 
    }

    get cameraX() {
        return this._camera.position.x;
    }

    get cameraY() {
        return this._camera.position.y;
    }

    get cameraZ() {
        return this._camera.position.z;
    }

    get cameraNear() {
        return this._camera.near;
    }

    get cameraFar() {
        return this._camera.far;
    }

    set cameraNear(value:number) {
        this._camera.near = value;
        this._camera.updateProjectionMatrix();
    }

    set cameraFar(value:number) {
        this._camera.far = value;
        this._camera.updateProjectionMatrix();
    }

    get configured() {
        return this._isConfigured;
    }

    get hasCameraMovementEnded() {
        if(!this._camera) return false;
        return this._hasCameraMovementEnded && this._canvasContainer.getBoundingClientRect().top <= this._animationScrollTopOffset;
    }
}
