// Author: Ti-R (Renan Lavarec)
// License: MIT
// Version: 1.3.0

// Namespace TR
if( _.isUndefined(TR) )
	var TR = {};


TR.DebugScroll = false;

// Mouse
TR.ScrollMouse = {x: 0, y: 0};
TR.TouchMouse = {y: 0};

document.addEventListener('mousemove', function(e){ 
    TR.ScrollMouse.x = e.clientX || e.pageX; 
    TR.ScrollMouse.y = e.clientY || e.pageY;
}, false);


// Create the nice scroll struct
TR.NiceScroll = function ( _id_child, options )
{
	// BEGIN ---- OPTIONS ----
	this.mOptions = {};
	
	// Minimum size for the inner scroll
	this.mOptions.ScrollInnerSizeMin = 20;
	
	// Value to set to force scrolling 
	this.mOptions.ForceScrollingMax = 5;
	
	// Enable to force scrolling 
	this.mOptions.EnableForceScrolling = true;
	// END ---- OPTIONS ----
	
	// Id Child
	this.mIdChild = _id_child;
	
	// Save Interval
	this.mInterval = undefined;
	
	// Enable to count before to force scrolling
	this.mForceScrollingCount = 0;
	
	
	// Merge options
	var tThis = this;
	function MergeOptions( _value, _key )
	{
		if( _.has(options, _key) )
		{
			tThis.mOptions[_key] = options[_key];
		}
	}
	_.each(this.mOptions, MergeOptions);
}

///
/// Remove scroll bar
///
TR.NiceScroll.prototype.Remove = function()
{
	var tDiv = $( this.mIdChild );
	var tDivParent = tDiv.parent();
	
	// Get NodeNiceScroll
	var tNodeNiceScroll = tDivParent.parent();
	if( !tNodeNiceScroll.hasClass('NodeNiceScroll') )
		return;
	
	// Move content before NodeNiceScroll and destroy NodeNiceScroll
	tDivParent.insertBefore(tNodeNiceScroll);
	tNodeNiceScroll.remove();
	
	// Remove timer
	if( this.mInterval != undefined)
	{
		window.clearInterval(this.mInterval);
		this.mInterval = undefined;
	} 
	
	tDivParent.css("overflow", "auto");
	
	//var tScrollBar = tDivParent.children('.tr_scrollbar');
	var tScrollBar = tDivParent.prev();
	if( !tScrollBar )
		return;
	if( !tScrollBar.hasClass('tr_scrollbar') )
		return;


	tScrollBar.remove();
	
	// Mouse wheel (for the body to scroll)
	tDiv.unbind("mousewheel.tr_scroll");
	
	tDiv.unbind("touchstart.tr_scroll");
	
	tDiv.unbind("touchmove.tr_scroll");
	
}
	
///
/// Remove scroll bar
///
TR.NiceScroll.prototype.Add = function()
{
	this.Remove();
	
	var tDiv = $( this.mIdChild );
	var tDivParent = tDiv.parent();
	
	var tNodeHtml = '<div class="NodeNiceScroll" style="position:relative;"></div>';
	$(tNodeHtml).insertBefore( tDivParent );
	tDivParent.prev().append(tDivParent);
	
//	tDivParent.unbind("scroll").scroll(function(event) {
//  		console.log( " PARENT: Handler for .scroll() called.", event  );
//  		event.preventDefault();
//	});
	
	if( TR.DebugScroll )
	{
		if( tDiv.length )
			console.log("TR.NiceScroll.Add -> " + this.mIdChild + " is found and attached");
		else
			console.log("ERROR: TR.NiceScroll.Add -> " + this.mIdChild + " is NOT found");
	}
		
	function MouseWheelAction(event)
	{
		return ScrollBarScrollAction((/*event.deltaY*event.deltaFactor*/event.deltaY*200), true, false);
	}	

	// Mouse wheel (for the body to scroll)
	tDiv.unbind("mousewheel.tr_scroll").bind('mousewheel.tr_scroll', function(event) {
		if(MouseWheelAction(event))
			return false;
			
		// Can give the event to the parent	
		return true; 
	});
	
	tDiv.unbind("touchstart.tr_scroll").children().bind('touchstart.tr_scroll', function(event) {
		
	 if( TR.DebugScroll )
		  console.log("touchstart.tr_scroll");
		  
		TR.TouchMouse.y = event.originalEvent.changedTouches[0].pageY;
			
		$(this).unbind("touchmove.tr_scroll").bind('touchmove.tr_scroll', function(event) {
			event.preventDefault();
			
		//	if( event.originalEvent.changedTouches[0].pageY-TR.TouchMouse.y > 10)
			{
	 			if( TR.DebugScroll )
					console.log("touchmove", event.originalEvent.changedTouches[0].pageY-TR.TouchMouse.y + " px");	
	
				ScrollBarScrollAction((event.originalEvent.changedTouches[0].pageY-TR.TouchMouse.y), false, false);
				TR.TouchMouse.y = event.originalEvent.changedTouches[0].pageY;
			}
		});
		
		function UnbindAll()
		{
			$(this).unbind("touchend.tr_scroll").unbind("touchcancel.tr_scroll");
		}
		
		$(this).unbind("touchend.tr_scroll").bind('touchend.tr_scroll', function(event) {
	 		if( TR.DebugScroll )
				console.log("touchend");	
			_.bind(UnbindAll, this)();
		});
		
		$(this).unbind("touchcancel.tr_scroll").bind('touchcancel.tr_scroll', function(event) {
	 		if( TR.DebugScroll )
	 			console.log("touchcancel");	
			_.bind(UnbindAll, this)();
		});
	});
	
	var tThis = this;
	// If mouse set to true or this is for the scrollbar
	function ScrollBarScrollAction( _pixels, _is_mouse, _is_scrollbar )
	{
		var tParentHeight = tDivParent.innerHeight();
		var tChildHeight = tDiv.outerHeight();
	
		
		//var tScrollBar = tDivParent.children('.tr_scrollbar');
		var tScrollBar = tDivParent.prev();
		if( !tScrollBar )
			return;
		if( !tScrollBar.hasClass('tr_scrollbar') )
			return;
		var tScrollBarInner = tScrollBar.find('.tr_scrollbar_inner');


		var tCurrentTopPos = tDivParent.scrollTop();

	 	if( TR.DebugScroll )
	 	{
			console.log("_pixels:", _pixels);
			console.log("tParentHeight:", tParentHeight);
			console.log("tChildHeight:", tChildHeight);
			console.log("tChildHeight-tParentHeight:", tChildHeight-tParentHeight);
		}

		var tMaxHeightBackgroundScrollBar = ((tParentHeight) - ((tParentHeight/tChildHeight)*tParentHeight));
		if( tMaxHeightBackgroundScrollBar+tThis.mOptions.ScrollInnerSizeMin > tParentHeight)
			tMaxHeightBackgroundScrollBar = tParentHeight-tThis.mOptions.ScrollInnerSizeMin;

		if( _is_mouse )
		{
			if( _is_scrollbar )
			{
				// Scrollbar
				var tScrollBarInnerPositionTop = -tScrollBarInner.position().top;
				var tNewTopPosition = (-tScrollBarInnerPositionTop)-_pixels;
	
	 			if( TR.DebugScroll )
	 			{
					console.log("tScrollBarInnerPositionTop:", tScrollBarInnerPositionTop);
				}
				
				if( tNewTopPosition < 0 )
				{
					tNewTopPosition = 0;
				}
				else
				{
					if( tNewTopPosition > tMaxHeightBackgroundScrollBar)
					{
						tNewTopPosition = tMaxHeightBackgroundScrollBar;
					}
				}
			    tScrollBarInner.css({ top: tNewTopPosition+'px' });
			    
			    
			    var tScrollNewTopPosition = tNewTopPosition/tMaxHeightBackgroundScrollBar * (tChildHeight-tParentHeight);
	
			    tDivParent.scrollTop(tScrollNewTopPosition);
			}
			else
			{
				// Mouse scrolling
				var tScrollBarInnerPositionTop = -tDivParent.scrollTop();
				var tNewTopPosition = (-tScrollBarInnerPositionTop)-_pixels;
	
	 			if( TR.DebugScroll )
	 			{
					console.log("tScrollBarInnerPositionTop:", tScrollBarInnerPositionTop);
				}
				
				if( tNewTopPosition < 0 )
				{
					tNewTopPosition = 0;
				}
				else
				{
					if( tNewTopPosition > (tChildHeight-tParentHeight))
					{
						tNewTopPosition = (tChildHeight-tParentHeight);
					}
				}
			    tDivParent.stop().animate({ scrollTop:tNewTopPosition }, 100, "linear");
			    //tDivParent.scrollTop(tNewTopPosition);
			    
			    var tScrollNewTopPosition = tNewTopPosition/(tChildHeight-tParentHeight) * tMaxHeightBackgroundScrollBar;
			    
			    //tScrollBarInner.css({ top: tScrollNewTopPosition+'px' });
			    tScrollBarInner.stop().animate({ top:tScrollNewTopPosition }, 100, "linear");
			}
		}
		else
		{
			// Touch device
			var tScrollBarInnerPositionTop = -tDivParent.scrollTop();
			var tNewTopPosition = (-tScrollBarInnerPositionTop)-_pixels;

 			if( TR.DebugScroll )
 			{
				console.log("tScrollBarInnerPositionTop:", tScrollBarInnerPositionTop);
			}
			if( tNewTopPosition < 0 )
			{
				tNewTopPosition = 0;
			}
			else
			{
				if( tNewTopPosition > (tChildHeight-tParentHeight))
				{
					tNewTopPosition = (tChildHeight-tParentHeight);
				}
			}
		    tDivParent.scrollTop(tNewTopPosition);
		    
		    
		    var tScrollNewTopPosition = tNewTopPosition/(tChildHeight-tParentHeight) * tMaxHeightBackgroundScrollBar;

		    tScrollBarInner.css({ top: tScrollNewTopPosition+'px' });
		}

		if( tCurrentTopPos === tDivParent.scrollTop())
		{
			if( tThis.mOptions.EnableForceScrolling )
			{
				++tThis.mForceScrollingCount;
				if( tThis.mForceScrollingCount > tThis.mOptions.ForceScrollingMax)
				{
					tThis.mForceScrollingCount = 0;
					return false;
				}
			}
			return true;
		}
		tThis.mForceScrollingCount = 0;
		return true;
	}

	var tIdChild = this.mIdChild;
	
	function AddScrollIfNeed()
	{
		//tDivParent.children('.tr_scrollbar').remove();
		var tScrollBar = tDivParent.prev();
		if( tScrollBar && tScrollBar.hasClass('tr_scrollbar') )
			tScrollBar.remove();
			
		tDivParent.css("overflow", "hidden");
		
		
	
		var tParentHeight = tDivParent.innerHeight();
		var tParentMarginTop = 0;

		var tChildHeight = tDiv.outerHeight();
			
		if( tParentHeight < tChildHeight )
		{
			tParentMarginTop += parseFloat(tDivParent.css('border-top-width'));
		
			var tHtml = '';
			tHtml += '<div class="tr_scrollbar tr_scrollbar_invible" style="height:'+tParentHeight+'px;margin-top:'+tParentMarginTop+'px" onmouseover="TR.SetScrollBarBigger(\''+tIdChild+'\')" onmouseout="TR.SetScrollBarSmaller(\''+tIdChild+'\')">';
				tHtml += '<div class="tr_scrollbar_background" style="height:'+tParentHeight+'px;">';
					tHtml += '<div class="tr_scrollbar_inner" style="height:'+(tParentHeight/tChildHeight)*100+'%">';
					tHtml += '</div>';
				tHtml += '</div>';
			tHtml += '</div>';
			//tDivParent.prepend(tHtml);
			$(tHtml).insertBefore( tDivParent );
			
			var tScrollingMoving = false;
			var tMousePosInYOnMouseDown = TR.ScrollMouse.y;
			//var tScrollBar= tDivParent.children('.tr_scrollbar')
			var tScrollBar = tDivParent.prev();
			if( !tScrollBar )
				return;
			if( !tScrollBar.hasClass('tr_scrollbar') )
				return;

			var tScrollBarInner = tScrollBar.find('.tr_scrollbar_inner');
			var tScrollBarInnerPositionTop = 0;
			var tScrollBarBackground = tScrollBar.children('.tr_scrollbar_background');
			
			// Min inner height
			if( tScrollBarInner.height()<tThis.mOptions.ScrollInnerSizeMin )
				tScrollBarInner.height(tThis.mOptions.ScrollInnerSizeMin);
				
			tScrollBar.css({"margin-left":(tDivParent.outerWidth()- parseFloat(tDivParent.css("border-left-width"))- parseFloat(tDivParent.css("border-right-width"))+parseFloat(tDivParent.css("margin-left"))-30) + "px"});
			
			var tCountEnterDivs = 0;
			
			// Init scroll pos
			ScrollBarScrollAction(0, true, false);
			
			// Click on scrollbar
			tScrollBarBackground.click(function(event) {
			
				if( TR.ScrollMouse.y < tScrollBarInner.offset().top )
				{
					// Mouse on top of the inner
					ScrollBarScrollAction(tScrollBarBackground.height()*0.8, false, true);
				} 
				else
				{
					// Mouse after the inner
					ScrollBarScrollAction(-tScrollBarBackground.height()*0.8, false, true);
				} 
				return false;
			});
			
			// Mouse wheel (for the scrollbar)
			tScrollBar.mousewheel(function(event) {
			
				MouseWheelAction(event);
				return false;
			});
			
			tScrollBarInner.mousedown(function(){
				tCountEnterDivs = 1;
				tMousePosInYOnMouseDown = TR.ScrollMouse.y;
				tScrollBarInnerPositionTop = tScrollBarInner.position().top;
				
			    tScrollingMoving = true;
			    
			    $('body').append('<div class="tr_scrollbar_scrolling_dontloose_focus tr_scrollbar_invible"></div>');
				$('.tr_scrollbar_scrolling_dontloose_focus').css("position", "fixed")
														.css("top",(tScrollBar.offset().top-200)+"px")
														.css("left", tScrollBar.offset().left-200+"px")
														.css("height",(tParentHeight+400)+"px")
														.css("width", "440px");
			    $('body').addClass("tr_forbid_selection");
			    
				    
				$('.tr_scrollbar_scrolling_dontloose_focus').mouseup(function() {
				    StopMovingScrollBar();
				}).mouseleave(function() {
				    StopMovingScrollBar();
				}).mousemove(function() {
					if( tScrollingMoving )
					{
				    	setScrollingPosition();
						TR.SetScrollBarBigger( tIdChild, true );
				    }
				    	
					tMousePosInYOnMouseDown = TR.ScrollMouse.y;
				});
			});
			
			function StopMovingScrollBar()
			{
			    tScrollingMoving = false;
			    $('.tr_scrollbar_scrolling_dontloose_focus').remove();
			    $('body').removeClass("tr_forbid_selection");
			    TR.SetScrollBarSmaller( tIdChild );
			}
			
			
			function setScrollingPosition() {
			    ScrollBarScrollAction( tMousePosInYOnMouseDown-TR.ScrollMouse.y, true, true);
			}
		}
	}

	// Use this hack to check every half second if size change
	var tLastWidth = -1;
	var tLastHeight = -1;
	this.mInterval = setInterval(function () {
        if ((tLastWidth != tDiv.width()) || (tLastHeight != tDiv.innerHeight())) {
            tLastWidth = tDiv.width();
            tLastHeight = tDiv.innerHeight();
			
			AddScrollIfNeed();
        }
    }, 500);
	
	AddScrollIfNeed();
	
}
	
TR.SetScrollBarBigger = function( _id_child, _set_hover  )
{
	_set_hover = _set_hover || false;
	
	var tDiv = $( _id_child );
	var tDivParent = tDiv.parent();
	
	
	//var tScrollBar= tDivParent.children('.tr_scrollbar')
	var tScrollBar = tDivParent.prev();
	if( !tScrollBar )
		return;
	if( !tScrollBar.hasClass('tr_scrollbar') )
		return;
		
	tScrollBar.find(".tr_scrollbar_background").addClass("tr_scrollbar_width_hover");
	tScrollBar.find(".tr_scrollbar_inner").addClass("tr_scrollbar_width_hover");

	if( _set_hover )
		tScrollBar.find(".tr_scrollbar_inner").addClass("tr_scrollbar_inner_hover");
}

TR.SetScrollBarSmaller = function( _id_child  )
{
	var tDiv = $( _id_child );
	var tDivParent = tDiv.parent();
	
	//var tScrollBar= tDivParent.children('.tr_scrollbar')
	var tScrollBar = tDivParent.prev();
	if( !tScrollBar )
		return;
	if( !tScrollBar.hasClass('tr_scrollbar') )
		return;
		
	tScrollBar.find(".tr_scrollbar_background").removeClass("tr_scrollbar_width_hover");
	tScrollBar.find(".tr_scrollbar_inner").removeClass("tr_scrollbar_width_hover").removeClass("tr_scrollbar_inner_hover");
}




