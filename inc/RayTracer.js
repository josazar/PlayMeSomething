//////////////////////////////////
// PARTICLE
//////////////////////////////////
class RayTracer {
	constructor(locx, locy, h) {
		this.accelX = 15;
		this.location = createVector(locx, locy);
		this.velocity = createVector(-this.accelX, 0);
		this.c1 = color(255, 255, 255, 255);
		this.c2 = color(255, 255, 255, 0);
		this.lifespan = 255;
		this.h = 30;
		this.w = 1;
	}

	update() {
		this.location.add(this.velocity.x, this.velocity.y);
		this.lifespan -= 10;
		this.h += getRandomArbitrary(-15, 15);
	}

	draw() {
		noStroke();
		fill(255, random(255), 300, this.lifespan);
		rectMode(CENTER);
		rect(this.location.x + this.accelX, this.location.y, this.w, this.h);
	}

	isDead() {
		return this.lifespan <= 0;
	}
}

////////////////////////////////
class RayTracerSystem {
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
	addRayTracer(x, y) {
		this.particles.push(new RayTracer(this.x, this.y));
	}
}
