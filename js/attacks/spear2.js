import * as normalDamage from "./normalAttackDamage.js";

const SAFE_DIST = 3;

export function draw(scene, sol) {
    if (sol.ticksToDamage > 0) {
	return;
    }
    const alpha = scene.ctx.globalAlpha;
    const color = scene.ctx.fillStyle;
    scene.ctx.fillStyle = "#ccc";
    scene.ctx.globalAlpha = 0.4;
    const center = sol.center;
    for(let x = 0; x < scene.width; ++x) {
	for(let y = 0; y < scene.height; ++y) {
	    if (isInside(x, y, center)) {
		scene.drawTile(x, y);
	    }
	}
    }
    scene.ctx.globalAlpha = alpha;
    scene.ctx.fillStyle = color;
}

export function isInside(x, y, center) {
    const dx = Math.abs(x - center[0]);
    const dy = Math.abs(y - center[1]);
    const normalSides = (dx < SAFE_DIST && dy < SAFE_DIST) || dx == 0 || dy == 0 || dx == 2 || dy == 2 || (dx == SAFE_DIST && dy < SAFE_DIST) || (dy == SAFE_DIST && dx < SAFE_DIST);
    const lines = (dy - dx) == 0 || (dx - dy) == 3 || (dy - dx) == 3;
    const isInCorner = dx > SAFE_DIST -2 && dy > SAFE_DIST -2;
    return  normalSides || isInCorner && lines;
}

export function label() {
    if (window.SHOW_LABEL) {
	return "spear";
    } else {
	return "";
    }
}

export function damage(target, sol) {
    if (sol.ticksToDamage == 1) {
	sol.cur_img = "./assets/sol_spear.png";
    } else {
	sol.cur_img = "./assets/sol.png";
    }
    if (!target || sol.ticksToDamage > 0) {
	return;
    }
    const p = target.position;
    if (isInside(p[0], p[1], sol.center)) {
	normalDamage.damage(target);
    }
}


export function ticksTaken(sol) {
    return 4;
}

export function delayNextAttackBy(sol) {
    if (sol.phase >= 3) {
	return 3;
    }
    return 4;
}
