/*!
 * jQuery Radmenu (Radial Menu) Plugin
 * version: 1.0.1 (17-JAN-2013)
 * @requires v1.4.2 or later
 * 
 * Author: Nirvana Tikku - ntikku@gmail.com - @ntikku
 * Documentation:
 * 		http://www.tikku.com/jquery-radmenu-plugin
 * 
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html 
 * 
 */

;(function($){
	
	// radmenu namespace
	
	var RADMENU = ".radmenu", // events are radmenu.{event} - guarantee no NS collision
	
		OPTS = "options"+RADMENU,
		
		PREVOPTS = "prevoptions"+RADMENU,
		
		RADMENU_CLASS = "ui-radmenu-parent"; 
		
	// private defaults
	var defaults = {
		
		// radial menu container properties
		
		listClass: "list",
		
		itemClass: "item",
		
		activeItemClass: "active",
		
		// active item selection properties
		
		selectEvent: null, // click, mouseenter etc
		
		onSelect: function($selected){},
		
		// initial setup properties
		
		radius: 10, // in pixels
		
		angleOffset: 0, // in degrees
		
		centerX: 0,
		
		centerY: 0,
		
		// animation properties
		
		animSpeed: 500,
		
		animEasing: "swing",
		
		// scaling properties and method
		
		initialScale: 1,
		
		scaleAnimSpeed: 0,
		
		scaleAnimEasing: "swing",
		
		scaleAnimOpts: {},
		
		// example onScaleItem: $item.css("font-size", factor+"em");
		onScaleItem: function($item, factor, coords){},
		
		// public events 
		
		afterAnimation: function($m){},
		
		onShow: function($items){$items.show();},
		
		onHide: function($items){$items.hide();},
		
		onNext: function($items){return true;},
		
		onPrev: function($items){return true;},
		
		// rotation property and fine-tuning event 
		
		rotate: false,
		
		getRotation: function(degrees, index, numItems){return degrees;}
		
	};

	// radial menu container setup defaults
	$.radmenu = {
		
		container: {
			
			html: "<div></div>",
			
			css: { "position": "relative" },
			
			clz: "radial_div",
			
			itemClz: "radial_div_item"
			
		}
		
	};
	
	/**
	 * jQuery Radmenu Plugin
	 * 	@params 
	 * 		> input, dealt with by type
	 * 	if empty - assumes initialization
	 * 	if object - assumes initialization
	 * 	if string - assumes trigger method
	 * 	if number - select a particular menu item
	 */ 
	$.fn.radmenu = function(input, param){
		
		try {
			
			var $this = $(this);
			
			var type = typeof input;
			
			if(arguments.length==0 || type=="object") 
			
				return init($this, input);
				
			else if(type=="string")
			
				return (input=="items" || input=="opts") ?
					$this.triggerHandler(input+RADMENU) :
					$this.trigger(input+RADMENU, param || null);
					
			else if(type=="number")
				
				return $this.trigger("select"+RADMENU,input);
				
		} catch (e) { 
			
			return "error : "+e; 
			
		}
		
	};
	
	/**
	 * private :: init fn
	 * @params
	 * 	$menu - the jQuery obj / array w/ menu target
	 *  opts - options object, to be merged with defaults
	 */
	function init($menu, opts){
		
		var o = $.extend({}, defaults, opts);
		
		return $menu.each(function(m){
			
			var $this = $(this);
			
			if(!$this.hasClass(RADMENU_CLASS)) {
			
				var $list = $this.find("."+o.listClass);
			
				$list.find("."+o.itemClass).hide(); // ensure its hidden
			
				// set the options within the data for the elem & bind evts
				$this.data(OPTS, updateRadius(o, o.initialScale, o.radius));
			
				for(e in MENU) 
					$this.bind(e+RADMENU, $this, MENU[e]);
				
				$this.addClass(RADMENU_CLASS);
			
			}
			
		});
		
	};

	/**
	 * selects a menu item - this method provides
	 * functionality for nested radial menus
	 * @param 
	 * 	evt - the event object
	 * triggers select event on radmenu container
	 * 	using the index of the 'target object'
	 */
	function selectMenuitem(evt){ 
		
		var $this = $(this);
		
		var $element = $(evt.target);
		
		var container = $.radmenu.container;
		
		if(!$element.hasClass(container.itemClz))
			$element = $element.closest("."+container.itemClz);
			
		var isInNested = $element.parents("."+container.itemClz).length>0;
		
		var index = $element.index();
		
		if(!isInNested)
			$this.parents("."+container.clz).radmenu(index);
			
		else 
			$this.radmenu(index);
			
		cancelBubble(evt);
		
	};
	
	/**
	 * cancel event bubbling - x-browser friendly
	 * @param
	 * 	evt - the event object
	 */
	function cancelBubble(evt){
		
		if(!$.support.opacity) 
			window.event.cancelBubble = true;
			
		else 
			evt.stopPropagation();
			
	};
	
	/**
	 * All the events bound to the radial menu instance
	 */
	var MENU = {
		opts: function(evt) { 
			
			return getMenu(evt).opts;
			
		},
		show: function(evt, fn){ // fn = user input onshow
			
			var $m = getMenu(evt);
			
			var container = $.radmenu.container;
			
			// clear any existing radial menus within the menu
			$m.menu.find("."+container.clz).remove();
			
			// grab the desired menu items to be used in building the radmenu
			var $menuitems = $m.menu.find("."+$m.opts.itemClass);
			
			// create a div that will be the radmenu & create the HTML for the items
			var $radialMenu = $(container.html)
								.addClass(container.clz)
								.css(container.css)
								.html(buildMenuHTML($menuitems, $m.opts));
				
			// assign a selection event if the user has specified something
			var $menuitems = $radialMenu.find("."+container.itemClz);
			
			if($m.opts.selectEvent!=null)
				$menuitems.bind($m.opts.selectEvent,selectMenuitem);
				
			// append the radmenu items inside the menu 
			$radialMenu.appendTo($m.menu);
			
			if(typeof(fn) == "function") 
				fn($menuitems); // allow passing in a method
				
			else
				$m.opts.onShow($menuitems); // user can do what they want
			
			cancelBubble(evt);
			
		},
		hide: function(evt){ 
			
			var $m = getMenu(evt);
			
			// remove the radmenu that was built and appended inside the menu
			var $menu = $m.menu.find("."+$.radmenu.container.clz);
			
			$m.opts.onHide($menu.find("."+$.radmenu.container.itemClz));
			
			$menu.remove();
			
			cancelBubble(evt);
			
		},
		select: function(evt, selectIndex){
			
			var $m = getMenu(evt);
			
			// with a specific index specified, grab the item
			var $selected = $($m.raditems().get(selectIndex));
			
			// remove the active class on the elements siblings
			$selected.siblings().removeClass($m.opts.activeItemClass);
			
			// add the active class on the selected item
			$selected.addClass($m.opts.activeItemClass);
			
			// pass the selected item to a customizable function
			$m.opts.onSelect($selected);
			
			cancelBubble(evt);
			
		},
		next: function(evt){ // clockwise
			
			var $m = getMenu(evt);
			
			if( !$m.opts.onNext($m) ) return;
			
			// switch the first and last items and then animate
			switchItems($m, $m.raditems().length-1, 0);
			
		},
		prev: function(evt){ // anticlockwise
			
			var $m = getMenu(evt);
			
			if( !$m.opts.onPrev($m) ) return;
			
			// switch the last and first items and then animate
			switchItems($m, 0, $m.raditems().length-1);
			
		},
		shuffle: function(evt){
			
			var $m = getMenu(evt);
			
			var len = $m.raditems().length;
			
			// swap some random item with another random item, and add some shuffling effects
			switchItems($m, rnd(len), rnd(len));
			
		},
		destroy: function(evt){
			
			var $m = getMenu(evt);
			
			$m.menu.data(OPTS, null)
				.data(PREVOPTS, null)
				.removeClass(RADMENU_CLASS)
				.unbind(RADMENU);
			
			return $m.menu;
			
		},
		items: function(evt){
			
			return getMenu(evt).raditems();
			
		},
		scale: function(evt, factor){
			
			var $m = getMenu(evt);
			
			if(factor){
				
				var o = $m.opts;
				
				var container = $.radmenu.container;
				
				var prevOpts = $m.menu.data(PREVOPTS);
				
				if(!prevOpts) $m.menu.data(PREVOPTS, prevOpts=o);
				
				// get the radial menu items
				var $items = $m.menu.find("."+container.itemClz);
				
				var updatedRadiusOpts = updateRadius(o, factor, prevOpts.radius);
				
				$m.menu.data(OPTS, updatedRadiusOpts); // save the radius for anim purposes
				
				$items.each(function(i){ // for each item update the x,y + css
					
					var $this = $(this);
					
					var coords = getCoords(i, $items.length, updatedRadiusOpts);
					
					var animOpts = {
						
						top: coords.top,
						
						left: coords.left
						
					};
					
					if(typeof(o.scaleAnimOpts) == "object") {
						
						animOpts = $.extend({}, o.scaleAnimOpts, animOpts);
						
					}
					
					$this.animate(animOpts, o.scaleAnimSpeed, o.scaleAnimEasing);
					
					$m.opts.onScaleItem($this, factor, coords);
					
				});
				
			}
			
			return $m.menu;
		}
	};
	
	// simply multiples the radius by a factor
	function updateRadius(opts, radius, factor){
		
		return $.extend({},opts,{radius:(factor*radius)});
		
	};
	
	// random int offset 
	function rnd(i){
		
		return parseInt( Math.random() * i );
		
	};
	
	/**
	 * getMenu - this is a method that returns all
	 *	the required objects within a given method
	 *	that is subscribed to the radmenu object.
	 *	
	 * @params
	 * 	evt - the event object
	 * @return
	 * 	Object
	 * 		> menu - jQueryfied menu
	 * 		> opts - the options
	 * 		> raditems - the radial menu items
	 */
	function getMenu(evt){
		
		var $menu = evt.data;
		
		return {
			
			menu: $menu, 
			
			opts: $menu.data(OPTS),
			
			raditems: function(){
				
				// you will want to trigger raditems() if the contents get modified
				return $menu.find("."+$.radmenu.container.itemClz);
				
			}
			
		};
	};
	
	/**
	 * Switch Items -- this method is used in re-evaluating the (x,y) coords
	 * 	as a result of swapping the position of items. The intent with this
	 * 	is that the plugin will reoganize the items (in the container, 
	 *	as opposed to the original dom elements) such that the elements
	 *	positions, when selected, remains fixed around the circle.
	 *	Based on given indexes the items are swapped and then animated. The 
	 *	most typical case involves removing the first and swapping the last
	 *	and vice versa.
	 * 
	 * @params
	 * 	$m - the menu package
	 * 	remove - the index of the menuitem to replace in the swap
	 * 	add - the index of the menuitem to use in the swap (a placeholder)
	 */
	function switchItems($m, remove, add){
		
		if(remove==add) add = remove - 1; // ensure that we don't lose any items
		
		var $remove = $($m.raditems()[remove]); // grab the replacement item
		
		var toAddto = $m.raditems()[add]; // grab the placeholder 
		
		// insertion is dependent on index of items
		if(remove>add) 
			$remove.insertBefore(toAddto);
			
		else
		 	$remove.insertAfter(toAddto);
		
		animateWheel($m, (remove<add)); // posOffset = 5:neat, 10:fireworksesque, 15:subtleish
		
	};
	
	/**
	 * buildMenuHTML - returns string instead of objects
	 * 		for performance 
	 * 
	 * @params
	 * 	$menuitems - the jQueryified menu items
	 * 	opts - the radial menu's options
	 * @return
	 * 	String
	 * 		> each item is wrapped with an 
	 * 			absolute positioned div at an
	 * 			offset determined by it's location
	 * 			on a circle
	 */
	function buildMenuHTML($menuitems, opts){
		
		var ret = [];
		
		$menuitems.each(function(i){ // for each item we will want to build the HTML
			
			var $this = $(this);
			
			var coords = getCoords(i, $menuitems.length, opts); // each item has a position
			
			var rotationHTML = "transform:rotate("+coords.angle+"deg); ";
			
			ret.push("<div class='"+$.radmenu.container.itemClz+"' "); // outer container for the div
			
			// after getting the coordinates, absolute position element at (x,y)
			ret.push("style='");
			ret.push("position:absolute;display:none;");
			ret.push("left:"+coords.left+"px;");
			ret.push("top:"+coords.top+"px;");

			if(opts.rotate) {
				
				for(rot in XForm.opts)
					ret.push(XForm.opts[rot]+rotationHTML);
					
			}
			
			ret.push("'>");
		
			ret.push($this.html()); // append the HTML _within_ the user's defined 'item'
		
			ret.push("</div>");
			
		});
		
		return ret.join("");
		
	};
	
	/**
	 * Get the radians value of an angle given a 
	 * particular slice of the selection
	 * 
	 * 	@params
	 * 		iIdx - the instance index
	 * 		iNum - the number of menu items
	 */
	function getAngleAtIndex(iIdx, iNum){
		
		return 2 * Math.PI * parseFloat(iIdx/iNum); // radians

	};
	
	/**
	 * getCoords - returns coordinates for menuitems, as 
	 * 	well as an animation object with the appropriate rotation
	 *	as per config
	 * 
	 * 	@params
	 * 		iIdx - the instance index (1st, 2nd, 3rd, etc..)
	 * 		iNum - the number of menuitems to distribute
	 * 		oOpts - the options provided by the user customizations
	 * 		bClockwise - a flag for the animation object 
	 * 	@return
	 * 		Object - (x, y) coords & the angle in degrees
	 */
	function getCoords(iIdx, iNum, oOpts, bClockwise){
		
		var radius = oOpts.radius; // user specified radius
		
		var angle = getAngleAtIndex(iIdx, iNum);
		
		angle += toRadians(oOpts.angleOffset); // provide flexibility of angle
		
		//	assuming: hypotenuse (hyp) = radius
		//
		//	opposite	|\	hypotenuse
		//				| \
		//		90deg	|__\	(*theta* - angle)
		//				adjacent
		//
		//	x-axis offset: cos(theta) = adjacent / hypotenuse
		//		==> adjacent = left = cos(theta) * radius
		//	y-axis offset: sin(theta) = opposite / hypotenuse
		//		==> opposite = top = sin(theta) * radius
		
		var l = oOpts.centerX + ( Math.cos( angle ) * radius ), // "left"
			// angle is rounded to 2dp to fix a bug
			t = oOpts.centerY + ( Math.sin( parseInt(angle*100)/100 ) * radius ); // "top"
			
		var degrees = oOpts.rotate ? oOpts.getRotation( angle * 180 / Math.PI, iIdx, iNum ) : 0;

		// NOTE: why not just simply rotate to the angle? buggy
		// the element that gets shifted cycles through an unnecessary revolution 
		// i.e. >360deg -> >0 deg
		var slice = oOpts.rotate ? ( getAngleAtIndex(1, iNum) * 180 / Math.PI ) : 0;

		var rotation = ( bClockwise==true ? "-=" : "+=" ) + slice;
		
		return {
			
			left: l, 
			
			top: t, 
			
			angle: degrees, 
			
			animObj:{
				
				left: l, 
				
				top: t, 
				
				radrotate: rotation
			
			} 
			
		}; // return the x,y coords
		
	};
	
	/**
	 * simple method to convert degrees to radians
	 */
	function toRadians(degrees){
		
		return degrees * Math.PI / 180;
		
	};
	
	/**
	 * animateWheel - performs animation on menu items within 
	 *	the container elements
	 * 
	 * @params
	 * 	$m - object holding menu & options
	 * 	iPosOffset - the position offset for the initial menuitem
	 * 	bClockwise - for the animation, clockwise or counter
	 */
	function animateWheel($m, bClockwise){
		
		// get the menu from the $m menu package
		var $menuitems = $m.raditems();
		
		// get a handle on the number of items
		var len = $menuitems.length;
		
		// for each item, we're going to animate left/top attributes
		$menuitems.each(function(i){
			
			var $this = $(this);
			
			// establish the new coordinates with a customizable offset
			var coords = getCoords(i, len, $m.opts, bClockwise);
			
			// playing with this is fun - this basically just
			// performs the animation with new coordinates 
			
			$this.animate(
				coords.animObj, 
				$m.opts.animSpeed, 
				$m.opts.animEasing, 
				function(){
					if(i==(len-1) ){
						// allow the user to do something after completing an animation
						$m.opts.afterAnimation($m);
					}
				}
			);
		});
	};
	
	/**
	 * Transform Utils
	 */
	var XForm = {};
	
	// local cache of the appropriate transform to use
	XForm.attr = undefined;
	
	// Safari, Chrome, FF 3.5+, IE 9+, and Opera 11+
	XForm.opts = ["","-webkit-","-moz-","-ms-","-o-"];
	XForm.cssattrs = ["","Webkit","Moz","ms","O"];
	
	/**
	 * Get the relevant CSS attr and cache it 
	 */
	XForm.getCSSAttr = function($elm){ 
		
		if( this.attr ) 
			return this.attr;
			
		return this.attr = (function(){
			
			for(var ii=0; ii<XForm.cssattrs.length; ii++){
				
				var opt = XForm.cssattrs[ii]+"Transform";
				
				if( $elm[0].style[opt] )
					return opt;
				
			}
			
			return "transform";
			
		})();
	
	};
	
	/**
	 * Deduce which transform is applicable
	 * and extract the attr's value
	 * 	@params
	 * 	  $elm - jQuerified element which the 
	 * 		css attribute is evaluated against
	 */
	XForm.getTransformValue = function($elm){
		
		return jQuery.style( $elm[0], XForm.getCSSAttr($elm) );
	
	};
	
	/**
	 * jQuery Proxy object
	 */
	var _ = {};

	_.cur = $.fx.prototype.cur;
	
	/**
	 * jQuery Proxy Method: 
	 * 	We need to override this method in order for the "rotate([x]deg)" 
	 * 	css value to be parsed and passed through to the step fn numerically 
	 * 
	 * Credit due: Zachary Johnson www.zachstronaut.com 
	 * 		from https://github.com/zachstronaut/jquery-animate-css-rotate-scale
	 */
    $.fx.prototype.cur = function() {
	
        if ( this.prop == "radrotate" ) {
	
			var $elm = $(this.elem);
	
			var style = XForm.getTransformValue($elm) || 'none';
			
	        if (style) {
		
                var m = style.match(/rotate\(([^)]+)\)/);

                if (m && m[1])	{
	
					return parseFloat( m[1] );
					
				}

            }

            return 0;

        }

        return _.cur.apply(this, arguments);

    };	

	//
	// use a custom animation property - radrotate
	//
	$.fx.step.radrotate = function(fx) {
			
		var $elm = $(fx.elem);
		
        $elm.css(XForm.getCSSAttr($elm), "rotate("+ fx.now +"deg)");
		
    };
	
})(jQuery);