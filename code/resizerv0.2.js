/*
	jQuery Window Resizer Plugin 1.2
	Copyright (c) 2011 Daniel Thomson
	
	Licensed under the MIT license:
	http://www.opensource.org/licenses/mit-license.php
*/

// jQuery Window Resizer plugin
// v0.1 - basic functionality built
// v0.2 - added min/max key command - so that it can be used on very low resolutions when the  control panel isn't fully displayed
//
// Settings:
// sizes		:	JSON data - an array of value pairs representing screen resolutions
// index		:	number - keps track of currently selected resolution, can be set, but really just a data holder
// loopDelay	:	number - on slideshow mode the period between display resolutions
// bodyOverflow	:	boolean - sets body to display scrollbars or not
// press "m"	: 	not an option - pressing the "m" key will toggle the controls to/from minimised view
// left arrow	:	not an option - activate the previous window size in the list
// right arrow	:	not an option - activate the next window size in the list

// TO DO:
// might have a look at the flickering caused by setting the window to max avaliable size to get inner dimensions
// going to make each of the control sections optional so that you can turn the controls on or off depending on your preference except for close button
//					- will set them all to show by default

(function($){

	$.fn.windowResize = function(config)
	{
		// config - default settings
		var settings = {                   
                              sizes		: 	{
                              						240:400,
                              						320:480,
                              						480:800,
							  						640:360,
							  						768:480,
                              						992:600,
                              						1024:800,
                              						1152:768,
                              						1382:768,
                              						1600:1024,
                              						1920:1080
                              					},
                              index		:	0,
                              loopDelay	:	5000,
                              bodyOverflow: true, 
                              controlBtns	: true,  // will add choice of turning these off
                              resizeInput	: true,  // will add choice of turning these off		
                              playBox		: true   // will add choice of turning these off                           
					 };

		// if settings have been defined then overwrite the default ones
        // comments:        true value makes the merge recursive. that is - 'deep' copy
		//					{} creates an empty object so that the second object doesn't overwrite the first object
		//					this emtpy takes object1, extends2 onto object1 and writes both to the empty object
		//					the new empty object is now stored in the var opts.
		var opts = $.extend(true, {}, settings, config);
		
		// iterate over each object that calls the plugin and do stuff
		this.each(function(){
			// do pluging stuff here
			// each box calling the plugin now has the variable name: myBox


			var resizer = $(this);  // this is the window but probably don't need it
			$(this).loopTimer = 0;
			
			// if controls exists already then destroy them
			$("#resizeControls").remove();
			
			// set overflow value
			if (opts.bodyOverflow == false)
			{
				$("body").css("overflow","hidden");
			}
			else
			{
				$("body").css("overflow","auto");
			}
			
			var controls = $.fn.windowResize.createControls(opts);
			
			// add to the dom and style the control box
			$.fn.windowResize.addBox(controls, opts);

			// put the box into the DOM and bind all the controls
			$.fn.windowResize.bindControls(opts, resizer);
			// end of plugin stuff
		});

		// return jQuery object
		return this;
	};

	// plugin functions go here - example of two different ways to call a function, and also two ways of using the namespace
	// note: $.fn.testPlugin.styleBox allows for this function to be extended beyond the scope of the plugin and used elsewhere, 
	// that is why it is a superior namespace. Also: anonymous function calling I think is probably better naming practise too.

	// create the markup for the controls
	$.fn.windowResize.createControls = function(opts)
	{
		var controlBox = '<div id="resizeControls"><div class="controlWrap">',
			controlBtns = '',
			controlText = '',
			playBox = '',
			closeBtn = '',
			miniBar = '';
			
		
		// if control buttons are on
		if (opts.controlBtns)
		{
			controlBtns = '<div class="controlBtns">';
			// loop through the options and add a controller for each one			 
			for (var i in opts.sizes)
			{
				// do something here
				if (opts.sizes.hasOwnProperty(i))
				{
					//console.log(i+" -> " +opts.sizes[i]);
					controlBtns += '<input type="button" value="'+ i + ' x ' + opts.sizes[i] + '" name="'+ i + 'x' + opts.sizes[i] + '" class="resizeBtn" />';
				}
			}
			controlBtns += '</div>';
		}

		// if input form is turned on
		if (opts.resizeInput)
		{
			// add text inputs to allow resize on the fly
			var controlText = '<div class="resizeInput"><ul><li><label>Height</label><input type="text" size="20" class="windowWidth" /></li><li><label>Width</label><input type="text" size="20" class="windowHeight" /></li><li><input type="button" value="GO!" class="customSize" /></li></ul></div>';
			//console.log(controlText);
		}
		
		// if play controls are turned on
		if (opts.playBox)
		{
			// slideshow buttons html
			var playBox = '<div class="playBox"><div class="wrap"><input type="button" value="previous" class="prev" /><input type="button" value="next" class="next" /><input type="button" value="start player" class="start" /><input type="button" value="stop player" class="stop" /></div></div>';
		}
		
		// close button html
		var closeBtn = '<div class="closeBtn"><a href="#" class="close">close</a><a href="#" class="min">minimise</a></div>';
		
		// minified control bar
		var miniBar = '<div class="controlWrapMin"><a href="#" class="max">Maximise</a></div>';
		
		// putting it all together
		controlBox += controlBtns + controlText + playBox + closeBtn + '</div>' + miniBar +'</div>';
		//console.log(controlBox);


		return controlBox;
	};
	
	$.fn.windowResize.addBox = function(controls, opts)
	{
		// add the control buttons to the document 
		$("body").append(controls);
		$("#resizeControls").slideDown(200);
		//$("#resizeControls .resizeBtn:eq("+opts.index+")").addClass("btnActive");
		// add event handling for closing box        
	};
	
	$.fn.windowResize.bindControls = function(opts, resizer)
	{
		// bind the button events
		
		$("#resizeControls .resizeBtn").each(function(){
			$(this).click(function(){
				// find the x and y values on the button and then pass that to the window resize fundtion
				// break string up here
				var value = $(this).attr("name");
				//console.log(value);
				var valuePair = value.split("x");
				//console.log(valuePair);
				var x = valuePair[0];
				var y = valuePair[1];
				//console.log("x "+x);
				//console.log("y "+y);
				x = parseFloat(x);
				y = parseFloat(y);
				$.fn.windowResize.resize(opts,x,y);
				$(".resizeBtn").removeClass("btnActive");
				$(this).addClass("btnActive");
				// get the index of this button and change the global variable to match - opts.index
				//var thisItem = $(this).parent();
				opts.index = $(this).parent().children().index(this);
				return false;
			});
		});	
		
		$("#resizeControls .customSize").click(function(){
			var x = parseFloat($(".windowWidth").attr("value"));
			var y = parseFloat($(".windowHeight").attr("value"));
			//console.log("x: "+x+", y: "+y);
			// test whether the inputs are numbers > 0
			if ((!isNaN(x) || !isNaN(y)) && (x > 0 && y > 0))
			{
				$.fn.windowResize.resize(opts,x,y); 
			}
			else
			{
				//console.log("something is not a number or 0");
				alert("you need a number greater than 0");
			}
			return false;
		});

		$("#resizeControls .next").click(function(){
			clearTimeout($.fn.windowResize.loopTimer);
			// find next active button
			$.fn.windowResize.selectActiveEl(1);
			return false;
		});
		
		$("#resizeControls .prev").click(function(){
			clearTimeout($.fn.windowResize.loopTimer);
			$.fn.windowResize.selectActiveEl(-1);
			return false;
		});
		
		$("#resizeControls .start").click(function(){
			$(this).addClass("startActive");
			$.fn.windowResize.startLoop(opts.loopDelay);
			return false;
		});
		
		$("#resizeControls .stop").click(function(){
			$(".startActive").removeClass("startActive");
			$.fn.windowResize.stopLoop();
			return false;
		});
		
		$("#resizeControls .close").click(function(){
			$("#resizeControls").slideUp(200, function(){$(this).remove();});
			return false;
		});
		
		$("#resizeControls .min").click(function(){
			$("#resizeControls .controlWrapMin").css("display","block");
			// hide the rest of the control bar
			$("#resizeControls .controlWrap").css("display","none").parent().addClass("noBG");
		});
		
		$("#resizeControls .max").click(function(){
			$("#resizeControls .controlWrapMin").css("display","none");
			// open up the control bar
			$("#resizeControls .controlWrap").css("display","block").parent().removeClass("noBG");
		});
		
		document.onkeydown = function(e)
		{
			var keycode;
			if (window.event)
			{
				keycode = window.event.keyCode;
			}
			else if (e)
			{
				keycode = e.which;
			}
			if (keycode == 77)
			{
                   // toggle min and max buttons
                   if ($("#resizeControls").hasClass("noBG"))
                   {
                   		// click on the maximise button
                   		$("#resizeControls .controlWrapMin").css("display","none");
                   		$("#resizeControls .controlWrap").css("display","block").parent().removeClass("noBG");
                   }
                   else
                   {
                   		// else click on the minimise button
                   		$("#resizeControls .controlWrapMin").css("display","block");
                   		$("#resizeControls .controlWrap").css("display","none").parent().addClass("noBG");
                   }
			}
			else if (keycode == 37)  // left arrow
			{
				clearTimeout($.fn.windowResize.loopTimer);
				$.fn.windowResize.selectActiveEl(-1);
			}
			else if (keycode == 39)  // right arrow
			{
				clearTimeout($.fn.windowResize.loopTimer);				
				$.fn.windowResize.selectActiveEl(1);
			}
		};
	};
	
	$.fn.windowResize.selectActiveEl = function(i)
	{
		// select the next resolution
		var loopLength = $(".resizeBtn").length,
			currentItem = $(".btnActive"),
			index = $(currentItem).parent().children().index(currentItem);
			
		//console.log(index);
		//alert("loop: "+loopLength);
		index = index + i; 
		//alert("index: "+index);
		if (index < 0)
		{
			index = (loopLength - 1);
			//alert("hit low");
		}
		if (index > (loopLength-1))
		{
			index = 0;
			//alert("hit high");
		}
		//alert(index);
		// simulate a click event on the button of this resolution
		$(".controlBtns .resizeBtn:eq("+index+")").click();
	};

	$.fn.windowResize.startLoop = function(delay)
	{
		//console.log("hit timer, delay: "+delay);
		$.fn.windowResize.loopTimer = setTimeout(function(){$.fn.windowResize.selectActiveEl(1);$.fn.windowResize.startLoop(delay);},delay);
	};
	
	$.fn.windowResize.stopLoop = function()
	{
		clearTimeout($.fn.windowResize.loopTimer);
	};

	$.fn.windowResize.resize = function(opts,w,h)
	{
		
		var innerX,
			innerY,
			adjustedX,
			adjustedY,
			availW = screen.availWidth,
			availH = screen.availHeight;

		// size the browser to full size and then find difference between inner and outer sizes
		window.moveTo(0,0);
		window.resizeTo(availW,availH);
		
		// find inner height of browser. Wow this got hacky, not my code. jQuery probably already does this - leaving for now, will get back to it
    	if (self.innerHeight) // all except Explorer
		{
			innerX = self.innerWidth;
			innerY = self.innerHeight;
		}
		else if (document.documentElement && document.documentElement.clientHeight)// Explorer 6 Strict Mode
		{
			innerX = document.documentElement.clientWidth;
			innerY = document.documentElement.clientHeight;
		}
		else if (document.body) // other Explorers
		{
			innerX = document.body.clientWidth;
			innerY = document.body.clientHeight;
		}

		//console.log("innerX: "+innerX);
		//console.log("innerY: "+innerY);

		// make sure we have a final x/y value
		// pick one or the other windows value, not both
		// only need this if we are going to center the screen, however its an issue on dual monitors, so probably not needed
		/*
		if (window.screenX !== undefined)
		{
			x = window.screenX;
		}
		else
		{
			x = window.screenLeft;
		}
		if (window.screenY !== undefined)
		{
			y = window.screenY;
			//console.log("screenY");
		}
		else
		{
			y = window.screenTop;
			//console.log("screenTop");
		}
		*/


		//console.log("w: " + w);
		//console.log("h: " + h);
	
		//console.log("screenX: "+x);
		//console.log("screenY: "+y);
		
		// get inner width and add the difference
		adjustedX = w + (availW - innerX);
		adjustedY = h + (availH - innerY);
		//console.log("adjustedX: " + adjustedX);
		//console.log("adjustedY: " + adjustedY);
		
		// not sure I need the first resize here
		window.resizeTo(w, h);
		// size window to new adjusted dimensions
		window.resizeTo(adjustedX, adjustedY);

		// sets the height and width of the body to the new resolution and overflow properties if needed
		//$("body").css({"width":w+"px","height":h+"px"}); - don't need this, css should take care of these things
		if (opts.bodyOverflow == false)
		{
			$("body").css("overflow","hidden");
		}

	};

	// end of module
})(jQuery);