
class LineNote {
  constructor(freq, id, posY) {
    this.freq = freq;   
    this.id = id;
    this.posY = posY;
    this.color = 255;
    this.weight = 0.5;
    this.pBMove = 0; // position y du point de controle B qui va s'agitter au focus 
    this.force = 0;
  }
  isFocus(freq) {
    return (abs(freq - this.freq) < 5) 
  }
  distFrom(freq) {
    return (abs(this.freq - freq)) 
  }
  setOn() {    
   // this.color = "#8d3030";
    this.weight = 1;
    this.force = 20
    this.pBMove = sin(frameCount) * this.force;
  }  
  setOff() {    
    this.color = 255;
    this.weight = 0.5;
    if (this.force > 0 ) {
      this.force-=1;      
      this.pBMove = sin(frameCount) * this.force;
    }
  }
  draw() {
    fill(255);
    textSize(12);
    stroke(this.color);
    strokeWeight(this.weight);
    noFill();
    // quadraticVertex avec comme point de controle au centre qui s'agitera au focus de l'onde.     
    let pA = createVector(0, this.posY );
    let pB = createVector(width/2, this.posY + this.pBMove);
    let pC = createVector(width, this.posY);
    
    beginShape();
    vertex(pA.x, pA.y);
    quadraticVertex(pB.x, pB.y, pC.x, pC.y);
    endShape();
    
    
    noStroke();
    text(this.id, 20, this.posY);    
  }
}

