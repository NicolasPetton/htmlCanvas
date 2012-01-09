/*
 * Copyright 2011 Nicolas Petton <nico@objectfusion.fr>
 * This file is released under MIT.
 * See the LICENSE file for more infos.
 *
 * A simple HTML Canvas library similar to Amber Smalltalk
 *
 */

var htmlCanvas = (function() {
	
	/* The HTML Canvas object. */
	var htmlCanvas = function(aJQuery) {
		var that = {};
		var tags = ('a abbr acronym address area article aside audio b bdi bdo big ' +
    		'blockquote body br button canvas caption cite code col colgroup command ' +
    		'datalist dd del details dfn div dl dt em embed fieldset figcaption figure ' +
    		'footer form frame frameset h1 h2 h3 h4 h5 h6 hr head header hgroup html i ' +
    		'iframe img input ins kbd keygen label legend li link map mark meta meter ' +
    		'nav noscript object ol optgroup option output p param pre progress q rp rt' +
    		'ruby samp script section select small source span strong style sub summary' +
    		'sup table tbody td textarea tfoot th thead time title tr track tt ul var' +
    		'video wbr').split(' ')
		that.root = tagBrush({canvas: that, jQuery: aJQuery});


		/* Public API */
		that.tag = function(tag, children) {
			var t = tagBrush({canvas: that, tag: tag, children: children});
			that.root.addBrush(t);
			return t;
		};

		for(var i=0; i < tags.length; i++) {
			that[tags[i]] = (function(t) {
				return function() {
					var args = Array.prototype.slice.call(arguments);
					return that.tag(t, args);
				}
			})(tags[i]);
		};

		that.render = function(obj) {
			that.root.render(obj);
		};

		return that;
	};


	/* A tag brush object represents a DOM element */
	var tagBrush = function(spec) {

		var that       = {};
		var canvas     = spec.canvas;
		var attributes = 'href for id media rel src style title type'.split(' ');
		var events     = ('blur focus focusin focusout load resize scroll unload ' +
                  		'click dblclick mousedown mouseup mousemove mouseover ' +
                  		'mouseout mouseenter mouseleave change select submit ' +
                  		'keydown keypress keyup error').split(' ');
		var element;
	

		/* DOM elements creation */

		function createElement(string) {
			return document.createElement(string);
		};

		function createTextNode(string) {
			return document.createTextNode(string);
		};


		/* Appending objects to the brush */

		function append(object) {
			if(typeof object === "string") {
				appendString(object);
			} else if(typeof object === "function") {
				appendFunction(object);
			} else {
				object.appendToBrush(that);
			}
		};

		function appendBrush(aTagBrush) {
			appendChild(aTagBrush.element());
		};

		function appendString(string) {
			appendChild(createTextNode(string));
		};	

		function appendFunction(fn) {
			var root = canvas.root;
			canvas.root = that;
			fn(canvas);
			canvas.root = root;
		};

		function appendChild(obj) {
			if (element.canHaveChildren !== false) {
				element.appendChild(obj);
 			} else {
 				element.text = element.text +  obj.innerHTML;
 			}
		};


		/* Public API */

		that.element = function() {
			return element;
		};

		that.render = function() {
			var args = Array.prototype.slice.call(arguments);
			for(var i=0; i < args.length; i++) {
				append(args[i]);
			};
			return that;
		};

		that.appendToBrush = function(aTagBrush) {
			aTagBrush.addBrush(that);
		}

		that.addBrush = appendBrush;

		// Events are delegated to jQuery
		that.on = function(event, callback) {
			that.asJQuery().bind(event, callback);
			return that;
		};

		for(var i=0; i < events.length; i++) {
			that[events[i]] = (function(e) {
				return function(callback) {
					that.on(e, callback);
					return that;
				};
			})(events[i]);
		};

		for(var i=0; i < attributes.length; i++) {
			that[attributes[i]] = (function(att) {
				return function(value) {
					that.setAttribute(att, value);
					return that;
				};
			})(attributes[i]);
		};


		that.setAttribute = function(key, value) {
			element.setAttribute(key, value);
			return that;
		};

		that.addClass = function(string) {
			that.asJQuery().addClass(string);
			return that;
		};

		that.removeClass = function(string) {
			that.asJQuery().removeClass(string);
			return that;
		};

		that.contents = function(obj) {
			that.asJQuery().empty().
			append(obj);
			return that;
		};

		that.asJQuery = function() {
			return jQuery(that.element());
		};


		/* TagBrush initialization */


		if(spec.jQuery) {
			element = spec.jQuery.get(0);
		} else {
			element = createElement(spec.tag);
		};


		if(spec.children) {
			for(var i=0; i < spec.children.length; i++) {
				append(spec.children[i]);
			}
		};


		return that;
	};

	
	/* A Widget uses an HTML canvas to render itself using renderOn() */

	var widget = function() {
		var that = {};
		
		that.appendTo = function(aJQuery) {
			var jquery;
			if(typeof aJQuery === 'string') {
				jquery = jQuery(aJQuery);
			} else {
				jquery = aJQuery;
			}
			that.renderOn(htmlCanvas(jquery));
		};

		that.appendToBrush = function(aTagBrush) {
			that.appendTo(aTagBrush.asJQuery());
		};

		/* Concrete widgets should override this function.
		 * The html parameter represent a htmlCanvas object.
		 */
		that.renderOn = function(html) {};

		return that;
	};

	return {
		tagBrush:   tagBrush, 
		htmlCanvas: htmlCanvas,
		widget:     widget
	}
})()
