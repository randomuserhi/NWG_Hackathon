"use strict";

/**
 * @namespace pipe
 */
var pipe;
(function (pipe) {

	pipe.PipeNode = function(location) {
		pipe.Object.call(this); // invoke inherited constructor

		this.lat = location.lat;
		this.lng = location.lng;

		this.properties = {
			demand: 0.1,
			height: 10,
			name: "",
			status: "Working"
		}

		this.sim = {
			water: 0,
			nextwater: 0
		}
	}
	pipe.PipeNode.prototype = new pipe.Object();
	pipe.PipeNode.prototype.lat = 0;
	pipe.PipeNode.prototype.lng = 0;
	pipe.PipeNode.prototype.getRenderer = function() {
		return new pipe.PipeNodeRenderer(this);
	}

	pipe.PipeNodeRenderer = function(pipeNode) {
		if (!pipeNode) {
			console.error("No pipeNode was provided.");
			return null;
		}

		pipe.Renderer.call(this); // invoke inherited constructor
		this.pipeNode = pipeNode;
		this.radius = 35;
		this.width = 0;
		this.height = 0;
		this.padding = 200;

		this.state = {
			hovering: true,
			selected: false
		};

		this.addEventListener("attach", () => { this.canvas.classList.add("node-renderer"); });
	}
	pipe.PipeNodeRenderer.prototype = new pipe.Renderer();
	pipe.PipeNodeRenderer.prototype.inScreenRange = function(location, distance = this.radius) {
		if (!this.canvas) return false;

		let scale = pipe.Renderer.getScaleFactor();
		distance *= scale;

		return this.sqrdistance(location) < distance * distance;
	}
	pipe.PipeNodeRenderer.prototype.remap = function(projection) {
		let location = projection.fromLatLngToDivPixel(new google.maps.LatLng(this.pipeNode.lat, this.pipeNode.lng));
		let scale = pipe.Renderer.getScaleFactor();
		let padding = this.padding * scale;

		this.width = this.radius * 2 * scale + padding * 2;
		this.height = this.radius * 2 * scale + padding * 2;

		this.canvas.style.left = `${location.x - this.width / 2}px`;
		this.canvas.style.top = `${location.y - this.height / 2}px`;

		this.canvas.width = this.width;
		this.canvas.height = this.height;
	};
	pipe.PipeNodeRenderer.prototype.draw = function(time = 0) {
		let scale = pipe.Renderer.getScaleFactor();
		let padding = this.padding * scale;

		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

		this.ctx.save();
		this.ctx.translate(this.width / 2, this.height / 2);
		this.ctx.scale(scale, scale);

		this.ctx.beginPath();
		this.ctx.arc(0, 0, this.radius, 0, 2 * Math.PI);

		this.ctx.fillStyle = this.state.hovering || this.state.selected ? "red" : "white";
		this.ctx.fill();

		this.ctx.font = "30px Arial";
		this.ctx.textAlign = "center";
		this.ctx.fillStyle = "blue";
		this.ctx.fillText(`${this.pipeNode.properties.name}`, 0, -120);
		this.ctx.fillStyle = "green";
		this.ctx.fillText(`status: ${this.pipeNode.properties.status}`, 0, -80);

		this.ctx.restore();
	}
    
})(pipe || (pipe = {}));