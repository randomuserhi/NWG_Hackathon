"use strict";

/**
 * @namespace pipe
 */
var pipe;
(function (pipe) {

	pipe.PipeSystem = function() {
		this.pipes = [];
		this.nodes = [];
	};
	pipe.PipeSystem.prototype.getRenderer = function() {
		return new pipe.PipeSystemRenderer();
	};

	pipe.PipeSystemRenderer = null;
	pipe.init_PipeSystemRenderer = function() {
		pipe.PipeSystemRenderer = function() {
    		this.events = new pipe.EventManager();
    		this.dom = document.createElement("div");
			this.pipeSystem = null;
			this.renderers = new Map();
			this.lastTime = 0;
		};
    	pipe.PipeSystemRenderer.prototype = new google.maps.OverlayView(); 
    	pipe.PipeSystemRenderer.prototype.addEventListener = function(event, callback) {
			return this.events.addEventListener(event, callback);
		}
		pipe.PipeSystemRenderer.prototype.removeEventListener = function(event, callback) {
			this.events.removeEventListener(event, callback);
		}
    	pipe.PipeSystemRenderer.prototype.onAdd = function() {
    		let fragment = document.createDocumentFragment();
    		fragment.appendChild(this.dom);

    		let panes = this.getPanes();
    		panes.overlayLayer.appendChild(fragment);

    		this.recalc(); // initial calculation
    		this.render(); // start animations
    	};
    	pipe.PipeSystemRenderer.prototype.render = function(time) {
    		if (isNaN(time)) time = 0;
    		time *= 0.001;
    		let dt = time - this.lastTime;
    		this.lastTime = time;

    		// draw items
    		for (let renderer of this.renderers.values()) {
    			renderer.render(dt);
    		}

    		// simulate code would go here
    		

    		requestAnimationFrame(this.render.bind(this));
    	}
    	pipe.PipeSystemRenderer.prototype.draw = function() {
    		//this.recalc(); // real time updates

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
    	// Performs recalc on all attached renderers. Specific objects can be specified if only a selected few need to be updated
    	pipe.PipeSystemRenderer.prototype.recalc = function(objects = null) {
    		let projection = this.getProjection();

			if (!this.pipeSystem) {
    			this.renderers.clear();
	    		this.dom.replaceChildren();
    			return;
    		}

    		if (objects) {
	    		for (let i = 0; i < objects.length; ++i) {
	    			let obj = objects[i];
	    			if (this.renderers.has(obj)) {
	    				this.renderers.get(obj).recalc(projection);
	    			}
	    		}
    		}
    		else {
    			// update renderers
	    		let iter = this.renderers.keys();
	    		for (let obj of iter) {
	    			// object no longer exists in system
	    			if (this.pipeSystem.pipes.indexOf(obj) == -1 &&
	    				this.pipeSystem.nodes.indexOf(obj) == -1) {
	    				// Move canvas deletion into render.delete() or something
	    				let canvas = this.renderers.get(obj).canvas;
	    				canvas.parentNode.removeChild(canvas);
	    				this.renderers.delete(obj);
	    			}
	    		}
	    		objects = [...this.pipeSystem.nodes, ...this.pipeSystem.pipes];
	    		for (let i = 0; i < objects.length; ++i) {
	    			let obj = objects[i];
	    			// add new object to system
	    			if (!this.renderers.has(obj)) {
	    				let renderer = obj.getRenderer();
	    				renderer.attach(this.dom);
	    				this.renderers.set(obj, renderer);
	    			}
	    		}

	    		for (let renderer of this.renderers.values()) {
	    			renderer.recalc(projection);
	    		}
    		}
    	}
	};
    
})(pipe || (pipe = {}));