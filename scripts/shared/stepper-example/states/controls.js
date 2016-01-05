var State = require('ampersand-state');

var Slider = State.extend({
  props: {
    min: ['number', true, 0],
    max: ['number', true, 0],
    value: ['number', true, 0],
    disabled: ['boolean', true, true]
  }
});

//-----------------------------------------------------------------------------

var Controls = State.extend({
  children: {
    slider: Slider
  }
});

module.exports = Controls;
