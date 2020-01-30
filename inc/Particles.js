//////////////////////////////////
// PARTICLE
//////////////////////////////////
class Particle {
	constructor(locx, locy) {
		this.location = createVector(locx, locy);
		this.velocity = createVector(random(-3, 0), random(-0.5, 0.5));
		this.acceleration = createVector(-0.05, 0.005);

		this.lifespan = 2000;
	}

	update() {
		this.velocity.add(this.acceleration.x, this.acceleration.y);
		this.location.add(this.velocity.x, this.velocity.y);
		this.lifespan -= 30;
	}

	draw() {
		noStroke();
		fill(random(255), random(255), 300, this.lifespan);
		circle(this.location.x, this.location.y, 3);
	}

	isDead() {
		return this.lifespan <= 0;
	}
}

////////////////////////////////
class ParticleSystem {
	constructor(x, y) {
		this.particles = [];
		this.x = x;
		this.y = y;
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
	addParticles(x, y) {
		for (let j = 0; j < 5; j++) {
			this.particles.push(new Particle(this.x, this.y));
		}
	}
}
