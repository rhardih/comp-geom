var State = require('ampersand-state');
var View = require('ampersand-view');

//-----------------------------------------------------------------------------

var Button = State.extend({
  props: {
    slider: 'state'
  }
});

var PreviousButton = Button.extend({
  derived: {
    disabled: {
      deps: ['slider.min', 'slider.value'],
      fn: function() {
        return this.slider.min === this.slider.value;
      }
    }
  }
});

var NextButton = Button.extend({
  derived: {
    disabled: {
      deps: ['slider.max', 'slider.value'],
      fn: function() {
        return this.slider.max === this.slider.value;
      }
    }
  }
});

//-----------------------------------------------------------------------------

var StepsView = View.extend({
  template: function() { return this.el.outerHTML },

  bindings: {
    'model.max': '[data-hook=max]',
    'model.value': '[data-hook=value]'
  }
});

var ReloadButtonView = View.extend({
  // explicit template only needed because this is a subview
  template: function() { return this.el.outerHTML },

  events: {
    click: function() {
      this.model.clear();
    }
  }
})

var StepButtonView = View.extend({
  bindings: {
    'model.disabled': {
      type: 'booleanAttribute'
    }
  }
});

var PreviousButtonView = StepButtonView.extend({
  template: "<button class='pure-button'>&larr;</button>",

  events: {
    click: function() { this.model.slider.value--; }
  }
})

var NextButtonView = StepButtonView.extend({
  template: "<button class='pure-button'>&rarr;</button>",

  events: {
    click: function() { this.model.slider.value++; }
  }
});

var SliderView = View.extend({
  template: function() {
    return this.el.outerHTML;
  },

  events: {
    'input': 'onInput'
  },

  bindings: {
    'model.value': {
      type: 'attribute',
      name: 'value'
    },

    'model.value': {
      type: 'value'
    },

    'model.disabled': {
      type: 'booleanAttribute'
    },

    'model.max': {
      type: 'attribute',
      name: 'max'
    }
  },

  onInput: function() {
    this.model.value = parseInt(this.el.value, 10);
  }
});

var ControlsView = View.extend({
  template: require('../templates/controls.hbs'), 

  events: {
    'click [data-hook="reload"]': function() {
      this.trigger('reload');
    }
  },

  subviews: {
    steps: {
      hook: 'steps',
      prepareView: function(el) {
        return new StepsView({ el: el, model: this.model.slider });
      }
    },

    reload: {
      hook: 'reload',
      prepareView: function(el) {
        return new ReloadButtonView({ el: el, model: this.model.slider });
      }
    },

    previous: {
      hook: 'previous',
      prepareView: function(el) {
        return new PreviousButtonView({
          el: el,
          model: new PreviousButton({ slider: this.model.slider  })
        });
      }
    },

    next: {
      hook: 'next',
      prepareView: function(el) {
        return new NextButtonView({
          el: el,
          model: new NextButton({ slider: this.model.slider  })
        });
      }
    },

    slider: {
      hook: 'slider',
      waitFor: 'model.slider',
      prepareView: function(el) {
        return new SliderView({ el: el, model: this.model.slider });
      }
    }
  }
});

module.exports = ControlsView;
