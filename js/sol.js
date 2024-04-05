import {Mob} from "./mob.js";
import * as vectors from "./vector-stuff.js";
import {clamp} from "./vector-stuff.js";
import {UnitTypes} from "./Units.js";
import * as shield1 from "./attacks/shield1.js";
import * as shield2 from "./attacks/shield2.js";
import * as spear1 from "./attacks/spear1.js";
import * as spear2 from "./attacks/spear2.js";
import * as parry from "./attacks/parry.js";
import {PhaseTransition} from "./attacks/phaseTransition.js";

var SPECIAL_FREQUENCY = 0.1;
var SPECIAL_HP_LIMIT = 1350;
export class SolMob extends Mob {

    
    setStats () {
	super.setStats();
	this.resting = 4;
	this.attacking = false;
	this.spear2 = false;
	this.shield2 = false;
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
	this.phase = 1;
	this.lastPhaseHp = this.currentStats.hitpoint;
	this.nextPhaseHp = this.getNextPhaseHp();
    }

    startOfTick() {
	super.startOfTick();
	this.lastPhaseHp = this.currentStats.hitpoint;
    }

    getNextPhaseHp() {
	const hp = this.lastPhaseHp;
	if (hp > 1350) {
	    return 1350;
	}
	if (hp > 1100) {
	    return 1100;
	}
	if (hp > 750) {
	    return 750;
	}
	if (hp > 400) {
	    return 400;
	}
	if (hp > 150) {
	    return 150;
	}
	return 0;
    }


    get center() {
	return [this.position[0] + 2, this.position[1] - 2];
    }

    nextTurn(map) {
	if (this.currentStats.hitpoint <= 0) {
	    return;
	}
	if (this.stunned > 0) {
	    --this.stunned;
	    return;
	}
	if (!this.attacking && --this.resting == 0) {
	    this.attacking = true;
	    this.ticksToDamage = 4;
	    this.attack = this.nextAttack;
	    this.label = this.attack.label();
	}

	if (!this.attacking) {
	    this.attack = null;
	    this.label = null;
	    this.doNextMove(map);
	} else {
	    --this.ticksToDamage;
	    this.attack.damage(this.target, this);
	    if(this.ticksToDamage == 0) {
		this.attacking = false;
		this.resting = 4;
	    }
	}
    }

    draw(scene) {
	super.draw(scene);
	if(this.attack && this.attack.draw) {
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

    getNextTransitionPhase() {
	const hp = this.lastPhaseHp;
	if (hp > 1100) {
	    this.phase = 2;
	    return new PhaseTransition("Phase 2");
	}
	if (hp > 750) {
	    this.phase = 3;
	    return new PhaseTransition("Phase 3");
	}
	if (hp > 400) {
	    this.phase = 4;
	    return new PhaseTransition("Phase 4");
	}
	if (hp > 150) {
	    this.phase = 5;
	    return new PhaseTransition("Phase 5");
	}
	if (hp > 0) {
	    this.phase = 5;
	    return new PhaseTransition("Enrage");
	}
	this.phase = 6;
	return new PhaseTransition("Surprise, volatility");
    }

    get nextAttack() {
	const isSpear = Math.random() < 0.5;

	if (this.lastPhaseHp <= this.nextPhaseHp) {
	    this.nextPhaseHp = this.getNextPhaseHp();
	    return this.getNextTransitionPhase();
	}
	
	if (this.currentStats.hitpoint < SPECIAL_HP_LIMIT) {
	    const r = Math.random();
	    if (r < SPECIAL_FREQUENCY) {
		this.spear2 = false;
		this.shield2 = false;
		this.ticksToDamage = parry.ticksTaken(this);
		return new parry.Parry();
	    }
	}
	if (isSpear) {
	    if(this.spear2) {
		this.spear2 = false;
		this.shield2 = false;
		this.ticksToDamage = spear2.ticksTaken(this);
		return spear2;
	    } else {
		this.spear2 = true;
		this.shield2 = false;
		this.ticksToDamage = spear1.ticksTaken(this);
		return spear1;
	    }
	}
	if(this.shield2) {
	    this.shield2 = false;
	    this.spear2 = false;
	    this.ticksToDamage = shield2.ticksTaken(this);
	    return shield2;
	} else {
	    this.shield2 = true;
	    this.spear2 = false;
	    this.ticksToDamage = shield1.ticksTaken(this);
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
