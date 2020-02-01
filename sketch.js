// Day 192
//
// Duplicated and transformed from :
// Daniel Shiffman
// https://thecodingtrain.com/CodingChallenges/151-ukulele-tuner.html

// ML
const model_url =
	"https://cdn.jsdelivr.net/gh/ml5js/ml5-data-and-models/models/pitch-detection/crepe/";
let pitch;
let mic;
let _FREQ = 220;
let _NOFREQ = true;
let freqsY = [];

// CONF
const CONF = {
	stepX: 2,
	lowFreq: 110,
	highFreq: 500,
	lines: false,
	modePlay: false,
	listening: false,
	FxTracerType: 1, // 0: Particles / 1: RayTracer  / 2: Ligne
	autoplay: true,
	notes: {
		showText: true
	}
};
const notesFreq = {
	// octave 2
	C2: { freq: "130.81", name: "C" }, // Do
	Db2: { freq: "138.59", name: "Db" },
	D2: { freq: "146.83", name: "D" }, // Ré
	Eb2: { freq: "155.56", name: "Eb" },
	E2: { freq: "164.81", name: "E" },
	F2: { freq: "174.61", name: "F" }, // Fa
	Gb2: { freq: "185", name: "Gb" },
	G2: { freq: "196", name: "G" },
	Ab2: { freq: "207.65", name: "Ab" },
	A2: { freq: "220", name: "A" },
	Bb2: { freq: "233.08", name: "Bb" },
	B2: { freq: "246.94", name: "B" },
	// octave 3
	C3: { freq: "261.63", name: "C" },
	Db3: { freq: "277.18", name: "Db" },
	D3: { freq: "293.66", name: "D" },
	Eb3: { freq: "311.13", name: "Eb" },
	E3: { freq: "329.63", name: "E" },
	F3: { freq: "349.23", name: "F" },
	Gb3: { freq: "369.99", name: "Gb" },
	G3: { freq: "392", name: "G" },
	Ab3: { freq: "415.3", name: "Ab" },
	A3: { freq: "440", name: "A" },
	Bb3: { freq: "466.16", name: "Bb" },
	B3: { freq: "493.88", name: "B" }
};
const palette = [
	"142,126,165",
	"152,135,180",
	"124,98,169",
	"136,99,153",
	"132,95,149",
	"119,101,143",
	"163,101,152",
	"157,71,134",
	"152,36,99"
];
// Tone

const ToneConf = {
	// init tone js et ses instruments
	synth: new Tone.AMSynth().toMaster(),
	piano: new Tone.Sampler(
		{
			C2: "C2.[mp3|ogg]",
			"D#2": "Ds2.[mp3|ogg]",
			"F#2": "Fs2.[mp3|ogg]",
			A2: "A2.[mp3|ogg]",
			C3: "C3.[mp3|ogg]",
			"D#3": "Ds3.[mp3|ogg]",
			"F#3": "Fs3.[mp3|ogg]",
			A3: "A3.[mp3|ogg]",
			C4: "C4.[mp3|ogg]",
			"D#4": "Ds4.[mp3|ogg]",
			"F#4": "Fs4.[mp3|ogg]",
			A4: "A4.[mp3|ogg]"
		},
		function() {
			//sampler will repitch the closest sample
			console.log("Sampler Piano Loaded !");
		},
		"/audio/piano/"
	).toMaster()
};

// Particules System
let ps;
// RayTracer System
let rayTracer;
// Attributs du jeu
let GAME = new Game();

//HTML Elements
// P
let pGamePts;
let pBPM;

// inGame buttons
let stopBtn;
let pauseBtn;
let playBtn;
let recordBtn;
let lineBtn;

// Main nav
let startBtn;
let audioToMidiBtn;
let backHomeBTn;

// Partitions Timeline
const lineNotes = [];
let mainTimeLine;
let mainRecorder;
// let state = 'stop';
let songCurrentTime = 0;
let notesObj = [];
let songJSON;
let body;

function setup() {
	console.log("🔔 A pitch detection experimentation by Joseph AZAR");
	//createCanvas(CONF.canvasW, windowHeight);

	createCanvas(windowWidth, windowHeight);
	audioContext = getAudioContext();
	CONF.cursorX = width / 2;
	// ** PAGE ACCUEIL **
	// chargement du JSON
	// JSON
	let request = new XMLHttpRequest();
	request.open("GET", "song-notes.json");
	request.responseType = "json";
	request.send();
	request.onload = function() {
		console.log("JSON loaded");
		songJSON = request.response;
		// on charge la page d'ACCUEIL:
		initHome();
	};
}

/**********************/
/** BOUCLE PRINCIPALE */
/**********************/
function draw() {
	background("#352f3b");

	if (GAME.currentView === "inGame") {
		drawInGame();
	}
}

// Permet le fonctionnement de la WebAudio API dans chrome et donc android
function touchStarted() {
	if (getAudioContext().state !== "running") {
		getAudioContext().resume();
	}
}

function initHome() {
	body = select("body");
	body.addClass("home");

	// Titre
	let title = createElement("h1", "Play me Something!");
	title.class("main-title");
	title.parent("mainUI");
	// texte d'explication du jeu et crédits.
	let pHome = createP(songJSON.description_home);
	pHome.class("home-description");
	pHome.parent("mainUI");

	if (CONF.modePlay) {
		// bouton PLAY
		playBtn = createButton("PLAY");
		playBtn.parent("mainUI");
		playBtn.class("ui-bt-play");
		playBtn.mousePressed(() => {
			// TODO: faire un process pour switcher entre les vues, en temporaire :
			GAME.mode = "play";
			initGame(GAME.mode);
		});
	}
	// bouton Recod Audio To audioToMidiBtn
	audioToMidiBtn = createButton("START");
	audioToMidiBtn.parent("mainUI");
	audioToMidiBtn.class("ui-bt-audioToMidi");
	audioToMidiBtn.mousePressed(() => {
		GAME.mode = "audioToMidi";
		initGame(GAME.mode);
		body.addClass("record-mode");
	});
}

function initGame(gameMode) {
	// on écoute le signal audio du micro
	if (CONF.listening && !mic) {
		mic = new p5.AudioIn();
		mic.start(listening);
		// on sort du code, c'est la function getPitch qui va lancer le jeu une fois que le model esr chargé.

		return;
	}

	// on enleve la class 'home' du body.
	body.removeClass("home");
	body.addClass("inGame");
	if (!mainTimeLine) {
		mainTimeLine = new Timeline(width);
		mainRecorder = new Recorder(mainTimeLine);
	}
	if (gameMode === "audioToMidi") {
		mainTimeLine.notesJSON = []; // on ne lui donne aucune notes de mélodie c'est l'utilisatuer qui va enregistrer ses notes
	} else {
		mainTimeLine.notesJSON = songJSON.notes;
	}

	// init Tableau de fréquences pour le tracé qui dessine la fréquence courante
	freqsY.length = 0;
	for (let i = 0; i < width / 2 + CONF.stepX; i += CONF.stepX) {
		freqsY.push(0);
	}

	// init le particules system
	ps = new ParticleSystem(width / 2, height / 2);

	// init l'effet de tracé 'sonore'
	rayTracer = new RayTracerSystem(width / 2, height / 2);

	// Init des lignes de notes
	lineNotes.length = 0;
	for (let [key, value] of Object.entries(notesFreq)) {
		let freq = map(value.freq, CONF.lowFreq, CONF.highFreq, height, 0);
		lineNotes.push(new LineNote(value.freq, key, freq));
	}

	// INTERFACE
	textAlign(CENTER);
	// UI - boutons ...
	if (!startBtn) {
		startBtn = createButton("START");
		startBtn.class("ui-bt-start");
		startBtn.parent("mainUI");
		startBtn.mousePressed(() => {
			mainTimeLine.start();
			startBtn.addClass("active");
			if (GAME.mode == "audioToMidi") {
				recordBtn.removeClass("active");
				mainRecorder.stopRecording();
			}
		});

		stopBtn = createButton("STOP");
		stopBtn.class("ui-bt-stop");
		stopBtn.parent("mainUI");
		stopBtn.mousePressed(() => {
			mainTimeLine.stop();
			// stop the recorder
			startBtn.removeClass("active");
			if (GAME.mode == "audioToMidi") {
				recordBtn.removeClass("active");
				mainRecorder.stopRecording();
			}
			GAME.reset();
		});

		backHomeBtn = createButton("BACK");
		backHomeBtn.parent("mainUI");
		backHomeBtn.class("ui-bt-back");
		backHomeBtn.mousePressed(() => {
			closeGame();
		});

		lineBtn = createButton("Fqz");
		lineBtn.parent("mainUI");
		lineBtn.class("ui-bt-trigger bt-lines");
		lineBtn.mousePressed(() => {
			if (CONF.lines) CONF.lines = false;
			else CONF.lines = true;
		});
		/*pGamePts = createP("0");
		pGamePts.class("game-points");
		pGamePts.parent("mainUI");*/
		pBPM = createP("0");
		pBPM.class("p-bpm");
		pBPM.parent("mainUI");

		// Timer
		GAME.timer = new Timer();
	}
	if (gameMode === "audioToMidi" && !recordBtn) {
		recordBtn = createButton("RECORD");
		recordBtn.class("ui-bt-record");
		recordBtn.parent("mainUI");
		recordBtn.mousePressed(() => {
			// TODO: créer onComplete function sur le timer
			GAME.timer.start();
			// startBtn.removeClass("active");
			// recordBtn.addClass("active");
			// mainRecorder.startRecording();
		});
	}

	// On affiche la vue 'inGame'
	GAME.currentView = "inGame";
	// on lance le timer
	if (GAME.mode == "play") GAME.timer.start();
}

/** CLOSE VIEW */

// on désactive l'écoute et on reset tout
function closeGame() {
	GAME.currentView = "home";
	body.addClass("home");
	body.removeClass("inGame");
	body.removeClass("record-mode");
	if (CONF.listening) {
		//mic.stop();
	}
	mainTimeLine.stop();
	mainRecorder.stopRecording();
	startBtn.removeClass("active");
	GAME.reset();
}

function drawInGame() {
	mainTimeLine.update();
	// Affiche la fréquences en cours
	noStroke();
	fill(255);
	// MAPPAGE Des Fréquences sur la hauteur du Canvas
	let currentFreqPosY = getPosYFromFreq(_FREQ.toFixed(2));

	// Tracer FX
	if (CONF.FxTracerType == 0) drawParticules(currentFreqPosY);
	if (CONF.FxTracerType == 2) drawTuneLine(freqsY, currentFreqPosY);
	if (CONF.FxTracerType == 1) drawFxTracer(currentFreqPosY);

	// ligne vertical de lecture
	stroke("#d276a5");
	noFill();
	strokeWeight(1);
	drawingContext.setLineDash([5, 15]);
	line(CONF.cursorX, 0, CONF.cursorX, height);
	drawingContext.setLineDash([]);
	// Lignes Horizontales des notes
	if (CONF.lines) {
		for (let line of lineNotes) {
			line.draw();
			if (line.isFocus(_FREQ)) {
				// modif sur la ligne
				line.setOn();
			} else {
				line.setOff();
			}
		}
	}

	if (GAME.mode === "audioToMidi") {
		mainRecorder.update();
	}
	// show BPM
	pBPM.html(mainTimeLine.BPM + " BPM");
	// Controles de la TimeLine
	if (mainTimeLine.state === "play") {
		// Affichage de la Timeline
		mainTimeLine.draw();
		// on test si proche d'une note
		for (let i = 0; i < mainTimeLine.notes.length; i++) {
			let currentNote = mainTimeLine.notes[i];
			if (
				currentNote.isClose({ x: CONF.cursorX, y: currentFreqPosY }, 10) &&
				!currentNote.wasHit
			) {
				currentNote.hit();
				GAME.addPoint();
				gsap.fromTo(
					".game-points",
					{
						scale: 5
					},
					{
						duration: 0.5,
						scale: 1,
						ease: "power1.inOut"
					}
				);
			}
		}
	}

	// INTERFACE
	// Points
	//pGamePts.html(GAME.pts);

	// Entrée du micro
	if (mic) drawInputVolume();
}

function drawInputVolume() {
	let inputLevel = mic.getLevel();
	let h = 50;
	let w = 10;
	let left = width - 3 * w;
	let maxInputLevel = 0.5;

	stroke(255, 255, 255, 125);
	strokeWeight(1);
	noFill();
	rectMode(CORNER);
	rect(left, 2 * w, w, h);

	let inputHeight = map(inputLevel, 0, maxInputLevel, 0, h);
	noStroke();
	fill(255);
	rect(left, h + 2 * w - inputHeight, w, inputHeight);
}

function drawFxTracer(posY) {
	rayTracer.x = CONF.cursorX;
	rayTracer.y = posY;
	rayTracer.addRayTracer();
	rayTracer.run();
}

function drawParticules(posY) {
	ps.x = CONF.cursorX;
	ps.y = posY;
	ps.addParticles();
	ps.run();
}
function drawTuneLine(frequenciesArr, currentFreq) {
	stroke("#d276a5");
	noFill();
	strokeWeight(1);
	beginShape();
	for (let i = 0; i < frequenciesArr.length; i++) {
		vertex(i * CONF.stepX, frequenciesArr[i]);
		// on décale chaque valeur du tableau vers l'index inférieur et la derniere est la valeur actuelle
		if (i > 0) {
			frequenciesArr[i - 1] = frequenciesArr[i];
		}
	}
	frequenciesArr[frequenciesArr.length - 1] = currentFreq;
	endShape();
}

function windowResized() {
	// if (CONF.canvasW < windowWidth) resizeCanvas(CONF.canvasW, windowHeight);
	resizeCanvas(windowWidth, windowHeight);

	CONF.cursorX = width / 2;
	if (mainTimeLine) {
		mainTimeLine.starterPos = width;
	}
}

/** UTILS **/
function listening() {
	console.log("listening");
	if (!pitch)
		pitch = ml5.pitchDetection(
			model_url,
			audioContext,
			mic.stream,
			modelLoaded
		);
}
function modelLoaded() {
	console.log("model loaded");
	pitch.getPitch(gotPitch);
	console.log("Starting Game...");
	initGame(GAME.mode);
}

/**
 * Dés que le Model génére du contenu : il va prédire la fréquence en cours
 * @param {*} error
 * @param {*} frequency
 */
function gotPitch(error, frequency) {
	if (error) {
		console.error(error);
	} else {
		if (frequency && mic.getLevel() > 0.01) {
			_NOFREQ = false;
			_FREQ = frequency;
		} else {
			_NOFREQ = true;
		}
		pitch.getPitch(gotPitch);
	}
}
function getPosYFromFreq(freq) {
	return map(freq, CONF.lowFreq, CONF.highFreq, height, 0);
}
