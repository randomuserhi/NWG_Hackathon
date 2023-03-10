"use strict";

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
    
    map.heatMapGradient = [
        "rgba(0, 255, 255, 0)",
        "rgba(0, 255, 255, 1)",
        "rgba(0, 191, 255, 1)",
        "rgba(0, 127, 255, 1)",
        "rgba(0, 63, 255, 1)",
        "rgba(0, 0, 255, 1)",
        "rgba(0, 0, 223, 1)",
        "rgba(0, 0, 191, 1)",
        "rgba(0, 0, 159, 1)",
        "rgba(0, 0, 127, 1)",
        "rgba(63, 0, 91, 1)",
        "rgba(127, 0, 63, 1)",
        "rgba(191, 0, 31, 1)",
        "rgba(255, 0, 0, 1)",
    ];
    
	map.init = function() {
		let element = document.getElementById("map");
        map.reportData = [];
        map.infoWindow = new google.maps.InfoWindow();
        map.heatMapData = new google.maps.MVCArray();
        map.markers = new google.maps.MVCArray();
        map.markers.setValues({visible: null})
        
        
	    map.instance = new google.maps.Map(element, {
	        center: { lat: 54.77557699364985, lng: -1.5854189367600946 },
	        zoom: 22,
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
                data[i].coords.lat, data[i].coords.lng
            ));
            
            let a = new google.maps.Marker({
                position: new google.maps.LatLng(data[i].coords.lat, data[i].coords.lng)
            });
            a.bindTo("map", map.markers, "visible");
            
            a.addListener("click", () => {
                map.infoWindow.close();
                
                map.infoWindow = new google.maps.InfoWindow({
                    content: [
                            "<b>Name:</b> " + data[i].name + "<br>", 
                            "<b>Description:</b> " + data[i].description
                        ].join(""),
                    position: new google.maps.LatLng(data[i].coords.lat, data[i].coords.lng)
                });
                
                map.infoWindow.setOptions({
                    minWidth: 200,
                    maxWidth: 200   
                });
                
                map.infoWindow.open(map.instance);
            });
        };
    };
    
})(map || (map = {}));