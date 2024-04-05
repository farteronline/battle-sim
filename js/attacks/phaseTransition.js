
export class PhaseTransition {
    constructor(label) {
	this.text = label;
    }

    draw(scene, sol) {

    }

    label() {
	return this.text;
    }

    isInside(x, y, center) {
	return false;
    }

    damage(target, sol){

    }
}
