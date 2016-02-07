// Author: Ti-R (Renan Lavarec)
// License: MIT
// Version: 1.1.0

var gDebugScroll = false;

// Mouse
var gScrollMouse = {x: 0, y: 0};
var gTouchMouse = {y: 0};


document.addEventListener('mousemove', function(e){ 
    gScrollMouse.x = e.clientX || e.pageX; 
    gScrollMouse.y = e.clientY || e.pageY;
}, false);


// Namespace TR
if( _.isUndefined(TR) )
	var TR = {};


// Create the nice scroll struct
TR.NiceScroll = function ( _id_child )
{
	// Id Child
	this.mIdChild = _id_child;
// Intervals
	this.mInterval = undefined;
}

///
/// Remove scroll bar
///
TR.NiceScroll.prototype.Remove = function()
{
	var tDiv = $( this.mIdChild );
	var tDivParent = tDiv.parent();
	
	// Remove timer
	if( this.mInterval != undefined)
	{
		window.clearInterval(this.mInterval);
		this.mInterval = undefined;
	} 
	
	//var tScrollBar = tDivParent.children('.tr_scrollbar');
	var tScrollBar = tDivParent.prev();
	if( !tScrollBar )
		return;
	if( !tScrollBar.hasClass('tr_scrollbar') )
		return;


	tScrollBar.remove();
	
	// Mouse wheel (for the body to scroll)
	tDiv.unbind("mousewheel");
	
	tDiv.unbind("touchstart");
	
	tDiv.unbind("touchmove");
	
}
	
///
/// Remove scroll bar
///
TR.NiceScroll.prototype.Add = function()
{
	this.Remove();
	
	var tDiv = $( this.mIdChild );
	var tDivParent = tDiv.parent();
	
//	tDivParent.unbind("scroll").scroll(function(event) {
//  		console.log( " PARENT: Handler for .scroll() called.", event  );
//  		event.preventDefault();
//	});
	
	if( gDebugScroll )
	{
		if( tDiv.length )
			console.log("TR.NiceScroll.Add -> " + this.mIdChild + " is found and attached");
		else
			console.log("ERROR: TR.NiceScroll.Add -> " + this.mIdChild + " is NOT found");
	}
		
	function MouseWheelAction(event)
	{
		ScrollBarScrollAction((/*event.deltaY*event.deltaFactor*/event.deltaY*200), true, false);
	}	

	// Mouse wheel (for the body to scroll)
	tDiv.unbind("mousewheel").mousewheel(function(event) {
		MouseWheelAction(event);
		return false; 
	});
	
	tDiv.unbind("touchstart").children().bind('touchstart', function(event) {
		
	 if( gDebugScroll )
		  console.log("touchstart");
		  
		gTouchMouse.y = event.originalEvent.changedTouches[0].pageY;
			
		$(this).unbind("touchmove").bind('touchmove', function(event) {
			event.preventDefault();
			
		//	if( event.originalEvent.changedTouches[0].pageY-gTouchMouse.y > 10)
			{
	 			if( gDebugScroll )
					console.log("touchmove ", event.originalEvent.changedTouches[0].pageY-gTouchMouse.y + " px");	
	
				ScrollBarScrollAction((event.originalEvent.changedTouches[0].pageY-gTouchMouse.y), false, false);
				gTouchMouse.y = event.originalEvent.changedTouches[0].pageY;
			}
		});
		
		function UnbindAll()
		{
			$(this).unbind("touchend").unbind("touchcancel");
		}
		
		$(this).unbind("touchend").bind('touchend', function(event) {
	 		if( gDebugScroll )
				console.log("touchend");	
			_.bind(UnbindAll, this)();
		});
		
		$(this).unbind("touchcancel ").bind('touchcancel ', function(event) {
	 		if( gDebugScroll )
	 			console.log("touchcancel");	
			_.bind(UnbindAll, this)();
		});
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

	 	if( gDebugScroll )
	 	{
			console.log("_pixels:", _pixels);
			console.log("tParentHeight:", tParentHeight);
			console.log("tChildHeight:", tChildHeight);
			console.log("tChildHeight-tParentHeight:", tChildHeight-tParentHeight);
		}

		var tMaxHeightBackgroundScrollBar = ((tParentHeight) - ((tParentHeight/tChildHeight)*tParentHeight));
		
		if( _is_mouse )
		{
			if( _is_scrollbar )
			{
				// Scrollbar
				var tScrollBarInnerPositionTop = -tScrollBarInner.position().top;
				var tNewTopPosition = (-tScrollBarInnerPositionTop)-_pixels;
	
	 			if( gDebugScroll )
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
	
	 			if( gDebugScroll )
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

 			if( gDebugScroll )
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
		var tParentMarginTop = parseFloat(tDivParent.css('margin-top')) - parseFloat(tDivParent.css('padding-top'));
		//var tParentPadding = tDivParent.css('padding-top')+tDivParent.css('padding-bottom');
		var tChildHeight = tDiv.outerHeight();
	//	tDivParent += tParentPadding;
			
		if( tParentHeight < tChildHeight )
		{
			// Fix marging bug after absolute position (workarround FF/Chrome)
			if( tParentMarginTop<5 )
				tParentMarginTop = 0;
			else
				tParentMarginTop -= 5;
			
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
			var tMousePosInYOnMouseDown = gScrollMouse.y;
			//var tScrollBar= tDivParent.children('.tr_scrollbar')
			var tScrollBar = tDivParent.prev();
			if( !tScrollBar )
				return;
			if( !tScrollBar.hasClass('tr_scrollbar') )
				return;

			var tScrollBarInner = tScrollBar.find('.tr_scrollbar_inner');
			var tScrollBarInnerPositionTop = 0;
			var tScrollBarBackground = tScrollBar.children('.tr_scrollbar_background');
			
			
			tScrollBar.css({"margin-left":(tDivParent.outerWidth()- parseFloat(tDivParent.css("border-left-width"))- parseFloat(tDivParent.css("border-right-width"))+parseFloat(tDivParent.css("margin-left"))-30) + "px"});
			
			var tCountEnterDivs = 0;
			
			// Init scroll pos
			ScrollBarScrollAction(0, true, false);
			
			// Click on scrollbar
			tScrollBarBackground.click(function(event) {
			
				if( gScrollMouse.y < tScrollBarInner.offset().top )
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
				tMousePosInYOnMouseDown = gScrollMouse.y;
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
				    	
					tMousePosInYOnMouseDown = gScrollMouse.y;
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
			    ScrollBarScrollAction( tMousePosInYOnMouseDown-gScrollMouse.y, true, true);
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




