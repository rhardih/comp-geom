var View = require('ampersand-view');

var ExampleView = require('../../example/views/example.js');

var ControlsView = require('./controls.js');
var Controls = require('../states/controls.js');

//-----------------------------------------------------------------------------

var StepperExampleView = ExampleView.extend({
  subviews: {
    controls: {
      hook: 'stage',
      prepareView: function(el) {
        return new ControlsView({ el: el, model: this.model.controls });
      }
    }
  }
});

module.exports = StepperExampleView;
