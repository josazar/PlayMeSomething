/**
 * Note
 * S'affichant de droite à gauche
 *
 */
class Note {
	constructor(pos, note_time, note_length, note_id) {
		// la note est comme un ennemi de jeux vidéo elle a une vie
		this.wasHit = false;
		this.time = note_time;
		// Par défaut une note s'affichera sur un BPM de 120, une noire = 500ms, on définit donc une largeur par défaut :
		this._noireWidth = 80;
		// note_length : valeur du fichier JSON où 500 correspond à une noire
		this.myWidth = (this._noireWidth * note_length) / 500;
		this.velocity = createVector(0, 0);
		this.position = createVector(pos.x, pos.y);
		this.color = color(
			"rgb(" +
				palette[Math.round(getRandomArbitrary(0, palette.length - 1))] +
				")"
		);
		this.textLife = 50;
		this.textPosY = pos.y;
		this.name = notesFreq[note_id].name;
		this.noteID = note_id;
		this.triggerSound = false;
	}

	update(parentPosX) {
		this.position.x = this.getRelativePosX() + parentPosX;
		this.position.add(this.velocity);

		if (
			GAME.mode == "audioToMidi" &&
			this.position.x < CONF.cursorX + 10 &&
			!this.triggerSound
		) {
			this.playSound(this.noteID);
			this.triggerSound = true;
			this.hit();
			console.log(this.name);
		}
	}

	draw() {
		noStroke();
		fill(this.color);
		rect(this.position.x, this.position.y - 10, this.myWidth, 20, 5);

		// le nom de la note
		if (CONF.notes.showText && this.wasHit && this.textLife > 0) {
			this.textLife--;
			textSize(26);
			text(this.name, this.position.x + 30, this.textPosY - 30);
		}
	}

	isClose(pos, diff) {
		return (
			abs(pos.x - this.position.x) < diff && abs(pos.y - this.position.y) < diff
		);
	}

	hit() {
		let easeValue = { y: 0.5, alpha: 255 };
		let _this = this;
		gsap.to(easeValue, 0.5, {
			ease: Sine.easeInOut,
			y: 0,
			alpha: 0,
			onUpdate: function() {
				_this.velocity.add(0, easeValue.y);
				_this.color.setAlpha(easeValue.alpha);
			}
		});
		this.wasHit = true;
	}

	getRelativePosX() {
		// référence de noire (500) = 100px
		let dist = (100 * this.time) / 500;
		return dist;
	}

	playSound(noteid) {
		// ToneConf.synth.triggerAttackRelease(noteid, '2n')
		ToneConf.piano.volume.value = -3;
		ToneConf.piano.triggerAttackRelease(noteid, "1n");
	}
	stopSound() {
		ToneConf.synth.triggerRelease();
	}
}
