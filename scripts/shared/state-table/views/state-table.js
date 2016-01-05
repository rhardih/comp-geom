var View = require('ampersand-view');

//------------------------------------------------------------------------------

var RowsView = View.extend({
  bindings: {
    'model.rows': {
      type: function() {
        this.render();
      }
    }
  },

  render: function() {
    var getKey = function(d) { return d && d.key; };
    var extractRowData = function(d) { return d && d.value; }
    var ident = function(d) { return d; };
    var klass = function(d) {
      return (typeof(d.class) === "function" ? d.class(d) : d.class);
    }

    var tbody = d3.select(this.el);
    var rows = tbody.selectAll('tr').data(this.model.rows);

    // Row update selection
    // Update cells in existing rows.
    var cells = rows.selectAll('td').data(extractRowData);

    // Cells enter selection
    cells.enter().append('td');
    cells.html(ident);

    // Cells exit selection
    cells.exit().remove();

    // Row enter selection
    // Add new rows
    var cells_in_new_rows = rows.enter().append('tr').
      selectAll('td').data(extractRowData);

    // Row enter + update selection
    rows.attr('class', klass);

    cells_in_new_rows.enter().append('td');
    cells_in_new_rows.html(ident);

    // Row exit selection
    // Remove old rows
    rows.exit().remove();
  }
});

var StateTableView = View.extend({
  template: require('../templates/state-table.hbs'), 

  subviews: {
    rows: {
      selector: 'tbody',
      waitFor: 'model.rows',
      prepareView: function(el) {
        return new RowsView({ el: el, model: this.model });
      }
    }
  }
});

module.exports = StateTableView;
