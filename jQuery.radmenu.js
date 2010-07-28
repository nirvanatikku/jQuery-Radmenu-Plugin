/*!
 * jQuery Radmenu (Radial Menu) Plugin
 * version: 0.9.4 (27-JULY-2010)
 * @requires v1.3.2 or later
 * 
 * Documentation:
 * 		http://www.tikku.com/jquery-radmenu-plugin
 *
 * Copyright 2010, Nirvana Tikku (ntikku@gmail.com)
 * 
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html 
 */

;(function($){
	
	// radmenu namespace
	var OPTS = "options",
		RADMENU = ".radmenu"; // events are radmenu.{event} - guarantee no NS collision
		
	// private :: defaults
	var defaults = {
		listClass: "list",
		itemClass: "item",
		activeItemClass: "active",
		selectEvent: null, // click, mouseenter etc
		onSelect: function($selected){},
		radius: 10, // in pixels
		angleOffset: 0, // in radians
		centerX: 0,
		centerY: 0,
		animSpeed: 500,
		afterAnimation: function($m){},
		onShow: function($items){$items.show();},
		onHide: function($items){$items.hide();}
	};
	
	// DEFAULTS
	$.radmenu = {
		container: {
			clz: "radial_div",
			itemClz: "radial_div_item",
			html: "<div></div>",
			css: { "position": "relative" }
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
				return input=="items" ?
					$this.triggerHandler(input+RADMENU) :
					$this.trigger(input+RADMENU, param||null);
			else if(type=="number"){
				return $this.trigger("select"+RADMENU,input);
			}
		} catch (e){ return "error : "+e; }
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
			var $list = $this.find("."+o.listClass);
			$list.find("."+o.itemClass).hide(); // ensure its hidden
			// set the options within the data for the elem & bind evts
			$this.data(OPTS, o);
			for(event in MENU) $this.bind(event+RADMENU, $this, MENU[event]);
		});
	};

	/**
	 * selectMenuitem
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
		if(!isInNested)$this.parents("."+container.clz).radmenu(index);
		else $this.radmenu(index);
		cancelBubble(evt);
	};
	
	/**
	 * cancel event bubbling - x-browser friendly
	 * @param
	 * 	evt - the event object
	 */
	function cancelBubble(evt){
		if(!$.support.opacity) window.event.cancelBubble = true;
		else evt.stopPropagation();
	};
	
	/**
	 * All the MENU events to be bound to the radial menu
	 */
	var MENU = {
		show: function(evt){ // fn = user input onshow
			var $m = getMenu(evt);
			var container = $.radmenu.container;
			// clear any existing radial menus within the menu
			$m.menu.find("."+container.clz).remove();
			// grab the desired menu items to be used in building the radmenu
			var $menuitems = $m.menu.find("."+$m.opts.itemClass);
			// create a div that will be the radmenu & create the HTML for the items
			var $radialMenu = $(container.html)
				.addClass(container.clz).css(container.css)
				.html(buildMenuHTML($menuitems, $m.opts));
			// assign a selection event if the user has specified something
			var $menuitems = $radialMenu.find("."+container.itemClz);
			if($m.opts.selectEvent!=null)
				$menuitems.bind($m.opts.selectEvent,selectMenuitem);
			// append the radmenu items inside the menu 
			$radialMenu.appendTo($m.menu);
			if(typeof(fn) == "function") fn($menuitems);
			else $m.opts.onShow($menuitems); // user can do what they want
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
			// switch the first and last items and then animate
			switchItems($m, $m.raditems().length-1, 0, 1);
		},
		prev: function(evt){ // anticlockwise
			var $m = getMenu(evt);
			// switch the last and first items and then animate
			switchItems($m, 0, $m.raditems().length-1, 1);
		},
		shuffle: function(evt,rndOffset){
			var $m = getMenu(evt);
			var len = $m.raditems().length;
			// swap some random item with another random item, and add some shuffling effects
			switchItems($m, rnd(len), rnd(len), rnd(rndOffset||15));
		},
		destroy: function(evt){
			var $m = getMenu(evt);
			$m.menu.data(OPTS, null).unbind(RADMENU);
			return $m.menu;
		},
		items: function(evt){return getMenu(evt).raditems();}
	};
	
	// random int offset 
	function rnd(i){return parseInt(Math.random()*i);};
	
	/**
	 * getMenu 
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
	 * switchItems
	 * @params
	 * 	$m - the menu package
	 * 	remove - the index of the menuitem to replace in the swap
	 * 	add - the index of the menuitem to use in the swap (a placeholder)
	 */
	function switchItems($m, remove, add, posOffset){
		if(remove==add) add = remove - 1; // ensure that we don't lose any items
		var $remove = $($m.raditems()[remove]); // grab the replacement item
		var toAddto = $m.raditems()[add]; // grab the placeholder 
		// insertion is dependent on index of items
		if(remove>add) $remove.insertBefore(toAddto);
		else $remove.insertAfter(toAddto);
		animateWheel($m,posOffset); // posOffset = 5:neat, 10:fireworksesque, 15:subtleish
	};
	
	/**
	 * buildMenuHTML - returns string instead of objects
	 * 		for performance 
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
		var ret = "";
		$menuitems.each(function(i){ // for each item we will want to build the HTML
			var $this = $(this);
			var coords = getCoords(i+1, $menuitems.length, opts); // each item has a position
			ret += "<div class='"+$.radmenu.container.itemClz+"' "; // outer container for the div
			// after getting the coordinates, absolute position element at (x,y)
			ret += "style='position:absolute;left:"+coords.x+"px;top:"+coords.y+"px;display:none;'>";
			ret += $this.html(); // append the HTML _within_ the user's defined 'item'
			ret += "</div>";
		});
		return ret;
	};
	
	/**
	 * getCoords - returns coordinates for menuitems
	 * 	@params
	 * 		idx - the instance index (1st, 2nd, 3rd, etc..)
	 * 		num - the number of menuitems to spread
	 * 		opts - the options provided by the user customizations
	 * 	@return
	 * 		Object - (x, y) coords
	 */
	function getCoords(idx, num, opts){
		var radius = opts.radius; // user specified radius
		var angleOffset = opts.angleOffset; // provide flexibility of angle
		var angle = 2 * Math.PI * (parseFloat(idx/num)); // radians
		//	assuming: hypotenuse (hyp) = radius
		//
		//	opposite	|\	hypotenuse
		//			| \
		//		90deg	|__\	(*theta* - angle)
		//			adjacent
		//
		//	x-axis offset: cos(theta) = adjacent / hypotenuse
		//		==> adjacent = left = cos(theta) * radius
		//	y-axis offset: sin(theta) = opposite / hypotenuse
		//		==> opposite = top = sin(theta) * radius
		var l = opts.centerX + (Math.cos(angle + angleOffset) * radius), // "left"
			t = opts.centerY + (Math.sin(angle + angleOffset) * radius); // "top"
		return {x: l, y: t}; // return the x,y coords
	};
	
	/**
	 * animateWheel - performs animation
	 * @params
	 * 	$m - object holding menu & options
	 * 	posOffset - the position offset for the initial menuitem
	 */
	function animateWheel($m, posOffset){
		// get the menu from the $m menu package
		var $menuitems = $m.menu.find("."+$.radmenu.container.itemClz);
		// get a handle on the number of items
		var len = $menuitems.length;
		// for each item, we're going to animate left/top attributes
		$menuitems.each(function(i){
			var $this = $(this);
			// establish the new coordinates with a customizable offset
			var coords = getCoords(i+posOffset, len, $m.opts);
			// playing with this is fun - this basically just
			// performs the animation with new coordinates 
			$this.animate({
				left: coords.x, top: coords.y
			}, $m.opts.animSpeed, i==(len-1)?function(){
				// allow the user to do something after completing an animation
				$m.opts.afterAnimation($m);
			}:undefined);
		});
	};
	
})(jQuery);