import {pickRandIndex} from "../randoms.js";

export class PhaseTransition {
    constructor(label, sol) {
	this.text = label;
	console.log(sol.phase);
	if (sol.phase >= 2 && sol.phase <=4) {
	    for(var i = 0; i < 6; ++i) {
		let index = pickRandIndex(sol.spawnableTiles);
		const tile = sol.spawnableTiles.splice(index,1)[0];
		sol.spawnTile(tile);
	    }
	}
    }

    draw(scene, sol) {

    }

    label() {
	return this.text;
    }

    isInside(x, y, center) {
	return false;
    }

    damage(target, sol){

    }
}
