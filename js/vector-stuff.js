import * as randoms from "./randoms.js";

export function dotVec(A, B){
    return A[0] * B[0] + A[1] * B[1];
}
export function divVec(A, b){
    return [A[0] / b, A[1] / b];
}
export function interpolateVec(t, A, B){
    const diffX = B[0] - A[0];
    const diffY = B[1] - A[1];
    return [A[0] + t * diffX, A[1] + t * diffY];
}

export function sumList(list) {
    let sum = 0;
    for(var i = 0; i < list.length; ++i) {
	sum += list[i];
    }
    return sum;
}


export function normalVec(A,B) {
    let dx = (A[0] - B[0]);
    let dy = (A[1] - B[1]);
    const M = Math.sqrt(dx*dx + dy*dy);
    dy /= M;
    dx /= M;
    if (dx > 0) {
	return [dy, -dx];
    } else {
	return [-dy, dx];
    }
}

export function clamp(x, a, b) {
    return Math.max(a, Math.min(x, b));
}

export function manhattenDist(A,B) {
    let dx = Math.abs(A[0] - B[0]);
    let dy = Math.abs(A[1] - B[1]);
    return Math.max(dx, dy);
}

export function lenVec(A,B) {
    let dx = (A[0] - B[0]);
    let dy = (A[1] - B[1]);
    return Math.sqrt(dx*dx + dy*dy);
}

export function magVec(A) {
    let dx = A[0];
    let dy = A[1];
    return Math.sqrt(dx*dx + dy*dy);
}

export function clone(A) {
    return [A[0],A[1]];
}

export function midPoint(A,B) {
    return [(A[0] + B[0])/2,(A[1] + B[1])/2];
}

export function mulVec(A, s){
    return [A[0] * s, A[1] * s];
}

export function addVec(A, B){
    return [A[0] + B[0],A[1] + B[1]];
}

export function subVec(A, B){
    return [A[0] - B[0],A[1] - B[1]];
}

export function vecToPoint(A){
    return {x:A[0], y:A[1]}
}

export function pointsEqual(A,B){
    return A[0] == B[0] && A[1] == B[1];
}

var angles = [Math.PI * 0.85, 0];

export function interpolate(v, R) {
    let diff = R[0] - R[1];
    return diff * v + R[1];
}

export function angleAdd(A, angle, dist) {
    return [
	A[0] + Math.sin(angle) * dist,
	A[1] + Math.cos(angle) * dist
    ];
}

export function offsetPoint(A,B, maxDist = 20, mag = null, s = null) {
    mag = mag ?? Math.abs(randoms.gRandNormMag());
    let angle = interpolate(mag, angles);
    s = s ?? Math.random();
    if (s < 0.5) {
	angle = -angle;
    }
    angle += 2*Math.PI;
    angle += angleTo(A,B);

    const minDist = Math.min(20, maxDist);
    const dist = interpolate(Math.random(), [minDist, maxDist]);;

    return angleAdd(A, angle, dist);
}

export function angleTo(A,B) {
    let dx = (A[0] - B[0]);
    let dy = (A[1] - B[1]);
    return Math.atan2(dx, dy) + Math.PI;
}
