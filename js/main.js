let authorized = false;
let play_btn = document.getElementById('play_btn');
let time = 30;
let apple_player;
let playing = false; 
let wrapper = document.getElementById('wrapper');
let nameInput = document.getElementById('name-input');

/**
 * get cookie
 */
function getCookie(name) {
  // Split cookie string and get all individual name=value pairs in an array
  var cookieArr = document.cookie.split(";");
  
  // Loop through the array elements
  for(var i = 0; i < cookieArr.length; i++) {
      var cookiePair = cookieArr[i].split("=");
      
      /* Removing whitespace at the beginning of the cookie name
      and compare it with the given string */
      if(name == cookiePair[0].trim()) {
          // Decode the cookie value and return
          return decodeURIComponent(cookiePair[1]);
      }
  }
  
  // Return null if not found
  return null;
}
/**
 * INIT
 */
// let cookie = getCookie('p2.session');
// if(cookie) {
// 	fetch(`${env.api}/session?token=${cookie}`)
// 	.then(res => res.json())
// 	.then(res => {
// 		if(!res.success) return;

// 		switch(res.dsp) {
// 			case 'spotify':
// 				// do spotify stuff
// 				document.cookie = `p2.session=${res.token}`;
// 				break;
// 			case 'apple':
// 				window.p2data = {
// 					name: res.name,
// 					high_score: res.high_score
// 				}
// 				// do apple stuff
// 				document.cookie = `p2.session=${res.token}`;
// 				break;
// 		}
// 	})
// }

fetch(`${env.api}/token`)
.then(res => res.json())
.then(res => registerApple(res.token))


let scenes = {
	landing: document.getElementById('landing'),
	name: document.getElementById('name'),
	characterSelect: document.getElementById('character-select'),
	levelSelect: document.getElementById('level-select'),
	game: document.getElementById('game'),
}

function changeUIScene(scene) {
	for(prop in scenes) {
		if(scene === prop)
			scenes[prop].hidden = false;
		else
			scenes[prop].hidden = true;
	}
}

function auth() {
	changeUIScene('name');
}

function submitName() {
	console.log(`the name is ${nameInput.value}`);

	if(nameInput.value.length === 0)
		return alert('You must enter a name!');
	if(nameInput.value.length > 13)
		return alert('Name must be shorter than 13 characters!');

	fetch(`${window.env.api}/name`, {
		method: 'POST',
		headers: {
			'content-type': 'application/json'
		},
		body: JSON.stringify({
			name: nameInput.value,
			...window.purpose_session
		})
	})
	.then(res => res.json())
	.then(res => {
		window.purpose_session.token = res.token;
		window.purpose_session.user = res.user;

		changeUIScene('characterSelect');
		changeGameScene(SCENE.OUTFIT);
	});
}

function selectCharacter() {
	changeUIScene('levelSelect');
	changeGameScene(SCENE.LEVEL);

	// get leaderboards
	fetch(`${window.env.api}/leaderboards`)
	.then(res => res.json())
	.then(res => {
		console.log('got the leaderboard',res)
		window.purpose_session.leaderboard = res
	});
}

function selectLevel() {
	setLevel(1);
	changeUIScene('game');
	changeGameScene(SCENE.GAMEPLAY);
	// playAudio(apple_id);
}

function registerApple(token) {
	document.addEventListener('musickitloaded', function() {
		MusicKit.configure({
			developerToken: token,
			app: {
				name: 'bieber - runner',
				build: '0.5'
			}
		});

		apple_player = MusicKit.getInstance();

		apple_player.addEventListener('playbackStateDidChange', async e => {
			console.log(e.state,e);
			if(e.state !== 2 || playing) return;

			// playing
			playing = true;
			// startGame()
		})
	});

	// append music kit
	let tag = document.createElement("script");
	tag.src = 'https://js-cdn.music.apple.com/musickit/v1/musickit.js';
	document.getElementsByTagName("head")[0].appendChild(tag);
}

// sorry (j balvin remix)
let apple_id = '1444617719'

async function authNext() {
	changeUIScene('name');
}

/**
 * METHOD authorize()
 * Authorize Apple Music user
 */
async function authApple() {
	authorized = await apple_player.authorize();
	window.purpose_session = {
		dsp: 'apple',
		access_token: authorized
	};

	console.log('authorized!!')
	console.log('changed ui scene!');
	changeUIScene('name');
	// playAudio(apple_id);
	// wrapper.hidden = true;
}

let popup;
console.log('registering callbaasdfasdfck');

window.addEventListener('message', handleMessage, false);

function handleMessage(e) {
	if(!e.data) return;

	let data;
	try {
		data = JSON.parse(e.data);
	} catch(err) {
		return;
	}

	if(!data.access_token) return;

	popup.close();
	initSpotifyWebPlayback(data.access_token, spotify_player => window.spotify_player = spotify_player);
	addScript('https://sdk.scdn.co/spotify-player.js');
	console.log('got the data!',data);


  	window.purpose_session = {
		dsp: 'spotify',
		access_token: data.access_token,
		refresh_token: data.refresh_token,
		token: data.token,
		user: data.user
	};

	if(!data.token)
		return changeUIScene('name');

	changeUIScene('characterSelect');
	changeGameScene(SCENE.OUTFIT);
}


async function authSpotify() {
	popup = window.open(
		`${window.env.api}/oauth/spotify`,
		'Login with Spotify',
		'width=800,height=600'
	)
}

/**
 * METHOD playAudio
 * play an apple music song through msic kit
 */
async function playAudio() {
	console.log('playing audio!')
	switch(window.purpose_session.dsp) {
		case 'apple':
			if(!apple_id) return;
			console.log('playing',apple_id)
			if(!authorized) return authorize(apple_id);

			if(playing) return; // pauseAudio();
			let queue, data, seeked;

			play_btn.innerHTML = 'LOADING...';
			/**
			 * closure variable to make sure listener handle doesnt run twice
			 */
			let triggered = false;

			try {
				await apple_player.setQueue({
			      songs: [apple_id], // queue's last
			    })
			} catch(err) {
				return console.log('ERROR QUEUING',err);
			}

			try {
				data = await apple_player.player.play();
			} catch(err) {
				return console.log('ERROR PLAYING APPLE',err);
			}
			break;
		case 'spotify':
			play({
		      playerInstance: window.spotify_player,
		      spotify_uri: 'spotify:track:09CtPGIpYB4BrO8qb1RGsF',
		      uris: ['spotify:track:09CtPGIpYB4BrO8qb1RGsF'],
		      position_ms: 0
		    })
			break;
	}
}