import {Mob} from "./mob.js";
import * as vectors from "./vector-stuff.js";
import {clamp} from "./vector-stuff.js";
import {UnitTypes} from "./Units.js";


export class SolMob extends Mob {


    nextTurn(map) {
	this.doNextMove(map);
    }

    nextMove(map) {
	if(!this.target) {
	    return null;
	}
	const target = this.target;
	const td = this.targetDirection(target);
	const delta = vectors.subVec(target.position, this.position);

	//console.log(delta);


	// stop once at mob border
	if (this.target.type != UnitTypes.MOVETO) {
	    if (delta[0] >= 0 && delta[0] < this.size
		&& delta[1] == -this.size) {
		return null;
	    }
	    if (delta[0] >= 0 && delta[0] < this.size
		&& delta[1] == 1) {
		return null;
	    }
	    if (delta[1] > -this.size  && delta[1] <= 0
		&& delta[0] == this.size) {
		return null;
	    }
	    if (delta[1] > -this.size  && delta[1] <= 0
		&& delta[0] == -1) {
		return null;
	    }
	}

	
	const moveX = this.nextMoveX(map, td);
	let moveY = this.nextMoveY(map, td);

	// dont pass diagonally into mob
	if (this.target.type != UnitTypes.MOVETO) {
	    if ((delta[0] == this.size || delta[0] == -1)
		&& (delta[1] == -this.size || delta[1] == 1)) {
		return moveX || moveY || null;
	    }
	}

	// if player is within borders of our size
	// dont move diagonally
	if (delta[0] >= 0 && delta[0] < this.size) {
	    return moveY;
	}
	if (delta[1] > -this.size && delta[1] <= 0) {
	    return moveX;
	}


	if (moveX && moveY) {
	    const moveXY = this.nextMoveXY(map, td);
	    if (moveXY) {
		return moveXY;
	    }
	}

	return moveX || moveY || null;
    }

}
