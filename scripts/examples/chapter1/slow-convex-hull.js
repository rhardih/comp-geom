var View = require('ampersand-view');
var State = require('ampersand-state');

var _ = require('lodash');

var CompGeom = require('../../lib/comp-geom.js');
var HTMLEntities = require('../../lib/html-entities.js');

var StepperExample = require('../../shared/stepper-example/states/stepper-example.js');
var StateTable = require('../../shared/state-table/states/state-table.js');

var StepperExampleView = require('../../shared/stepper-example/views/stepper-example.js');
var StateTableView = require('../../shared/state-table/views/state-table.js');
var StageView = require('../../shared/stage/views/stage.js');

var LoggingSlowConvexHull = require('../../algorithms/logging-slow-convex-hull.js');

//------------------------------------------------------------------------------

var Stage = State.extend({
  props: {
    state: ['object', true, function() { return {}; }],
    lastState: ['object', true, function() { return {}; }],
    vertexCount: ['number', true, 10],
    verticesData: 'array'
  },

  derived: {
    finalState: {
      deps: ['state', 'lastState'],
      fn: function() {
        return this.state.L && this.state.L.length === this.lastState.L.length;
      }
    },
    convexHullPathData: {
      deps: ['state'],
      fn: function() {
        return this.state.L ? [this.state.L] : [];
      }
    },
    linesData: {
      deps: ['state'],
      fn: function() {
        var p = this.state.p;
        var q = this.state.q;
        var r = this.state.r;
        var L = this.state.L;
        var valid = this.state.valid;
        var linesData = [];

        if (!L) {
          if (p && q) {
            linesData.push({
              x1: p.x, y1: p.y,
              x2: q.x, y2: q.y,
              valid: valid
            });

            if (r) {
              linesData.push({
                x1: q.x, y1: q.y,
                x2: r.x, y2: r.y,
                valid: valid
              });
            }
          }
        }

        return linesData;
      }
    }
  }
});

var SlowConvexHull = StepperExample.extend({
  children: {
    stage: Stage,
    stateTable: StateTable
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
    'model.state': {
      type: function() {
        this.render();
      }
    }
  },

  vertex: d3.vertex().
    label(function(d) { return d.id; }).
    title(function(d) { return d.title; }).
    selectable(true),

  render: function() {
    this.vertices = d3.select(this.el).selectAll('g.vertex').
      data(this.model.verticesData);

    this.vertices.call(this.vertex);

    var p = this.model.state.p;
    var q = this.model.state.q;
    var r = this.model.state.r;
    var L = this.model.state.L;

    //--------------------------------------------------------------------------

    this.vertices.classed('p-color q-color r-color convex', false);

    if (L) {
      this.vertices.classed('convex', function(d) {
        return L.some(function(l) {
          return l.x === d.x && l.y === d.y;
        });
      });
    } else {
      if (p && q) {
        this.vertices.classed({
          'p-color': function(d) { return d.x === p.x && d.y === p.y; },
          'q-color': function(d) { return d.x === q.x && d.y === q.y; },
          'r-color': function(d) {
            if (r) { return d.x === r.x && d.y === r.y; }
          }
        });
      }
    }
  }
})

var LinesView = View.extend({
  template: "<g class='lines'></g>",

  bindings: {
    'model.linesData': {
      type: function() {
        this.render();
      }
    }
  },

  linesAttr: {
    x1: function(d) { return d.x1; },
    y1: function(d) { return d.y1; },
    x2: function(d) { return d.x2; },
    y2: function(d) { return d.y2; }
  },

  render: function() {
    var lines = d3.select(this.el).selectAll('line').data(this.model.linesData);
    lines.enter().append('line');
    lines.attr(this.linesAttr).classed({
      'valid': function(d) { return d.valid; },
      'invalid': function(d) { return !d.valid; }
    });
    lines.exit().remove();
  }
});

var ConvexHullView = View.extend({
  template: "<g class='convex-hull'></g>",

  bindings: {
    'model.convexHullPathData': {
      type: function() {
        this.render();
      }
    },
    'model.finalState': {
      type: function() {
        if (this.model.finalState) {
          this.lineFunction.interpolate("linear-closed");
        } else {
          this.lineFunction.interpolate("linear");
        }
      }
    }
  },

  lineFunction: d3.svg.line().
    x(function(d) { return d.x; }).
    y(function(d) { return d.y; }),

  render: function() {
    var dAttr = function(d) { return this.lineFunction(d); };

    var path = d3.select(this.el).selectAll('path').
      data(this.model.convexHullPathData);
    path.enter().append('path').attr('class', 'convex-hull');
    path.attr('d', dAttr.bind(this));
    path.exit().remove();
  }
});

var SlowConvexHullView = StageView.extend({
  template: "<svg><g class='lines'></g><g class='convex-hull'></g><g class='vertices'></g></svg>",

  subviews: {
    'convexHull': {
      selector: '.convex-hull',
      waitFor: 'model.convexHullPathData',
      prepareView: function(el) {
        return new ConvexHullView({ el: el, model: this.model });
      }
    },
    'lines': {
      selector: '.lines',
      waitFor: 'model.linesData',
      prepareView: function(el) {
        return new LinesView({ el: el, model: this.model });
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

var SlowConvexHullExample = function(container) {
  var SlowConvexHullExampleView = StepperExampleView.extend({
    subviews: _.extend({}, StepperExampleView.prototype.subviews, {
      'stage': {
        hook: 'stage',
        prepareView: function(el) {
          return new SlowConvexHullView({ el: el, model: this.model.stage });
        }
      },
      'stateTable': {
        hook: 'meta',
        prepareView: function(el) {
          return new StateTableView({ el: el, model: this.model.stateTable });
        }
      }
    })
  });

  //----------------------------------------------------------------------------

  var updateStateTable = function(index) {
    var state = loggingSlowConvexHull.log(index);

    var identityPrinter = function(v) { return v; };

    var vertexPrinter = function(v) {
      return '<span title="' + v.title + '">' + v.id + '</span>';
    };

    var verticesPrinter = function(v) {
      return '[' + v.map(function(v, k) {
        return vertexPrinter(v);
      }).join(', ') + ']';
    }

    var edgesPrinter = function(v) {
      return '[' + v.map(function(v) {
        return '(' + v.map(function(v) {
          return vertexPrinter(v);
        }).join(', ') + ')';
      }).join(', ') + ']';
    }

    var printers = {
      E: edgesPrinter,
      p: vertexPrinter,
      q: vertexPrinter,
      valid: identityPrinter,
      r: vertexPrinter,
      L: verticesPrinter
    }

    var classes = {
      E: undefined,
      p: 'p-color',
      q: 'q-color',
      valid: function(d) {
        return d.value[1].valueOf() ? 'valid' : 'invalid';
      },
      r: 'r-color',
      L: 'convex-hull',
    }

    var data = [];

    for (var k in state) {
      var value = state[k];
      var printer = printers[k];
      var klass = classes[k];

      var printed = value === null ? '' : printer(value);

      data.push({ class: klass, value: [k, printed, undefined] });
    }

    slowConvexHull.stateTable.rows = data;
  }

  var updateStage = function(index) {
    var history = loggingSlowConvexHull.log();
    var state = history[index];
    var lastState = history.slice(-1)[0];

    slowConvexHull.stage.set({ state: state, lastState: lastState });
  }

  var slowConvexHull = new SlowConvexHull();
  var loggingSlowConvexHull;

  var slowConvexHullExampleView = new SlowConvexHullExampleView({
    el: container,
    model: slowConvexHull
  });

  var randomVerticesData = function() {
    return CompGeom.Util.Point.
      random(
        slowConvexHullExampleView.stage.width,
        slowConvexHullExampleView.stage.height,
        30,
        slowConvexHull.stage.vertexCount
      ).
        map(function(p, i) {
        return {
          x: p.x,
          y: p.y,
          id: HTMLEntities.greek[i].value,
          title: HTMLEntities.greek[i].name
        }
      });
  }

  //----------------------------------------------------------------------------

  slowConvexHullExampleView.el.setAttribute('id', 'slow-convex-hull');

  slowConvexHullExampleView.controls.on('reload', function() {
    slowConvexHullExampleView.stage.vertices.
      vertices.classed('selected', false);

    slowConvexHull.stage.verticesData = randomVerticesData();

    if (!loggingSlowConvexHull) { return; }

    loggingSlowConvexHull.reset();

    updateStage(0);
    updateStateTable(0);
  });

  slowConvexHull.on('change:step', function(model, value) {
    updateStage(value);
    updateStateTable(value);
  });

  slowConvexHullExampleView.stage.drag.on('dragend', function() {
    var selection = slowConvexHullExampleView.stage.selector.selected();

    if (selection.size() > 1) {
      loggingSlowConvexHull = LoggingSlowConvexHull(selection);
      loggingSlowConvexHull.call();

      slowConvexHull.set({ steps: loggingSlowConvexHull.log().length - 1});
    }
  });

  slowConvexHull.stage.verticesData = randomVerticesData();
}

module.exports = SlowConvexHullExample;
