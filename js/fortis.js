let randoms = import("./randoms.js");
let vectors = import("./vector-stuff.js");
let maps = import("./map.js");
let sol = import("./sol.js");
let playermob = import("./player.js");


const colors = ["#FF0000", "#00A08A", "#F2AD00", "#F98400", "#5BBCD6"];
class ImageStore {
    constructor(images) {
	this.images = {};
	this.list = images;
	this.size = images.length;
    }

    async load() {
	const state = {unloaded: this.size};
	return new Promise((accept, resolve)=>{
	    state.accept = accept;
	    for(var name of this.list) {
		const img = this.images[name] = document.createElement("img");
		img.onload = this.loader.bind(state);
		img.src = name;
	    }
	});
    }

    loader() {
	this.unloaded -= 1;
	if (this.unloaded == 0) {
	    this.accept();
	}
    }
};

class Scene {
    constructor(map, w, h, tilesize, bg, id){
	this.map = map;
	this.canvas = document.getElementById(id);
	this.ctx = this.canvas.getContext("2d");
	this.canvas.width = tilesize * w;
	this.canvas.height = tilesize * h;
	this.tilesize = tilesize;
	this.width = w;
	this.height = h;
	this.bg = imagestore.images[bg];
	this.drawables = [];

	this.smoothIt();
    }

    hitbox(position) {
        const x = 0 +
	      (doc && doc.scrollLeft || body && body.scrollLeft || 0) -
	      (doc && doc.clientLeft || body && body.clientLeft || 0);
        const y = 0 +
	      (doc && doc.scrollTop  || body && body.scrollTop  || 0) -
	      (doc && doc.clientTop  || body && body.clientTop  || 0 );
	return [position[0] * this.tilesize + x,
		position[1] * this.tilesize + y];
    }

    addDrawables(draws){
	this.drawables = this.drawables.concat(draws);
    }
    addDrawable(draw){
	this.drawables.push(draw);
    }

    drawTile(x, y) {
	
	//console.log("drawing",x,y);
	this.ctx.fillRect(
            (x) * scene.tilesize,
            (y) * scene.tilesize,
            scene.tilesize,
            scene.tilesize
          )
    }

    drawTileC(x, y, c) {
	const fillOld = this.ctx.fillStyle;
	this.ctx.fillStyle = c;
	//console.log("drawing",x,y);
	this.ctx.fillRect(
            (x) * scene.tilesize,
            (y) * scene.tilesize,
            scene.tilesize,
            scene.tilesize
        )
	this.ctx.fillStyle = fillOld;
    }

    smoothIt() {
	const ctx = this.ctx;
	const smooth = false;
	ctx.imageSmoothingEnabled = smooth;
	ctx.mozImageSmoothingEnabled = smooth;
	ctx.webkitImageSmoothingEnabled = smooth;
    }

    drawAll(){
	this.draw();
	this.drawables.forEach(x=>x.draw(this));
    }

    draw() {
	const ctx = this.ctx;

	ctx.drawImage(this.bg, 0,0,this.width * this.tilesize,this.height * this.tilesize);
	/*for (let x = 0; x < this.width; ++x) {
	    for (let y = 0; y < this.height; ++y) {
		ctx.fillStyle = colors[(x+y) % colors.length];
		ctx.fillRect(x * this.tilesize, y * this.tilesize, this.tilesize, this.tilesize)
	    }
	}*/
    }
};


let scene = null;
let map = null;
let imgNames = ["map", "player", "sol"].map(x=>`./assets/${x}.png`)
let imagestore = null;
let targetstore = null;
let player = null;
let sceneRemote = null;
let solMob = null;

function blockMapRect(map, x,y,w,h) {
    for(let xi = x; xi < x+w; ++xi) {
	for(let yi = y; yi < y+h; ++yi) {
	    map.setBlocking(xi, yi, maps.BLOCK_WALL);
	}
    }
}

async function main() {
    randoms = (await randoms);
    vectors = await window.vectors;
    maps = await maps;
    sol = await sol;
    playermob = await playermob;

    imagestore = new ImageStore(imgNames);
    await imagestore.load();
    map = new maps.Map(21, 21);
    scene = new Scene(map, 21, 21, 32, "./assets/map.png", "canvas");

    map.scene = scene;

    blockMapRect(map, 0,0,3,21);
    blockMapRect(map, 0,0,21,3);
    blockMapRect(map, 18,0,3,21);
    blockMapRect(map, 0,18,21,3);
    map.setBlocking(3,3, maps.BLOCK_WALL);
    map.setBlocking(17,3, maps.BLOCK_WALL);
    map.setBlocking(3,17, maps.BLOCK_WALL);
    map.setBlocking(17,17, maps.BLOCK_WALL);

    solMob = new sol.SolMob([8,8]);
    const playerMob = new playermob.PlayerMob([10,15]);

    player = playerMob;
    solMob.target = playerMob;

    player.block(map);
    solMob.block(map);
    
    scene.addDrawable(solMob);
    scene.addDrawable(playerMob);

    
    scene.drawAll();

    setTimeout(mainLoop, 600);
}




function mainLoop(){

    const monsters = [solMob];
    let stillGoing = false;
    player.nextTurn(map);

    const didMove = monsters.map(x=>x.nextTurn(map));
    const didMoveAny = didMove.indexOf(true) != -1;
    stillGoing = stillGoing || didMoveAny;


    scene.drawAll();


    setTimeout(mainLoop, 600);

}

canvas.onclick = function(event) {
	var eventDoc, doc, body;
    var rect = this.getBoundingClientRect()
	event = event || window.event; // IE-ism

	// If pageX/Y aren't available and clientX/Y are,
	// calculate pageX/Y - logic taken from jQuery.
	// (This is to support old IE)
	if (event.pageX == null && event.clientX != null) {
            eventDoc = (event.target && event.target.ownerDocument) || document;
            doc = eventDoc.documentElement;
            body = eventDoc.body;

            event.pageX = event.clientX +
		(doc && doc.scrollLeft || body && body.scrollLeft || 0) -
		(doc && doc.clientLeft || body && body.clientLeft || 0);
            event.pageY = event.clientY +
		(doc && doc.scrollTop  || body && body.scrollTop  || 0) -
		(doc && doc.clientTop  || body && body.clientTop  || 0 );
	}
    const thisX = event.pageX - rect.x - window.scrollX;
    const thisY = event.pageY - rect.y - window.scrollY;

    const x = (thisX) / scene.tilesize | 0;
    const y = (thisY) / scene.tilesize | 0;
    
    player.target = getTargetAtPos([x,y]);
}

function getTargetAtPos(position) {
    const result = [solMob].find(mob=>{
	const found = mob.getClosestTileTo(position[0], position[1]);
	return found[0] == position[0] && found[1] == position[1];
    });
    return result || {position, type: 3}
}

function prayRange() {
    if (player.prayer == "range") {
	player.prayer = null;
	return;
    }
    player.prayer = "range";
}
function prayMage() {
    if (player.prayer == "mage") {
	player.prayer = null;
	return;
    }
    player.prayer = "mage";
}

function makebutton(name, onclick){
    name = name || type;
    const classname = name.replace(/\s/g, "-");
    var button = document.createElement("button");
    button.classList.add(`button-${classname}`);
    button.textContent = name;
    document.getElementById("buttons").appendChild(button);
    button.onclick = onclick;
    return button;
}

function makeimgbt(img, onclick) {
    const button = makebutton(img, onclick);
    button.textContent = "";
    var elImg = document.createElement("img");
    elImg.src = img;
    button.appendChild(elImg);
    return button;
}


main();
