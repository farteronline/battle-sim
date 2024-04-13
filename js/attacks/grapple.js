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
	this.isPerfect = false;
    }

    draw(scene, sol) {

    }

    isInside(x, y, center) {
	return false;
    }
    
    damage(target, sol) {
	const elapsed = ticksTaken(sol) - sol.ticksToDamage;
	if (sol.ticksToDamage == 1 && target.slotClicked != this.part) {
	    this.isPerfect = true;
	}
	if (sol.ticksToDamage != 0) {
	    return;
	}


	if (target.slotClicked != this.part){
	    normalDamage.damage(target);
	} else if (this.isPerfect) {
	    target.freeMax = true;
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
