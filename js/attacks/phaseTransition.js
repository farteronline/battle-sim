export class PhaseTransition {
    constructor(label, sol) {
	this.text = label;
	if (sol.phase >= 2 && sol.phase <=5) {
	    const maxSpawn = sol.phase == 5? 4:5;
	    for(var i = 0; i < maxSpawn; ++i) {
		sol.spawnANewTile();
	    }
	    sol.spawnATileUnderTarget();
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
