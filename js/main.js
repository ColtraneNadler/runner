let authorized = false;
let play_btn = document.getElementById('play_btn');
let time = 30;
let apple_player;
let playing = false; 
let wrapper = document.getElementById('wrapper');
let nameInput = document.getElementById('name-input');

let is_mobile = (a => {return !!(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) })(navigator.userAgent||navigator.vendor||window.opera);
let is_safari = /constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || (typeof safari !== 'undefined' && safari.pushNotification));

let web_sdk = !is_mobile && !is_safari;

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
	instagram: document.getElementById('instagram'),
	landing: document.getElementById('landing'),
	syncSpotify: document.getElementById('sync_spotify'),
	name: document.getElementById('name'),
	characterSelect: document.getElementById('character-select'),
	levelSelect: document.getElementById('level-select'),
	game: document.getElementById('game'),
}

/**
 * instagram
 */
if(navigator.userAgent.toLowerCase().indexOf('instagram') > -1)
	changeUIScene('instagram');


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

		document.cookie = `p2.session=${res.token}`;

		if(!window.avatar_loaded)
			console.log('not loaded yet');

		changeUIScene('characterSelect');
		changeGameScene(SCENE.OUTFIT);
	});

	changeUIScene('characterSelect');
	changeGameScene(SCENE.OUTFIT);
}

function selectCharacter() {
	changeUIScene('levelSelect');
	changeGameScene(SCENE.LEVEL);

	// get leaderboards
	fetch(`${window.env.api}/leaderboards`)
	.then(res => res.json())
	.then(res => {
		window.purpose_session.leaderboard = res
	});
}

function selectLevel() {
	setLevel(1);

	console.log('selecting level!', web_sdk)
	if(window.purpose_session.dsp === 'apple' || web_sdk)
		return startGame();

	fetch(`${window.env.api}/playing?accessToken=${window.purpose_session.access_token}`)
	.then(res => res.json())
	.then(res => {
		if(res.playing)
			return startGame();

		window.selected_level = envIdx;
		changeUIScene('syncSpotify');
	});
}

window.onfocus = () => {
	if(!window.selected_level) return;
	fetch(`${window.env.api}/playing?accessToken=${window.purpose_session.access_token}`)
	.then(res => res.json())
	.then(res => {
		if(res.playing)
			return startGame();

		window.selected_level = envIdx;
		changeUIScene('syncSpotify');
	});
}

function startGame() {
	fetch(`${window.env.api}/gt`)
	.then(res => res.json())
	.then(res => {
		window.purpose_session.gt = res.gt;
		changeUIScene('game');
		changeGameScene(SCENE.GAMEPLAY);
	})
	playAudio(envIdx);
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
			// playing = true;
			// startGame()
		})
	});

	// append music kit
	let tag = document.createElement("script");
	tag.src = 'https://js-cdn.music.apple.com/musickit/v1/musickit.js';
	document.getElementsByTagName("head")[0].appendChild(tag);
}

// sorry (j balvin remix)

async function authNext() {
	changeUIScene('name');
}

/**
 * METHOD authorize()
 * Authorize Apple Music user
 */
async function authApple() {
	let cookie = getCookie('p2.session');

	if(cookie) {
		let res = await fetch(`${window.env.api}/session?token=${cookie}`);
		let data = await res.json();

		if(data.success) {
			apple_player.musicUserToken = data.access_token;

			window.purpose_session = {
				dsp: 'apple',
				access_token: data.access_token,
				token: data.token,
				user: data.user
			}

			document.cookie = `p2.session=${data.token}`;
			changeUIScene('characterSelect');
			changeGameScene(SCENE.OUTFIT);
			return
		}
	}

	authorized = await apple_player.authorize();
	window.purpose_session = {
		dsp: 'apple',
		access_token: authorized
	};

	console.log('authorized!!')
	console.log('changed ui scene!');
	changeUIScene('name');
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

	if(web_sdk) {
		initSpotifyWebPlayback(data.access_token, spotify_player => window.spotify_player = spotify_player);
		addScript('https://sdk.scdn.co/spotify-player.js');
	}

  	window.purpose_session = {
		dsp: 'spotify',
		web_sdk,
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

let tracks = {
	0: { sp: 'spotify:track:5u1n1kITHCxxp8twBcZxWy', ap: 1531508507 }, // holy
	1: { sp: 'spotify:track:4y4spB9m0Q6026KfkAvy9Q', ap: 1535542529 }, // lonely
	2: { sp: 'spotify:track:2Z8yfpFX0ZMavHkcIeHiO1', ap: 1541060450 }, // monster

	3: { sp: 'spotify:track:09CtPGIpYB4BrO8qb1RGsF', ap: 1440829610 }, // sorry,
	4: { sp: 'spotify:track:4B0JvthVoAAuygILe3n4Bs', ap: 1440829606 }, // what do u mean
	5: { sp: 'spotify:track:0n8ob8S72lvznoVfiwz4qL', ap: 971262282 }, // where r u now
	6: { sp: 'spotify:track:0SNIAtRCPVVLoGEPcuHSIc', ap: 1440829480 }, // ill show you
	7: { sp: 'spotify:track:2SnNaoNhMjC1WRMTWD8qTX', ap: 1440829467 }, // mark my words
	8: { sp: 'spotify:track:61uyGDPJ06MkxJtHgPmuyO', ap: 1440829617 }, // company
}

/**
 * METHOD playAudio
 * play an apple music song through msic kit
 */
async function playAudio(idx) {
	console.log('playing audio!')
	let track_indexes = Object.keys(tracks);

	let first = tracks[idx];
	track_indexes.splice(idx, 1);

	switch(window.purpose_session.dsp) {
		case 'apple':
			if(playing) return; // pauseAudio();
			let queue, data, seeked;

			play_btn.innerHTML = 'LOADING...';
			/**
			 * closure variable to make sure listener handle doesnt run twice
			 */
			let triggered = false;

			try {
				await apple_player.setQueue({
			      songs: [
			      	first.ap,
			      	...track_indexes.map(i => tracks[i].ap)
			      ], // queue's last
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
			if(web_sdk) {
			  	let uris = [
			      		first.sp,
			      		...track_indexes.map(i => tracks[i].sp)
			      	];

			    console.log('the uris are',uris)

				return play({
			      playerInstance: window.spotify_player,
			      uris
			    })
			}

			fetch(`${window.env.api}/sync?accessToken=${window.purpose_session.access_token}&idx=${idx}`)
			.then(res => res.json())
			.then(res => console.log('got res',res))
			break;
	}
}