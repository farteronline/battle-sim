import * as normalDamage from "./normalAttackDamage.js";
import * as vectors from "../vector-stuff.js";
const SAFE_DIST = 4;

export class Parry {
    constructor() {
	this.prayedBad = false;
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
	const elapsed = ticksTaken(sol) - sol.ticksToDamage;
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
	return "parry";
    }
}

export function ticksTaken(sol) {
    if (sol.phase >= 4) {
	return 11;
    }
    return 10;
}
