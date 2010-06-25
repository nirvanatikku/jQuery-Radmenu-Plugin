/*!
 * jQuery Radmenu (Radial Menu) v0.9
 * http://www.tikku.com/jquery-radmenu-plugin
 *
 * Copyright 2010, Nirvana Tikku (ntikku@gmail.com)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 *
 * Date: 24 June, 2010
 */

(function($){
	
	// private :: constants
	var SELECT = "select",
		NEXT = "next",
		PREV = "prev",
		SHOW = "show",
		HIDE = "hide",
		SHUFFLE = "shuffle",
		OPTS = "options";
		
	var RADIAL_DIV_CLASS = "radial_div",
		RADIAL_DIV_ITEM_CLASS = "radial_div_item",
		RADIAL_DIV_HTML = "<div class='" + RADIAL_DIV_CLASS + "'></div>",
		RADIAL_DIV_CSS = { "position": "relative" };
	
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
		afterAnimation: function($m){}
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
	$.fn.radmenu = function(input, extra){
		try {
			var $this = $(this);
			var type = typeof(input);
			if(arguments.length==0 || type=="object") 
				return init($this, input);
			else if(type=="string")
				return $this.trigger(input, extra);
			else if(type=="number")
				return $this.trigger(SELECT,input);
		} catch (e){ return "error"; }
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
			$this.data(OPTS, o)
				.bind(SHOW, $this, MENU.show)
				.bind(HIDE, $this, MENU.hide)
				.bind(SELECT, $this, MENU.select)
				.bind(NEXT, $this, MENU.next)
				.bind(PREV, $this, MENU.prev)
				.bind(SHUFFLE, $this, MENU.shuffle);
		});
	};
	
	/**
	 * selectMenuitem
	 * @param 
	 * 	evt - the event object
	 * triggers select event on radmenu container
	 */
	function selectMenuitem(evt){ 
		var $this = $(this);
		var $element = $(evt.target);
		var index = $element.index();
		$this.parents("."+RADIAL_DIV_CLASS)
				.radmenu(index);
	}
	/**
	 * All the MENU events to be bound to the radial menu
	 */
	var MENU = {
		show: function(evt){
			var $m = getMenu(evt);
			$m.menu.find("."+RADIAL_DIV_CLASS).remove(); // clear
			var $menuitems = $m.menu.find("."+$m.opts.itemClass);
			var $radialMenu = $(RADIAL_DIV_HTML).css(RADIAL_DIV_CSS)
				.html(buildMenuHTML($menuitems, $m.opts));
			if($m.opts.selectEvent!=null)
				$radialMenu.find("."+RADIAL_DIV_ITEM_CLASS)
					.bind($m.opts.selectEvent,selectMenuitem);
			$radialMenu.appendTo($m.menu); // create container
		},
		hide: function(evt){ 
			var $m = getMenu(evt);
			$m.menu.find("."+RADIAL_DIV_CLASS).remove(); 
		},
		select: function(evt, selectIndex){
			var $m = getMenu(evt);
			var $selected = $($m.raditems().get(selectIndex));
			$selected.siblings().removeClass($m.opts.activeItemClass);
			$selected.addClass($m.opts.activeItemClass);
			$m.opts.onSelect($selected);
		},
		next: function(evt){ // clockwise
			var $m = getMenu(evt);
			switchItems($m, $m.raditems().length-1, 0, 1);
		},
		prev: function(evt){ // anticlockwise
			var $m = getMenu(evt);
			switchItems($m, 0, $m.raditems().length-2, 1);
		},
		shuffle: function(evt){
			var $m = getMenu(evt);
			switchItems($m, 0, 1, parseInt(Math.random()*15));
		}
	};
	
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
				return $menu.find("."+RADIAL_DIV_ITEM_CLASS);
			}
		};
	};
	
	/**
	 * switchItems
	 * @params
	 * 	$m - the menu package
	 * 	remove - the expression for the menuitem to remove
	 * 	add - the expression for the menuitem to add
	 */
	function switchItems($m, remove, add, posOffset){
		var $remove = $($m.raditems()[remove]),
			_$remove = $remove.clone();
		$remove.remove();
		var toAddto = $m.raditems()[add];
		if(remove>add) _$remove.insertBefore(toAddto).show();
		else _$remove.insertAfter(toAddto).show();
		animateWheel($m,posOffset); // 5:neat, 10:fireworksesque, 15:subtleish
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
		$menuitems.each(function(i){
			var $this = $(this);
			var coords = getCoords(i+1, $menuitems.length, opts);
			ret += "<div class='"+RADIAL_DIV_ITEM_CLASS+"' ";
			ret += "style='position:absolute;left:"+coords.x+"px;top:"+coords.y+"px;'>";
			ret += $this.html();
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
		var radius = opts.radius;
		var angleOffset = opts.angleOffset;
		var angle = 2 * Math.PI * (parseFloat(idx/num));
		var l = opts.centerX + (Math.cos(angle + angleOffset) * radius),
			t = opts.centerY + (Math.sin(angle + angleOffset) * radius);
		return {x: l, y: t};
	};
	
	/**
	 * animateWheel - performs animation
	 * @params
	 * 	$m - object holding menu & options
	 * 	posOffset - the position offset for the initial menuitem
	 */
	function animateWheel($m, posOffset){
		var $menuitems = $m.menu.find("."+RADIAL_DIV_ITEM_CLASS);
		var len = $menuitems.length;
		$menuitems.each(function(i){
			var $this = $(this);
			var coords = getCoords(i+posOffset, len, $m.opts);
			$this.animate({
				left: coords.x, top: coords.y
			}, $m.opts.animSpeed);
		});
		$m.opts.afterAnimation($m);
	};
	
})(jQuery);
