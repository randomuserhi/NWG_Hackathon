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
			status: "WORKING"
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
		this.radius = 80;
		this.width = 0;
		this.height = 0;
		this.padding = 400;

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

		if (this.state.hovering) {
			this.ctx.beginPath();
			this.ctx.arc(0, 0, this.radius - 10, 0, 2 * Math.PI);

			this.ctx.strokeStyle = "#060424";
			this.ctx.lineWidth = 10 * scale;
			this.ctx.stroke();
		}

		this.ctx.beginPath();
		this.ctx.arc(0, 0, 25, 0, 2 * Math.PI);

		this.ctx.fillStyle = this.state.hovering || this.state.selected ? "#856440" : "#c4955e";
		this.ctx.fill();

		this.ctx.beginPath();

		this.ctx.font = "80px Open Sans";
		/*let a = this.ctx.measureText(this.pipeNode.properties.name).width;
		let b = this.ctx.measureText(`status: ${this.pipeNode.properties.status}`).width;
		let w = a > b ? a : b;
		w += 20;
		let h = 100;
		this.ctx.fillStyle = "rgba(36, 47, 62, 0.5)";
		this.ctx.roundRect(-w / 2, -180, w, h, 5 * scale);
		this.ctx.fill();

		this.ctx.lineWidth = 3 * scale;
		this.ctx.strokeStyle = "rgba(255, 163, 33, 1.0)";
		this.ctx.roundRect(-w / 2, -180, w, h, 5 * scale);
		this.ctx.stroke();*/

		this.ctx.textAlign = "center";
		this.ctx.fillStyle = "#f3cf9c";
		this.ctx.fillText(`${this.pipeNode.properties.name}`, 0, -240);
		if (this.pipeNode.properties.status == "WORKING")
			this.ctx.fillStyle = "#4db070";
		else
			this.ctx.fillStyle = "#eb466d";
		this.ctx.fillText(`status: ${this.pipeNode.properties.status}`, 0, -140);


		this.ctx.restore();
	}
    
})(pipe || (pipe = {}));