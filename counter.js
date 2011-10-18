function counter() {

	var that = htmlCanvas.widget();

	var count = 0;
	var h1;

	that.renderOn = function(html) {
		h1 = html.h1(count.toString());
		html.button()
			.render('+')
			.click(function() {increase()});
		html.button()
			.render('-')
			.click(function() {decrease()});
	};


	function increase() {
		count += 1;
		refresh();
	};

	function decrease() {
		count -= 1;
		refresh();
	};

	function refresh() {
		h1.asJQuery().html(count.toString());
	};

	return that;
}


/* Add a counter to the page  */

jQuery(document).ready(function() {
	counter().appendTo('body');
	counter().appendTo('body');
})
