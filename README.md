# Nice-Scrollbar
Nice scrolling Bar for browser on PC (mouse and touch events) and on Smartphones (touch events). Big and slim, easy to integrate. Tested on Firefox/Chrome/Maxthon/iPhone/Android.

# Infos
 - Get bigger when the mouse is next to it.
 - Scrolling working on Smartphone with the finder on the div you need to scroll.
 - Automatic adaptive scrolling even if content will appear later.
 - You can use a mouse on PC to move the scrollbar.
 - You can click inside the scrollbar to move quickly top or down.
 - You can use the scrolling button of the mouse to scroll content.
 - You can click in the bar to quickly page up or down.
 - You can use scrolling content inside scrolling content.
 - Pixel perfect.
 - Support browser zooming.
 - Add "force scrolling" by scrolling more on extrem position (top or bottom) when 1 scroll element is child of another one. (option) (enable by default)
 
 
# Dependencies
 - [jquery](https://jquery.com/)
 - [jquery.mousewheel](https://github.com/jquery/jquery-mousewheel)
 - [underscore](http://underscorejs.org/)


# Demo
When the user is far away, the scrollbar is hidden.
When the user approach, the scrollbar appear.

![Nice-Scrollbar Nice-Scrollbar](http://www.ti-r.com/images/js/tr.nice.scroll.gif)

You can test it on my website.
[www.ti-r.com (NiceScroll)](http://www.ti-r.com/?js/Web/NiceScroll)

There is 5 demos inside demos directory
- demo-basic.html:
	* It show how to use it with a very basic sample.

- demo-dynamic-add-content:
	* Same as basic but you can add content to the scroll div.
	* The scrollbar is automatically changing size.

- demo-dynamic-inside-another:
	* Enable to see scrolled content inside another scrolled control.

- demo-set-options:
	* Show how to set options.

- demo-add-remove:
	* Show how to add remove scrolling.


# How to use it
- Html:
You need 2 div, the parent will own the scrollbar, the child will be scrolled.
```html
<div id="divNiceScrollSampleParent">
	<div id="divNiceScrollSampleInside"></div>
</div>
```

- CSS:
"padding-right" enable to get some space when the scrollbar grow.
"padding" enable to get some space for the text scrolled.
```css
#divNiceScrollSampleParent {
	padding-right:10px;
	height:152px;
	width:580px;
}

#divNiceScrollSampleInside {
	padding:5px;
}
```

- Javascript:
```js
var niceScroll = new TR.NiceScroll("#divNiceScrollSampleInside");
niceScroll.Add();
// After you use it, you can remove remove it
niceScroll.Remove();
```

# Reason
I needed a scrolling library for my personal website, and because I couldn't find a good one fitting all my needs, I just create my own :)


# Changelog
 - Version 1.3.0
	* Add/Remove events binding with namespace.
	* Add a grandparent node automatically.
	* Enable to force scrolling by scrolling more on extreme position (top or bottom) when 1 scroll element is child of another one. (enable by default)
	* Add options:
		* Set the size of the minimum inner size height
		* Activate force scrolling
		* Set force scrolling attempt before to continue to scroll over the screen
	
 - Version 1.2.0
	* Fix a bug where too much content to scroll make the cursor too small.
	* Fix a bug on placement for some cases.
	* Add namespace for global vars
		
 - Version 1.1.0
	* Insert scrollbar before parent of the div because of a Firefox Bug
		- Firefox: bug scrollbar absolute position is moving on scrolling content

 - Version 1.0.0
	* Release
	