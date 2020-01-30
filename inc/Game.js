class Game {
  constructor() {
    this.pts = 0;
    this.currentView = "home"; // "home", "inGame"
    this.mode = "play"; // "audioToMidi" ou "play"
    // this.timer (créer depuis sketch)
  }
  addPoint() {
    this.pts++;
  }
  reset() {
    // Points
    this.pts = 0;
  }
}
