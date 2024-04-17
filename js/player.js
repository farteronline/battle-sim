import {Mob} from "./mob.js";
import {UnitTypes} from "./Units.js";
import * as vectors from "./vector-stuff.js";
import {clamp} from "./vector-stuff.js";
import {BLOCK_WALL} from "./map.js";

var WEAPON_COOLDOWN = 4;

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

    getClosestPointNotInsideTarget(map) {
	if (!this.target) {
	    return this.position;
	}
	const thisPosition = this.position;
	const [px, py] = this.position;
	const [tx, ty] = this.target.position;
	const size = this.target.size;
	const eastPos = [(tx - 1), py];
	const westPos = [(tx + size), py];
	const northPos = [px, (ty - size)];
	const southPos = [px, (ty + 1)];
	// only need to do 4 tiles because of arena shape
	const possibleTiles = [
	    eastPos,
	    westPos,
	    northPos,
	    southPos,
	].map(position=>{
	    return {position,
		    dist: vectors.manhattenDist(position, thisPosition)};
	}).sort((x,y)=>x.dist > y.dist);

	for(let tile of possibleTiles) {
	    let [x, y] = tile.position;
	    if (map.getBlocking(x, y) != BLOCK_WALL) {
		return tile.position;
	    }
	}
    
	return this.position;
    }
    
    get isInsideTarget() {
	if (!this.target || !this.target.getClosestTileTo) {
	    return false;
	}
	const [x,y] = this.position;
	const closest = this.target.getClosestTileTo(x, y);
	const delta = vectors.subVec(closest, this.position);
	return delta[0] == 0 && delta[1] == 0;
    }

    nextTurn(map) {
	this.lastPosition = this.position;
	if (this.attackCooldown > 0) {
	    --this.attackCooldown;
	}
	const insideTarget = this.isInsideTarget;
	let tempTarget = this.target;
	if (insideTarget) {
	    this.target = {position: this.getClosestPointNotInsideTarget(map), type: UnitTypes.MOVETO};
	}
	if (this.running) {
	    this.doNextMove(map);
	}
	this.doNextMove(map);
	this.target = tempTarget;
	if (this.target && this.target.type == UnitTypes.MOB) {
	    
	    this.attack();
	}
    }

    get weaponCooldown () {
	if (window.WEAPON_SPEED <= 0) {
	    return 1;
	}
	return window.WEAPON_SPEED || WEAPON_COOLDOWN;
    }

    get maxHit() {
	const WEAPON_MAX = window.PLAYER_MAX || 49;
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

    get accuracy () {
	return window.PLAYER_ACCURACY || 0.7728;
    }

    get inRange() {
	if (!this.target) {
	    return false;
	}
	const [x,y] = this.position;
	const closest = this.target.getClosestTileTo(x, y);
	const delta = vectors.subVec(closest, this.position);
	return vectors.manhattenDist([0,0], delta) == 1;
    }

    attack() {
	if (!this.inRange) {
	    return;
	}

	
	if (this.attackCooldown <= 0) {
	    this.attackCooldown = this.weaponCooldown;
	} else {
	    return;
	}
	let dam = Math.floor(Math.random() * (this.maxHit + 1));
	if (Math.random() > this.accuracy) {
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
	const closest = this.target.getClosestTileTo != null ? this.target.getClosestTileTo(
	    this.position[0], this.position[1]) : this.target.position;
	const td = this.targetDirection(closest, this.position);
	const delta = vectors.subVec(closest, this.position);
	const closestAbsolute = vectors.absVec(delta);
	const inXBound = delta[0] == 0;
	const inYBound = delta[1] == 0;

	// stop once at mob border
	if (this.target.type != UnitTypes.MOVETO) {
	    if (inXBound
		&& delta[1] == 1) {
		return null;
	    }
	    if (inXBound
		&& delta[1] == -1) {
		return null;
	    }
	    if (inYBound
		&& delta[0] == -1) {
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
	if (target.size) {
	    if (inXBound) {
		return moveY;
	    }
	    if (inYBound) {
		return moveX;
	    }
	}


	const isDirectlyDiagonal = closestAbsolute[0] == closestAbsolute[1];
	if (!isDirectlyDiagonal) {
	    if (closestAbsolute[0] > closestAbsolute[1]) {
		return moveX  || null;
	    } else if (closestAbsolute[1] > closestAbsolute[0]) {
		return moveY || null;
	    }
	}
	if (moveX && moveY && isDirectlyDiagonal) {
	    const moveXY = this.nextMoveXY(map, td);
	    if (moveXY) {
		return moveXY;
	    }
	}

	return moveX || moveY || null;
    }


}
