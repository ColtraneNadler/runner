let scoreP = document.getElementById('score_p')
	, score = document.getElementById('score')
	, wrapper = document.getElementById('wrapper');

/**
 * SETUP THREE.JS SCENE
 */
let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
scene.fog = new THREE.FogExp2( '#cce6ff', .005 );
renderer = new THREE.WebGLRenderer({alpha:true});//renderer with transparent backdrop
renderer.setClearColor(0xcce6ff, 1);
renderer.setSize( window.innerWidth, window.innerHeight );

let geo = new THREE.BoxGeometry();
let mat = new THREE.MeshBasicMaterial({color: 0x00ff00});
let cube = new THREE.Mesh(geo,mat);

// var controls = new THREE.OrbitControls( camera, renderer.domElement );

// camera.rotation.y = 1.6;
camera.rotation.x = -.14;
camera.position.y = 1.4;
camera.position.x = 0;
camera.position.z = 4.6;

window.camera = camera;

let hemiLight = new THREE.HemisphereLight( 0xffffff, 0x444444 );
hemiLight.position.set( 0, 20, 0 );
scene.add( hemiLight );

let dirLight = new THREE.DirectionalLight( 0xffffff );
dirLight.position.set( 3, 10, 10 );
dirLight.castShadow = true;
dirLight.shadow.camera.top = 2;
dirLight.shadow.camera.bottom = - 2;
dirLight.shadow.camera.left = - 2;
dirLight.shadow.camera.right = 2;
dirLight.shadow.camera.near = 0.1;
dirLight.shadow.camera.far = 40;
scene.add( dirLight );

let loader = new THREE.GLTFLoader();

window.glb;
let collision = [];


let jumping = false
	, jump_time = 0;

/**
 * LOAD SCENE
 */
loader.load( '/assets/env1.glb', function ( glb ) {
	glb.scene.children.forEach(node => {
		node.position.y = -1;

		if(node.name.toLowerCase() === 'ground')
			scene.add( node )
		if(node.name.toLowerCase() === 'ground2')
			scene.add( node )
		if(node.name.toLowerCase() === 'sideground')
			scene.add( node )
	})

	console.log('the world',glb.scene.children);

}, undefined, err => {
	console.error('Error loading scene glb',err);
});


let animations = {
	Ollie: 'Ollie',
	Heelflip: 'Heelflip',
	TurnLeft: 'TurnLeft',
	TurnRight: 'TurnRight',
	Push: 'Push'
}

let current_animation = animations.Push;

/**
 * LOAD AVATAR
 */
let avatar, boy_clips, boy_mixer;

function getAction(action) {
	console.log('getting', action)
	let clip;
	if(boy_clips)
		for(let j = 0; j < boy_clips.length; j++)
			if(boy_clips[j].name !== action)
				continue;
			else
				return boy_mixer.clipAction(boy_clips[j]);
}

loader.load( '/assets/bSkater_CompleteSet_RC1.gltf', function ( glb ) {
	scene.add( glb.scene );
	avatar = glb.scene;

	console.log('loaded!!',glb)


	glb.scene.scale.set( .012, .012, .012 );			   
	glb.scene.position.x = 0;				    
    glb.scene.position.y = -1;				    
	glb.scene.position.z = .1;				    
	
	glb.scene.rotation.y = -3.14;
	avatar = glb.scene;

	// // window.avatar = glb;
	boy_clips = glb.animations;

	// // console.log('the clips',boy_clips)
	boy_mixer = new THREE.AnimationMixer( glb.scene );


	boy_clips.forEach(clip => {
		let action = getAction(clip.name)

		action.enabled = true;
		action.setEffectiveTimeScale( 1 );
		action.setEffectiveWeight( clip.name.toLowerCase() === 'idle' ? 1 : 0 );

		console.log('playing', action)
		action.play()
	})
	getAction(current_animation).play()

}, undefined, err => {
	console.error('Error loading avatar glb',err);
});


let val = 0.01;

/**
 * COLLISION CHECK
 */
function collisionCheck() {
	for(let j = 0; j < collision.length; j++) {
		let mesh = collision[j];

		let {position, scale} = mesh;
		// console.log(position,scale);
		// let v1 = {x: position.x * scale.x, y: , z: }
	}
}

/**
 * RENDER
 */
function render() {
	collisionCheck()
	requestAnimationFrame( render );
	renderer.render( scene, camera );

	if(jumping) {
		let dT = Date.now() - jump_time;
		let nY = avatar.position.y + (dT * -.0025) + .5;
		if(nY <= -1) {
			jumping = false;
			avatar.position.y = -1	
		} else
			avatar.position.y = nY;
	}

	if(boy_mixer)
		boy_mixer.update(.025)

	if(window.glb)
		window.glb.scene.position.x += .4

}

/**
 * START GAME
 */
function startGame() {

	setInterval(() => {
		score.innerHTML = parseInt(score.innerHTML) + 1;
	}, 750)

	// wrapper.remove()
	score_p.hidden = false;
	// wrapper.hidden = true;
	document.body.appendChild( renderer.domElement );
	render();
}

startGame()



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

/**
 * MovePlayer
 * @param dir - ENUM (LEFT, RIGHT, UP, DOWN)
 */
function movePlayer(dir) {
	let startAction, endAction;
	switch(dir) {
		case 'UP':
			if(jumping)
				return;

			jumping = true;
			jump_time = Date.now()
			current_animation = animations.JUMP;
			return;
		case 'DOWN':
			// slide
			break;
		case 'LEFT':
			if(current_lane === lanes.LEFT) return;
				current_lane = current_lane === lanes.RIGHT ? lanes.MIDDLE : lanes.LEFT;
			break;
		case 'RIGHT':
			if(current_lane === lanes.RIGHT) return;
				current_lane = current_lane === lanes.LEFT ? lanes.MIDDLE : lanes.RIGHT;

			current_animation = animations.RIGHT;
			break;
	}

	// ANIMATE
	if(avatar_tween)
		avatar_tween.stop();

	avatar_tween = new TWEEN(avatar.position);
	avatar_tween.to({x: lane_positions[current_lane]}, 120);
	avatar_tween.start();


	if(camera_tween)
		camera_tween.stop();

	camera_tween = new TWEEN(camera.position);
	camera_tween.to({x: camera_positions[current_lane]}, 120);
	camera_tween.start();
}

/**
 * KEYBINDING CONTROLS
 */
window.addEventListener('keydown', e => {
	let pos;
	// to do animate position
	switch(e.keyCode) {
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
    if ( ! xDown || ! yDown ) {
        return;
    }
    var xUp = evt.touches[0].clientX;                                    
    var yUp = evt.touches[0].clientY;
    var xDiff = xDown - xUp;
    var yDiff = yDown - yUp;

    if(Math.abs(xDiff) > Math.abs(yDiff))
        if (xDiff > 0)
        	movePlayer('LEFT');
        else
			movePlayer('RIGHT');  
    else
        if(yDiff > 0)
			movePlayer('UP')
        else
        	console.log('DOWN')

    /* reset values */
    xDown = null;
    yDown = null;                                             
};