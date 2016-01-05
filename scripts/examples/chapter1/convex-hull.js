var View = require('ampersand-view');
var State = require('ampersand-state');

var CompGeom = require('../../lib/comp-geom.js');
var HTMLEntities = require('../../lib/html-entities.js');

var StepperExample = require('../../shared/stepper-example/states/stepper-example.js');
var StateTable = require('../../shared/state-table/states/state-table.js');

var StepperExampleView = require('../../shared/stepper-example/views/stepper-example.js');
var StateTableView = require('../../shared/state-table/views/state-table.js');
var StageView = require('../../shared/stage/views/stage.js');

var LoggingConvexHull = require('../../algorithms/logging-convex-hull.js');

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
        var linesData = [];

        if (this.state.notRightTurnPoints && !this.state.L) {
          var p = this.state.notRightTurnPoints[0];
          var q = this.state.notRightTurnPoints[1];
          var r = this.state.notRightTurnPoints[2];
          var valid = this.state.notRightTurn;

          linesData.push({
            x1: p.x, y1: p.y,
            x2: q.x, y2: q.y,
            valid: valid
          }, {
            x1: q.x, y1: q.y,
            x2: r.x, y2: r.y,
            valid: valid
          });
        }

        return linesData;
      }
    }
  }
});

var ConvexHull = StepperExample.extend({
  children: {
    stage: Stage,
    stateTable: StateTable,
    testsTable: StateTable
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

    var p = this.model.state.p_i;
    var L = this.model.state.L;

    //--------------------------------------------------------------------------

    this.vertices.classed('p-color convex', false);

    if (L) {
      this.vertices.classed('convex', function(d) {
        return L.some(function(l) {
          return l.x === d.x && l.y === d.y;
        });
      });
    } else {
      this.vertices.classed({
        'p-color': function(d) {
          if (p) {
            return d.x === p.x && d.y === p.y;
          }
        }
      });
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

  classed: {
    'valid': function(d) { return d.valid; },
    'invalid': function(d) { return !d.valid; }
  },

  render: function() {
    var lines = d3.select(this.el).selectAll('line').data(this.model.linesData);

    lines.enter().append('line');
    lines.attr(this.linesAttr).classed(this.classed);
    lines.exit().remove();
  }
});

var ConvexHullPathView = View.extend({
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

var ConvexHullView = StageView.extend({
  template: "<svg><g class='lines'></g><g class='convex-hull'></g>\
    <g class='vertices'></g></svg>",

  subviews: {
    'convexHull': {
      selector: '.convex-hull',
      waitFor: 'model.convexHullPathData',
      prepareView: function(el) {
        return new ConvexHullPathView({ el: el, model: this.model });
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

var SubTestView = StateTableView.extend({
  template: require('./convex-hull/templates/not-right-turn-table.hbs')
});

var MetaView = View.extend({
  template: '<div><div data-hook="state-table"></div>\
    <div data-hook="sub"></div></div>',

  subviews: {
    stateTable: {
      hook: 'state-table',
      prepareView: function(el) {
        return new StateTableView({ el: el, model: this.model.stateTable });
      }
    },
    subTest: {
      hook: 'sub',
      prepareView: function(el) {
        return new SubTestView({ el: el, model: this.model.testsTable });
      }
    }
  }
});

//------------------------------------------------------------------------------

var ConvexHullExample = function(container) {
  var ConvexHullExampleView = StepperExampleView.extend({
    subviews: _.extend({}, StepperExampleView.prototype.subviews, {
      'stage': {
        hook: 'stage',
        prepareView: function(el) {
          return new ConvexHullView({ el: el, model: this.model.stage });
        }
      },
      'stateTable': {
        hook: 'meta',
        prepareView: function(el) {
          return new MetaView({ el: el, model: this.model });
        }
      }
    })
  });

  //----------------------------------------------------------------------------

  var updateStateTable = function(index) {
    var state = loggingConvexHull.log(index);

    var identityPrinter = function(v) { return v; };

    var vertexPrinter = function(v) {
      return '<span title="' + v.title + '">' + v.id + '</span>';
    };

    var verticesPrinter = function(v) {
      return '[' + v.map(function(v, k) {
        return vertexPrinter(v);
      }).join(', ') + ']';
    }

    var nonBreakingVerticesPrinter = function(v) {
      return '[' + v.map(function(v, k) {
        return vertexPrinter(v);
      }).join(',&nbsp;') + ']';
    }

    var printers = {
      p1pn: verticesPrinter,
      L_upper: verticesPrinter,
      i: identityPrinter,
      n: identityPrinter,
      p_i: vertexPrinter,
      L_lower: verticesPrinter,
      L: verticesPrinter,
      notRightTurn: identityPrinter,
      notRightTurnPoints: nonBreakingVerticesPrinter
    }

    var classes = {
      p1pn: undefined,
      L_upper: undefined,
      i: undefined,
      n: undefined,
      p_i: 'p-color',
      L_lower: undefined,
      L: 'convex-hull',
      notRightTurn: function(d) {
        return d.value[1].valueOf() ? 'valid' : 'invalid';
      },
      notRightTurnPoints: undefined
    }

    var idConverters = {
      p1pn: function(k) { return 'p<sub>1</sub>,&hellip;,p<sub>n</sub>'; },
      L_upper: function(k) { return 'L<sub>upper</sub>'; },
      i: identityPrinter,
      n: identityPrinter,
      p_i: function(k) { return 'p<sub>i</sub>'; },
      L_lower: function(k) { return 'L<sub>lower</sub>'; },
      L: identityPrinter,
      notRightTurn: function() { return 'Do not make a right turn?'; },
      notRightTurnPoints: identityPrinter
    }

    var testsKeys = ['notRightTurn', 'notRightTurnPoints'];

    var statesData = [];
    var testsData = [];

    for (var k in state) {
      var value = state[k];
      var printer = printers[k];
      var klass = classes[k];
      var converter = idConverters[k];

      var printed = value === null ? '' : printer(value);
      var converted = value === null ? '' : converter(k);

      if (testsKeys.indexOf(k) === 0) {
        if (!state.L) {
          var points = printers['notRightTurnPoints'](state.notRightTurnPoints);
          testsData.push({ class: klass, value: [points, printed, undefined] });
        }
      } else if (testsKeys.indexOf(k) === 1) {
      } else {
        statesData.push({ class: klass, value: [converted, printed, undefined] });
      }
    }

    convexHull.stateTable.rows = statesData;
    convexHull.testsTable.rows = testsData;
  }

  var updateStage = function(index) {
    var history = loggingConvexHull.log();
    var state = history[index];
    var lastState = history.slice(-1)[0];

    convexHull.stage.set({ state: state, lastState: lastState });
  }

  var convexHull = new ConvexHull();
  var loggingConvexHull;

  var convexHullExampleView = new ConvexHullExampleView({
    el: container,
    model: convexHull
  });

  var randomVerticesData = function() {
    return CompGeom.Util.Point.
      random(
        convexHullExampleView.stage.width,
        convexHullExampleView.stage.height,
        30,
        convexHull.stage.vertexCount
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

  convexHullExampleView.el.setAttribute('id', 'convex-hull');

  convexHullExampleView.controls.on('reload', function() {
    convexHullExampleView.stage.vertices.
      vertices.classed('selected', false);

    convexHull.stage.verticesData = randomVerticesData();
  });

  convexHull.on('change:step', function(model, value) {
    updateStage(value);
    updateStateTable(value);
  });

  convexHullExampleView.stage.drag.on('dragend', function() {
    var selection = convexHullExampleView.stage.selector.selected();

    if (selection.size() > 1) {
      loggingConvexHull = LoggingConvexHull(selection);
      loggingConvexHull.call();

      convexHull.set({ steps: loggingConvexHull.log().length - 1});
    }
  });

  convexHull.stage.verticesData = randomVerticesData();
}

module.exports = ConvexHullExample;
