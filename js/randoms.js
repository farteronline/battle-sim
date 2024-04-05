export function shuffle(array) {
  let currentIndex = array.length,  randomIndex;

  // While there remain elements to shuffle.
  while (currentIndex > 0) {

    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
      array[randomIndex], array[currentIndex]];
  }

  return array;
}

export function gaussianRandom(mean=0, maxdev=1) {
    let u = 1 - Math.random(); // Converting [0,1) to (0,1]
    u = Math.max(u, 0.0112);
    const v = Math.random();
    const z = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
    // Transform to the desired mean and standard deviation:
    return z * maxdev/3 + mean;
}

export function gaussianRandomVec(VV) {
    const [mean, maxdev]=VV;
    let u = 1 - Math.random(); // Converting [0,1) to (0,1]
    u = Math.max(u, 0.0112);
    const v = Math.random();
    const z = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
    // Transform to the desired mean and standard deviation:
    return z * maxdev/3 + mean;
}


// [-1, 1]
export function gRandNormMag() {
    return gaussianRandom(0, 1);
}

//[0,1]
export function gRandNormal() {
    return gaussianRandom(0.5, 0.5);
}

export function randomWeighted(set) {
    let random = Math.random() * set.sum;
    for (let i = 0; i < set.vals.length; ++i) {
	if (random <= set.vals[i]){
	    return i;
	}
	random -= set.vals[i];
    }
    return set.length - 1;
}

export function pickRand(array){
    return array[(Math.random()*array.length)|0];
}

export function pickRandIndex(array){
    return (Math.random()*array.length)|0;
}
