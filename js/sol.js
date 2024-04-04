import {Mob} from "./mob.js";


export class SolMob extends Mob {


    nextTurn(map) {
	this.doNextMove(map);
    }
}
