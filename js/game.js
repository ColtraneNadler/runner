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
renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });//renderer with transparent backdrop
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

let geo = new THREE.BoxGeometry();
let mat = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
let cube = new THREE.Mesh(geo, mat);

// var controls = new THREE.OrbitControls( camera, renderer.domElement );

// camera.rotation.y = 1.6;
camera.rotation.x = -.14;
camera.position.y = 1.4;
camera.position.x = 0;
camera.position.z = 4.6;

let hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444);
hemiLight.position.set(0, 20, 0);
scene.add(hemiLight);

let dirLight = new THREE.DirectionalLight(0xffffff);
dirLight.position.set(3, 10, 10);
dirLight.castShadow = true;
dirLight.shadow.camera.top = 2;
dirLight.shadow.camera.bottom = - 2;
dirLight.shadow.camera.left = - 2;
dirLight.shadow.camera.right = 2;
dirLight.shadow.camera.near = 0.1;
dirLight.shadow.camera.far = 40;
scene.add(dirLight);

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
let envController = new EnvController(envs[randomSceneIdx][1], envs[randomSceneIdx][2], envs[randomSceneIdx][3], 13.2, 10);
loader.load(envs[randomSceneIdx][0], function (glb) {
	envController.Init(glb);
}, null, console.log);

/**
 * LOAD AVATAR AND ANIMATIONS
 */

// TEMP FOR TEST
const outfits = ['outfit1', 'outfit2', 'outfit3'];
let currentOutfit = 0;

let avatar, boy_clips, boy_mixer;
let boy_actions = []
const animations = {
	NONE: -1,
	JUMP: 1,
	PUSH: 2,
	TURN_LEFT: 3,
	TURN_RIGHT: 4,
}
let current_animation = animations.Push;
loader.load('/assets/bSkater_CompleteSet_RC1.gltf', function (glb) {
	scene.add(glb.scene);
	avatar = glb.scene;

	glb.scene.scale.set(.01, .01, .01);
	avatar = glb.scene;

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
	current_animation = animations.PUSH;

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
});

nextOutfitBtn.addEventListener("click", () => {
	if (currentOutfit === outfits.length - 1) {
		currentOutfit = 0;
	} else {
		currentOutfit++;
	}
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

function setupForScene(scene) {
	switch (scene) {
		case SCENE.OUTFIT: {
			avatar.position.set(200, 0, 0)
			avatar.rotation.y = 0;
			camera.position.set(200, 1., 2.6)
			sceneTitle.innerHTML = "outfit select"
			outfitScreen.hidden = false;
			break;
		}
		case SCENE.GAMEPLAY: {
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
			sceneTitle.innerHTML = "score: " + Math.floor(currentScore) + "<br>press space to continue</br>";
			avatar.position.set(300, 0, 0)
			avatar.rotation.y = -Math.PI / 4;
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

function updateForScene(scene) {
	let dt = 0.025
	switch (scene) {
		case SCENE.OUTFIT: {
			break;
		}
		case SCENE.GAMEPLAY: {
			//TODO: sync w/ framerate
			playerMovementUpdate(dt);
			envController.EnvUpdate(4.0 * dt);
			currentScore += dt;
			sceneTitle.innerHTML = "score: " + Math.floor(currentScore);
			if (envController.CollisionCheck()) {
				clearScene(currentScene);
				currentScene = SCENE.GAMEOVER;
				setupForScene(currentScene);
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
	renderer.render(scene, camera);
	updateForScene(currentScene)
	stats.end();
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
	jumpHeight: 1.7,
	jumpSpeed: 0.7,
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
function movePlayer(dir) {
	if (currentScene != SCENE.GAMEPLAY) return;
	switch (dir) {
		case 'UP':
			if (jumping)
				return;

			jumping = true;
			jump_time = 0
			current_animation = animations.JUMP;
			boy_actions[animations.JUMP].reset()
			boy_actions[animations.JUMP].time = 0.4;
			return;
		case 'DOWN':
			// slide
			break;
		case 'LEFT':
			if (current_lane === lanes.LEFT || jumping == true) return;
			current_lane = current_lane === lanes.RIGHT ? lanes.MIDDLE : lanes.LEFT;
			current_animation = animations.TURN_LEFT;
			boy_actions[animations.TURN_LEFT].reset()
			boy_actions[animations.TURN_LEFT].time = 0.2;
			break;
		case 'RIGHT':
			if (current_lane === lanes.RIGHT || jumping == true) return;
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

function playerMovementUpdate(dt) {
	if (jumping) {
		jump_time += movementParams.jumpSpeed * dt;
		if (jump_time >= 1) {
			jumping = false;
			jump_time = 1;
		}
		let jumpVal = Math.sin(Math.PI * jump_time);
		avatar.position.y = -1 + movementParams.jumpHeight * jumpVal;
	}
}
function animationUpdate(dt) {
	if (boy_actions.length < 1) return;
	//blend to current animation, once current animation is complete, set anim state back to push
	let action = boy_actions[current_animation];
	if (action.loop == THREE.LoopOnce && action._clip.duration - action.time < 0.75) {
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

