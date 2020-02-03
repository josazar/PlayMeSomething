//////////////////////////////////
// PARTICLE
//////////////////////////////////
class PaintBrush {
	constructor(locx, locy, opacity, couleur) {
		this.location = createVector(locx, locy);
		this.velocity = createVector(-2, 0);
		this.opacity = opacity;
		this.radius = 10;
		this.color = color("rgb(" + couleur + ")");
	}

	update() {
		// this.velocity.add(this.acceleration.x, this.acceleration.y);
		this.location.add(this.velocity.x, this.velocity.y);
		// this.opacity--;
	}

	draw() {
		noStroke();
		this.color.setAlpha(this.opacity);
		fill(this.color);
		let r = map(this.opacity, 50, 0, this.radius, 0);
		circle(this.location.x, this.location.y, r);
		this.color.setAlpha(255);
	}

	isDead() {
		return this.location.x < -10;
	}
}

////////////////////////////////
class PaintBrushSystem {
	constructor(x, y) {
		this.particles = [];
		this.x = x;
		this.y = y;
		this.life = 50;
		this.couleur = palette[3];
	}

	run() {
		for (let i = 0; i < this.particles.length; i++) {
			if (!this.particles[i].isDead()) {
				this.particles[i].update();
				this.particles[i].draw();
			} else {
				this.particles.splice(i, i + 1);
			}
		}
	}
	newNote(couleur) {
		this.life = 50;
		this.couleur = couleur;
	}
	releasing() {
		this.life -= 2;
	}

	addParticles(x, y) {
		if (this.life > 0)
			this.particles.push(
				new PaintBrush(this.x, this.y, this.life, this.couleur)
			);
	}
}
