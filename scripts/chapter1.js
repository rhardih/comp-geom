window.d3 = require('d3');
require('./d3_plugins.js');

document.addEventListener("DOMContentLoaded", function(event) {
  var when = require('./util/when.js');

  var determinantExample = require('./examples/chapter1/determinant.js');
  var slowConvexHullExample = require('./examples/chapter1/slow-convex-hull.js');
  var convexHullExample = require('./examples/chapter1/convex-hull.js');
  var convexHullBenchmarkExample = require('./examples/chapter1/benchmark.js');
  var extraExample = require('./examples/chapter1/extra.js');

  var examples = [
    { id: "slow-convex-hull-ex", callback: slowConvexHullExample },
    { id: "determinant-ex", callback: determinantExample },
    { id: "convex-hull-ex", callback: convexHullExample },
    { id: "benchmark-ex", callback: convexHullBenchmarkExample },
    { id: "extra-ex", callback: extraExample },
  ];

  examples.forEach(function(example) {
    example.callback(document.querySelector('#' + example.id));
    //when(example.id).scrolls_into_view(example.callback);
  });
});
