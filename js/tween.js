/**
 * TWEEN CLASS
 * something is wrong here
 */
class TWEEN {
	constructor(ref) {
		// time constants
		this.STEP = 10;
		this.STEPS = 0;
		this.TIME = 0;

		this.START_TIME = 0;

		// value maps
		this.ref = ref;
		this.diffs = {};
		this.finals = {};

		// 
		this.stopped = false;
	}

	to(opts, ms) {
		// total time for this tween
		this.TIME = ms;

		// number of steps
		this.STEPS = this.TIME / this.STEP;

		this.finals = opts;

		for (let prop in opts) {
			// assign increments for each prop
			let diff = opts[prop] - this.ref[prop];
			this.diffs[prop] = diff;
		}
	}

	start() {
		this.START_TIME = Date.now()
		this.run();
	}

	run() {
		if (!this.stopped) {
			let updated = true;
			for (let j in this.finals) {
				if (this.diffs[j] > 0 && this.ref[j] >= this.finals[j])
					this.ref[j] = this.finals[j]
				else if (this.diffs[j] < 0 && this.ref[j] <= this.finals[j])
					this.ref[j] = this.finals[j]
				else if (this.diffs[j] > 0 && this.ref[j] < this.finals[j])
					updated = false;
				else if (this.diffs[j] < 0 && this.ref[j] > this.finals[j])
					updated = false;
			}

			if (updated && Date.now() - this.START_TIME > this.TIME)
				this.stopped = true;
			if (!this.stopped)
				setTimeout(this.run.bind(this), this.STEP);
			// number of steps
			for (let prop in this.diffs)
				this.ref[prop] += this.diffs[prop] / this.STEPS;
		}
	}

	stop() {
		this.stopped = true;
	}
}