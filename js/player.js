import {Mob} from "./mob.js";
import {UnitTypes} from "./Units.js";
import * as vectors from "./vector-stuff.js";
import {clamp} from "./vector-stuff.js";

var WEAPON_COOLDOWN = 4;
var WEAPON_MAX = 49;
var WEAPON_ACCURACY = 0.7728;

export class PlayerMob extends Mob {

    get size() {
	return 1;
    }
    get image() {
	return imagestore.images["./assets/player.png"];
    }

    startOfTick() {
	super.startOfTick();
	++this.tick;
    }

    setStats () {
	super.setStats();
	this.running = true;
	this.attackCooldown = 0;
	this.lastPosition = this.position;
	this.pot_brew = 0;
	this.pot_combat = true;
	this.tick = 0;
	this.last_pot_tick = -3;
    }

    nextTurn(map) {
	this.lastPosition = this.position;
	if (this.attackCooldown > 0) {
	    --this.attackCooldown;
	}
	if (this.running) {
	    this.doNextMove(map);
	}
	this.doNextMove(map);
	if (this.target && this.target.type == UnitTypes.MOB) {
	    this.attack();
	}
    }

    get maxHit() {
	let brews = this.pot_brew;
	if (brews > 4) {
	    brews = 4;
	}
	if (!this.pot_combat) {
	    brews += 1;
	}
	if (brews > 0) {
	    let max = (WEAPON_MAX * (5 - brews) / 5) | 0;
	    if (max < 0) {
		return 0;
	    }
	    return max;
	}
	return WEAPON_MAX | 0;
    }

    attack() {
	if (this.attackCooldown <= 0) {
	    this.attackCooldown = 4;
	} else {
	    return;
	}
	let dam = Math.floor(Math.random() * (this.maxHit + 1));
	if (Math.random() > WEAPON_ACCURACY) {
	    dam = 0;
	}
	if (this.freeMax) {
	    this.freeMax = false;
	    dam = this.maxHit;
	}
	this.target.damage(dam);
    }

    get type() {
	return UnitTypes.PLAYER;
    }

    nextMove(map) {
	if(!this.target) {
	    return null;
	}
	const target = this.target;
	const td = this.targetDirection(target);
	const delta = vectors.subVec(target.position, this.position);

	const inXBound = delta[0] <= 0 && delta[0] > -target.size;
	const inYBound = delta[1] < target.size && delta[1] >= 0;
	//console.log(delta, inXBound, inYBound);


	// stop once at mob border
	if (this.target.type != UnitTypes.MOVETO) {
	    if (inXBound
		&& delta[1] == target.size) {
		return null;
	    }
	    if (inXBound
		&& delta[1] == -1) {
		return null;
	    }
	    if (inYBound
		&& delta[0] == -target.size) {
		return null;
	    }
	    if (inYBound
		&& delta[0] == 1) {
		return null;
	    }
	}

	
	const moveX = this.nextMoveX(map, td);
	let moveY = this.nextMoveY(map, td);

	// dont pass diagonally into mob
	if (this.target.type != UnitTypes.MOVETO) {
	    if ((delta[0] == -target.size || delta[0] == 1)
		&& (delta[1] == target.size || delta[1] == -1)) {
		return moveX || moveY || null;
	    }
	}

	// if player is within borders of target size
	// dont move diagonally
	//console.log(target.size, delta);
	if (target.size) {
	    if (inXBound) {
		return moveY;
	    }
	    if (inYBound) {
		return moveX;
	    }
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
