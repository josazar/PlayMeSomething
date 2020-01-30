/**
 * TimeLine principal du morceau,
 * Nous sert à : 
 * à afficher les notes 
 * à controller la vitesse
 * 
 * Infos sur BPM : 
 * Exemple pour 120 bpm à la noire.
 * 
Délai entre chaque temps en millisecondes = 60*1000 / bpm = 60000 / 120 = 500 ms
Exemple pour une mesure à 4 temps : durée d'une double.
Délai pour 1/16e de mesure = (60000 / bpm)x4 / 16 = 125ms 

 */


class Timeline {
    /**
     * 
     * @param {int} startPosX Position x de départ par rapport au canvas
     */
    constructor(startPosX) {
        this.position = createVector(0, 0)
        this.starterPos = startPosX;
        this.startTime = 0;
        this.currentTime = 0;
        this.state = 'stop';    // 'play' , 'stop', 'record'
        this.notesJSON = [];
        this.notes = [];
        this.noire_width = 50;
        // Init
        this.inputBPM = this.createInputBPM();        
        this.BPM = this.inputBPM.value();
    }
    /**
     * Dessine les notes 
     */ 
    draw() {
        // Draw the notes
        if (this.notes.length > 0) {
            for(let note of this.notes) {
                note.update(this.position.x);   
                note.draw();       
            }
        }
    }

    // Every Frame update values and datas
    update() {    
        if( this.state == "play" && this.notes.length > 0) {
            this.currentTime = millis() - this.startTime;
            this.position.x = this.starterPos - this.getPosXFromBPM(this.currentTime, this.BPM);
        }
        this.BPM = this.inputBPM.value();
        // RECORD mode
       /* if( this.state === "record" ) {
            this.recordingNotes();
        }*/
    }

    getPosXFromBPM(currentTime, bpm) {
        // on récupere le temp en ms d'un temps à la noire : 
        let noire = 60000 / bpm;   // 
        // une noire correpond à 100 pixel de largeur
        let posX = this.noire_width * currentTime / noire;
        return posX; 
    }
    // bouton Play
    start() {
        this.state = 'play';
        this.startTime = millis();
        // Si la TimeLine vient avec une mélodie déjà préchargée ou est déjà enregistré
        if (this.notesJSON.length > 0) {
            this.notes = this.initNotes(this.notesJSON);    
        } else {
            this.notes = [];
        }
    }

    // bouton Stop
    stop() {
        this.state = 'stop';
       // this.resetRecord();
    }

    initNotes(notesJSON) {
        let notes = [];
        for(let note of notesJSON) {
            let freq = notesFreq[note.id].freq;
            let posY = map(freq, CONF.lowFreq, CONF.highFreq, height, 0);
            let pos = createVector(width, posY);
            notes.push(new Note(pos,note.time, note.length, note.id));                
        }
        return notes;
    }
    updateBPM(value) {
        this.BPM = value;
    }

    createInputBPM() {
        let slider = createSlider(40,200,180);
        slider.class('bpm-slider')
        slider.parent('mainUI');
        return slider;
    }

    resetRecord() {
        this.rec_PreviousNoteId = "";
        this.rec_CurrentNoteId = "";
        this.rec_CurrentLength = 0;
        this.rec_CurrentTimeStart = 0;
        this.rec_MainStartTime = 0;
        this.rec_nbFrameCurrent = 0;
        this.rec_newPass = true;
    }
}