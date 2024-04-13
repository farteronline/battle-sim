import * as normalDamage from "./normalAttackDamage.js";
const SAFE_DIST = 4;

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
    return  !((dx == SAFE_DIST || dy == SAFE_DIST) && (dx <= SAFE_DIST &&  dy <= SAFE_DIST)) ;
}

export function label() {
    return "shield";
}

export function damage(target, sol) {
    if (sol.ticksToDamage == 1) {
	sol.cur_img = "./assets/sol_shield.png";
    } else {
	sol.cur_img = "./assets/sol.png";
    }
    if (!target || sol.ticksToDamage > 0) {
	return;
    }
    const p = target.lastPosition;
    if (isInside(p[0], p[1], sol.center)) {
	normalDamage.damage(target);
    }
}

export function ticksTaken(sol) {
    return 4;
}
