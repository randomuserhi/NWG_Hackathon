let map;

function CustomOverlay(latlng, element, map) {
  this.latlng_ = latlng;
  this.element_ = element;
  
  this.div_ = null;
  
  this.setMap(map);
}

CustomOverlay.prototype.onAdd = function() {
  var div = document.createElement('div');
  div.className = 'overlay-container';
  div.style.borderStyle = 'none';
  div.style.borderWidth = '0px';
  div.style.position = 'absolute';

  div.appendChild(this.element_);

  $compile(div)($scope);

  this.div_ = div;

  var panes = this.getPanes();
  panes.floatPane.appendChild(this.div_);

};

CustomOverlay.prototype.draw = function () {
  var overlayProjection = this.getProjection();

  var point = overlayProjection.fromLatLngToDivPixel(this.latlng_);

  if (point) {
    var div = this.div_;
    div.style.left = point.x + 'px';
    div.style.top = point.y + 'px';
  }
};

CustomOverlay.prototype.onRemove = function () {
  this.div_.parentNode.removeChild(this.div_);
  this.div_ = null;
};

function initMap() {
	CustomOverlay.prototype = new google.maps.OverlayView();

	let element = document.getElementById("map");
	map = new google.maps.Map(element, {
		center: { lat: 27.93, lng: 86.10 },
		zoom: 8,
	});

	// Add some overlay
	// Assuming we already have map object html element
	new CustomOverlay(
	  new google.maps.LatLng(27.93, 86.10),
	  document.createElement("div"),
	  map
	);
}

window.initMap = initMap;