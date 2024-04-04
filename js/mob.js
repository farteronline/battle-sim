import * as vectors from "./vector-stuff.js";
import {clamp} from "./vector-stuff.js";
import {BLOCK_WALL,BLOCK_FREE,BLOCK_MOB} from "./map.js";
import {UnitTypes} from "./Units.js";


let index = 0;

const prayerImgs = {
    mage:"../mageOver.png",
    range:"../rangeOver.png",
};

export class Mob {
    constructor([x, y]) {
	this.position = [x,y];
	this.attackDelay = 0;
	this.frozen = 0;
	this.stunned = 0;
	this.hadLOS = false;
	this.setStats();
	this.index = index++;
    }

    get attackSpeed () {
	return 4
    }
    get type() {
	return UnitTypes.MOB;
    }
    
    get attackRange () {
	return 15
    }
    get attackSpeed () {
	return 0
    }

    get flinchDelay () {
	return Math.floor(this.attackSpeed / 2);
    }
  
    get maxHit () {
	return 0
    }
    // Returns true if the NPC can move towards the unit it is aggro'd against.
    canMove () {
	return (!this.hasLOS && !this.isFrozen() && !this.isStunned() && !this.isDying())
    }

    canAttack () {
	return !this.isDying() && !this.isStunned();
    }
    freeze(ticks) {
	if (ticks < this.frozen) {
	    return;
	}
	this.perceivedLocation = this.location;
	this.frozen = ticks;
    }

    isFrozen() {
	return (this.frozen > 0)
    }

    isStunned () {
	return (this.stunned > 0)
    }
    isDying () {
    return (this.dying > 0)
    }
    // Returns true if this game object is on the specified tile.
    isOnTile (x, y) {
	return (x >= this.position[0] && x < this.position[0] + this.size) && (y <= this.position[1] && y > this.position[1] - this.size)
    }
    // Returns the closest tile on this mob to the specified point.
    getClosestTileTo (x, y) {
	// We simply clamp the target point to our own boundary box.
	return [clamp(x, this.position[0], this.position[0] + this.size - 1), clamp(y, this.position[1] - this.size + 1, this.position[1])]
    }

    attackIfPossible () {
	--this.attackDelay;


	if (this.canAttack() === false) {
	    return;
	}

	this.attackStyle = this.attackStyleForNewAttack()

	
	const weaponIsAreaAttack = this.weapons[this.attackStyle].isAreaAttack
	let isUnderAggro = false
	if (!weaponIsAreaAttack) {
	    isUnderAggro = Collision.collisionMath(this.position[0], this.position[1], this.size, this.target.position[0], this.target.position[1], 1)
	}
	this.attackFeedback = AttackIndicators.NONE

	if (!isUnderAggro && this.hasLOS && this.attackDelay <= 0) {
	    this.attack()
	}
    }

    attackStep () {

	if (this.spawnDelay > 0) {
	    return;
	}
	if (this.dying === 0) {
	    return
	}

	this.attackIfPossible()
	this.detectDeath()

	--this.frozen;
	--this.stunned;

    }

    
    setStats () {
	// non boosted numbers
	this.stats = {
	    attack: 99,
	    strength: 99,
	    defence: 99,
	    range: 99,
	    magic: 99,
	    hitpoint: 99
	}

	// with boosts
	this.currentStats = {
	    attack: 99,
	    strength: 99,
	    defence: 99,
	    range: 99,
	    magic: 99,
	    hitpoint: 99
	}

    }


    get bonuses() {
	return {
	    attack: {
		stab: 0,
		slash: 0,
		crush: 0,
		magic: 0,
		range: 0
	    },
	    defence: {
		stab: 0,
		slash: 0,
		crush: 0,
		magic: 0,
		range: 0
	    },
	    other: {
		meleeStrength: 0,
		rangedStrength: 0,
		magicDamage: 0,
		prayer: 0
	    }
	};
    }

    chooseTarget(){
	this.target = randoms.pickRand(targetstore.players);
    }
    
    get image() {
	return imagestore.images["./assets/sol.png"];
    }
    get prayerImage() {
	return imagestore.images[prayerImgs[this.prayer]];
    }

    draw(scene){
	scene.ctx.fillStyle="#ff0000";
	scene.ctx.fillRect(
	    (this.position[0]) * scene.tilesize,
	    (this.position[1]-this.size+1) * scene.tilesize,
	    this.size * scene.tilesize,
	    5);
	scene.ctx.fillStyle="#00ff00";
	scene.ctx.fillRect(
	    (this.position[0]) * scene.tilesize,
	    (this.position[1]-this.size+1) * scene.tilesize,
	    this.size * scene.tilesize * this.currentStats.hitpoint/this.stats.hitpoint,
	    5);
	
	scene.ctx.drawImage(this.image,
			    (this.position[0]) * scene.tilesize,
			    (this.position[1]-this.size+1) * scene.tilesize,
			    this.size * scene.tilesize,
			    this.size * scene.tilesize);
	scene.ctx.strokeStyle="#5688b0";
	scene.ctx.strokeRect(
			    (this.position[0]) * scene.tilesize,
			    (this.position[1]-this.size+1) * scene.tilesize,
			    this.size * scene.tilesize,
	    this.size * scene.tilesize);
	if (this.prayer) {
	    scene.ctx.drawImage(this.prayerImage,
			    (this.position[0]) * scene.tilesize,
			    (this.position[1]-this.size + 1) * scene.tilesize,
			    this.size * scene.tilesize,
			    this.size * scene.tilesize);
	}
	

    }

    get blocking(){
	return BLOCK_MOB;
    }

    get size() {
	return 5;
    }

    blockSet(map, status) {
	for(let x = 0; x < this.size; ++x) {
	    for(let y = 0; y < this.size; ++y) {
		map.setBlocking(x + this.position[0], this.position[1] - y, status);
	    }
	}
    }

    unblock(map) {
	this.blockSet(map, BLOCK_FREE);
    }
    
    block(map) {
	this.blockSet(map, this.blocking);
    }

    get canBeAttacked() {
	return true;
    }

    targetDirection(target) {
	let x = 0;
	if (target.position[0] > this.position[0]) {
	    x = 1;
	} else if (target.position[0] < this.position[0]){
	    x = -1;
	}

	let y = 0;
	if (target.position[1] > this.position[1]) {
	    y = 1;
	} else if (target.position[1] < this.position[1]){
	    y = -1;
	}
	return [x, y];
    }

    canMoveDirected(map, posDeltas) {
	const deltaIterate = [0,0];
	const iterateMax = [0,0];
	// offset by deltas, plus adjust for runescape being SW tile based positions
	const startingPosition = vectors.addVec(vectors.addVec(this.position, posDeltas), [0, -this.size + 1] );
	//east
	if (posDeltas[0]==1) {
	    startingPosition[0] += this.size - 1;
	}
	//south
	if (posDeltas[1]==1) {
	    startingPosition[1] += this.size - 1;
	}
	// corner case
	if (posDeltas[0]!=0 && posDeltas[1]!=0){
	    return this.canMoveSpot(map, startingPosition);
	}
	// do not move
	if (posDeltas[0]==0 && posDeltas[1]==0){
	    return false
	}
	// check west or east side  south to north
	if (posDeltas[0]!=0){
	    deltaIterate[1] = -1;
	    iterateMax[1] = this.size;
	}
	// check north or south side  east to west
	if (posDeltas[1]!=0){
	    deltaIterate[0] = -1;
	    iterateMax[0] = this.size;
	}

	while(iterateMax[0] != 0 || iterateMax[1] != 0) {
	    iterateMax[0] += deltaIterate[0];
	    iterateMax[1] += deltaIterate[1];
	    let checkPos = vectors.addVec(iterateMax, startingPosition);
	    //map.scene.drawTileC(checkPos[0], checkPos[1], "#FF0000");
	    if (!this.canMoveSpot(map, checkPos)) {
		return false;
	    }
	}
	return true;
    }

    canMoveSpot(map, nextPos){
	const blockAt = map.getBlocking(nextPos[0], nextPos[1]);
	return blockAt == BLOCK_FREE || (this.type == UnitTypes.PLAYER && blockAt == BLOCK_MOB);
    }

    nextMoveX(map, targetDirection) {
	// if we've already moved x we dont need to move
	if (targetDirection[0] == 0) {
	    return null;
	}
	// if can move in the x direction of the target
	if (this.canMoveDirected(map, [targetDirection[0], 0])) {
	    return [this.position[0] + targetDirection[0],
		    this.position[1]];
	}
	return null;
    }

    nextMoveY(map, targetDirection) {
	// if we've already moved y we dont need to move
	if (targetDirection[1] == 0) {
	    return null;
	}
	// if can move in the y direction of the target
	if (this.canMoveDirected(map, [0, targetDirection[1]])) {
	    return [this.position[0],
		    this.position[1] + targetDirection[1]];
	}
	return null;
    }

    nextMoveXY(map, targetDirection) {
	// if can move in the diagonal direction of the target
	if (this.canMoveDirected(map, targetDirection)) {
	    return [this.position[0] + targetDirection[0],
		    this.position[1] + targetDirection[1]];
	}
	return null;
    }

    doNextMove(map) {
	const move = this.nextMove(map);
	if(move){
	    this.unblock(map);
	    this.position = move;
	    this.block(map);
	    return true;
	}
	return false;
    }

    damage(amount) {
	if(!(this.currentStats.hitpoint > 0)) {
	    return;
	}
	this.currentStats.hitpoint -= amount;
	this.currentStats.hitpoint = Math.max(0, this.currentStats.hitpoint);
	if (this.currentStats.hitpoint === 0) {
	    // todo despawn
	}
    }

    closestIsCornerTrap() {
	const tx = this.target.position[0];
	const ty = this.target.position[1];
	const closest = this.getClosestTileTo(tx, ty);
	const dx = Math.abs(tx - closest[0]);
	const dy = Math.abs(ty - closest[1]);
	return dx == 1 && dy == 1;
    }

    nextMove(map) {
	if(!this.target) {
	    return null;
	}
	const target = this.target;
	const td = this.targetDirection(target);
	const delta = vectors.subVec(target.position, this.position);

	console.log(delta);


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

	if (moveX && moveY) {
	    const moveXY = this.nextMoveXY(map, td);
	    if (moveXY) {
		return moveXY;
	    }
	}

	return moveX || moveY || null;
    }

    

    nextTurn(map) {
	if (this.dying) {
	    return false;
	}
	if (this.currentStats.hitpoint == 0) {
	    this.dying = true;
	    this.unblock(map);
	    if (this.onDie) {
		this.onDie();
		return false;
	    }
	}
	return true;
    }
};
