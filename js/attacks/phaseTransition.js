export class PhaseTransition {
    constructor(label, sol) {
	this.text = label;
	
    }

    spawnTiles(sol) {
	if (sol.phase >= 2 && sol.phase <=6) {
	    const maxSpawn = sol.phase == 6? 4:5;
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
	if (sol.ticksToDamage != 0) {
	    return;
	}
	this.spawnTiles(sol);
    }
    
    ticksTaken(sol) {
	return 3;
    }

    delayNextAttackBy(sol) {
	return 2;
    }
}
