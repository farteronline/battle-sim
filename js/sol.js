import {Mob} from "./mob.js";
import * as vectors from "./vector-stuff.js";
import {clamp} from "./vector-stuff.js";
import {UnitTypes} from "./Units.js";
import * as shield1 from "./attacks/shield1.js";
import * as shield2 from "./attacks/shield2.js";
import * as spear1 from "./attacks/spear1.js";
import * as spear2 from "./attacks/spear2.js";

export class SolMob extends Mob {

    
    setStats () {
	super.setStats();
	this.resting = 4;
	this.attacking = false;
	this.spear2 = false;
	this.shield2 = false;
	this.showAttackPattern = false;
	this.label = null;
	this.stunned = 2;
	this.stats = {
	    attack: 99,
	    strength: 99,
	    defence: 99,
	    range: 99,
	    magic: 99,
	    hitpoint: 1500
	};
	this.currentStats = {...this.stats};
    }


    get center() {
	return [this.position[0] + 2, this.position[1] - 2];
    }

    nextTurn(map) {
	this.showAttackPattern = false;
	if (this.stunned > 0) {
	    --this.stunned;
	    return;
	}
	if (!this.attacking && --this.resting == 0) {
	    this.attacking = true;
	    this.attack = this.nextAttack;
	    this.ticksToDamage = 4;
	    this.label = this.attack.label();
	}

	if (!this.attacking) {
	    this.attack = null;
	    this.label = null;
	    this.doNextMove(map);
	} else {
	    if(--this.ticksToDamage == 0) {
		this.showAttackPattern = true;
		if (this.target) {
		    const [x,y] = this.target.position;
		    if (this.attack.isInside(x,y,this.center)) {
			this.attack.damage(this.target);
		    }
		}
		this.attacking = false;
		this.resting = 4;
	    }
	}
    }

    draw(scene) {
	super.draw(scene);
	if(this.showAttackPattern) {
	    this.attack.draw(scene, this);
	}
	if(this.label) {
	    const center = vectors.mulVec(this.center, scene.tilesize);
	    const ctx = scene.ctx;
	    const fillColor = ctx.fillStyle;
	    const strokeColor = ctx.strokeStyle;
	    const lineWidth = ctx.lineWidth;
	    ctx.fillStyle = "yellow";
	    ctx.strokeStyle = "black";
	    ctx.lineWidth = 3;
	    scene.ctx.strokeText(this.label, center[0], center[1]);
	    scene.ctx.fillText(this.label, center[0], center[1]);
	    ctx.fillStyle = fillColor;
	    ctx.strokeStyle = strokeColor;
	    ctx.lineWidth = lineWidth;
	}
    }

    get nextAttack() {
	const isSpear = Math.random() < 0.5;
	if (isSpear) {
	    if(this.spear2) {
		this.spear2 = false;
		this.shield2 = false;
		return spear2;
	    } else {
		this.spear2 = true;
		this.shield2 = false;
		return spear1;
	    }
	}
	if(this.shield2) {
	    this.shield2 = false;
	    this.spear2 = false;
	    return shield2;
	} else {
	    this.shield2 = true;
	    this.spear2 = false;
	    return shield1;
	}
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
