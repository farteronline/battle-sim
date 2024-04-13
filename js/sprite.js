export class Sprite {
    constructor(image, xTiles, yTiles, sprite_w, sprite_h, frame_start, frame_stop, slow_factor = null) {
	this.image = image;
	this.xTiles = xTiles;
	this.yTiles = yTiles;
	this.spriteWidth = sprite_w;
	this.spriteHeight = sprite_h;
	this.start = frame_start;
	this.end = frame_stop;
	this.slow_factor = slow_factor;
    }
    draw(ctx, x, y, width, height, startFrame, frame) {
	frame = frame - startFrame;
	if (this.slow_factor != null) {
	    frame = (frame * this.slow_factor) | 0;
	}

	frame += this.start;
	if (frame > this.end) {
	    frame = this.end;
	}
	if (frame < this.start) {
	    frame = this.start;
	}
	const sx = (frame % this.xTiles) * this.spriteWidth;
	const sy = ((frame / this.xTiles) | 0) * this.spriteHeight;
	ctx.drawImage(this.image,
		      sx,
		      sy,
		      this.spriteWidth,
		      this.spriteHeight,
		      x, y, width, height);
    }
}
