/**
 * @namespace map
 */
var map;
(function (map) 
{

	map.instance = null;
	map.init = function()
	{
		let element = document.getElementById("map");
	    map.instance = new google.maps.Map(element, {
	        center: { lat: 27.93, lng: 86.10 },
	        zoom: 8,
	    });
	}

})(map || (map = {}));