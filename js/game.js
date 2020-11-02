const sceneTitle = document.getElementById('sceneTitle')
const outfitScreen = document.getElementById('outfitScreen')
const startButton = document.getElementById('startGameButton')
const wrapper = document.getElementById('wrapper');
const prevOutfitBtn = document.getElementById('prevOutfitBtn');
const nextOutfitBtn = document.getElementById('nextOutfitBtn');

/**
 * SETUP THREE.JS SCENE
 */
let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
renderer = new THREE.WebGLRenderer({ alpha: false, antialias: true });//renderer with transparent backdrop
renderer.physicallyCorrectLights = true;
renderer.gammaFactor = 2.2;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.setSize(window.innerWidth, window.innerHeight);
// renderer.toneMapping = THREE.ACESFilmicToneMapping;
// renderer.toneMappingExposure = 1;
const composer = new THREE.EffectComposer( renderer );

// renderer.setClearColor(0x000000,0.0);

let pmremGenerator = new THREE.PMREMGenerator( renderer );
pmremGenerator.compileEquirectangularShader();

document.body.appendChild(renderer.domElement);

// bloom
// var composer;
// var bloomStrength = 0.3;
// var bloomRadius = 0.1;
// var bloomThreshold = 0.9;


// 	renderScene = new THREE.RenderPass(scene, camera);

//     var effectFXAA = new THREE.ShaderPass(THREE.FXAAShader);
// 		effectFXAA.uniforms['resolution'].value.set(1 / window.innerWidth, 1 / window.innerHeight );

//     var copyShader = new THREE.ShaderPass(THREE.CopyShader);
// 		copyShader.renderToScreen = true;

// 	var bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), bloomStrength, bloomRadius, bloomThreshold);

// 		composer = new THREE.EffectComposer(renderer);

//     composer.setSize(window.innerWidth, window.innerHeight);
//     composer.addPass(renderScene);
//     composer.addPass(effectFXAA);
//   	composer.addPass(effectFXAA);

//     composer.addPass(bloomPass);
//     composer.addPass(copyShader);


// end of bloom


// let geo = new THREE.BoxGeometry();

// let mat = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
// let cube = new THREE.Mesh(geo, mat);


// camera.rotation.y = 1.6;
camera.rotation.x = -.14;
camera.position.y = 1.4;
camera.position.x = 0;
camera.position.z = 4.6;

let hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
hemiLight.position.set(0, 20, 0);
hemiLight.layers.set(0);
scene.add(hemiLight);

let hemiLight2 = new THREE.HemisphereLight(0xffffff, 0x444444, 1);
hemiLight2.position.set(0, 20, 0);
hemiLight2.layers.set(1);
scene.add(hemiLight2);

let dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(3, 10, 10);
dirLight.castShadow = true;
dirLight.shadow.camera.top = 2;
dirLight.shadow.camera.bottom = - 2;
dirLight.shadow.camera.left = - 2;
dirLight.shadow.camera.right = 2;
dirLight.shadow.camera.near = 0.1;
dirLight.shadow.camera.far = 40;
scene.add(dirLight);

let dirLight2 = new THREE.DirectionalLight(0xffffff, 1);
dirLight2.position.set(3, 10, 10);
dirLight2.castShadow = true;
dirLight2.shadow.camera.top = 2;
dirLight2.shadow.camera.bottom = - 2;
dirLight2.shadow.camera.left = - 2;
dirLight2.shadow.camera.right = 2;
dirLight2.shadow.camera.near = 0.1;
dirLight2.shadow.camera.far = 40;
dirLight2.layers.set(1);
scene.add(dirLight2);

// const ambientLight  = new THREE.AmbientLight(0xFFFFFF, 1);
// ambientLight.position = (200, 10, 0);
// ambientLight.layers.set(1);
// scene.add(ambientLight);

let loader = new THREE.GLTFLoader();

let jumping = false
	, jump_time = 0;

/**
 * LOAD SCENE
 */

let envs = [
	['/assets/Enviroment1BigRoad.glb', InitConstructionEnv, SetUpStaticConstructionEnv, ConstructionSpawnTypes],
	['/assets/Enviroment2Packaged.glb', InitCityEnv, SetUpStaticCityEnv, CitySpawnTypes]
]
let randomSceneIdx = Math.floor(2 * Math.random());
let envController = new EnvController(envs[randomSceneIdx][1], envs[randomSceneIdx][2], envs[randomSceneIdx][3], 13.2157202, 10);
loader.load(envs[randomSceneIdx][0], function (glb) {
	envController.Init(glb);
}, null, console.log);

/**
 * LOAD AVATAR AND ANIMATIONS
 */

// TEMP FOR TEST
const outfits = [[], []];
let currentOutfit = 0;

function setUpForCurrentOutfit() {
	let geo = avatar.getObjectByName("geo");
	for (let i = 0; i < outfits.length; i++) {
		outfits[i].forEach((idx) => {
			geo.children[idx].visible = (i == currentOutfit);
		})
	}
}

let avatar, boy_clips, boy_mixer;
let boy_actions = []
const animations = {
	NONE: -1,
	OLLIE: 0,
	JUMP: 1,
	PUSH: 2,
	TURN_LEFT: 3,
	TURN_RIGHT: 4,
	FALL: 5,
	IDLE: 6,
}
let current_animation = animations.Push;
loader.load('/assets/bSkater_CompleteSet_RC6.glb', function (glb) {

	let models = glb.scene;
	models.traverse((child) => {
		if (child instanceof THREE.Mesh) {
			child.layers.set(1);
			child.material.encoding = THREE.sRGBEncoding;
			// child.material.emissiveMap.encoding = THREE.sRGBEncoding;
			child.material.roughness = 0.35;
			child.material.metalness = 0;
			child.material.side = THREE.DoubleSide;
		}
	})

	scene.add(glb.scene);
	avatar = glb.scene;

	// set up outfits, get all array indices 
	let geo = avatar.getObjectByName("geo");
	console.log('the world', geo.children);
	geo.children.forEach((child, idx) => {

		if (child.name.startsWith("o1")) {
			outfits[0].push(idx);
		} else if (child.name.startsWith("o2")) {
			outfits[1].push(idx);
		}
		else if (child.name.startsWith("o3")) {
			child.visible = false;
		}
		
	})

	setUpForCurrentOutfit();

	// set up mixer
	boy_clips = glb.animations;
	boy_mixer = new THREE.AnimationMixer(glb.scene);

	//initialize clip actions
	boy_clips.forEach((clip) => {
		let action = boy_mixer.clipAction(clip);
		action.play();
		boy_actions.push(action)
		action.setEffectiveWeight(0);
		action.setLoop(THREE.LoopOnce);
		action.clampWhenFinished = true;
	});
	boy_actions[animations.PUSH].setLoop(THREE.LoopRepeat);
	boy_actions[animations.PUSH].clampWhenFinished = false;
	boy_actions[animations.IDLE].setLoop(THREE.LoopRepeat);
	boy_actions[animations.IDLE].clampWhenFinished = false;
	setupForScene(currentScene);
}, undefined, err => {
	console.error('Error loading avatar glb', err);
});

/**
 * UI EVENTS
 */
startButton.addEventListener("click", () => {
	clearScene(SCENE.OUTFIT);
	currentScene = SCENE.GAMEPLAY;
	setupForScene(currentScene);
});

prevOutfitBtn.addEventListener("click", () => {
	if (currentOutfit === 0) {
		currentOutfit = outfits.length - 1;
	} else {
		currentOutfit--;
	}
	setUpForCurrentOutfit();
});

nextOutfitBtn.addEventListener("click", () => {
	if (currentOutfit === outfits.length - 1) {
		currentOutfit = 0;
	} else {
		currentOutfit++;
	}
	setUpForCurrentOutfit();
});

/**
 * GAME STATE
 */
SCENE = {
	OUTFIT: 0,
	GAMEPLAY: 1,
	GAMEOVER: 2
}
let currentScene = SCENE.OUTFIT;
let currentScore = 0;

getCubeMapTexture();

function getCubeMapTexture () {
      let OurRGBELoader = new THREE.RGBELoader()
		.setDataType( THREE.UnsignedByteType )
		.load( '/assets/environment/venice_sunset_1k.hdr', texture => {
			
          const envMap = pmremGenerator.fromEquirectangular( texture ).texture;
          pmremGenerator.dispose();
		//   resolve( { envMap } );
		  scene.environment = envMap;
		});
  }

function setupForScene(scene) {
	switch (scene) {
		case SCENE.OUTFIT: {
			current_animation = animations.IDLE;
			HardResetAnimsToIdle();
			avatar.position.set(200, 0, 0)
			avatar.rotation.y = 0;
			camera.position.set(200, 1., 2.6)
			sceneTitle.innerHTML = "outfit select"
			outfitScreen.hidden = false;
			break;
		}
		case SCENE.GAMEPLAY: {
			current_animation = animations.PUSH;
			envController.InitTilesWithSpawnedObjects();
			avatar.position.set(0, -1, .1)
			avatar.rotation.y = Math.PI;
			camera.position.set(0, 1.4, 4.6)
			currentScore = 0;
			sceneTitle.innerHTML = "score: " + Math.floor(currentScore);
			current_lane = lanes.MIDDLE;
			break;
		}
		case SCENE.GAMEOVER: {
			current_animation = animations.IDLE;
			HardResetAnimsToIdle();
			sceneTitle.innerHTML = "score: " + Math.floor(currentScore) + "<br>press space to continue</br>";
			avatar.position.set(300, 0, 0)
			avatar.rotation.y = 0;
			camera.position.set(300, 1.4, 2.6)
			break;
		}
	}
}
function clearScene(scene) {
	switch (scene) {
		case SCENE.OUTFIT: {
			outfitScreen.hidden = true;
			break;
		}
		case SCENE.GAMEPLAY: {
			envController.Reset();
			stopAllTweens();
			break;
		}
		case SCENE.GAMEOVER: {
			break;
		}
	}
}

// Ian added this and the if check in the below function to get a temp falling animation and environment movement pause before going to game over state
function updateForScene(scene) {
	let dt = 0.025

	switch (scene) {
		case SCENE.OUTFIT: {
			break;
		}
		case SCENE.GAMEPLAY: {
			//TODO: sync w/ framerate
			playerMovementUpdate(dt);

			let envSpeed = (current_animation == animations.FALL) ? 0 : 6.0;
			envController.EnvUpdate(envSpeed * dt);
			currentScore += dt;
			sceneTitle.innerHTML = "score: " + Math.floor(currentScore);
			let col = envController.CollisionCheck(false, new THREE.Vector3(0, 0, -1));
			if ((current_animation !== animations.FALL) && col[0] && col[1] < 0.1) {

				current_animation = animations.FALL;
				boy_actions[animations.FALL].reset()
				boy_actions[animations.FALL].setDuration(3)
				boy_actions[animations.FALL].time = 0.7;

				setTimeout(function () {
					clearScene(currentScene);
					currentScene = SCENE.GAMEOVER;
					setupForScene(currentScene);
				}, 1500);

			}
			break;
		}
		case SCENE.GAMEOVER: {
			break;
		}
	}
	animationUpdate(dt);
}

//Keep track of FPS
var stats = new Stats();
stats.showPanel(0);
document.getElementById('stats').appendChild(stats.domElement);

/**
 * RENDER
 */
function render() {
	requestAnimationFrame(render);
	stats.begin();
	// renderer.autoClear = true;
	renderer.autoClear = true;
	camera.layers.set(0);
	renderer.render(scene, camera);
	renderer.autoClear = false;
	camera.layers.set(1);
	renderer.render(scene, camera);


	updateForScene(currentScene)
	stats.end();
	composer.render();
}
render();

/**
 * MOVEMENT CONFIG
 */
let lanes = {
	LEFT: 'LEFT',
	MIDDLE: 'MIDDLE',
	RIGHT: 'RIGHT'
}
let lane_positions = {
	'RIGHT': 2.5,
	'MIDDLE': 0.0,
	'LEFT': - 2.5
}
let camera_positions = {
	'RIGHT': 1.5,
	'MIDDLE': 0.0,
	'LEFT': -1.5
}
let current_lane = lanes.MIDDLE;
let avatar_tween, camera_tween;

let movementParams = {
	forwardSpeed: 100,
	turnSpeed: 100,
	blendSpeed: 3.0,
	jumpHeight: 2,
	jumpSpeed: 0.65,
}

/**
 * KEYBINDING CONTROLS
 */
window.addEventListener('keydown', e => {
	switch (e.keyCode) {
		case 38:
			movePlayer('UP');
			break;
		case 37:
			movePlayer('LEFT')
			break;
		case 39:
			movePlayer('RIGHT')
			break;
		case 32:
			if (currentScene == SCENE.GAMEOVER) {
				clearScene(currentScene)
				currentScene = SCENE.OUTFIT
				setupForScene(currentScene)
			} else if (currentScene == SCENE.GAMEPLAY) {
				clearScene(currentScene)
				currentScene = SCENE.GAMEOVER
				setupForScene(currentScene)
			}
	}
})

/**
 * TOUCH CONTROLS
 */
document.addEventListener('touchstart', handleTouchStart, false);
document.addEventListener('touchmove', handleTouchMove, false);
var xDown = null;
var yDown = null;

function handleTouchStart(evt) {
	xDown = evt.touches[0].clientX;
	yDown = evt.touches[0].clientY;
};


function handleTouchMove(evt) {
	if (!xDown || !yDown) {
		return;
	}
	var xUp = evt.touches[0].clientX;
	var yUp = evt.touches[0].clientY;
	var xDiff = xDown - xUp;
	var yDiff = yDown - yUp;

	if (Math.abs(xDiff) > Math.abs(yDiff))
		if (xDiff > 0)
			movePlayer('LEFT');
		else
			movePlayer('RIGHT');
	else
		if (yDiff > 0)
			movePlayer('UP')
		else
			console.log('DOWN')

	/* reset values */
	xDown = null;
	yDown = null;
};
/**
 * MovePlayer
 * @param dir - ENUM (LEFT, RIGHT, UP, DOWN)
 */

var jumpFlipFlop = true;

function movePlayer(dir) {
	if (currentScene != SCENE.GAMEPLAY || (current_animation == animations.FALL)) return;
	switch (dir) {
		case 'UP':
			if (jumping || landed)
				return;

			jumping = true;
			jump_time = 0

			// I created a flip flop so we can alternate my two jumping animations
			if (jumpFlipFlop == true) {
				current_animation = animations.JUMP;
				boy_actions[animations.JUMP].reset()
				boy_actions[animations.JUMP].setDuration(2.7)
				boy_actions[animations.JUMP].time = 0.3;
				jumpFlipFlop = false;
			}
			else {
				current_animation = animations.OLLIE;
				boy_actions[animations.OLLIE].reset()
				boy_actions[animations.OLLIE].setDuration(3)
				boy_actions[animations.OLLIE].time = 0.5;
				jumpFlipFlop = true;
			}

			if (avatar_land_tween) {
				avatar_land_tween.stop()
			}
			return;
		case 'DOWN':
			// slide
			break;
		case 'LEFT':
			if (current_lane === lanes.LEFT || jumping == true || landed == true) return;
			current_lane = current_lane === lanes.RIGHT ? lanes.MIDDLE : lanes.LEFT;
			current_animation = animations.TURN_LEFT;
			boy_actions[animations.TURN_LEFT].reset()
			boy_actions[animations.TURN_LEFT].time = 0.2;
			break;
		case 'RIGHT':
			if (current_lane === lanes.RIGHT || jumping == true || landed == true) return;
			current_lane = current_lane === lanes.LEFT ? lanes.MIDDLE : lanes.RIGHT;

			current_animation = animations.TURN_RIGHT;
			boy_actions[animations.TURN_RIGHT].reset()
			boy_actions[animations.TURN_RIGHT].time = 0.2;
			break;
	}

	stopAllTweens();

	// ANIMATE
	avatar_tween = new TWEEN(avatar.position);
	avatar_tween.to({ x: lane_positions[current_lane] }, 380);
	avatar_tween.start();

	camera_tween = new TWEEN(camera.position);
	camera_tween.to({ x: camera_positions[current_lane] }, 380);
	camera_tween.start();
}

function stopAllTweens() {
	if (avatar_tween) {
		avatar_tween.stop();
	}
	if (camera_tween)
		camera_tween.stop();
}

let landed = false;
let landHeight = 0;
let avatar_land_tween;

function playerMovementUpdate(dt) {
	if (jumping) {
		jump_time += movementParams.jumpSpeed * dt;
		//while jumping, check if there is a collider underneath 
		// if you are close enough to it, land
		if (!landed) {
			let c = envController.CollisionCheck(true, new THREE.Vector3(0, -1, 0));
			//TODO:: get these params from the collision check ( 0.5 & -0.3)
			//this is set up to only work with the grind pipe
			if (c[0] && c[1] < 0.5) {
				landed = true;
				current_animation = animations.TURN_RIGHT;
				boy_actions[animations.TURN_RIGHT].reset()
				boy_actions[animations.TURN_RIGHT].setDuration(2.5)
				boy_actions[animations.TURN_RIGHT].time = 0.2;
				landHeight = avatar.position.y - c[1] + 0.1;
			}
		}
		if (jump_time >= 1) {
			jumping = false;
			jump_time = 1;
		}
		let jumpVal = Math.sin(Math.PI * jump_time);
		avatar.position.y = landed ? landHeight : -1 + movementParams.jumpHeight * jumpVal;
	}

	//stopped jumping and waiting to land back to the ground
	if (landed && !jumping) {
		let c = envController.CollisionCheck(true, new THREE.Vector3(0, -1, 0));
		if (!c[0]) {
			avatar_land_tween = new TWEEN(avatar.position);
			avatar_land_tween.to({ y: -1 }, 100);
			avatar_land_tween.start();
			landed = false
			current_animation = animations.PUSH;
			// for some reason, when I set the turn right duration longer for grinding it also affects turning right when NOT jumping. 
			//So I'm trying to reset the duration back to 1 when not grinding
			boy_actions[animations.TURN_RIGHT].setDuration(1)
		}


	}
}
function animationUpdate(dt) {
	if (boy_actions.length < 1) return;
	//blend to current animation, once current animation is complete, set anim state back to push
	let action = boy_actions[current_animation];

	if (action.loop == THREE.LoopOnce && action._clip.duration - action.time < 0.75 && current_animation != animations.FALL) {
		current_animation = animations.PUSH;
	}

	// blend in / out target and other animations
	for (let i = 0; i < boy_actions.length; i++) {
		let cWeight = boy_actions[i].getEffectiveWeight()
		if (i == current_animation) {
			cWeight = Math.min(cWeight + movementParams.blendSpeed * dt, 1)
			boy_actions[i].setEffectiveWeight(cWeight)
		} else {
			cWeight = Math.max(cWeight - movementParams.blendSpeed * dt, 0)
			boy_actions[i].setEffectiveWeight(cWeight)
		}
	}
	boy_mixer.update(dt)
}

function HardResetAnimsToIdle()
{
	for (let i = 0; i < boy_actions.length; i++) {
		if (i == animations.IDLE) {
			boy_actions[i].setEffectiveWeight(1.0)
		} else {
			boy_actions[i].setEffectiveWeight(0.0)
		}
	}
}

