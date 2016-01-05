var State = require('ampersand-state');

var Controls = require('./controls.js');

//-----------------------------------------------------------------------------

var StepperExample = State.extend({
  props: {
    steps: 'number',
    step: 'number'
  },

  children: {
    controls: Controls
  },

  initialize: function() {
    var that = this;

    this.on('change:steps', function(model, value) {
      model.controls.slider.max = value;
      model.controls.slider.value = value;
      model.controls.slider.disabled = false;
    });

    this.on('change:step', function(model, value) {
      model.controls.slider.value = value;
    });

    this.on('change:controls.slider.value', function(model, value) {
      that.step = value;
    });
  }
});

module.exports = StepperExample;
