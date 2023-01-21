/**
 * @namespace pipe
 */
var pipe;
(function (pipe) 
{

	pipe.PipeOverlayGroup = null;
	pipe.init = function()
	{
		pipe.PipeOverlayGroup = function()
		{

		};
    	pipe.PipeOverlayGroup.prototype = new google.maps.OverlayView(); 
    };
    
})(pipe || (pipe = {}));