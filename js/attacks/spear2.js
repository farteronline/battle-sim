import * as normalDamage from "./normalAttackDamage.js";

const SAFE_DIST = 4;

export function draw(scene, sol) {
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
    const normalSides = (dx < SAFE_DIST && dy < SAFE_DIST) || dx == 0 || dy == 0 || dx == 2 || dy == 2;
    const diagonalWrongLines = (dx - dy) == 1 || (dy - dx) == 1;
    const isInCorner = dx > SAFE_DIST -2 && dy > SAFE_DIST -2;
    return  normalSides || (isInCorner && !diagonalWrongLines);
}

export function label() {
    return "spear";
}

export function damage(target) {
    normalDamage.damage(target);
}
