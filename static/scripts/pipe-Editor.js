"use strict";

/**
 * @namespace pipe
 */
var pipe;
(function (pipe) {

	pipe.transformClientPoint = function(clientX, clientY) {
		return new v2(clientX - window.innerWidth / 2, clientY - window.innerHeight / 2);
	};

	pipe.Editor = function() {
		this.events = new pipe.EventManager();
		this.handles = [];
		this.activeSystem = null;
		this.systems = [];
		this.renderers = new Map();
		this.map = null;

		this.nid = 0;
		this.pid = 0;
		this.interactState = {
			mode: "SELECT",
			target: null,
			start: null,
			end: null,
			object: null,
			type: "",
			grabbed: false,
			editMode: true,
			selected: null,
			prevmouse: null
		};

		let call = function(e, mouse, event) { 
			if (this.interactState.grabbed) {

				if (this.interactState.mode == "SELECT" && event == "mouseup") {
					if (this.interactState.target) {
						if (this.interactState.selected) {
							this.interactState.selected.state.selected = false;
							pipe.editN = null;
							pipe.editP = null;
							document.getElementById("item-content-pipe").style.top = "-200px";
							document.getElementById("item-content-node").style.top = "-200px";
						}
						this.interactState.selected = this.interactState.target;
						this.interactState.selected.state.selected = true;

						let containerN = document.getElementById("item-content-node");
						let containerP = document.getElementById("item-content-pipe");

						switch(this.interactState.type) {
							case "NODE": {
								let n = this.interactState.target.pipeNode;
								containerP.style.top = "-200px";
								containerN.style.top = "60px";
								pipe.editN = n;
								document.getElementById("node-name").value = n.properties.name;
								document.getElementById("node-demand").value = n.properties.demand;
								document.getElementById("node-status").value = n.properties.status;
								document.getElementById("node-height").value = n.properties.height;
							};
							break;

							case "PIPE":
							case "PIPE-JOINT": {
								let p = this.interactState.target.pipe;
								containerN.style.top = "-200px";
								containerP.style.top = "60px";
								pipe.editP = p;
								document.getElementById("pipe-name").value = p.properties.name;
								document.getElementById("pipe-flow").value = p.sim.flow;
								document.getElementById("pipe-pressure").value = p.sim.pressure;
								document.getElementById("pipe-status").value = p.properties.status;
							};
							break;
						}
					}
					else if (mouse.x == this.interactState.prevmouse.x && mouse.y == this.interactState.prevmouse.y) {
						if (this.interactState.selected) this.interactState.selected.state.selected = false;
						pipe.editN = null;
						pipe.editP = null;			
						document.getElementById("item-content-pipe").style.top = "-200px";
						document.getElementById("item-content-node").style.top = "-200px";
					}
				}
				else if (this.interactState.mode == "EDIT") {
					if (this.interactState.target) {
						switch(this.interactState.type) {
							case "NODE": {
								let n = this.interactState.target;
								n.pipeNode.lat = e.latLng.lat();
								n.pipeNode.lng = e.latLng.lng();
							};
							break;

							case "PIPE": {
								let p = this.interactState.target;
								let obj = this.interactState.object;
								p.pipe.points[obj.joint].lat = e.latLng.lat();
								p.pipe.points[obj.joint].lng = e.latLng.lng();

								if (obj.joint == 0 || obj.joint == p.pipe.points.length - 1) {
									let n = p.pipe.points[obj.joint];
									for (let renderer of this.renderers.values()) {
										let objects = [ n, ...renderer.pipeSystem.pipes.filter(p => p.start == n || p.end == n) ];
										renderer.recalc(objects);
									}
								}
							};
							break;

							case "PIPE-JOINT": {
								let p = this.interactState.target;
								let obj = this.interactState.object;
								if (!this.interactState.object.created)
								{
									p.pipe.insert(obj.segment+1, { lat: e.latLng.lat(), lng: e.latLng.lng() });

									this.interactState.object.created = true;
								}

								if (event == "mousedown") p.state.dragging = true;
								else if (event == "mouseup") p.state.dragging = false;
								p.pipe.points[obj.segment+1].lat = e.latLng.lat();
								p.pipe.points[obj.segment+1].lng = e.latLng.lng();
							};
							break;
						}
					}
				}
				else if (this.interactState.mode == "DELETE") {
					if (this.interactState.target) {
						switch(this.interactState.type) {
							case "NODE": {
								let n = this.interactState.target;
								for (let renderer of this.renderers.values()) {
									renderer.pipeSystem.nodes = renderer.pipeSystem.nodes.filter(a => a !== n.pipeNode);
								}
							};
							break;

							case "PIPE-JOINT":
							case "PIPE": {
								let p = this.interactState.target;
								for (let renderer of this.renderers.values()) {
									renderer.pipeSystem.pipes = renderer.pipeSystem.pipes.filter(a => a !== p.pipe);
								}
							};
							break;
						}
					}
				}
				else if (this.interactState.mode == "CREATE" && event == "mouseup") {
					if (this.activeSystem && mouse.x == this.interactState.prevmouse.x && mouse.y == this.interactState.prevmouse.y) {
						let n = new pipe.PipeNode({ lat: e.latLng.lat(), lng: e.latLng.lng() });
						n.properties.name = "NODE #" + (this.nid++).toString();
						this.activeSystem.nodes.push(n);
					}
				}
				else if (this.interactState.mode == "JOIN" && event == "mousedown") {
					if (this.interactState.target && this.interactState.type == "NODE") {
						if (!this.interactState.start) {
							this.interactState.start = this.interactState.target;
							this.interactState.start.state.selected = true;
						}
						else {
							this.interactState.end = this.interactState.target;
							this.interactState.end.state.selected = true;

							if (this.interactState.start !== this.interactState.end) {
								let p = new pipe.Pipe(this.interactState.start.pipeNode, this.interactState.end.pipeNode);
								p.properties.name = "PIPE #" + (this.pid++).toString();
								this.activeSystem.pipes.push(p);
							}

							this.interactState.target = null;
							this.interactState.start.state.selected = false;
							this.interactState.end.state.selected = false;
							this.interactState.end = null
							this.interactState.start = null;
						}
					}
					else {
						if (this.interactState.start) this.interactState.start.state.selected = false;
						this.interactState.start = null;
						this.interactState.end = null
					}
				}

				// commit changes - todo optimize by passing in only the things that changed
				for (let renderer of this.renderers.values()) {
					if (this.interactState.mode == "EDIT" && this.interactState.type == "NODE" || this.interactState.type == "PIPE" || this.interactState.type == "PIPE-JOINT" ) {
						if (this.interactState.type == "NODE") {
							let n = this.interactState.target.pipeNode;
							let objects = [ n, ...renderer.pipeSystem.pipes.filter(p => p.start == n || p.end == n) ];
							renderer.recalc(objects);
						}
						else if (this.interactState.type == "PIPE" || this.interactState.type == "PIPE-JOINT") {
							let n = this.interactState.target.pipe;
							let objects = [ n ];
							renderer.recalc(objects);
						}
					}
					else renderer.recalc();
				}

				this.interactState.prevmouse = { x: mouse.x, y: mouse.y };
				return;
			}

			let nodes = this.getAllNodeRenderers().sort((a, b) => {
				return a.sqrdistance(mouse) - b.sqrdistance(mouse);
			});

			let pipes = this.getAllPipeRenderers().sort((a, b) => {
				return a.distance(mouse) - b.distance(mouse);
			})

			for (let i = 0; i < nodes.length; ++i) {
				nodes[i].state.hovering = false;
			}
			for (let i = 0; i < pipes.length; ++i) {
				pipes[i].state.hovering = false;
				pipes[i].state.edge = false;
			}

			this.interactState.target = null;
			this.interactState.type = "";
			if (nodes.length > 0 && nodes[0].inScreenRange(mouse)) {
				this.interactState.target = nodes[0];
				this.interactState.type = "NODE";
				
				nodes[0].state.hovering = true;
			}
			else if (pipes.length > 0 && (nodes.length == 0 || pipes[0].sqrdistance(mouse) < nodes[0].sqrdistance(mouse))) {
				if (pipes[0].inScreenRange(mouse)) {
					let p = pipes[0];
					this.interactState.target = p;
					
					let closest = p.interactState.closest;
					let a = p.points[closest.segment];
					let b = p.points[closest.segment+1];
					let distA = v2.sqrdist(a, mouse);
					let distB = v2.sqrdist(b, mouse);
					let c = distA < distB ? closest.segment : closest.segment+1;
					let distC = distA < distB ? distA : distB;
					this.interactState.object = {
						segment: closest.segment,
						joint: c
					};
					
					let scale = pipe.Renderer.getScaleFactor();
					let dist = 120 * scale;
					if (distC < dist * dist) {
						this.interactState.type = "PIPE";
						pipes[0].state.edge = true;
					}
					else {
						this.interactState.type = "PIPE-JOINT";
						this.interactState.object.created = false;
						pipes[0].state.hovering = true;
					}
				}
			}

			if (this.interactState.target) {
				map.instance.setOptions({
					draggable: false, 
					panControl: false,
					rotateControl: false,
					scrollwheel: false
				});
			}
			else {
				map.instance.setOptions({
					draggable: true, 
					panControl: true,
					rotateControl: true,
					scrollwheel: true
				});
			}
		}
		call = call.bind(this);

		this.addEventListener("mousemove", (e) => {
			let mouse = pipe.transformClientPoint(e.domEvent.clientX, e.domEvent.clientY);
			call(e, mouse);
		});

		this.addEventListener("mousedown", (e) => {
			this.interactState.grabbed = true;

			let mouse = pipe.transformClientPoint(e.domEvent.clientX, e.domEvent.clientY);
			call(e, mouse, "mousedown");
		});

		this.addEventListener("mouseup", (e) => {
			let mouse = pipe.transformClientPoint(e.domEvent.clientX, e.domEvent.clientY);
			call(e, mouse, "mouseup");

			this.interactState.grabbed = false;
		});
	};
	pipe.Editor.prototype.addEventListener = function(event, callback) {
		return this.events.addEventListener(event, callback);
	};
	pipe.Editor.prototype.removeEventListener = function(event, callback) {
		this.events.removeEventListener(event, callback);
	};
	pipe.Editor.prototype.invokeEvent = function(event, object = null) {
		this.events.invokeEvent(event, object);
		for (let renderer of this.renderers.values()) {
			renderer.events.invokeEvent(event, object);
		}
	};
	pipe.Editor.prototype.recalc = function() {
		let iter = this.renderers.keys();
		for (let system of iter) {
			// system no longer exists in systems list
			if (this.systems.indexOf(system) == -1) {
				this.renderers.delete(system);
			}
		}
		for (let i = 0; i < this.systems.length; ++i) {
			let system = this.systems[i];
			if (!this.renderers.has(system)) {
				let renderer = system.getRenderer();
				renderer.setSystem(system);
				this.renderers.set(system, renderer);
			}
		}
			
		for (let renderer of this.renderers.values()) {
			renderer.setMap(this.map);
		}
	};
	pipe.Editor.prototype.getAllRenderers = function() {
		let renderers = [];
		for (let renderer of this.renderers.values()) {
			renderers.push(...renderer.renderers.values());
		}
		return renderers;
	};
	pipe.Editor.prototype.getAllNodeRenderers = function() {
		let renderers = [];
		for (let renderer of this.renderers.values()) {
			for (let i = 0; i < renderer.pipeSystem.nodes.length; ++i) {
				renderers.push(renderer.renderers.get(renderer.pipeSystem.nodes[i]));
			}
		}
		return renderers;
	};
	pipe.Editor.prototype.getAllPipeRenderers = function() {
		let renderers = [];
		for (let renderer of this.renderers.values()) {
			for (let i = 0; i < renderer.pipeSystem.pipes.length; ++i) {
				renderers.push(renderer.renderers.get(renderer.pipeSystem.pipes[i]));
			}
		}
		return renderers;
	};
	pipe.Editor.prototype.setMap = function(map) {
		for (let i = 0; i < this.handles.length; ++i) {
			this.handles[i].remove();
		}
		this.map = map;
		this.handles = [];
		if (map) {
			this.recalc();

			this.handles.push(map.addListener("mousemove", (e) => {
				this.invokeEvent("mousemove", e);

				// TODO:: trigger internal renderer events if mouse is hovering over said renderers

				/*let renderers = [];
				for (let renderer of this.renderers.values()) {
					renderers.push(...renderer.renderers.values());
				}

				for (let i = 0; i < renderers.length; ++i) {
					// TODO:: make mousemove on items only toggle when you are moving over said item etc...
					renderers[i].events.invokeEvent("mousemove", e);
				}*/
			}));

			this.handles.push(map.addListener("mouseover", (e) => {
				this.invokeEvent("mouseover", e);
			}));

			this.handles.push(map.addListener("mousedown", (e) => {
				this.invokeEvent("mousedown", e);
			}));

			this.handles.push(map.addListener("mouseup", (e) => {
				this.invokeEvent("mouseup", e);
			}));

			this.handles.push(map.addListener("contextmenu", (e) => {
				this.invokeEvent("contextmenu", e);
			}));

			this.handles.push(map.addListener("click", (e) => {
				this.invokeEvent("click", e);
			}));

			this.handles.push(map.addListener("dblclick", (e) => {
				this.invokeEvent("dblclick", e);
			}));

			this.handles.push(map.addListener("dragstart", (e) => {
				this.invokeEvent("dragstart", e);
			}));

			this.handles.push(map.addListener("drag", (e) => {
				this.invokeEvent("drag", e);
			}));

			this.handles.push(map.addListener("dragend", (e) => {
				this.invokeEvent("dragend", e);
			}));

			// TODO:: support other events
		}
	};

})(pipe || (pipe = {}));