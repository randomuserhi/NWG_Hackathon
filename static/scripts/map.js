/**
 * @namespace map
 */
var map;
(function (map) 
{
	map.instance = null;
    
    map.stylesArray = [
        { elementType: "geometry", stylers: [{ color: "#242f3e" }] },
        { elementType: "labels.text.stroke", stylers: [{ color: "#242f3e" }] },
        { elementType: "labels.text.fill", stylers: [{ color: "#746855" }] },
        {
          featureType: "administrative.locality",
          elementType: "labels.text.fill",
          stylers: [{ color: "#d59563" }],
        },
        {
          featureType: "poi",
          elementType: "labels.text.fill",
          stylers: [{ color: "#d59563" }],
        },
        {
          featureType: "poi.park",
          elementType: "geometry",
          stylers: [{ color: "#263c3f" }],
        },
        {
          featureType: "poi.park",
          elementType: "labels.text.fill",
          stylers: [{ color: "#6b9a76" }],
        },
        {
          featureType: "road",
          elementType: "geometry",
          stylers: [{ color: "#38414e" }],
        },
        {
          featureType: "road",
          elementType: "geometry.stroke",
          stylers: [{ color: "#212a37" }],
        },
        {
          featureType: "road",
          elementType: "labels.text.fill",
          stylers: [{ color: "#9ca5b3" }],
        },
        {
          featureType: "road.highway",
          elementType: "geometry",
          stylers: [{ color: "#746855" }],
        },
        {
          featureType: "road.highway",
          elementType: "geometry.stroke",
          stylers: [{ color: "#1f2835" }],
        },
        {
          featureType: "road.highway",
          elementType: "labels.text.fill",
          stylers: [{ color: "#f3d19c" }],
        },
        {
          featureType: "transit",
          elementType: "geometry",
          stylers: [{ color: "#2f3948" }],
        },
        {
          featureType: "transit.station",
          elementType: "labels.text.fill",
          stylers: [{ color: "#d59563" }],
        },
        {
          featureType: "water",
          elementType: "geometry",
          stylers: [{ color: "#17263c" }],
        },
        {
          featureType: "water",
          elementType: "labels.text.fill",
          stylers: [{ color: "#515c6d" }],
        },
        {
          featureType: "water",
          elementType: "labels.text.stroke",
          stylers: [{ color: "#17263c" }],
        }
    ];
    
    map.alternateStylesArray = [
    ];
    
    map.togglables = [
        {
            featureType: "road",
            elementType: "labels",
            stylers: [
                {visibility: "off"},
            ]
        },
        {
            featureType: "administrative",
            elementType: "all",
            stylers: [
                {visibility: "off"},
            ]
        },
        {
            featureType: "poi",
            elementType: "all",
            stylers: [
                {visibility: "off"},
            ]
        },
        {    
            featureType: "landscape.man_made",
            elementType: "all",
            stylers: [
                {visibility: "off"},
            ]
        },
        {    
            featureType: "landscape.natural.terrain",
            elementType: "all",
            stylers: [
                {visibility: "off"},
            ]
        }
    ];
    
	map.init = function() {
		let element = document.getElementById("map");
        map.heatMapData = new google.maps.MVCArray();
        
	    map.instance = new google.maps.Map(element, {
	        center: { lat: 54.77557699364985, lng: -1.5854189367600946 },
	        zoom: 10,
            minZoom: 3,
            styles: map.stylesArray.concat(map.togglables),
            mapTypeControl: false,
            scaleControl: false,
            streetViewControl: false,
            rotateControl: false,
            panControl: false,
            fullscreenControl: false
	    });
        
        map.heatmap = new google.maps.visualization.HeatmapLayer({
            data: map.heatMapData
        });
        
        map.heatmap.setMap(map.instance);
        
	};
    
    map.updateHeatmap = function(data) {
        for (let i = 0; i < data.length; i++){
            map.heatMapData.push(new google.maps.LatLng(
                data[i].lat, data[i].lng
            ));
        }
    }
    
})(map || (map = {}));