/**
 * @namespace pipe
 */
var pipe;
(function (pipe) {

	pipe.Event = function(bind) {
		this.bind = bind;
	}
	pipe.Event.prototype.bind = null;
	pipe.Event.prototype.call = function(event, object = null) {
		if (this.hasOwnProperty(event)) for (let i = 0; i < this[event].length; ++i) this[event][i](object);
	}
	pipe.Event.prototype.add = function(event, callback) {
		if (this.hasOwnProperty(event)) this[event].push(callback.bind(this.bind));
		else this[event] = [callback];
	}
	pipe.Event.prototype.remove = function(event, callback) {
		if (this.hasOwnProperty(event)) this[event] = this[event].filter(e => e !== callback);
	}

	pipe.Renderer = function() {
		this.events = new pipe.Event(this);
	}
	pipe.Renderer.getScaleFactor = function() {
		if (!map.instance) return 1;
		return 1 / Math.pow(2, 22 - map.instance.getZoom());
	}
	pipe.Renderer.prototype.canvas = null;
	pipe.Renderer.prototype.ctx = null;
	pipe.Renderer.prototype.events = null;
	pipe.Renderer.prototype.addEventListener = function (event, callback) {
		this.events.add(event, callback);
	}
	pipe.Renderer.prototype.removeEventListener = function (event, callback) {
		this.events.remove(event, callback);
	}
	pipe.Renderer.prototype.draw = function(time) {
		// overridable function
	};
	pipe.Renderer.prototype.render = function(time) {
		let scale = pipe.Renderer.getScaleFactor();

		// TODO:: dont just check scale, also check map bounds (effectively culling)
		if (this.canvas.width * scale > 1 && this.canvas.height * scale > 1) {
			this.draw(time);
		}	
	};
	pipe.Renderer.prototype.remap = function(projection) {
		// overridable function
	};
	pipe.Renderer.prototype.recalc = function(projection) {
		if (!this.canvas || !this.ctx) return; 

		this.remap(projection);
	}
	pipe.Renderer.prototype.attach = function(parent) {
		this.canvas = document.createElement("canvas");
		this.canvas.classList.add("pipe-renderer");

		this.ctx = this.canvas.getContext("2d");

		parent.appendChild(this.canvas);

		this.events.call("attach");
	};

	pipe.Object = function() {

	}
	pipe.Object.prototype.getRenderer = function() {
		// overridable function
		return null;
	}

	pipe.init = function() {
		pipe.init_PipeSystemRenderer();

		// TEST CODE
		system = new pipe.PipeSystem();
		renderer = new pipe.PipeSystemRenderer(map.instance);
		renderer.setSystem(system);

		system.nodes.push(new pipe.PipeNode({ lat: 54.77557699364985, lng: -1.5854189367600946 }));
	}
    
})(pipe || (pipe = {}));