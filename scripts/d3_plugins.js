var d3 = require('d3');

/**
 * vertex - a draggable node with a label and a radius.
 */
d3.vertex = function() {
  var label = "";
  var title = "";
  var radius = 12;
  var draggable = false;
  var selectable = false;
  var _drag_behavior = d3.behavior.drag();

  function my(selection) {
    var groupAttr = {
      transform: function(d) {
        return 'translate(' + d.x + ',' + d.y + ')';
      }
    }

    // Update
    selection.attr(groupAttr);

    // Enter
    var groups = selection.
      enter().
      append('g').
      classed('vertex', true);

    var circleAttr = {
      r: function(d) {
        var _radius = (typeof(radius) === "function" ? radius(d) : radius);
        return _radius;
      }
    }

    var circle = groups.append('circle').attr(circleAttr);

    groups.
      append('text').
      html(function(d) {
      return (typeof(label) === "function" ? label(d) : label);
    }).
      attr({
      'text-anchor': 'middle',
      dy: '.35em'
    });

    groups.
      append('title').
      html(function(d) {
      return (typeof(title) === "function" ? title(d) : title);
    });

    selection.classed('selectable', function(d) {
      return (typeof(selectable) === "function" ? selectable(d) : selectable);
    });

    function dragstart(d) {
      d3.select(this).
        classed('drag', true);

      d3.event.sourceEvent.stopPropagation();
    }

    function drag(d){
      d.x = d3.event.x;
      d.y = d3.event.y;

      selection.attr(groupAttr);
    }

    function dragend(d) {
      d3.select(this).
        classed('drag', false);
    }

    var db = _drag_behavior.
      origin(function(d) { return d; }).
      on("dragstart.vertex", dragstart).
      on("drag.vertex", drag).
      on("dragend.vertex", dragend);

    var draggableVertices = selection.filter(function(d, i) {
      return (typeof(draggable) === "function" ? draggable(d) : draggable);
    });

    draggableVertices.classed('draggable', true);
    draggableVertices.call(db);

    selection.exit().remove();
  }

  my.label = function(value) {
    if (!arguments.length) return label;

    label = value;

    return my;
  }

  my.title = function(value) {
    if (!arguments.length) return title;

    title = value;

    return my;
  }

  my.draggable = function(value) {
    if (!arguments.length) return draggable;

    draggable = value;

    return my;
  }

  my.radius = function(value) {
    if (!arguments.length) return radius;

    radius = value;

    return my;
  }

  my.selectable = function(value) {
    if (!arguments.length) return selectable;

    selectable = value;

    return my;
  }

  my.drag_behavior = function(value) {
    if (!arguments.length) return _drag_behavior;

    _drag_behavior = value;

    return my;
  }

  return my;
}

/**
 * selectionBox - a rectangular dragging selection.
 *
 * Draggable tool for selecting nodes.
 *
 * Only nodes with class .selectable are included in a selection. While a node
 * is inside a selection, it gets class .selected.
 *
 * Methods
 *
 * radius - get/set the corner radius of the selection rectangle. Default is 5.
 * drag_behavior - get/set an d3.behavior.drag() to be used by the
 *                 selectionBox. Use if it's necessary to attach another
 *                 dragging behavior on the same selection, since only one can
 *                 attached at a time.
 * selected - returns a d3-selection of currently selected nodes.
 */
d3.selectionBox = function() {
  var _svg;
  var _radius = 5;
  var _rect; 
  var _drag_behavior = d3.behavior.drag();

  var bboxIntersect = function(a, b) {
    var separated =
      a.top > b.bottom ||
      a.right < b.left ||
      a.bottom < b.top ||
      a.left > b.right;

    return !separated;
  }

  var bbox = function() {
    return _rect.node().getBoundingClientRect();
  }

  var inside = function(d) {
    return bboxIntersect(bbox(), this.getBoundingClientRect());
  }

  function my(svg) {
    _svg = svg;
    var _radius =  (typeof(_radius) === "function" ? _radius() : _radius)

    var sb_attr = {
      rx: _radius, ry: _radius,
      x: 0, y: 0,
      width: 0, height: 0,
      class: "selection"
    }

    // selection box
    _rect = svg.append("rect").
      attr(sb_attr).
      style("visibility", "hidden");

    function dragstart(d) {
      d3.select(this).classed('selection', true);

      _rect.style('visibility', 'visible');

      var p = d3.mouse(this);
      d.x = p[0];
      d.y = p[1];

      sb_attr.transform = "translate(" + d.x + "," + d.y + ")";
      sb_attr.width = 0;
      sb_attr.height = 0;

      _rect.attr(sb_attr);

      _svg.selectAll('.selectable').classed('selected', false);
    }

    function drag(d) {
      var width = d3.event.x;
      var height = d3.event.y;
      var scale = { x: 1, y: 1 }

      if (width < 0) {
        width *= -1;
        scale.x = -1;
      }

      if (height < 0) {
        height *= -1;
        scale.y = -1;
      }

      sb_attr.transform = "translate(" + d.x + "," + d.y + ")" +
        "scale(" + scale.x + " " + scale.y + ")"
      sb_attr.width = width;
      sb_attr.height = height;

      _rect.attr(sb_attr);

      _svg.selectAll('.selectable').classed('selected', inside);
    }

    function dragend(d) {
      d3.select(this).classed('selection', false);

      _rect.style("visibility", "hidden");

      d.x = d.y = 0;
    }

    _drag_behavior.
      origin(function(d) { return d; }).
      on("dragstart.sb", dragstart).
      on("drag.sb", drag).
      on("dragend.sb", dragend);

    svg.call(_drag_behavior).data([{ x: 0, y: 0 }]);
  }

  my.radius = function(value) {
    if (!arguments.length) return radius;

    _radius = value;

    return my;
  };

  my.drag_behavior = function(value) {
    if (!arguments.length) return drag_behavior;

    _drag_behavior = value;

    return my;
  }

  my.selected = function() {
    return _svg.selectAll('.selectable').filter(inside);
  }

  return my;
}
