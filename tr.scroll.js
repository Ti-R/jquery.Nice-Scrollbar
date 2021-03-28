// Author: Ti-R (Renan Lavarec)
// License: MIT
// Version: 1.3.8

// Namespace TR
if( !TR )
	var TR = {};

// Mouse
if( !TR.MouseMove )
	TR.MouseMove = {x: 0, y: 0};

// Test if document got class, if not add it and bind the event
if (document.querySelector('mousemove_tr') === null) {
	document.className += ' mousemove_tr';
	document.addEventListener('mousemove', function(e){ 
		TR.MouseMove.x = e.clientX || e.pageX; 
	    TR.MouseMove.y = e.clientY || e.pageY;
	}, false);
}

// Create the nice scroll struct
TR.NiceScroll = function ( _id_child, options )
{
	// BEGIN ---- OPTIONS ----
	this.mOptions = {};
	
	// Debug
	this.mOptions.Debug = false;

	// Minimum size for the inner scroll
	this.mOptions.ScrollInnerSizeMin = 20;

	// Value to set to force scrolling 
	this.mOptions.ForceScrollingMax = 5;
	
	// Enable to force scrolling 
	this.mOptions.EnableForceScrolling = true;
	
	// Sensibility Touch in px to consider a click
	this.mOptions.SensibilityTouch = 10;
	
	// END ---- OPTIONS ----
	
	// Id Child
	this.mIdChild = _id_child;
	
	// Save Interval
	this.mInterval = undefined;
	
	// Enable to count before to force scrolling
	this.mForceScrollingCount = 0;

	// Save touch move
	this.mTouchMouse = {y: 0};	
	this.mTouchMouseStart = {x: 0, y: 0};	
	
	// Merge options
	if( options )
	{
		var tThis = this;
		for(var key in options) {
			tThis.mOptions[key] = options[key];
		}
	}
}

// Create debug function
TR.NiceScroll.prototype.Debug = function( _msg )
{
	if( this.mOptions.Debug )
	{
	    console.log("[NiceScroll] ", arguments);
	}
}

///
/// Remove scroll bar
///
TR.NiceScroll.prototype.Remove = function()
{
	var tDiv = jQuery( this.mIdChild );
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
	tDiv.unbind("touchend.tr_scroll");
	
	tDiv.unbind("touchmove.tr_scroll");
	
}
	
///
/// Remove scroll bar
///
TR.NiceScroll.prototype.Add = function()
{
	this.Remove();
	var tThis = this;
	var tDiv = jQuery( this.mIdChild );
	var tDivParent = tDiv.parent();
	
	// Save scroll position
	var tSavePosScrolling = tDivParent.scrollTop();
	
	var tNodeHtml = '<div class="NodeNiceScroll" style="position:relative;"></div>';
	jQuery(tNodeHtml).insertBefore( tDivParent );
	tDivParent.prev().append(tDivParent);

	// Restore scroll position
	tDivParent.scrollTop(tSavePosScrolling);
	
//	tDivParent.unbind("scroll").scroll(function(event) {
//  		tThis.Debug( " PARENT: Handler for .scroll() called.", event  );
//  		event.preventDefault();
//	});
	
	if( tThis.mOptions.Debug )
	{
		if( tDiv.length )
			tThis.Debug("TR.NiceScroll.Add -> " + this.mIdChild + " is found and attached");
		else
			tThis.Debug("ERROR: TR.NiceScroll.Add -> " + this.mIdChild + " is NOT found");
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
		
		tThis.Debug("touchstart.tr_scroll");
		  
		tThis.mTouchMouseStart.x = event.originalEvent.changedTouches[0].pageX;
		tThis.mTouchMouseStart.y = tThis.mTouchMouse.y = event.originalEvent.changedTouches[0].pageY;
			
		jQuery(this).unbind("touchmove.tr_scroll").bind('touchmove.tr_scroll', function(event) {
	/*		event.preventDefault();
			
		//	if( event.originalEvent.changedTouches[0].pageY-tThis.mTouchMouse.y > 10)
			{
				tThis.Debug("touchmove", event.originalEvent.changedTouches[0].pageY-tThis.mTouchMouse.y + " px");	
	
				ScrollBarScrollAction((event.originalEvent.changedTouches[0].pageY-tThis.mTouchMouse.y), false, false);
				tThis.mTouchMouse.y = event.originalEvent.changedTouches[0].pageY;
			}*/

 			tThis.Debug("touchmove", event.originalEvent.changedTouches[0].pageY-tThis.mTouchMouse.y + " px");	

			if(ScrollBarScrollAction((event.originalEvent.changedTouches[0].pageY-tThis.mTouchMouse.y), false, false))
			{
				tThis.mTouchMouse.y = event.originalEvent.changedTouches[0].pageY;
				return false;
			}
			return true;
		});
		
		function UnbindAll()
		{
			jQuery(this).unbind("touchend.tr_scroll").unbind("touchcancel.tr_scroll");
		}
		
		jQuery(this).unbind("touchend.tr_scroll").bind('touchend.tr_scroll', function(event) {
			tThis.Debug("touchend");	
			
			if( event.originalEvent.changedTouches[0].pageY<(tThis.mTouchMouseStart.y+tThis.mOptions.SensibilityTouch) && event.originalEvent.changedTouches[0].pageY>(tThis.mTouchMouseStart.y-tThis.mOptions.SensibilityTouch))
			{
				if( event.originalEvent.changedTouches[0].pageX<(tThis.mTouchMouseStart.x+tThis.mOptions.SensibilityTouch) && event.originalEvent.changedTouches[0].pageX>(tThis.mTouchMouseStart.x-tThis.mOptions.SensibilityTouch))
				{
					tThis.Debug("touchend.tr_scroll", tThis.mTouchMouseStart.x ,tThis.mTouchMouseStart.y );
					document.elementFromPoint(tThis.mTouchMouseStart.x, tThis.mTouchMouseStart.y).click();
				}
			}
			
			UnbindAll.call(this);
			// Can give the event to the parent	
			return true; 
		});
		
		jQuery(this).unbind("touchcancel.tr_scroll").bind('touchcancel.tr_scroll', function(event) {
 			tThis.Debug("touchcancel");	
			UnbindAll.call(this);
			
			// Can give the event to the parent	
			return true; 
		});

		// Can give the event to the parent	
		return false; 
	});
	
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
		
		if( tThis.mOptions.Debug )
		{
			tThis.Debug("_pixels:", _pixels);
			tThis.Debug("tCurrentTopPos:", tCurrentTopPos);
			tThis.Debug("tParentHeight:", tParentHeight);
			tThis.Debug("tChildHeight:", tChildHeight);
			tThis.Debug("tChildHeight-tParentHeight:", tChildHeight-tParentHeight);
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
	
				tThis.Debug("tScrollBarInnerPositionTop:", tScrollBarInnerPositionTop);
				
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
	
				tThis.Debug("tScrollBarInnerPositionTop:", tScrollBarInnerPositionTop);
				
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

			tThis.Debug("tScrollBarInnerPositionTop:", tScrollBarInnerPositionTop);

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
			jQuery(tHtml).insertBefore( tDivParent );

			var tScrollingMoving = false;
			var tMousePosInYOnMouseDown = TR.MouseMove.y;
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
			
				if( TR.MouseMove.y < tScrollBarInner.offset().top )
				{
					// Mouse on top of the inner
					ScrollBarScrollAction(tScrollBarBackground.height()*0.8, true, false);
				} 
				else
				{
					// Mouse after the inner
					ScrollBarScrollAction(-tScrollBarBackground.height()*0.8, true, false);
				} 
				return false;
			});
			
			// Mouse wheel (for the scrollbar)
			tScrollBar.bind('mousewheel',function(event) {
			
				MouseWheelAction(event);
				return false;
			});
			
			tScrollBarInner.mousedown(function(){
				tCountEnterDivs = 1;
				tMousePosInYOnMouseDown = TR.MouseMove.y;
				tScrollBarInnerPositionTop = tScrollBarInner.position().top;
				
			    tScrollingMoving = true;
			    
			    jQuery('body').append('<div class="tr_scrollbar_scrolling_dontloose_focus tr_scrollbar_invible"></div>');
				jQuery('.tr_scrollbar_scrolling_dontloose_focus').css("position", "fixed")
														.css("top",(tScrollBar.offset().top-200)+"px")
														.css("left", tScrollBar.offset().left-200+"px")
														.css("height",(tParentHeight+400)+"px")
														.css("width", "440px");
			    jQuery('body').addClass("tr_forbid_selection");
			    
				    
				jQuery('.tr_scrollbar_scrolling_dontloose_focus').mouseup(function() {
				    StopMovingScrollBar();
				}).mouseleave(function() {
				    StopMovingScrollBar();
				}).mousemove(function() {
					if( tScrollingMoving )
					{
				    	setScrollingPosition();
						TR.SetScrollBarBigger( tIdChild, true );
				    }
				    	
					tMousePosInYOnMouseDown = TR.MouseMove.y;
				});
			});
			
			function StopMovingScrollBar()
			{
			    tScrollingMoving = false;
			    jQuery('.tr_scrollbar_scrolling_dontloose_focus').remove();
			    jQuery('body').removeClass("tr_forbid_selection");
			    TR.SetScrollBarSmaller( tIdChild );
			}
			
			
			function setScrollingPosition() {
			    ScrollBarScrollAction( tMousePosInYOnMouseDown-TR.MouseMove.y, true, true);
			}
		}
	}

	// Use this hack to check every half second if size change
	var tLastWidth = -1;
	var tLastHeight = -1;
	var tLastHeightParent = -1;
	this.mInterval = setInterval(function () {
        if ((tLastWidth != tDiv.width()) || (tLastHeight != tDiv.innerHeight()) ||
        	(tLastHeightParent != tDivParent.innerHeight()) ) {
        	
            tLastWidth = tDiv.width();
            tLastHeight = tDiv.innerHeight();
			tLastHeightParent = tDivParent.innerHeight();
			AddScrollIfNeed();
        }
    }, 500);
	
	AddScrollIfNeed();
	
}
	
TR.SetScrollBarBigger = function( _id_child, _set_hover  )
{
	_set_hover = _set_hover || false;
	
	var tDiv = jQuery( _id_child );
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
	var tDiv = jQuery( _id_child );
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




