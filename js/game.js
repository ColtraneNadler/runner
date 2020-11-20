const sceneTitle = document.getElementById('sceneTitle')
const scoreWrapElement = document.getElementById('score-wrap')
const scoreElement = document.getElementById('score')
const prevOutfitBtn = document.getElementById('outfit-prev');
const nextOutfitBtn = document.getElementById('outfit-next');
const prevEnvBtn = document.getElementById('level-prev');
const nextEnvBtn = document.getElementById('level-next');
let paused = false;
let leaderboardElement = document.getElementById('popup-wrapper');
let leaderboardScoreElement = document.getElementById('leaderboard-score');
let leaderboardScoresElement = document.getElementById('leaderboard-scores');
let levelImageElement = document.getElementById('level-image');

/**
 * SETUP THREE.JS SCENE
 */
let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
renderer = new THREE.WebGLRenderer({ alpha: false, antialias: true });//renderer with transparent backdrop
// renderer.shadowMap.enabled = true;
// renderer.shadowMapSoft = true;
// renderer.shadowMap.type = THREE.PCFSoftShadowMap;
// renderer.shadowMapBias = 0.0039;
// renderer.shadowMapDarkness = 0.5;
// renderer.shadowMapWidth = 1024;
// renderer.shadowMapHeight = 1024;
renderer.physicallyCorrectLights = true;
renderer.gammaFactor = 2.2;
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.setSize(window.innerWidth, window.innerHeight);
// renderer.toneMapping = THREE.ACESFilmicToneMapping;
// renderer.toneMappingExposure = 1;
// const composer = new THREE.EffectComposer(renderer);

// renderer.setClearColor(0x000000,0.0);

let pmremGenerator = new THREE.PMREMGenerator(renderer);
pmremGenerator.compileEquirectangularShader();

document.body.appendChild(renderer.domElement);

camera.rotation.x = -.14;
camera.position.y = 1.4;
camera.position.x = 0;
camera.position.z = 4.6;

let hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 2);
hemiLight.position.set(0, 50, -100);

scene.add(hemiLight);

// let plight = new THREE.SpotLight( 0xffffff , 5, 5000);
// plight.position.set(0,0,1);
// plight.target.set =
// // plight.rotation.set(Math.PI / 2, Math.PI / 2,0);
// // plight.target.position.set(0,20,110);
// // scene.add(plight.target);
// scene.add( plight );


// let helper = new THREE.SpotLightHelper( plight);
// scene.add(helper);

let dirLight = new THREE.DirectionalLight(0xffffff, 0.05);
dirLight.position.set(15, 30, -100);

// coltrane's og settings
// dirLight.position.set(3, 10, 10);
// dirLight.castShadow = true;
// dirLight.shadow.camera.top = 2;
// dirLight.shadow.camera.bottom = - 2;
// dirLight.shadow.camera.left = - 2;
// dirLight.shadow.camera.right = 2;
// dirLight.shadow.camera.near = 0.1;
// dirLight.shadow.camera.far = 40;

// let d = 15;
// dirLight.shadow.camera.top = d;
// dirLight.shadow.camera.bottom = - d;
// dirLight.shadow.camera.left = - d;
// dirLight.shadow.camera.right = d;
// dirLight.shadow.camera.near = 0.1;
// dirLight.shadow.camera.far = 400;
// dirLight.shadow.mapSize.width = 4096;  
// dirLight.shadow.mapSize.height = 4096; 
scene.add(dirLight);

// scene.add( new THREE.CameraHelper( dirLight.shadow.camera ) );

// let ambientLight  = new THREE.AmbientLight(0xFFFFFF, 1);
// ambientLight.position = (200, 10, 0);
// scene.add(ambientLight);

let loader = new THREE.GLTFLoader();

let jumping = false
	, jump_time = 0;

/**
 * LOAD SCENE
 */

let envs = [
	['/assets/Env1Packaged/Enviroment1Packaged.gltf', InitConstructionEnv, SetUpStaticConstructionEnv, ConstructionSpawnTypes, SetUpConstructionEnvProps],
	['/assets/Env2Packaged/Enviroment2Packaged.gltf', InitCityEnv, SetUpStaticCityEnv, CitySpawnTypes, SetUpCityEnvProps],
	['/assets/Env3Packaged/Enviroment3Packaged.gltf', InitForestEnv, SetUpStaticForestEnv, ForestSpawnTypes, SetUpForestEnvProps]
]
let initialized = []
// load all envs in
envs.forEach((env) => {
	let cEnvController = new EnvController(env[1], env[2], env[3], env[4], 13.2466, 10);
	loader.load(env[0], function (glb) {
		cEnvController.Init(glb);
		env.push(cEnvController);
		initialized.push(1)
		//once all environments are loaded we can remove the loading screen
	}, null, console.log);
})


// skybox 

function createPathStrings(filename) {
	const basePath = "/assets/cSkybox_small/";
	const baseFilename = basePath + filename;
	const fileType = ".jpg";
	const sides = ["ft", "bk", "up", "dn", "lf", "rt"];
	const pathStings = sides.map(side => {
		return baseFilename + "_" + side + fileType;
	});

	return pathStings;
}

function createMaterialArray(filename, tintColor) {
	const skyboxImagepaths = createPathStrings(filename);
	const materialArray = skyboxImagepaths.map(image => {
		let texture = new THREE.TextureLoader().load(image);
		return new THREE.MeshBasicMaterial({ color: tintColor, map: texture, side: THREE.BackSide, fog: false });
	});
	return materialArray;
}

function initSkybox(color) {
	materialArray = createMaterialArray("cartoon", color);
	let skyboxGeo = new THREE.BoxGeometry(1000, 1000, 1000);
	let skybox = new THREE.Mesh(skyboxGeo, materialArray);
	skybox.position.set(200, 0, 0);
	scene.add(skybox);
}
let materialArray = []
initSkybox(new THREE.Color("#dfa6fb"));
/**
 * LOAD AVATAR AND ANIMATIONS
 */

// TEMP FOR TEST
const outfits = [[], [], []];
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
loader.load('/assets/bieberRC13/bSkater.glb', function (glb) {
	let models = glb.scene;
	models.traverse((child) => {
		if (child instanceof THREE.Mesh) {
			// child.layers.set(1);
			child.material.encoding = THREE.sRGBEncoding;
			// child.material.emissiveMap.encoding = THREE.sRGBEncoding;
			child.material.roughness = 0.9;
			child.material.metalness = 0;
			child.material.side = THREE.DoubleSide;
			// child.receiveShadow = true;
			// child.castShadow = true
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
		} else if (child.name.startsWith("o4")) {
			outfits[1].push(idx);
		} else if (child.name.startsWith("o2")) {
			outfits[2].push(idx);
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
	current_animation = animations.IDLE;
}, undefined, err => {
	console.error('Error loading avatar glb', err);
});

/**
 * UI EVENTS
 */
let envController;
let envIdx = 0;

function changeGameScene(scene){
	clearScene(currentScene);
	currentScene = scene;
	setupForScene(currentScene)
}
function setLevel(idx) {
	if (envController) {
		envController.SetVisibility(false);
	}
	envController = envs[envIdx][5]
	envController.SetVisibility(true);
}

prevEnvBtn.addEventListener("click", () => {
	if (envIdx === 0) {
		envIdx = envs.length - 1;
	} else {
		envIdx--;
	}

	levelImageElement.setAttribute('style', `background-image: url(/img/env${envIdx}.jpg)`);
});

nextEnvBtn.addEventListener("click", () => {
	if (envIdx === envs.length - 1) {
		envIdx = 0;
	} else {
		envIdx++;
	}

	levelImageElement.setAttribute('style', `background-image: url(/img/env${envIdx}.jpg)`);
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
	APPLE : 0,
	OUTFIT: 2,
	LEVEL: 1,
	GAMEPLAY: 3,
	GAMEOVER: 4
}
let currentScene = SCENE.APPLE;
let currentScore = 0;
let gameTime = 0;

getCubeMapTexture();
setupForScene(currentScene);

function getCubeMapTexture() {
	let OurRGBELoader = new THREE.RGBELoader()
		.setDataType(THREE.UnsignedByteType)
		.load('/assets/hdr/venice_sunset_1k.hdr', texture => {

			const envMap = pmremGenerator.fromEquirectangular(texture).texture;
			pmremGenerator.dispose();
			//   resolve( { envMap } );
			scene.environment = envMap;
		});
}

function SetUpDefaultEnvProps(baseSpawner) {
    scene.fog = new THREE.FogExp2('#f0d3fd', 0.02);
    scene.fog.far = 200;
    materialArray.forEach(mat => {
        mat.color = new THREE.Color('#dfa6fb');
    });
}

function setupForScene(scene) {
	switch (scene) {
		case SCENE.APPLE: {
			camera.position.set(-100, 1., 2.6)
			break;
		}
		case SCENE.OUTFIT: {
			current_animation = animations.IDLE;
			HardResetAnimsToIdle();
			avatar.position.set(200, 0, 0)
			avatar.rotation.y = 0;
			camera.position.set(200, 1., 2.6)
			SetUpDefaultEnvProps();
			break;
		}
		case SCENE.LEVEL: {
			camera.position.set(-100, 1., 2.6)
			break;
		}
		case SCENE.GAMEPLAY: {
			current_animation = animations.PUSH;
			sceneTitle.hidden = true;
			scoreWrapElement.hidden = false;
			envController.InitTilesWithSpawnedObjects();
			avatar.position.set(0, -1, .1)
			avatar.rotation.y = Math.PI;
			camera.position.set(0, 1.4, 4.6)
			currentScore = 0;
			sceneTitle.innerHTML = "score: " + Math.floor(currentScore);
			scoreElement.innerHTML = "score: " + Math.floor(currentScore);
			leaderboardScoreElement.innerHTML = "score: " + Math.floor(currentScore);
			current_lane = lanes.MIDDLE;
			gameTime = 0;
			break;
		}
		case SCENE.GAMEOVER: {
			current_animation = animations.IDLE;
			HardResetAnimsToIdle();
			let key = isTouchDevice ? "touch" : "press space";
			scoreWrapElement.hidden = true;
			sceneTitle.hidden = false;
			sceneTitle.innerHTML = "score: " + Math.floor(currentScore) + "<br>" + key + " to skate a new location</br>";
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
			break;
		}
		case SCENE.GAMEPLAY: {
			envController.Reset();
			break;
		}
		case SCENE.GAMEOVER: {
			break;
		}
	}
}

function initFall() {
	current_animation = animations.FALL;
	boy_actions[animations.FALL].reset()
	boy_actions[animations.FALL].setDuration(3)
	boy_actions[animations.FALL].time = 0.7;

	/**
	 * ajex request to post score
	 */
	fetch(`${window.env.api}/score?token=${window.purpose_session.token}`, {
		method: 'POST',
		headers: {
			'content-type': 'application/json'
		},
		body: JSON.stringify({
			score: Math.floor(currentScore)
		})
	})
	.then(res => res.json())
	.then(res => console.log('posted the score',res));

	setTimeout(function () {
		clearScene(currentScene);
		currentScene = SCENE.GAMEOVER;
		setupForScene(currentScene);
	}, 1500);
}

// Ian added this and the if check in the below function to get a temp falling animation and environment movement pause before going to game over state
// <<<<<<< HEAD
// function updateForScene(scene) {
// 	let dt = 0.03
// =======
function updateForScene(scene, dt) {
	dt *= 1.5;

	switch (scene) {
		case SCENE.OUTFIT: {
			break;
		}
		case SCENE.GAMEPLAY: {
			gameTime += dt;
			playerMovementUpdate(dt);
			//envspeed moves up 1 every 20 seconds, from 3 to 7
			let envSpeed = (current_animation == animations.FALL) ? 0 : 3 + Math.min(gameTime / 20, 4);
			envController.EnvUpdate(envSpeed * dt);
			currentScore += envSpeed * dt / 3;
			scoreElement.innerHTML = "score: " + Math.floor(currentScore);
			leaderboardScoreElement.innerHTML = "score: " + Math.floor(currentScore);
			// coin collision check
			let col = envController.CollisionCheck("Coin", new THREE.Vector3(0, 0, -1), new THREE.Vector3(0, 0.5, -0.2));
			if (col[0]) {
				currentScore += 5;
			}
			let bCol = envController.CollisionCheck("Coin", new THREE.Vector3(0, 0, -1), new THREE.Vector3(0, 0.1, -0.2));
			if (bCol[0]) {
				currentScore += 5;
			}
			//forward, left and right collision checks. break early if one succeeds
			if(current_animation == animations.FALL) {
				break;
			}
			let fCol = envController.CollisionCheck("Obstacle", new THREE.Vector3(0, 0, -1), new THREE.Vector3(0, 0.1, -0.2))
			if (fCol[0] && fCol[1] < 0.1) {
				initFall();
				break;
			}
			let lCol = envController.CollisionCheck("Obstacle", new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 0.1, -0.2))
			if (lCol[0] && lCol[1] < 0.2) {
				initFall();
				break;
			}
			let rCol = envController.CollisionCheck("Obstacle", new THREE.Vector3(-1, 0, 0), new THREE.Vector3(0, 0.1, -0.2))
			if (rCol[0] && rCol[1] < 0.2) {
				initFall();
				break;
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
// let stats = new Stats();
// stats.showPanel(0);
// document.getElementById('stats').appendChild(stats.domElement);
let clock = new THREE.Clock();
/**
 * RENDER
 */
function render() {
	if(paused) return;

	requestAnimationFrame(render);
	// stats.begin();

	// Used with light select layers
	// renderer.autoClear = true;
	// camera.layers.set(0);
	// renderer.render(scene, camera);
	// renderer.autoClear = false;
	// camera.layers.set(1);

	renderer.render(scene, camera);
	let delta = clock.getDelta();
	updateForScene(currentScene, delta)
	// stats.end();
	// composer.render();
}
render();

function togglePause() {
	paused = !paused;

	clock.stop();
	renderLeaderboard()

	if(!paused) {
		leaderboardElement.hidden = true;
		clock.start();
		render();
	} else {
		leaderboardElement.hidden = false;
	}
}

function renderLeaderboard() {
	let str = '';

	if(!window.purpose_session.leaderboard) return;
	window.purpose_session.leaderboard.forEach(v => str += createLbTr(v));

	leaderboardScoresElement.innerHTML = str;
}

function createLbTr(v) {
	return `<tr><td>${v.name}</td><td>${v.score}</td></tr>`
}

/**
 * MOVEMENT CONFIG
 */
let lanes = {
	LEFT: 'LEFT',
	MIDDLE: 'MIDDLE',
	RIGHT: 'RIGHT'
}
let lane_positions = {
	'MIDDLE': 0.0,
	'RIGHT': 2.5,
	'LEFT': - 2.5
}
let camera_positions = {
	'RIGHT': 2.5,
	'MIDDLE': 0.0,
	'LEFT': -2.5
}
let current_lane = lanes.MIDDLE;

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
	if(currentScene === SCENE.GAMEPLAY)
		switch (e.keyCode) {
			case 87:
				movePlayer('UP');
				break;
			case 32:
				movePlayer('UP');
				break;
			case 65:
				movePlayer('LEFT')
				break;
			case 68:
				movePlayer('RIGHT')
				break;
			case 38:
				movePlayer('UP');
				break;
			case 37:
				movePlayer('LEFT')
				break;
			case 39:
				movePlayer('RIGHT')
				break;
		}

	if(currentScene === SCENE.GAMEOVER && e.keyCode === 32) {
		changeUIScene('characterSelect');
		clearScene(currentScene)
		currentScene = SCENE.OUTFIT
		setupForScene(currentScene)
	}
})

/**
 * TOUCH CONTROLS
 */
function is_touch_device4() {
	if ("ontouchstart" in window)
		return true;

	if (window.DocumentTouch && document instanceof DocumentTouch)
		return true;


	return window.matchMedia("(pointer: coarse)").matches;
}
let isTouchDevice = is_touch_device4();

document.addEventListener('touchstart', handleTouchStart, false);
document.addEventListener('touchmove', handleTouchMove, false);
var xDown = null;
var yDown = null;

function handleTouchStart(evt) {
	xDown = evt.touches[0].clientX;
	yDown = evt.touches[0].clientY;
	if (currentScene == SCENE.GAMEOVER) {
		changeUIScene('characterSelect');
		clearScene(currentScene)
		currentScene = SCENE.OUTFIT
		setupForScene(currentScene)
	}
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
			if (current_lane === lanes.LEFT || landed == true) return;
			current_lane = current_lane === lanes.RIGHT ? lanes.MIDDLE : lanes.LEFT;
			current_animation = animations.TURN_LEFT;
			boy_actions[animations.TURN_LEFT].reset()
			boy_actions[animations.TURN_LEFT].time = 0.2;
			break;
		case 'RIGHT':
			if (current_lane === lanes.RIGHT || landed == true) return;
			current_lane = current_lane === lanes.LEFT ? lanes.MIDDLE : lanes.RIGHT;

			current_animation = animations.TURN_RIGHT;
			boy_actions[animations.TURN_RIGHT].reset()
			boy_actions[animations.TURN_RIGHT].time = 0.2;
			break;
	}

}

let landed = false;
let landHeight = 0;
let avatar_land_tween;
let maxPlayerDistanceDelta = 3.5;
let maxCamDistanceDelta = 3.5;

function playerMovementUpdate(dt) {

	//move char towards current lane , unless they are falling 
	if (current_animation !== animations.FALL) {
		let dif = lane_positions[current_lane] - avatar.position.x;
		if (Math.abs(dif) > dt * maxPlayerDistanceDelta) {
			avatar.position.x += Math.sign(dif) * dt * maxPlayerDistanceDelta;
		}
		dif = camera_positions[current_lane] - camera.position.x;
		if (Math.abs(dif) > dt * maxCamDistanceDelta) {
			camera.position.x += Math.sign(dif) * dt * maxCamDistanceDelta;
		}
	}

	if (jumping) {
		jump_time += movementParams.jumpSpeed * dt;
		//while jumping, check if there is a collider underneath 
		// if you are close enough to it, land
		if (!landed) {
			let c = envController.CollisionCheck("Jump", new THREE.Vector3(0, -1, 0), new THREE.Vector3(0, 0.1, -0.2));
			//this is set up to only work with the grind pipe
			if (c[0] && c[1] < 0.5) {
				landed = true;
				if (current_animation !== animations.FALL) {
					current_animation = animations.TURN_RIGHT;
					boy_actions[animations.TURN_RIGHT].reset()
					boy_actions[animations.TURN_RIGHT].setDuration(2.5)
					boy_actions[animations.TURN_RIGHT].time = 0.2;
				}
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
		let c = envController.CollisionCheck("Jump", new THREE.Vector3(0, -1, 0), new THREE.Vector3(0, 0.1, -0.2));
		if (!c[0]) {
			avatar_land_tween = new TWEEN(avatar.position);
			avatar_land_tween.to({ y: -1 }, 100);
			avatar_land_tween.start();
			landed = false
			if (current_animation !== animations.FALL) {
				current_animation = animations.PUSH;
				// for some reason, when I set the turn right duration longer for grinding it also affects turning right when NOT jumping. 
				//So I'm trying to reset the duration back to 1 when not grinding
				boy_actions[animations.TURN_RIGHT].setDuration(1.4)
			}
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

function HardResetAnimsToIdle() {
	for (let i = 0; i < boy_actions.length; i++) {
		if (i == animations.IDLE) {
			boy_actions[i].setEffectiveWeight(1.0)
		} else {
			boy_actions[i].setEffectiveWeight(0.0)
		}
	}
}

window.addEventListener( 'resize', onWindowResize, false );

function onWindowResize(){

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );

}