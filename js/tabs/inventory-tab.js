
export function populate(div, state) {
    state = state || {};

    /*for(var row = 0; row < 7; ++row) {
	for(var col = 0; col < 4; ++col) {


	    makeimgbt("./assets/a", `row-${row} col-${col}`, console.log, div);
	}
	}*/

    new Array(2).fill(0)
	.forEach(()=>makeimgbt("./assets/pot_c.png", "", clickCombat(state), div));
    new Array(2).fill(0)
	.forEach(()=>makeimgbt("./assets/empty.png", "", console.log, div));
    new Array(2).fill(0)
	.forEach(()=>makeimgbt("./assets/pot_r.png", "", clickRestore(state), div));
    new Array(2).fill(0)
	.forEach(()=>makeimgbt("./assets/empty.png", "", console.log, div));
        new Array(2).fill(0)
	.forEach(()=>makeimgbt("./assets/pot_r.png", "", clickRestore(state), div));
    new Array(2).fill(0)
	.forEach(()=>makeimgbt("./assets/empty.png", "", console.log, div));
    new Array(2).fill(0)
	.forEach(()=>makeimgbt("./assets/pot_b.png", "", clickBrew(state), div));
    new Array(2).fill(0)
	.forEach(()=>makeimgbt("./assets/empty.png", "", console.log, div));
    new Array(2).fill(0)
	.forEach(()=>makeimgbt("./assets/pot_b.png", "", clickBrew(state), div));
    new Array(2).fill(0)
	.forEach(()=>makeimgbt("./assets/empty.png", "", console.log, div));
    new Array(8).fill(0)
	.forEach(()=>makeimgbt("./assets/empty.png", "", console.log, div));


    return state;
}

function clickBrew(state) {
    return function() {
	if (state.tick < state.last_pot_tick + 3) {
	    return;
	}
	state.last_pot_tick = state.tick;

	if (state.currentStats.hitpoint > 0) {
	    state.currentStats.hitpoint += 16;
	    if (state.currentStats.hitpoint > 115) {
		state.currentStats.hitpoint = 115;
	    }
	}
	if (state.pot_combat) {
	    state.pot_combat = false;
	    return;
	}
	state.pot_brew += 1;
    }
}


function clickRestore(state) {
    return function() {
	if (state.tick < state.last_pot_tick + 3) {
	    return;
	}
	state.last_pot_tick = state.tick;

	if (state.pot_brew > 0) {
	    state.pot_brew -= 3;
	}
	if (state.pot_brew <= 0) {
	    state.pot_brew = 0;
	}
    }
}

function clickCombat(state) {
    return function() {
	if (state.tick < state.last_pot_tick + 3) {
	    return;
	}
	state.last_pot_tick = state.tick;

	if (state.pot_combat) {
	    return;
	}
	if (state.pot_brew > 0) {
	    state.pot_brew -= 1;
	    return;
	}
	state.pot_combat = true;
    }
}

function makebutton(name, klass, onclick, div){
    name = name || type;
    var button = document.createElement("button");
    klass.split(" ").forEach(classname=> {
	button.classList.add(`button-${classname}`);
    });
    button.textContent = name;
    div.appendChild(button);
    button.onclick = onclick;
    return button;
}

function makeimgbt(img, klass, onclick, div) {
    const button = makebutton(img, klass, onclick, div);
    button.textContent = "";
    var elImg = document.createElement("img");
    elImg.src = img;
    button.appendChild(elImg);
    return button;
}

