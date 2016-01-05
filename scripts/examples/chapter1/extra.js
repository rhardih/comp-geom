var View = require('ampersand-view');
var State = require('ampersand-state');

var CompGeom = require('../../lib/comp-geom.js');
var HTMLEntities = require('../../lib/html-entities.js');

var ExampleView = require('../../shared/example/views/example.js');
var StageView = require('../../shared/stage/views/stage.js');

//------------------------------------------------------------------------------

var Stage = State.extend({
  props: {
    verticesData: 'array',
    convexHullPathData: 'array'
  }
});

var VerticesView = View.extend({
  template: "<g class='vertices'></g>",

  bindings: {
    'model.verticesData': {
      type: function() {
        this.render();
      }
    },
    'model.convexHullPathData': {
      type: function() {
        this.render();
      }
    }
  },

  vertex: d3.vertex().
    label(function(d) { return d.id; }).
    title(function(d) { return d.title; }).
    radius(5).
    selectable(true).
    draggable(true),

  render: function() {
    var that = this;

    if (!this.rendered) {
      this.vertices = d3.select(this.el).selectAll('g.vertex').
        data(this.model.verticesData);

      this.vertices.call(this.vertex);

      this.vertex.drag_behavior().on('drag', function(d) {
        that.trigger('drag');
      });
    }

    if (this.model.convexHullPathData) {
      this.vertices.classed('convex', function(d) {
        return that.model.convexHullPathData[0].some(function(c) {
          return c.x === d.x && c.y === d.y;
        });
      });
    }
  }
})

var ConvexHullPathView = View.extend({
  template: "<g class='convex-hull'></g>",

  bindings: {
    'model.convexHullPathData': {
      type: function() {
        this.render();
      }
    }
  },

  lineFunction: d3.svg.line().
    x(function(d) { return d.x; }).
    y(function(d) { return d.y; }).
    interpolate("linear-closed"),

  render: function() {
    var dAttr = function(d) { return this.lineFunction(d); };

    var path = d3.select(this.el).selectAll('path').
      data(this.model.convexHullPathData);
    path.enter().append('path').attr('class', 'convex-hull');
    path.attr('d', dAttr.bind(this));
    path.exit().remove();
  }
});

var ExtraStageView = StageView.extend({
  template: "<svg><g class='convex-hull'></g><g class='vertices'></g></svg>",

  subviews: {
    'extra': {
      selector: '.convex-hull',
      waitFor: 'model.convexHullPathData',
      prepareView: function(el) {
        return new ConvexHullPathView({ el: el, model: this.model });
      }
    },
    'vertices': {
      selector: '.vertices',
      waitFor: 'model.verticesData',
      prepareView: function(el) {
        return new VerticesView({ el: el, model: this.model });
      }
    }
  },

  render: function() {
    if (!this.rendered) {
      StageView.prototype.render.apply(this, arguments);

      var svg = d3.select(this.el);

      this.drag = d3.behavior.drag();
      this.selector = d3.selectionBox().drag_behavior(this.drag);

      svg.call(this.drag);
      svg.call(this.selector);
    }
  }
});

//------------------------------------------------------------------------------

var ExtraExample = function(container) {
  var ExtraExampleView = View.extend({
    autoRender: true,

    template: "<div id='extra' class='pure-g'>\
      <div class='pure-u-1'>\
         <div data-hook='stage'></div>\
      </div>\
    </div>",

    subviews: {
      'stage': {
        hook: 'stage',
        prepareView: function(el) {
          return new ExtraStageView({ el: el, model: this.model });
        }
      }
    },

  });

  //----------------------------------------------------------------------------

  var stage = new Stage();

  var extraExampleView = new ExtraExampleView({
    el: container,
    model: stage
  });

  var randomVerticesData = function() {
    return CompGeom.Util.Point.random(
      extraExampleView.stage.width,
      extraExampleView.stage.height,
      30,
      100
    ).map(function(p, i) {
      return {
        x: p.x,
        y: p.y
      }
    });
  }

  //----------------------------------------------------------------------------

  extraExampleView.stage.drag.on('dragend', function() {
    var selection = extraExampleView.stage.selector.selected();
    var convexHullData;

    var updateConvexHull = function() {
      if (selection.size() > 1) {
        convexHullData = CompGeom.ConvexHull(selection.data());
        stage.set({ convexHullPathData: [convexHullData] });
      }
    }

    extraExampleView.stage.vertices.on('drag', function(d) {
      updateConvexHull();

      extraExampleView.stage.extra.render();
    });


    updateConvexHull();
  });

  stage.verticesData = randomVerticesData();
}

module.exports = ExtraExample;
