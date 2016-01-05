var View = require('ampersand-view');
var State = require('ampersand-state');

var StageView = require('../../shared/stage/views/stage.js');
var ExampleView = require('../../shared/example/views/example.js'); 

//------------------------------------------------------------------------------

var Vertex = State.extend({
  props: {
    x: 'number',
    y: 'number',
    name: 'string'
  },
  
  derived: {
    xRounded: {
      deps: ['x'],
      fn: function() {
        return Math.round(this.x);
      }
    },

    yRounded: {
      deps: ['y'],
      fn: function() {
        return Math.round(this.y);
      }
    }
  }
});

var Determinant = State.extend({
  props: {
    p: 'state',
    q: 'state'
  },

  derived: {
    result: {
      deps: ['p.x', 'p.y', 'q.x', 'q.y'],
      fn: function() {
        return this.p.xRounded * this.q.yRounded -
          this.p.yRounded * this.q.xRounded;
      }
    },
    linesData: {
      deps: ['p.x', 'p.y', 'q.x', 'q.y'],
      fn: function() {
        return [
          { x1: 0, y1: 0, x2: this.p.x, y2: this.p.y },
          { x1: this.p.x, y1: this.p.y, x2: this.q.x, y2: this.q.y }
        ];
      }
    },
    verticesData: {
      deps: ['p', 'q'],
      fn: function() {
        return [this.p, this.q];
      }
    },
    negative: {
      deps: ['result'],
      fn: function() {
        return this.result < 0;
      }
    }
  }
}); 

var CalcTableView = View.extend({
  template: require('./determinant/templates/calc-table.hbs'),
    
  bindings: {
    'model.p.xRounded': {
      type: 'text',
      hook: 'p.x'
    },
    'model.p.yRounded': {
      type: 'text',
      hook: 'p.y'
    },
    'model.q.xRounded': {
      type: 'text',
      hook: 'q.x'
    },
    'model.q.yRounded': {
      type: 'text',
      hook: 'q.y'
    },
		'model.result': {
			type: 'text',
			hook: 'result'
		},
		'model.negative': {
			type: 'booleanClass',
			hook: 'result'
		}
  }
});

var LinearAxesView = View.extend({
  template: "<g class='axes'></g>",

  initialize: function(options) {
    this.xMin = options.xMin || 0;
    this.yMin = options.yMin || 0;
    this.xMax = options.xMax || 20;
    this.yMax = options.yMax || 20;
    this.padding = options.padding || 30;

    this.width = this.parent.width;
    this.height = this.parent.height;

    this.xScale = d3.scale.linear().domain([this.xMin, this.xMax]).
      range([this.padding, this.width - this.padding]);        

    this.yScale = d3.scale.linear().domain([this.yMin, this.yMax]).
      range([this.height - this.padding, this.padding]);
  },

  render: function() {
    if (!this.rendered) {
      View.prototype.render.apply(this, arguments);
      
      var d3el = d3.select(this.el);
      var translateX = "0," + (this.height - this.padding);
      var translateY = this.padding + ",0";

      d3el.append("g").
        attr("class","x axis").
        attr("transform","translate(" + translateX + ")").
        call(d3.svg.axis().scale(this.xScale));

      d3el.append("g").
        attr("class","y axis").
        attr("transform","translate(" + translateY + ")").
        call(d3.svg.axis().scale(this.yScale).orient("left"));
    }
  }
});

var DeterminantView = StageView.extend({
  template: "<svg><g data-hook='axes'></g></svg>",

  subviews: {
    'axes': {
      hook: 'axes',
      waitFor: 'stageRender',
      prepareView: function(el) {
        return new LinearAxesView({
          el: el, parent: this,
          xMin: 0, xMax: 20,
          yMin: 0, yMax: 20
        });
      }
    }
  },

  render: function() {
    var xScale, yScale, xAxis, yAxis;
    var svg;
    var linesGroup, lineGroups;
    var verticesGroup, VertexGroup;
    var vertexLabels, vertex;
    var drag;
    var that = this;

    var update = function() {
      vertexGroup.attr('transform', function(d) {
        var x = xScale(d.x);
        var y = yScale(d.y);

        return 'translate(' + x + ',' + y + ')';
      });

      vertexLabels.text(function(d) {
        return "(" + Math.round(d.x) + ", " + Math.round(d.y) + ")"; 
      });

      lineGroups.data(that.model.linesData).attr({
        x1: function(d) { return xScale(d.x1); },
        y1: function(d) { return yScale(d.y1); },
        x2: function(d) { return xScale(d.x2); },
        y2: function(d) { return yScale(d.y2); }
      });
    }

    var vertexDragStart = function(d){
      d3.select(this).classed('drag', true)
      d3.event.sourceEvent.stopPropagation();
    }

    var vertexDrag = function(d){
      d.x = xScale.invert(d3.event.x);
      d.y = yScale.invert(d3.event.y);

      update();
    }

    var vertexDragEnd = function(d) {
      d3.select(this).classed('drag', false)
    }

    if (!this.rendered) {
      StageView.prototype.render.apply(this, arguments);

      this.stageRender = true;
      this.trigger('change');

      svg = d3.select(this.el);

      xScale = this.axes.xScale;
      yScale = this.axes.yScale;

      linesGroup = svg.append('g').attr({ class: 'lines' });
      verticesGroup = svg.append('g').attr({ class: 'vertices' });

      lineGroups = linesGroup.selectAll("g").
        data(this.model.linesData).
        enter().
        append("line").
        attr({ class: 'vector' });

      vertex = d3.vertex().
        label(function(d) { return d.name; }).
        draggable(true);

      vertexGroup = verticesGroup.selectAll('g.vertex').
        data(this.model.verticesData).
        call(vertex);

      vertexLabels = vertexGroup.append('text').attr({
        "text-anchor": "middle",
        dx: "-3em",
        dy: "-1em",
        class: "outside"
      })

      drag = d3.behavior.drag().
        on("dragstart", vertexDragStart).
        on("drag", vertexDrag).
        on("dragend", vertexDragEnd);

      vertexGroup.call(drag).data(this.model.verticesData);

      update();
    }
  }
});

var DeterminantExample = function(container) {
  var DeterminantExampleView = ExampleView.extend({
    subviews: {
      'stage': {
        hook: 'stage',
        prepareView: function(el) {
          return new DeterminantView({ el: el, model: this.model });
        }
      },
      'calcTable': {
        hook: 'meta',
        prepareView: function(el) {
          return new CalcTableView({ el: el, model: this.model });
        }
      }
    }
 });

  //----------------------------------------------------------------------------

  var determinant = new Determinant({
    p: new Vertex({ x: 8, y: 6, name: 'p' }),
    q: new Vertex({ x: 13, y: 15, name: 'q' })
  });


  var exampleView = new DeterminantExampleView({
    model: determinant,
    el: container
  });


  exampleView.el.setAttribute('id', 'determinant');
}

module.exports = DeterminantExample;
