var View = require('ampersand-view');

//------------------------------------------------------------------------------

var StageView = View.extend({
  template: "<svg></svg>",

  render: function() {
    if (!this.rendered) {
      View.prototype.render.apply(this, arguments);

      var adjustHeight = function() {
        this.width = this.el.getBoundingClientRect().width;
        this.height = this.width * 3 / 4;

        this.el.setAttribute("height", this.height);
      }

      var boundAdjustHeight = adjustHeight.bind(this);

      window.addEventListener('resize', boundAdjustHeight);

      boundAdjustHeight();

      this.adjusted = true;
    }
  }
});

module.exports = StageView;
