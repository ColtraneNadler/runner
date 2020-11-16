let authorized = false;
let play_btn = document.getElementById('play_btn');
let time = 30;
let apple_player;
let playing = false; 
let wrapper = document.getElementById('wrapper');

fetch('http://localhost:4000/token')
.then(res => res.json())
.then(res => registerApple(res.token))

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

/**
 * METHOD authorize()
 * Authorize Apple Music user
 */
async function authorize() {
	authorized = await apple_player.authorize();
	playAudio(apple_id);
	wrapper.hidden = true;
}

/**
 * METHOD playAudio
 * play an apple music song through msic kit
 */
async function playAudio() {
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
}