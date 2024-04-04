export const BLOCK_WALL = 1;
export const BLOCK_MOB = 2;
export const BLOCK_FREE = 0;



export class Map{
    constructor(width, height){
	this.width = width;
	this.height = height;
	this.blocking = new Array(width*height).fill(BLOCK_FREE);
    }

    setBlocking(x, y, block){
	if (x < 0 || x >= this.width) {
	    return;
	}
	if (y < 0 || y >= this.height) {
	    return;
	}
	this.blocking[x + y*this.width] = block;
    }

    getBlocking(x, y){
	if (x < 0 || x >= this.width) {
	    return BLOCK_WALL;
	}
	if (y < 0 || y >= this.height) {
	    return BLOCK_WALL;
	}
	return this.blocking[x + y*this.width];
    }
}
