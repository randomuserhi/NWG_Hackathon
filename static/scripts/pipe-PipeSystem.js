/**
 * @namespace pipe
 */
var pipe;
(function (pipe) {

	pipe.PipeSystem = function() {

	}
	pipe.PipeSystem.prototype.pipes = [];
	pipe.PipeSystem.prototype.nodes = [];

	pipe.PipeSystemRenderer = null;
	pipe.init_PipeSystemRenderer = function() {
		pipe.PipeSystemRenderer = function(map) {
			if (!map) {
				console.error("No map was provided.");
				return null;
			}

    		this.dom = document.createElement("div");
			this.setMap(map);
		};
    	pipe.PipeSystemRenderer.prototype = new google.maps.OverlayView(); 
		pipe.PipeSystemRenderer.prototype.dom = null;
		pipe.PipeSystemRenderer.prototype.pipeSystem = null;
		pipe.PipeSystemRenderer.prototype.renderers = new Map();
    	pipe.PipeSystemRenderer.prototype.onAdd = function() {
    		let fragment = document.createDocumentFragment();
    		fragment.appendChild(this.dom);

    		let panes = this.getPanes();
    		panes.overlayLayer.appendChild(fragment);

    		this.render();
    	};
    	pipe.PipeSystemRenderer.prototype.render = function(time) {
    		time *= 0.001;

    		// draw items
    		for (let renderer of this.renderers.values()) {
    			renderer.render(time);
    		}

    		requestAnimationFrame(this.render.bind(this));
    	}
    	pipe.PipeSystemRenderer.prototype.draw = function() {
    		if (!this.pipeSystem) {
    			this.renderers.clear();
	    		this.dom.replaceChildren();
    			return;
    		}

    		// update renderers
    		let iter = this.renderers.keys();
    		for (let obj of iter) {
    			// object no longer exists in system
    			if (this.pipeSystem.pipes.indexOf(obj) == -1 &&
    				this.pipeSystem.nodes.indexOf(obj) == -1) {
    				this.renderers.delete(obj);
    			}
    		}
    		let objects = this.pipeSystem.nodes.concat(this.pipeSystem.pipes);
    		for (let i = 0; i < objects.length; ++i) {
    			let obj = objects[i];
    			// add new object to system
    			if (!this.renderers.has(obj)) {
    				let renderer = obj.getRenderer();
    				renderer.attach(this.dom);
    				this.renderers.set(obj, renderer);
    			}
    		}

    		// remap renderers
    		let projection = this.getProjection();
    		for (let renderer of this.renderers.values()) {
    			renderer.recalc(projection);
    		}
    	};
    	pipe.PipeSystemRenderer.prototype.onRemove = function() {
    		if (this.dom) {
    			this.dom.parentNode.removeChild(this.dom);
    			this.dom = null;
    			this.renderers.clear();
    		}
    	};
    	pipe.PipeSystemRenderer.prototype.setSystem = function(pipeSystem = null) {
    		this.pipeSystem = pipeSystem;
    		this.draw();
    	};
	};
    
})(pipe || (pipe = {}));