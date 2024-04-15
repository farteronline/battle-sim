import * as normalDamage from "./normalAttackDamage.js";
import * as vectors from "../vector-stuff.js";
import {Sprite} from "../sprite.js";
const SAFE_DIST = 4;


export class Parry {
    constructor() {
	this.prayedBad = false;
	this.beforeFirstHit = new Sprite(imagestore.images["./assets/parry.png"], 10, 10, 320, 279, 0, 26);
	this.beforeSecondHit = new Sprite(imagestore.images["./assets/parry.png"], 10, 10, 320, 279, 27, 54);
	this.beforeThirdHit = new Sprite(imagestore.images["./assets/parry.png"], 10, 10, 320, 279, 55, 82);
	this.beforeThirdHitSlow = new Sprite(imagestore.images["./assets/parry.png"], 10, 10, 320, 279, 55, 82, 0.75);
	this.postHit = new Sprite(imagestore.images["./assets/parry.png"], 10, 10, 320, 279, 83, 99);

	this.moveDuringAttack = true;
    }

    

    draw(scene, sol) {
	const ctx = scene.ctx;
	const alpha = ctx.globalAlpha;
	const color = ctx.strokeStyle;
	const lineWidth = ctx.lineWidth;
	ctx.lineWidth = 3;
	ctx.strokeStyle = "#5688b0";
	ctx.globalAlpha = 0.4;
	const center = sol.center;
	// a diamond around sols center
	const points = [
	    [0, -4],
	    [2.5, 0],
	    [0, 4],
	    [-2.5, 0]
	]
	      .map(x=>vectors.addVec(x, [0.5,0.5]))
	      .map(x=>vectors.addVec(x, center))
	      .map(x=>vectors.mulVec(x, scene.tilesize));
	ctx.beginPath();
	const lastPoint = points[3];
	ctx.moveTo(lastPoint[0], lastPoint[1]);
	points.forEach(x=>ctx.lineTo(x[0], x[1]));
	ctx.stroke(); 
	ctx.lineWidth = lineWidth;
	ctx.globalAlpha = alpha;
	ctx.strokeStyle = color;
    }

    isInside(x, y, center) {
	return false;
    }
    
    damage(target, sol) {
	const ticksTook = ticksTaken(sol);
	const elapsed = ticksTook - sol.ticksToDamage;
	const lastTick = sol.ticksToDamage == 0;
	if (elapsed == 1 || elapsed == 4 || elapsed == 7 || lastTick) {
	    sol.animationStart = sol.currentAnimationFrame;
	}
	if (elapsed == 1) {
	    sol.sprite = this.beforeFirstHit;
	}
	if (elapsed == 4) {
	    sol.sprite = this.beforeSecondHit;
	}
	if (elapsed == 7) {
	    if (ticksTook == 11) {
		sol.sprite = this.beforeThirdHitSlow;
	    } else {
		sol.sprite = this.beforeThirdHit;
	    }
	}
	if (lastTick) {
	    sol.sprite = null;
	}
	if (sol.ticksToDamage == 0 || elapsed == 4 || elapsed == 7) {
	    if (this.prayedBad || target.prayer != "melee"){
		normalDamage.damage(target);
		this.prayedBad = false;
	    }
	    return;
	}

	if (target.prayer == "melee"){
	    this.prayedBad = true;
	    target.prayer = null;
	}
    }
    
    label() {
	if (window.SHOW_LABEL) {
	    return "parry";
	} else {
	    return "";
	}
    }
}

export function ticksTaken(sol) {
    if (sol.phase >= 4) {
	return 11;
    }
    return 10;
}
