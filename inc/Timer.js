/**
 * Affiche un décompte avant le départ
 */

class Timer {
	constructor() {
		this.elDOM = this.createDOM();
		this.startNum = 3;
		this.bpm = 120;
		this.isON = false;
	}

	start() {
		this.elDOM.addClass("active");
		this.elDOM.html(this.startNum);
		this.isON = true;
		// on lance la Timeline GSAP
		this.decrease();
	}

	reset() {
		this.elDOM.removeClass("active");
		this.startNum = 3;
	}

	decrease() {
		let _this = this;
		gsap
			.fromTo(
				".game-timer",
				{
					scale: 5,
					opacity: 1
				},
				{
					duration: 0.5,
					opacity: 0,
					scale: 1,
					ease: "power1.inOut",
					onRepeat: function() {
						_this.startNum--;
						if (_this.startNum == 0) {
							_this.elDOM.html("GO!");
						} else _this.elDOM.html(_this.startNum);
					},
					onComplete: function() {
						_this.reset();
						if (CONF.autoplay && GAME.mode == "play") {
							mainTimeLine.start();
							startBtn.addClass("active");
						}
						if (CONF.autoplay && GAME.mode == "audioToMidi") {
							startBtn.removeClass("active");
							recordBtn.addClass("active");
							mainRecorder.startRecording();
						}
					}
				}
			)
			.repeat(3);
	}

	onComplete() {
		this.elDOM.removeClass("active");
		this.isON = false;
	}

	playSound() {}

	createDOM() {
		let p = createP(this.startNum);
		p.class("game-timer");
		p.parent("mainUI");

		return p;
	}
}
