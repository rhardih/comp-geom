var Svg = {
	// Output: object representing the bounding box of a
	// child element of the svg
	elementBbox: function(svg, child) {
		svg_bound = svg.node().getBoundingClientRect();
		child_bound = child.node().getBoundingClientRect();

		return {
			x1: child_bound.left - svg_bound.left,
			y1: child_bound.top - svg_bound.top,
			x2: child_bound.left + child_bound.width - svg_bound.left,
			y2: child_bound.top + child_bound.height - svg_bound.top
		}
	}
};
