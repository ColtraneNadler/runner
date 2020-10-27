let score = document.getElementById('score')
let startButton = document.getElementById('startGame')
let wrapper = document.getElementById('wrapper');

/**
 * SETUP THREE.JS SCENE
 */
let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
scene.fog = new THREE.FogExp2('#cce6ff', .02);
renderer = new THREE.WebGLRenderer({ alpha: true });//renderer with transparent backdrop
renderer.setClearColor(0xcce6ff, 1);
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

window.camera = camera;

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

let groundTiles = []
let tileWidth = 5.3
let numTiles = 20;
/**
 * LOAD SCENE
 */
loader.load('/assets/env1.glb', function (glb) {
	let tileableWorld = new THREE.Object3D();
	glb.scene.children.forEach(node => {
		node.position.y = -1;

		if (node.name.toLowerCase() === 'ground')
			tileableWorld.add(node)
		if (node.name.toLowerCase() === 'ground2')
			tileableWorld.add(node)
		if (node.name.toLowerCase() === 'sideground')
			tileableWorld.add(node)
	})
	for (let i = 0; i < numTiles; i++) {
		let tile2 = tileableWorld.clone()
		tile2.position.z = -tileWidth * i;
		groundTiles.push(tile2);
		scene.add(tile2);
	}
	console.log('the world', glb.scene.children);

}, undefined, err => {
	console.error('Error loading scene glb', err);
});

/**
 * LOAD AVATAR AND ANIMATIONS
 */
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
	glb.scene.rotation.y = -3.14;
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
 * GAME STATE
 */
SCENE = {
	OUTFIT: 0,
	GAMEPLAY: 1,
	GAMEOVER: 2
}
let currentScene = SCENE.OUTFIT;
let currentScore = 0;
startButton.addEventListener("click", () => {
	clearScene(SCENE.OUTFIT);
	currentScene = SCENE.GAMEPLAY;
	setupForScene(currentScene);
})

function setupForScene(scene) {
	switch (scene) {
		case SCENE.OUTFIT: {
			avatar.position.set(200, 0, 0)
			camera.position.set(200, 1.4, 4.6)
			score.innerHTML = "outfit select"
			startButton.hidden = false;
			break;
		}
		case SCENE.GAMEPLAY: {
			avatar.position.set(0, -1, .1)
			camera.position.set(0, 1.4, 4.6)
			currentScore = 0;
			score.innerHTML = "score: " + Math.floor(currentScore);
			break;
		}
		case SCENE.GAMEOVER: {
			score.innerHTML = "score: " + Math.floor(currentScore) + "<br>press space to continue</br>";
			avatar.position.set(300, 0, 0)
			camera.position.set(300, 1.4, 4.6)
			break;
		}
	}
}
function clearScene(scene) {
	switch (scene) {
		case SCENE.OUTFIT: {
			startButton.hidden = true;
			break;
		}
		case SCENE.GAMEPLAY: {
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
			sceneTileUpdate(3.0 * dt);

			currentScore += dt;
			score.innerHTML = "score: " + Math.floor(currentScore);

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
stats.showPanel( 0 ); 
console.log(stats.domElement)
document.getElementById('stats').appendChild( stats.domElement );

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
	'RIGHT': 0.1 + 2,
	'MIDDLE': 0.1,
	'LEFT': 0.1 - 2
}
let camera_positions = {
	'RIGHT': .1 + 1.2,
	'MIDDLE': .1,
	'LEFT': .1 - 1.2
}
let current_lane = lanes.MIDDLE;
let avatar_tween, camera_tween;

let movementParams = {
	forwardSpeed: 400,
	turnSpeed: 150,
	blendSpeed: 3.0,
	jumpHeight: 2,
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
	let startAction, endAction;
	switch (dir) {
		case 'UP':
			if (jumping)
				return;

			jumping = true;
			jump_time = 0
			current_animation = animations.JUMP;
			boy_actions[animations.JUMP].reset()
			boy_actions[animations.JUMP].time = 0.1;
			return;
		case 'DOWN':
			// slide
			break;
		case 'LEFT':
			if (current_lane === lanes.LEFT) return;
			current_lane = current_lane === lanes.RIGHT ? lanes.MIDDLE : lanes.LEFT;
			current_animation = animations.TURN_LEFT;
			boy_actions[animations.TURN_LEFT].reset()
			break;
		case 'RIGHT':
			if (current_lane === lanes.RIGHT) return;
			current_lane = current_lane === lanes.LEFT ? lanes.MIDDLE : lanes.RIGHT;

			current_animation = animations.TURN_RIGHT;
			boy_actions[animations.TURN_RIGHT].reset()
			break;
	}

	// ANIMATE
	if (avatar_tween)
		avatar_tween.stop();

	avatar_tween = new TWEEN(avatar.position);
	avatar_tween.to({ x: lane_positions[current_lane] }, 240);
	avatar_tween.start();


	if (camera_tween)
		camera_tween.stop();

	camera_tween = new TWEEN(camera.position);
	camera_tween.to({ x: camera_positions[current_lane] }, 240);
	camera_tween.start();
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
	if (action.loop == THREE.LoopOnce && action._clip.duration - action.time < 0.2) {
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

function sceneTileUpdate(dt) {
	for (let i = 0; i < groundTiles.length; i++) {
		groundTiles[i].position.z += dt;
		if (groundTiles[i].position.z > tileWidth) {
			groundTiles[i].position.z = -(numTiles - 1) * tileWidth;
		}
	}
}