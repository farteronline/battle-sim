import {Mob} from "./mob.js";
import * as vectors from "./vector-stuff.js";
import {clamp} from "./vector-stuff.js";
import {UnitTypes} from "./Units.js";
import * as shield1 from "./attacks/shield1.js";
import * as shield2 from "./attacks/shield2.js";
import * as spear1 from "./attacks/spear1.js";
import * as spear2 from "./attacks/spear2.js";
import * as parry from "./attacks/parry.js";
import * as grapple from "./attacks/grapple.js";
//import {Howl, Howler} from './3rd_party/howler.min.js';

import {PhaseTransition} from "./attacks/phaseTransition.js";
import {BLOCK_WALL,BLOCK_FREE,BLOCK_MOB} from "./map.js";
import {pickRandIndex} from "./randoms.js";


var SPECIAL_FREQUENCY = 0.2;
var SPECIAL_HP_LIMIT = 1350;
var MAX_SOL_HP = 1500;
var PLAY_SOUND = JSON.parse(localStorage.getItem("sound-check"));
var spear_sound = new Howl({
    src: ['./assets/spear.wav']
});
var shield_sound = new Howl({
    src: ['./assets/shield.wav']
});
var parry1_sound = new Howl({
    src: ['./assets/parry1.wav']
});
var parry2_sound = new Howl({
    src: ['./assets/parry2.wav']
});

let SHOW_LABEL = (function() {
    let label = localStorage.getItem("label-check");
    if (label) {
	return JSON.parse(label);
    }
    return true;
})();

let TICK_COUNT = (function() {
    let label = localStorage.getItem("tick-counter");
    if (label) {
	return JSON.parse(label);
    }
    return 7;
})();

let PLAYER_MAX = (function() {
    let label = localStorage.getItem("max-hit");
    if (label) {
	return JSON.parse(label);
    }
    return 49;
})();

let PLAYER_ACCURACY = (function() {
    let label = localStorage.getItem("accuracy");
    if (label) {
	return JSON.parse(label);
    }
    return 0.7728;
})();

let WEAPON_SPEED = (function() {
    let label = localStorage.getItem("weapon-speed");
    if (label) {
	return JSON.parse(label);
    }
    return 4;
})();


function onLoadBinders () {
    document.getElementById("sound-check").checked = PLAY_SOUND;
    document.getElementById("label-check").checked = SHOW_LABEL;
    document.getElementById("tick-counter").value = TICK_COUNT;
    document.getElementById("max-hit").value = PLAYER_MAX;
    document.getElementById("accuracy").value = PLAYER_ACCURACY;
    document.getElementById("weapon-speed").value = WEAPON_SPEED;
    window.WEAPON_SPEED = WEAPON_SPEED;
    window.PLAYER_MAX = PLAYER_MAX;
    window.PLAYER_ACCURACY = PLAYER_ACCURACY;
    window.TICK_COUNT = TICK_COUNT;
    window.SHOW_LABEL = SHOW_LABEL;
    window.PLAY_SOUND = PLAY_SOUND;
    document.getElementById("sound-check").onchange = function() {
	PLAY_SOUND = this.checked;
	window.PLAY_SOUND = PLAY_SOUND;
	localStorage.setItem("sound-check",JSON.stringify(PLAY_SOUND))
    };
    document.getElementById("label-check").onchange = function() {
	SHOW_LABEL = this.checked;
	window.SHOW_LABEL = SHOW_LABEL;
	localStorage.setItem("label-check",JSON.stringify(SHOW_LABEL))
    };
    document.getElementById("tick-counter").onchange = function() {
	TICK_COUNT = ((this.value < 0 ? 0 : this.value) | 0) || 7;
	window.TICK_COUNT = TICK_COUNT;
	localStorage.setItem("tick-counter",JSON.stringify(TICK_COUNT))
    };
    document.getElementById("max-hit").onchange = function() {
	PLAYER_MAX = ((this.value < 0 ? 0 : this.value) | 0) || 49;
	window.PLAYER_MAX = PLAYER_MAX;
	localStorage.setItem("max-hit",JSON.stringify(PLAYER_MAX))
    };
    document.getElementById("weapon-speed").onchange = function() {
	WEAPON_SPEED = ((this.value < 0 ? 0 : this.value) | 0) || 4;
	window.WEAPON_SPEED = WEAPON_SPEED;
	localStorage.setItem("weapon-speed",JSON.stringify(WEAPON_SPEED))
    };
    document.getElementById("accuracy").onchange = function() {
	PLAYER_ACCURACY = (this.value < 0 ? 0 : this.value - 0) || 0.7728;
	window.PLAYER_ACCURACY = PLAYER_ACCURACY;
	localStorage.setItem("accuracy",JSON.stringify(PLAYER_ACCURACY))
    };
}
if (document.readyState === "complete") {
    onLoadBinders();
} else {
    window.addEventListener("load", onLoadBinders);
}


export class SolMob extends Mob {
    
    get image() {
	return imagestore.images[this.cur_img];
    }

    setStats () {
	super.setStats();
	this.resting = 1;
	this.attacking = false;
	this.spear2 = false;
	this.shield2 = false;
	this.label = null;
	this.stunned = 4;
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
	this.ticksToNewTile = 3;
	this.lastPhaseHp = this.currentStats.hitpoint/MAX_SOL_HP;
	this.nextPhaseHp = this.getNextPhaseHp();
	this.forceSpear = true;
	this.cur_img = "./assets/sol.png";
	this.sprite = null;
    }

    startOfTick() {
	super.startOfTick();
	this.lastPhaseHp = this.currentStats.hitpoint/MAX_SOL_HP;
    }

    getNextPhaseHp() {
	const hp = this.lastPhaseHp;
	if (hp > 0.9) {
	    return 0.9;
	}
	if (hp > 0.75) {
	    return 0.75;
	}
	if (hp > 0.5) {
	    return 0.5;
	}
	if (hp > 0.25) {
	    return 0.25;
	}
	if (hp > 0.1) {
	    return 0.1;
	}
	return 0;
    }

    getTargetDelta() {
	if (!this.target) {
	    return null;
	}
	const [x,y] = this.target.position;
	const closest = this.getClosestTileTo(x, y);
	return vectors.subVec(closest, this.target.position);
    }

    
    isTargetInMeleeDistance(delta) {
	if (delta == null) {
	    return false;
	}
	const dx = Math.abs(delta[0]);
	const dy = Math.abs(delta[1]);
	return (dx == 1 && dy == 0) ||
	    (dx == 0 && dy == 1) ||
	    (dx == 1 && dy == 1) ||
	    (dx == 0 && dy == 0);
    }

    isTargetInside(delta) {
	if (delta == null) {
	    return false;
	}
	return delta[0] == 0 && delta[1] == 0;
    }

    initMap(map) {
	this.map = map;
	this.tileMap = {};
	this.spawnedTiles = [];
	this.newSpawnedTiles = [];
	this.ticksToSpawnTiles = 0;
	this.spawnableTiles = map.blocking.map((t,i)=>{
	    const x = i % map.width;
	    const y = Math.floor(i / map.width);
	    if(t != BLOCK_WALL) {
		return [x, y];
	    }
	    return null;
	}).filter(x=>x!=null);
    }

    spawnANewTile() {
	const radius = 3;
	const dx = Math.floor(Math.random() * (radius * 2 + 2) - radius);
	const dy = Math.floor(Math.random() * (radius * 2 + 2) - radius);
	const tile = vectors.addVec([dx,dy], this.target.position);
	if (this.map.getBlocking(tile[0], tile[1]) != BLOCK_WALL && !this.tileMap[this.tileIndex(tile)]) {
	    this.spawnTile(tile);
	} else {
	    this.spawnANewTileOld();
	}
    }
    
    spawnANewTileOld() {
	let index = pickRandIndex(this.spawnableTiles);
	const tile = this.spawnableTiles.splice(index,1)[0];
	this.spawnTile(tile);
    }

    spawnATileUnderTarget() {
	this.spawnTile(this.target.position);
    }


    get center() {
	return [this.position[0] + 2, this.position[1] - 2];
    }

    tileIndex(tile) {
	return `${tile[0]},${tile[1]}`;
    }

    isInBadTile(tile) {
	return tile != null && !!this.tileMap[this.tileIndex(tile)];
    }

    spawnTile(tile) {
	if (!this.tileMap[this.tileIndex(tile)]) {
	    this.newSpawnedTiles.push(tile);
	    this.ticksToSpawnTiles = 2;
	}
    }

    convertNewSpawnedTilesToSpawnedTiles() {
	this.newSpawnedTiles.map(tile=>{
	    this.spawnedTiles.push(tile);
	    this.tileMap[this.tileIndex(tile)] = true;
	});
	this.newSpawnedTiles = [];
    }
    
    nextTurn(map) {
	if(this.ticksToSpawnTiles > 0) {
	    if(--this.ticksToSpawnTiles == 0) {
		this.convertNewSpawnedTilesToSpawnedTiles();
	    }
	}
	if (this.isInBadTile(this.target.position)) {
	    this.target.damage(Math.floor(Math.random() * 11));
	}

	const targetDelta = this.getTargetDelta();
	const targetInside = this.isTargetInside(targetDelta);
	const isInMeleeDistance = this.isTargetInMeleeDistance(targetDelta);
	
	if (this.currentStats.hitpoint <= 0) {
	    if (window.SHOW_LABEL) {
		this.label = "Surprise, volatility";
	    } else {
		this.label = "";
	    }
	    return;
	}
	if (this.stunned > 0) {
	    --this.stunned;
	    return;
	}
	if (this.resting <= 0) {
	    this.resting = 1;
	}
	if (!this.attacking && --this.resting == 0 && isInMeleeDistance) {
	    this.attacking = true;
	    this.ticksToDamage = 4;
	    this.attack = this.nextAttack;
	    this.label = this.attack.label();
	}

	if (this.phase >= 6) {
	    if(--this.ticksToNewTile == 0) {
		this.ticksToNewTile = 3;
		this.spawnANewTile();
	    }
	}
	
	if (!this.attacking || (this.attack && this.attack.moveDuringAttack)) {
	    this.lastPosition = this.position;
	    if (!targetInside) {
		this.doNextMove(map);
	    }
	    this.doNextMove(map);
	}
	if (this.attacking) {
	    --this.ticksToDamage;
	    this.attack.damage(this.target, this);
	    if(this.ticksToDamage == 0) {
		this.attacking = false;
		this.resting = this.attack.delayNextAttackBy(this);
	    }
	} else {
	    this.attack = null;
	    this.label = null;
	}

    }

    drawSprite(scene, currentAnimationFrame) {
	if(this.sprite == null){
	    return super.drawSprite(scene, currentAnimationFrame);
	}

	this.sprite.draw(scene.ctx,
			 (this.position[0]) * scene.tilesize,
			 (this.position[1]-this.size+1) * scene.tilesize,
			 this.size * scene.tilesize,
			 this.size * scene.tilesize,
			 this.animationStart,
			 currentAnimationFrame);

    }

    draw(scene, currentAnimationFrame) {
	this.currentAnimationFrame = currentAnimationFrame;
	const ctx = scene.ctx;
	const fillColor = ctx.fillStyle;
	ctx.fillStyle = "orange";
	this.spawnedTiles.map(tile=>scene.drawTile(tile[0], tile[1]));
	ctx.fillStyle = "white";
	this.newSpawnedTiles.map(tile=>scene.drawTile(tile[0], tile[1]));
	ctx.fillStyle = fillColor;

	super.draw(scene, currentAnimationFrame);
	if(this.attack && this.attack.draw) {
	    this.attack.draw(scene, this);
	}
	if(this.label) {
	    const center = vectors.mulVec(this.center, scene.tilesize);
	    const strokeColor = ctx.strokeStyle;
	    const lineWidth = ctx.lineWidth;
	    ctx.fillStyle = "yellow";
	    ctx.strokeStyle = "black";
	    ctx.lineWidth = 3;
	    scene.ctx.strokeText(this.label, center[0], center[1]);
	    scene.ctx.fillText(this.label, center[0], center[1]);
	    ctx.strokeStyle = strokeColor;
	    ctx.lineWidth = lineWidth;
	}

	ctx.fillStyle = fillColor;
	this.currentAnimationFrame = currentAnimationFrame + 1;
    }

    getNextTransitionPhase() {
	const hp = this.lastPhaseHp;
	const sol = this;
	if (hp > 0.75) {
	    this.phase = 2;
	    return new PhaseTransition("Phase 2: something else", sol);
	}
	if (hp > 0.5) {
	    this.phase = 3;
	    return new PhaseTransition("Phase 3: handle this", sol);
	}
	if (hp > 0.25) {
	    this.phase = 4;
	    return new PhaseTransition("Phase 4: can't win", sol);
	}
	if (hp > 0.1) {
	    this.phase = 5;
	    return new PhaseTransition("Phase 5: guided hand", sol);
	}
	if (hp > 0) {
	    this.phase = 6;
	    return new PhaseTransition("Enrage: end this", sol);
	}
	this.phase = 7;
	return new PhaseTransition("Surprise, volatility", sol);
    }

    get nextAttack() {
	const isSpear = this.forceSpear || Math.random() < 0.5;
	this.forceSpear = false;

	if (this.lastPhaseHp <= this.nextPhaseHp) {
	    this.nextPhaseHp = this.getNextPhaseHp();
	    this.forceSpear = true;
	    const nextPhase = this.getNextTransitionPhase();
	    this.ticksToDamage = nextPhase.ticksTaken(sol);
	    return nextPhase;
	}
	
	if (this.currentStats.hitpoint < SPECIAL_HP_LIMIT) {
	    const r = Math.random();
	    if (r < SPECIAL_FREQUENCY) {
		const isGrapple = Math.random() < 0.3;
		if (isGrapple) {
		    this.spear2 = false;
		    this.shield2 = false;
		    this.ticksToDamage = grapple.ticksTaken(this);
		    return new grapple.Grapple();
		} else {
		    
		    this.spear2 = false;
		    this.shield2 = false;
		    this.ticksToDamage = parry.ticksTaken(this);
		    if (PLAY_SOUND) {
			if (this.ticksToDamage == 10) {
			    parry1_sound.play();
			} else {
			    parry2_sound.play();
			}
		    }
		    return new parry.Parry();
		}
	    }
	}
	if (isSpear) {
	    if (PLAY_SOUND) {
		spear_sound.play();
	    }
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
	if (PLAY_SOUND) {
	    shield_sound.play();
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
	const td = this.targetDirection(this.target.position, this.position);
	const delta = vectors.subVec(target.position, this.position);

	


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
