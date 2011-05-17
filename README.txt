//////////////////////////////////////////////////////////////////////////////////
// jQuery Radial Menu
//////////////////////////////////////////////////////////////////////////////////

Latest version: v1.0.0 (14/May/2011)

Author: Nirvana Tikku (ntikku@gmail.com, @ntikku)
Documentation:
	http://www.tikku.com/jquery-radmenu-plugin
	
Dual licensed under the MIT or GPL Version 2 licenses.

//////////////////////////////////////////////////////////////////////////////////

The radmenu plugin is an implementation of a Radial Menu, also known as a Pie Menu.
The plugin essentially distributes items in around the circumference of a circle.
The items are considered 'locked' whilst the items can be rotated. The menu provides
a rotation method, enabling a 'wagon-wheel' style interface, via utilizing CSS3. 
The radmenu can be brought up in any way by extending effects, and can be rotated
in varying directions.  The items can also be shuffled up.  The menu can be scaled
inward or outward, and can be brought up using any given selectEvent (click, 
mouseover, doubleclick, custom etc..).

The plugin is initialized with the following properties:

	var defaults = {
		listClass: "list",
		itemClass: "item",
		activeItemClass: "active", 
		selectEvent: null, 
		onSelect: function($selected){}, 
		radius: 10,
		initialScale: 1, 
		angleOffset: 0,
		centerX: 0,
		centerY: 0, 
		rotateAnimOpts: {
			duration: 500,
			easing: "linear", // Creates a smoother animation when rotating more than once
			complete: function(){}
		},
		scaleAnimProps: {}, // Additional properties to be animated
		scaleAnimOpts: {
			duration: 500,
			easing: "swing",
			complete: function(){}
		},
		onShow: function($items){$items.show();}, 
		onHide: function($items){$items.hide();},
		onNext: function($items){return true;}, 
		onPrev: function($items){return true;},
		onScaleItem: function($item, scaleFactor, coords){},
		rotate: false, 
		getRotation: function(degrees, index, numItems){return degrees;} 
	};
	
The above defaults can be overridden during plugin initialization. 


The plugin provides the following controls:

	jQuery("#radial_menu").radmenu("show");
	jQuery("#radial_menu").radmenu("show", function(items){ items.fadeIn(1000); });
	
	jQuery("#radial_menu").radmenu("hide");
	
	jQuery("#radial_menu").radmenu("next");
	jQuery("#radial_menu").radmenu("prev");
	
	jQuery("#radial_menu").radmenu("shuffle");
	
	jQuery("#radial_menu").radmenu("select");
	jQuery("#radial_menu").radmenu(0);
	
	jQuery("#radial_menu").radmenu("scale", 1.5);
	
	jQuery("#radial_menu").radmenu("items");
	
	jQuery("#radial_menu").radmenu("opts");
	
	jQuery("#radial_menu").radmenu("destroy");

Note: Rotation enables the items within the radmenu to be used in a wagon
wheel type of interface. The items are rotated via performing transforms.
The implementation works on the following (currently considered modern) browsers:

	Mozilla Firefox 3.5+, 
	Safari,
	Google Chrome,
	Internet Explorer 9+,
	Opera 11+

//////////////////////////////////////////////////////////////////////////////////

To minify:

	java -jar compiler.jar --js=jQuery.radmenu.js > jQuery.radmenu.min.js
	
//////////////////////////////////////////////////////////////////////////////////

