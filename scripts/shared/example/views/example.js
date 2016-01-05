var View = require('ampersand-view');

//------------------------------------------------------------------------------

var ExampleView = View.extend({
  autoRender: true,

  template: require('../templates/example.hbs')
});

module.exports = ExampleView;
