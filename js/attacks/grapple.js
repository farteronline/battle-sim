import * as normalDamage from "./normalAttackDamage.js";
import * as vectors from "../vector-stuff.js";
import * as randoms from "../randoms.js";

const BODY_PARTS = [
    "BODY",
    "BACK",
    "HANDS",
    "LEGS",
    "FEET"
];

export class Grapple {
    constructor() {
	this.part = randoms.pickRand(BODY_PARTS);
    }

    draw(scene, sol) {

    }

    isInside(x, y, center) {
	return false;
    }
    
    damage(target, sol) {
	const elapsed = ticksTaken(sol) - sol.ticksToDamage;
	console.log(elapsed, sol.ticksToDamage);
	if (sol.ticksToDamage != 0) {
	    return;
	}


	if (target.slotClicked != this.part){
	    normalDamage.damage(target);
	}
	target.slotClicked = null;
    }
    
    label() {
	return this.part;
    }
}

export function ticksTaken(sol) {
    return 4;
}
