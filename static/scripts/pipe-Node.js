/**
 * @namespace pipe
 */
var pipe;
(function (pipe) {

	pipe.PipeNode = function(location) {
		this.lat = location.lat;
		this.lng = location.lng;
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
		this.pipeNode = pipeNode;
	}
	pipe.PipeNodeRenderer.prototype = new pipe.Renderer();
	pipe.PipeNodeRenderer.prototype.pipeNode = null;
	pipe.PipeNodeRenderer.prototype.radius = 10;
	pipe.PipeNodeRenderer.prototype.width = 10;
	pipe.PipeNodeRenderer.prototype.height = 10;
	pipe.PipeNodeRenderer.prototype.remap = function(projection) {
		let location = projection.fromLatLngToDivPixel(new google.maps.LatLng(this.pipeNode.lat, this.pipeNode.lng));
		let scale = pipe.Renderer.getScaleFactor();

		this.width = this.radius * 2;
		this.height = this.radius * 2;

		this.canvas.style.left = `${location.x - this.width / 2}px`;
		this.canvas.style.top = `${location.y - this.height / 2}px`;

		this.canvas.width = this.width;
		this.canvas.height = this.height;
	};
	pipe.PipeNodeRenderer.prototype.draw = function(time = 0) {
		console.log("sus");

		let scale = pipe.Renderer.getScaleFactor();

		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

		this.ctx.save();
		this.ctx.translate(this.width / 2, this.height / 2);
		this.ctx.scale(scale, scale);

		this.ctx.beginPath();
		this.ctx.arc(0, 0, this.radius, 0, 2 * Math.PI);

		this.ctx.fillStyle = "red";
		this.ctx.fill();

		this.ctx.restore();
	}
    
})(pipe || (pipe = {}));