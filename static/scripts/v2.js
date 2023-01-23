var v2 = function(x = 0, y = 0) {
	this.x = x;
	this.y = y;
}
v2.prototype.mag = function() {
	return Math.sqrt(this.x * this.x + this.y * this.y);
}
v2.prototype.sqrmag = function() {
	return this.x * this.x + this.y * this.y;
}
Object.defineProperty(v2.prototype, "lat", {
    get() {
        return this.x;
    },
    set(value) {
        this.x = value;
    }
});
Object.defineProperty(v2.prototype, "lng", {
    get() {
        return this.y
    },
    set(value) {
        this.y = value;
    }
});

v2.from = function(a) {
	return new v2(a.x, a.y);
}
v2.dot = function(a, b) {
	return a.x * b.x + a.y * b.y;
}
v2.add = function(a, b) {
	return new v2(a.x + b.x, a.y + b.y);
}
v2.sub = function(a, b) {
	return new v2(a.x - b.x, a.y - b.y);
}
v2.mul = function(a, b) {
	return new v2(a.x * b.x, a.y * b.y);
}
v2.div = function(a, b) {
	return new v2(a.x / b.x, a.y / b.y);
}
v2.scale = function(a, b) {
	return new v2(a.x * b, a.y * b);
}
v2.proj = function(a, norm) {
	return v2.scale(norm, v2.dot(a, norm) / norm.sqrmag())
}
v2.dist = function(a, b) {
	return Math.sqrt((b.x - a.x) * (b.x - a.x) + (b.y - a.y) * (b.y - a.y));
}
v2.sqrdist = function(a, b) {
	return (b.x - a.x) * (b.x - a.x) + (b.y - a.y) * (b.y - a.y);
}