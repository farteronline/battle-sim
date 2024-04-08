
export function populate(div, state) {
    state = state || {};
    makeimgbt("./assets/body.png", "body", click( "BODY", state), div);
    makeimgbt("./assets/hands.png", "hands", click( "HANDS", state), div);
    makeimgbt("./assets/legs.png", "legs", click( "LEGS", state), div);
    makeimgbt("./assets/boots.png", "boots", click( "FEET", state), div);
    makeimgbt("./assets/cape.png", "cape", click( "BACK", state), div);
    return state;
}

function click(part, state) {
    return function() {
	state.slotClicked = part;
    }
}

function makebutton(name, klass, onclick, div){
    name = name || type;
    const classname = klass;
    var button = document.createElement("button");
    button.classList.add(`button-${classname}`);
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

