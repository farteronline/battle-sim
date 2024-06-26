export class TickCounter {
    constructor(ticks, c1, c2) {
	this._ticks = ticks;
	this.t = 0;
	this.c1 = c1;
	this.c2 = c2;
    }

    get ticks() {
	if (window.TICK_COUNT == 0) {
	    return 1;
	}
	return window.TICK_COUNT || this._ticks;
    }

    tick() {
	this.t = (this.t + 1) % this.ticks;
    }

    circle(scene, t, c){
	const ctx = scene.ctx;
	ctx.fillStyle = c;
	ctx.beginPath();
	ctx.arc(28 + 44 * t, scene.canvasHeight - 28, 20, 0, 2 * Math.PI);
	ctx.fill(); 
    }
    draw(scene) {
	for(let i = 0; i < this.ticks; ++i) {
	    this.circle(scene, i, (i == this.t)?this.c1:this.c2);
	}
    }
}
