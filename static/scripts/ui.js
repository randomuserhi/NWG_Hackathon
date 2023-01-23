"use strict";

/**
 * @namespace ui
 */
var ui;
(function (ui) 
{
	
    ui.toggleVisibility = function(feature) {
        let vision = map.togglables.filter(s=>s.featureType==feature)[0].stylers.filter(i=>i.visibility)[0];
        
        if (vision.visibility == "on"){
            vision.visibility = "off";
        } else {
            vision.visibility = "on";
        }
        
        
        map.instance.setOptions({styles: map.stylesArray.concat(map.togglables)});
    }
    
    ui.changeColourScheme = function() {
        // Swap map colour scheme
        let temp = map.stylesArray
        map.stylesArray = map.alternateStylesArray
        map.alternateStylesArray = temp
        map.instance.setOptions({styles: map.stylesArray.concat(map.togglables)})
        
        // Swap SideBar colour scheme
        let sidebar = document.getElementById("sidebar");
        sidebar.classList.toggle("light");
        
        // Swap Heatmap colour scheme
        map.heatmap.set("gradient", map.heatmap.get("gradient") ? null : map.heatMapGradient)
    }
    
    ui.toggleSidebar = function() {
        let sidebar = document.getElementById("sidebar");
        sidebar.classList.toggle("open");
    }
    
    ui.refreshHeatmap = async function() {
        try {
            let response = await fetch("http://127.0.0.1:3000/refresh");
            let newData = await response.json();
            if (newData.length != 0){
                (map.reportData).push(...newData);
            };
            
            map.updateHeatmap(newData);
        } catch(e) {
            console.log(e);
            alert(e);
        };
  
    }
    
    ui.toggleHeatmapMarkers = function() {
        if (map.heatmap.getMap() == map.instance){
            (map.heatmap).setMap(null);
            (map.markers).set("visible", map.instance);
        } else {
            (map.heatmap).setMap(map.instance);
            (map.markers).set("visible", null);
            map.infoWindow.close();
        };
    }
    
    setInterval(ui.refreshHeatmap, 5);

})(ui || (ui = {}));