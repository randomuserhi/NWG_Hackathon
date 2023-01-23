"use strict";

/**
 * @namespace pipe
 */
var pipe;
(function (pipe) {

	pipe.EventManager = function() {
	};
	pipe.EventManager.prototype.invokeEvent = function(event, object = null) {
		if (this.hasOwnProperty(event)) for (let i = 0; i < this[event].length; ++i) this[event][i](object);
	};
	pipe.EventManager.prototype.addEventListener = function(event, callback) {
		if (this.hasOwnProperty(event)) this[event].push(callback);
		else this[event] = [callback];

		return callback;
	};
	pipe.EventManager.prototype.removeEventListener = function(event, callback) {
		if (this.hasOwnProperty(event)) this[event] = this[event].filter(e => e !== callback);
	};

	pipe.Renderer = function() {
		this.events = new pipe.EventManager();
		this.canvas = null;
		this.ctx = null;
	};
	pipe.Renderer.getScaleFactor = function() {
		if (!map.instance) return 1;
		return 1 / Math.pow(2, 22 - map.instance.getZoom());
	};
	pipe.Renderer.prototype.addEventListener = function (event, callback) {
		return this.events.addEventListener(event, callback);
	};
	pipe.Renderer.prototype.removeEventListener = function (event, callback) {
		this.events.removeEventListener(event, callback);
	};
	pipe.Renderer.prototype.center = function() {
		return new v2(this.canvas.offsetLeft + this.canvas.offsetWidth / 2, this.canvas.offsetTop + this.canvas.offsetHeight / 2);
	}
	pipe.Renderer.prototype.sqrdistance = function(point) {
		//overridable function
		return v2.sqrdist(this.center(), point);
	}
	pipe.Renderer.prototype.distance = function(point) {
		//overridable function
		return v2.dist(this.center(), point);
	}
	pipe.Renderer.prototype.inScreenRange = function() {
		// overridable function
		return false;
	};
	pipe.Renderer.prototype.draw = function(time) {
		// overridable function
	};
	pipe.Renderer.prototype.render = function(time) {
		// TODO:: dont just check size, also check map bounds (effectively culling)
		if (this.canvas.width > 1 && this.canvas.height > 1) {
			this.draw(time);
		}	
	};
	pipe.Renderer.prototype.remap = function(projection) {
		// overridable function
	};
	pipe.Renderer.prototype.recalc = function(projection) {
		if (!this.canvas || !this.ctx) return; 

		this.remap(projection);
		this.render();
	};
	pipe.Renderer.prototype.attach = function(parent) {
		if (this.canvas || this.ctx) {
			console.error("Renderer has already been attached.");
			return;
		}

		this.canvas = document.createElement("canvas");
		this.canvas.classList.add("pipe-renderer");

		this.ctx = this.canvas.getContext("2d");

		parent.appendChild(this.canvas);

		this.events.invokeEvent("attach");
	};

	pipe.Object = function() {
	};
	pipe.Object.prototype.getRenderer = function() {
		// overridable function
		return null;
	};

	pipe.editN = null;
	pipe.editP = null;
	pipe.init = function() {
		pipe.init_PipeSystemRenderer();

		// TEST CODE
		pipe.system = new pipe.PipeSystem();

		let a = new pipe.PipeNode({ lat: 54.77556699364985, lng: -1.5854189367600946 });
		let b = new pipe.PipeNode({ lat: 54.77559699364985, lng: -1.5854289367600946 });
		pipe.system.nodes.push(a);
		pipe.system.nodes.push(b);

		pipe.editor = new pipe.Editor();
		pipe.editor.systems.push(pipe.system);
		pipe.editor.activeSystem = pipe.system;
		pipe.editor.setMap(map.instance);

		let edit = document.getElementById("edit");
		let create = document.getElementById("create");
		let join = document.getElementById("join");
		let del = document.getElementById("delete");
		let select = document.getElementById("select");

		select.addEventListener("click", () => {
			document.getElementById("item-content-pipe").style.display = "none";
			document.getElementById("item-content-node").style.display = "none";
			if (pipe.editor.interactState.selected) pipe.editor.interactState.selected.state.selected = false;
			if (pipe.editor.interactState.start) pipe.editor.interactState.start.state.selected = false;
			if (pipe.editor.interactState.end) pipe.editor.interactState.end.state.selected = false;
			pipe.editN = null;
			pipe.editP = null;
			pipe.editor.interactState = {
				mode: "SELECT",
				target: null,
				start: null,
				end: null,
				object: null,
				type: "",
				grabbed: false,
				editMode: true,
				selected: null
			};
		});
		edit.addEventListener("click", () => {
			document.getElementById("item-content-pipe").style.display = "none";
			document.getElementById("item-content-node").style.display = "none";
			if (pipe.editor.interactState.selected) pipe.editor.interactState.selected.state.selected = false;
			if (pipe.editor.interactState.start) pipe.editor.interactState.start.state.selected = false;
			if (pipe.editor.interactState.end) pipe.editor.interactState.end.state.selected = false;
			pipe.editN = null;
			pipe.editP = null;
			pipe.editor.interactState = {
				mode: "EDIT",
				target: null,
				start: null,
				end: null,
				object: null,
				type: "",
				grabbed: false,
				editMode: true,
				selected: null
			};
		});
		create.addEventListener("click", () => {
			document.getElementById("item-content-pipe").style.display = "none";
			document.getElementById("item-content-node").style.display = "none";
			if (pipe.editor.interactState.selected) pipe.editor.interactState.selected.state.selected = false;
			if (pipe.editor.interactState.start) pipe.editor.interactState.start.state.selected = false;
			if (pipe.editor.interactState.end) pipe.editor.interactState.end.state.selected = false;
			pipe.editN = null;
			pipe.editP = null;
			pipe.editor.interactState = {
				mode: "CREATE",
				target: null,
				start: null,
				end: null,
				object: null,
				type: "",
				grabbed: false,
				editMode: true,
				selected: null
			};
		});
		join.addEventListener("click", () => {
			document.getElementById("item-content-pipe").style.display = "none";
			document.getElementById("item-content-node").style.display = "none";
			if (pipe.editor.interactState.selected) pipe.editor.interactState.selected.state.selected = false;
			if (pipe.editor.interactState.start) pipe.editor.interactState.start.state.selected = false;
			if (pipe.editor.interactState.end) pipe.editor.interactState.end.state.selected = false;
			pipe.editN = null;
			pipe.editP = null;
			pipe.editor.interactState = {
				mode: "JOIN",
				target: null,
				start: null,
				end: null,
				object: null,
				type: "",
				grabbed: false,
				editMode: true,
				selected: null
			};
		});
		del.addEventListener("click", () => {
			document.getElementById("item-content-pipe").style.display = "none";
			document.getElementById("item-content-node").style.display = "none";
			if (pipe.editor.interactState.selected) pipe.editor.interactState.selected.state.selected = false;
			if (pipe.editor.interactState.start) pipe.editor.interactState.start.state.selected = false;
			if (pipe.editor.interactState.end) pipe.editor.interactState.end.state.selected = false;
			pipe.editN = null;
			pipe.editP = null;
			pipe.editor.interactState = {
				mode: "DELETE",
				target: null,
				start: null,
				end: null,
				object: null,
				type: "",
				grabbed: false,
				editMode: true,
				selected: null
			};
		});

		let onChange = function(el, callback) {
			let element = document.getElementById(el);
			element.addEventListener('beforeinput', (event) => {
				const thisTarget = event.target;
				callback(thisTarget.value);
			});
			element.addEventListener('input', (event) => {
				const thisTarget = event.target;
				callback(thisTarget.value);
			});
			element.addEventListener('change', (event) => {
				const thisTarget = event.target;
				callback(thisTarget.value);
			});
			element.addEventListener('cut', (event) => {
				const thisTarget = event.target;
				callback(thisTarget.value);
			});
			element.addEventListener('copy', (event) => {
				const thisTarget = event.target;
				callback(thisTarget.value);
			});
			element.addEventListener('paste', (event) => {
				const thisTarget = event.target;
				callback(thisTarget.value);
			});
		};

		onChange("node-name", (value) => { if (pipe.editN) pipe.editN.properties.name = value; });
		onChange("node-demand", (value) => { if (pipe.editN) pipe.editN.properties.demand = value; });
		onChange("node-height", (value) => { if (pipe.editN) pipe.editN.properties.height = value; });

		onChange("pipe-name", (value) => { if (pipe.editP) pipe.editP.properties.name = value; });
		onChange("pipe-flow", (value) => { if (pipe.editP) pipe.editP.sim.flow = Math.ceil(value / 50); });
		onChange("pipe-pressure", (value) => { if (pipe.editP) pipe.editP.sim.pressure = (value / 100) * 2 + 1;});
		onChange("pipe-diameter", (value) => { if (pipe.editP) pipe.editP.properties.diameter = value; });

		document.getElementById("node-status").addEventListener("change", function() {
			if (pipe.editN) pipe.editN.properties.status = this.value;
		});
		document.getElementById("pipe-status").addEventListener("change", function() {
			if (pipe.editP) pipe.editP.properties.status = this.value;
		});
	};
    
})(pipe || (pipe = {}));