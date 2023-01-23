let url = new URL(window.location.href).hostname;
let coordinates;

window.submitReport = async function(event){
            
    event.preventDefault();
    
    let userName = document.getElementById("reportName").value;
    let userDescription = document.getElementById("reportDescription").value;
    
    try{
        let payload = {
            method: "POST",
            headers: { "Content-Type": "application/json"},
            body: JSON.stringify({
                name: userName,
                description: userDescription,
                coords: coordinates
            })
        }; 
        
        let response = await fetch(`http://${url}:3000/report`, payload);
        let data = await response.json();
        
        alert(data);
        
    } catch(e){
        alert(e);
    }
            
}

function init() {
    let Coords = {lat: 54.77557699364985, lng: -1.5854189367600946};
    
    let stylesArray = [
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
    ]
    
    let map = new google.maps.Map(document.getElementById("map"), {
        zoom: 14,
        minZoom: 3,
        center: Coords,
        styles: stylesArray,
        mapTypeControl: false,
        scaleControl: false,
        streetViewControl: false,
        rotateControl: false,
        panControl: false,
        fullscreenControl: false
    });
    
    let infoWindow = new google.maps.InfoWindow({
        content: "Click to send a report at your location on the map :)",
        position: Coords,
    });
    
    let report;
    
    let submissionForm = [
        "<b>Report a problem here?</b><br>",
        "<form id='reportForm'>",
        "Name: <input id='reportName' type='text' />",
        "Description: <input id='reportDescription' type='text' />",
        "<input type='button' id='reportSubmit' value='Submit' onclick='submitReport(event)'>",
        "</form>"
    ].join("");
    
    infoWindow.open(map);
    
    map.addListener("click", async function(mapsMouseEvent) {
        
        infoWindow.close();
        
        coordinates = mapsMouseEvent.latLng;
        
        infoWindow = new google.maps.InfoWindow({
            position: coordinates,
            content: submissionForm
        });            
        
        infoWindow.setOptions({
            minWidth: 200,
            maxWidth: 200   
        });
         
        infoWindow.open(map);
            
        
    });
};


window.init = init;