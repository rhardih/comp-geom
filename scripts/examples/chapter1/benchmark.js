var View = require('ampersand-view');
var State = require('ampersand-state');

var Benchmark = require('benchmark');
// Benchmark needs to be defined on window
window.Benchmark = Benchmark;

var nv = require('nvd3');

var ExampleView = require('../../shared/example/views/example.js');
var StageView = require('../../shared/stage/views/stage.js');
var CompGeom = require('../../lib/comp-geom.js');

//------------------------------------------------------------------------------

var ConvexHullBenchmark = State.extend({
  props: {
    iterations: ['number', false, 5],
    log: ['string', true, ''],
    logHeight: ['number', true, 300],
    slowConvexHullChart: {
      type: 'object',
      default: function() {
        return { values: [], key: 'SlowConvexHull', color: '#ff7f0e' };
      }
    },
    convexHullChart: {
      type: 'object',
      default: function() {
        return { values: [], key: 'ConvexHull', color: '#7777ff' };
      }
    },
  },

  start: function() {
    var that = this;
    var suite = new Benchmark.Suite;
    var testData = [], i, testDatum, size;

    for (i = 1; i <= this.iterations; i++) {
      size = i * 10;
      testDatum = {
        points: CompGeom.Util.Point.random(1000, 1000, 0, size),
        size: size
      }

      testData.push(testDatum);
    }

    testData.forEach(function(d) {
      suite.add('SlowConvexHull (' + d.size + ')', function() {
        CompGeom.SlowConvexHull(d.points);
      }, { size: d.size, maxTime: 0.1 });

      suite.add('ConvexHull (' + d.size + ')', function() {
        CompGeom.ConvexHull(d.points);
      }, { size: d.size, maxTime: 0.1 });
    });

    suite.on('cycle', function(event) {
      var res = event.target.options.results;
      var size = event.target.options.size;

      if (!!event.target.name.match(/^Slow/)) {
        that.slowConvexHullChart.values.push({ x: size, y: event.target.hz });
      } else {
        that.convexHullChart.values.push({ x: size, y: event.target.hz });
      }

      that.trigger('change:chartData');

      that.set('log', that.get('log') + '<p>' + String(event.target) + '</p>');
    }).on('complete', function() {
      that.set('log', that.get('log') + '<p><em>Done!</em></p>');
    });

    suite.run({ 'async': true });
  }
});

var ChartView = StageView.extend({
  chart: nv.models.lineChart().
    margin({ left: 80, top: 10 }).
    useInteractiveGuideline(true).
    showLegend(true).
    showYAxis(true).
    showXAxis(true).
    yScale(d3.scale.log()),

  render: function () {
    var that = this;

    if (!this.rendered) {
      StageView.prototype.render.apply(this, arguments);

      this.model.logHeight = this.el.clientHeight;

      var objects = [
        this.model.slowConvexHullChart,
        this.model.convexHullChart
      ];

      var chartSelection = d3.select(this.el).datum(objects);

      chartSelection.call(this.chart);

      this.chart.xAxis.axisLabel('Input size').
        tickFormat(d3.format(',r'));
      this.chart.yAxis.axisLabel('Operations / Second').
        tickFormat(d3.format('.0f'));
      this.chart.yAxis.tickValues([1,10,100,1000,10000,1000000]);

      nv.utils.windowResize(function() { that.chart.update() });

      this.model.on('change:chartData', this.chart.update)
    }
  }
});

var ConvexHullBenchmarkStageView = View.extend({
  template: require('./benchmark/templates/benchmark-stage.hbs'),

  events: {
    "click #bm-start": function() {
      this.model.start();
    }
  },

  subviews: {
    'stage': {
      hook: 'stage',
      prepareView: function(el) {
        return new ChartView({ el: el, model: this.model });
      }
    }
  }
});

var MetaView = View.extend({
  template: '<div><code data-hook="log"></code></div>',

  bindings: {
    'model.log': [
      {
        type: 'innerHTML',
        hook: 'log'
      },
      {
        type: function(el) {
          el.scrollTop = el.scrollHeight;
        },
        hook: 'log'
      }
    ],
    'model.logHeight': {
      type: function(el, model) {
        el.style.height = model + "px";
      },
      hook: 'log'
    }
  }
});

//------------------------------------------------------------------------------

var ConvexHullBenchmarkExample = function(container) {
  var ConvexHullBenchmarkView = ExampleView.extend({
    subviews: {
      'stage': {
        hook: 'stage',
        prepareView: function(el) {
          return new ConvexHullBenchmarkStageView({ el: el, model: this.model });
        }
      },
      'stateTable': {
        hook: 'meta',
        prepareView: function(el) {
          return new MetaView({ el: el, model: this.model });
        }
      }
    }
  });

  //----------------------------------------------------------------------------

  var convexHullBenchmark = new ConvexHullBenchmark();

  var convexHullBenchmarkExampleView = new ConvexHullBenchmarkView({
    el: container,
    model: convexHullBenchmark
  });

};

module.exports = ConvexHullBenchmarkExample;
