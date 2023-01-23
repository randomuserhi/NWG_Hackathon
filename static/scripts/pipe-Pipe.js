"use strict";

/**
 * @namespace pipe
 */
var pipe;
(function (pipe) {

	pipe.Pipe = function(start, end) {
		pipe.Object.call(this); // invoke inherited constructor

		this.points = [
				start, 
				end
			];

		this.properties = {
			diameter: 10,
			name: "",
			status: "Working"
		}

		this.sim = {
			flow: 0.1,
			pressure: 1
		}
	}
	pipe.Pipe.prototype = new pipe.Object();
	pipe.Pipe.prototype.points = [];
	pipe.Pipe.prototype.getRenderer = function() {
		return new pipe.PipeRenderer(this);
	}
	pipe.Pipe.prototype.insert = function (index, location) {
		if (index <= 0 || index >= this.points.length) {
			console.warn("Cannot insert at start or end of pipe.");
			return;
		}
		this.points.splice(index, 0, location);
	}

	pipe.PipeRenderer = function(p) {
		if (!p) {
			console.error("No pipeNode was provided.");
			return null;
		}
		
		pipe.Renderer.call(this); // invoke inherited constructor
		this.pipe = p;
		this.points = [];
		this.bottomLeft = new v2();
		this.topRight = new v2();
		this.padding = 200;

		this.animTime = 2;

		this.interactState = {
			closest: null
		}

		this.state = {
			hovering: false,
			selected: false,
			edge: false
		};

		this.addEventListener("attach", () => { this.canvas.classList.add("pipe-renderer"); });
	}
	pipe.PipeRenderer.prototype = new pipe.Renderer();
	pipe.PipeRenderer.prototype.distance = function(location) {
		return Math.sqrt(this.sqrdistance(location));
	}
	pipe.PipeRenderer.prototype.sqrdistance = function(location) {
		//https://stackoverflow.com/questions/67144563/how-to-get-the-shortest-distance-from-a-point-in-space-to-a-line-segment

		let dist = [];

		for (let i = 0; i < this.points.length - 1; ++i) {
			let a = this.points[i];
			let b = this.points[i+1];

			let pointOnLine = new v2();
			
			if(v2.dot(v2.sub(a, b),v2.sub(location, a)) > 0) pointOnLine = v2.from(a);
			else if(v2.dot(v2.sub(b, a),v2.sub(location, b)) > 0) pointOnLine = v2.from(b);
			else pointOnLine = v2.add(a, v2.proj(v2.sub(location, a), v2.sub(b, a)));

			dist.push({ segment: i, sqrdistance: v2.sqrdist(pointOnLine, location) });
		}

		dist = dist.sort((a, b) => { return a.sqrdistance - b.sqrdistance; });
		this.interactState.closest = dist[0];

		return dist[0].sqrdistance;
	}
	pipe.PipeRenderer.prototype.inScreenRange = function(location, distance = 50) {
		if (!this.canvas) return false;

		let scale = pipe.Renderer.getScaleFactor();
		distance *= scale;

		return this.sqrdistance(location) < distance * distance;
	}
	pipe.PipeRenderer.prototype.remap = function(projection) {
		let scale = pipe.Renderer.getScaleFactor();

		this.points = [];
		this.points.push(projection.fromLatLngToDivPixel(new google.maps.LatLng(this.pipe.points[0].lat, this.pipe.points[0].lng)));
		this.bottomLeft.x = this.points[0].x;
		this.bottomLeft.y = this.points[0].y;
		this.topRight.x = this.points[0].x;
		this.topRight.y = this.points[0].y;
		for (let i = 1; i < this.pipe.points.length; ++i) {
			let point = projection.fromLatLngToDivPixel(new google.maps.LatLng(this.pipe.points[i].lat, this.pipe.points[i].lng));
			this.points.push(point);

			if (point.x < this.bottomLeft.x) this.bottomLeft.x = point.x;
			else if (point.x > this.topRight.x) this.topRight.x = point.x;
			if (point.y < this.bottomLeft.y) this.bottomLeft.y = point.y;
			else if (point.y > this.topRight.y) this.topRight.y = point.y;
		}

		let padding = this.padding * scale;

		this.canvas.style.left = `${this.bottomLeft.x - padding}px`;
		this.canvas.style.top = `${this.bottomLeft.y - padding}px`;

		this.canvas.width = this.topRight.x - this.bottomLeft.x + padding * 2;
		this.canvas.height = this.topRight.y - this.bottomLeft.y + padding * 2;
	};
	pipe.PipeRenderer.prototype.draw = function(time = 0) {
		let scale = pipe.Renderer.getScaleFactor();
		let padding = this.padding * scale;
		const transformPoint = function(point) {
			return new v2(point.x - this.bottomLeft.x + padding, point.y - this.bottomLeft.y + padding);
		}.bind(this);

		const drawPath = function(thickness, color) {
			this.ctx.save();

			this.ctx.beginPath();
			
			let p = transformPoint(this.points[0]);
			this.ctx.moveTo(p.x, p.y);
			for (let i = 1; i < this.points.length; ++i) {
				p = transformPoint(this.points[i]);
				this.ctx.lineTo(p.x, p.y);
				this.ctx.moveTo(p.x, p.y);
			}

			this.ctx.strokeStyle = color;
			this.ctx.lineWidth = thickness * scale;
			this.ctx.lineCap = "round";
			this.ctx.stroke();

			this.ctx.restore();
		}.bind(this);

		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

		if (this.interactState.closest) {
			this.ctx.save();

			this.ctx.beginPath();
			
			let a = transformPoint(this.points[this.interactState.closest.segment]);
			let b = transformPoint(this.points[this.interactState.closest.segment+1]);

			if (this.state.hovering) {
				this.ctx.moveTo(a.x, a.y);
				this.ctx.lineTo(b.x, b.y);

				this.ctx.strokeStyle = "red";
				this.ctx.lineWidth = 70 * scale;
				this.ctx.lineCap = "round";
				this.ctx.stroke();
			}
			else if (this.state.edge) {
				let cap = 80 * scale;

				let diff = v2.sub(b, a);
				let mag = diff.mag();
				cap = cap < mag ? cap : mag;
				this.ctx.moveTo(a.x, a.y);
				this.ctx.lineTo(a.x + diff.x / mag * cap, a.y + diff.y / mag * cap);

				this.ctx.strokeStyle = "white";
				this.ctx.lineWidth = 70 * scale;
				this.ctx.lineCap = "round";
				this.ctx.stroke();

				diff = v2.sub(a, b);
				mag = diff.mag();
				cap = cap < mag ? cap : mag;
				this.ctx.moveTo(b.x, b.y);
				this.ctx.lineTo(b.x + diff.x / mag * cap, b.y + diff.y / mag * cap);

				this.ctx.strokeStyle = "white";
				this.ctx.lineWidth = 70 * scale;
				this.ctx.lineCap = "round";
				this.ctx.stroke();
			}

			this.ctx.restore();
		}

		drawPath(60, "orange");
		drawPath(50, "grey");

		for (let i = 0; i < this.points.length - 1; ++i) {
			let start = transformPoint(this.points[i]);
			let end = transformPoint(this.points[i+1]);
			let color = "blue";
			if (this.pipe.sim.flow < 0) {
				let temp = start;
				start = end;
				end = temp;
				color = "red";
			}
			let diff = v2.sub(end, start);
			let mag = diff.mag();
			let dir = v2.scale(diff, 1/mag);

			let ideal = 250 * Math.abs(this.pipe.sim.flow) * scale;
			if (ideal == 0) continue;
			let calc = mag / ideal * Math.abs(this.pipe.sim.flow);
			let numSections = Math.round(calc < 2 ? 2 : calc);
			let size = mag / numSections;
			let gap = 0.2 / this.pipe.sim.pressure;
			for (let j = 0; j < numSections; ++j) {
				let a = (this.animTime - gap) % 1;
				let b = 1 - (this.animTime + gap) % 1;
				let s1 = v2.add(start, v2.scale(dir, size * j));
				let e1 = v2.add(s1, v2.scale(dir, size * a));
				let e2 = v2.add(start, v2.scale(dir, size * (j+1)));
				let s2 = v2.sub(e2, v2.scale(dir, size * b));

				let c = (this.animTime - 1 + gap) % 1;
				let d = (this.animTime - 1 + (1 - gap)) % 1;
				let s3 = v2.add(s1, v2.scale(dir, size * c));
				let e3 = v2.add(s1, v2.scale(dir, size * d));

				if (a < 1 - gap * 2) {
					this.ctx.beginPath();
					this.ctx.moveTo(s1.x, s1.y);
					this.ctx.lineTo(e1.x, e1.y);

					this.ctx.strokeStyle = color;
					this.ctx.lineWidth = 50 * scale;
					this.ctx.lineCap = "round";
					this.ctx.stroke();

					this.ctx.beginPath();
					this.ctx.moveTo(e2.x, e2.y);
					this.ctx.lineTo(s2.x, s2.y);

					this.ctx.strokeStyle = color;
					this.ctx.lineWidth = 50 * scale;
					this.ctx.lineCap = "round";
					this.ctx.stroke();
				}
				else {
					this.ctx.beginPath();
					this.ctx.moveTo(s3.x, s3.y);
					this.ctx.lineTo(e3.x, e3.y);

					this.ctx.strokeStyle = color;
					this.ctx.lineWidth = 50 * scale;
					this.ctx.lineCap = "round";
					this.ctx.stroke();
				}
			}
		}
		this.animTime += time * Math.abs(this.pipe.sim.flow);

		for (let i = 0; i < this.points.length - 1; ++i) {
			this.ctx.save();
			let mid = v2.scale(v2.add(transformPoint(this.points[i]), transformPoint(this.points[i+1])), 0.5);

			this.ctx.translate(mid.x, mid.y);
			this.ctx.scale(scale, scale);
			this.ctx.font = "15px Arial";
			this.ctx.textAlign = "center";
			this.ctx.fillStyle = "blue";
			this.ctx.fillText(`${this.pipe.properties.name}`, 0,- 10);
			this.ctx.fillStyle = "green";
			this.ctx.fillText(`status: ${this.pipe.properties.status}`,0, 10);

			this.ctx.restore();
		}
	};
    
})(pipe || (pipe = {}));