import {Mob} from "./mob.js";
import {UnitTypes} from "./Units.js";


export class PlayerMob extends Mob {

    get size() {
	return 1;
    }
    get image() {
	return imagestore.images["./assets/player.png"];
    }

    nextTurn(map) {
	this.doNextMove(map);
    }

    get type() {
	return UnitTypes.PLAYER;
    }

}
