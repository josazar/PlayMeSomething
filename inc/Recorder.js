/**
 * TODO:
 *
 * |_|  Signal en input
 * |_|  Enregistrer la note uniquement si le volume en input est assez élevé , nous permettant de créer des silences. Car actuellement le signal d'entrée nous sorts w<
 * |_|  ML5 mic.stream voir le volume
 * |_|
 * |_|
 * |_|
 * |_|
 * |_|
 * |_|
 */

class Recorder {
	constructor(timeline) {
		this.inputSignalAmp = 0;
		this.timeline = timeline;
		this.isRecording = false;

		// Record Mode properties
		this.rec_PreviousNoteId = "";
		this.rec_CurrentNoteId = "";
		this.rec_CurrentLength = 0;
		this.rec_CurrentTimeStart = 0;
		this.rec_MainStartTime = 0;
		this.rec_nbFrameCurrent = 0;
		this.rec_newPass = true;
	}

	update() {
		if (this.isRecording) {
			this.recording();
		}
	}

	recording() {
		// on sauvegarde les notes et on les ajoute à this.timeline.notesJSON
		// on regarde la ligne Note la plus proche du curseur, et on l'enregistre si elle est la m^me au moins pendant 10 frame (pour éviter les artefacts)

		if (!_NOFREQ) {
			this.rec_CurrentNoteId = closestNote(_FREQ);
		} else {
			// TODO: créer un Silence
		}
		// on enregistre une note uniquement si elle est présente 5 frameq de suite pour éviter les sauts/bugs
		// Si même note que la frame précédente
		if (this.rec_CurrentNoteId == this.rec_PreviousNoteId && !_NOFREQ) {
			this.rec_nbFrameCurrent++;

			// si Nb Frame > 7 et que la nouvelle note est différente de la précédente alors on peut dire que c'est une nouvelle note constante
			if (this.rec_nbFrameCurrent > 5) {
				console.log(this.rec_CurrentNoteId);
				// et on save le time Start
				if (this.rec_newPass) {
					this.rec_newPass = false;
					this.rec_CurrentTimeStart = millis() - this.rec_MainStartTime;
					let noteObj = {
						id: this.rec_CurrentNoteId,
						time: this.rec_CurrentTimeStart / 1.35,
						length: 500
					};
					this.timeline.notesJSON.push(noteObj);
					// test de jouer un son en même temps :
					//ToneConf.piano.triggerAttack(this.rec_CurrentNoteId);
				}
			}
		} else {
			this.rec_nbFrameCurrent = 0;
			this.rec_newPass = true;
		}

		this.rec_PreviousNoteId = this.rec_CurrentNoteId;
	}

	startRecording() {
		this.stopRecording();

		this.isRecording = true;

		this.timeline.stop();
		this.timeline.notesJSON.length = this.timeline.notes = 0;
		this.rec_MainStartTime = millis();
	}

	stopRecording() {
		this.isRecording = false;

		this.rec_PreviousNoteId = "";
		this.rec_CurrentNoteId = "";
		this.rec_CurrentLength = 0;
		this.rec_CurrentTimeStart = 0;
		this.rec_MainStartTime = 0;
		this.rec_nbFrameCurrent = 0;
		this.rec_newPass = true;
	}
}
