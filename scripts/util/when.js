var WhenHandler = function(id) {
  this.elm = document.querySelector("#" + id);
  this.scrolled_into_view = false;
  this.scroll_callback;

  this.doc = document.documentElement;
  this.doc_bounds = this.doc.getBoundingClientRect();
  this.elm_bounds = this.elm.getBoundingClientRect();
}

WhenHandler.prototype.scrolls_into_view = function(callback) {
  this.scroll_callback = callback;

  return this;
}

WhenHandler.prototype.onscroll = function(e) {
  if (this.scrolled_into_view) {
    return;
  }

  var bottom = (window.pageYOffset || this.doc.scrollTop)  -
    (this.doc.clientTop || 0) + this.doc.clientHeight;

  if ((this.elm_bounds.bottom + this.elm_bounds.height) < bottom) {
    this.scrolled_into_view = true;
    this.scroll_callback(this.elm);
  }
}

module.exports = function(id) {
  var handlers = {};

  window.onscroll = function(e) {
    for (id in handlers) {
      handlers[id].onscroll(e);
    }
  }

  return function(id) {
    if(!handlers.hasOwnProperty(id)){
      handlers[id] = new WhenHandler(id);
    }

    return handlers[id];
  }
}();
