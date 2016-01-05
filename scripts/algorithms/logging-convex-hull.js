var Immutable = require('immutable');

var CompGeom = require('../lib/comp-geom.js');

//------------------------------------------------------------------------------

var LoggingConvexHull = function(selection) {
  var P = selection.data();
  var log;

  var currentState = function() {
    return log[log.length - 1];
  }

  var updateState = function(state) {
    var newState = currentState().merge(state);

    if (!currentState().equals(newState)) {
      log.push(newState);
    }
  }

  var my = function() {
    my.reset();

    var rightTurn = function(points) {
      var p = points[0];
      var q = points[1];
      var r = points[2];
      var d = CompGeom.Util.Matrix.determinant([
        [1, p.x, p.y],
        [1, q.x, q.y],
        [1, r.x, r.y]
      ]);

      // This condition is inverted to follow the direction of the y-axis
      return d > 0;
    }

    var lexSort = function(P) {
      P.sort(function(p, q) {
        if (p.x < q.x) {
          return -1;
        }

        if (p.x > q.x) {
          return 1;
        }

        if (p.y < q.y) {
          return -1;
        }

        if (p.y > q.y) {
          return 1;
        }

        return 0;
      });
    }

    //--------------------------------------------------------------------------

    var p_1, p_2, L_upper, i, n, p_i;
    var p_n, p_n1, L_lower, L;

    // L1
    lexSort(P);
    n = P.length;
    updateState({ p1pn: Immutable.fromJS(P), n: n });

    // L2
    p_1 = P[0];
    p_2 = P[1];
    L_upper = [p_1, p_2];

    updateState({
      L_upper: Immutable.fromJS(L_upper)
    });

    // L3
    for(i = 3 - 1; i < n; i++) {
      updateState({ i: i + 1 });
      // L4
      p_i = P[i];
      updateState({ p_i: p_i });

      L_upper.push(p_i);
      updateState({
        L_upper: Immutable.fromJS(L_upper)
      });

      var notRightTurn = function(points) {
        var _notRightTurnPoints = points.slice(-3);
        var _notRightTurn = !rightTurn(_notRightTurnPoints);
        updateState({
          notRightTurn: _notRightTurn,
          notRightTurnPoints: _notRightTurnPoints
        });
        return _notRightTurn;
      }
      // L5
      while(L_upper.length > 2 && notRightTurn(L_upper)) {
        L_upper.splice(-2, 1)
        updateState({
          L_upper: Immutable.fromJS(L_upper)
        });
      }
    }

    // L7
    p_n = P.slice(-1)[0];
    p_n1 = P.slice(-2, -1)[0];
    L_lower = [p_n, p_n1];

    updateState({
      L_lower: Immutable.fromJS(L_lower)
    });

    // L8
    for (i = n - 2 - 1; i >= 1 - 1; i--) {
      updateState({ i: i + 1 });

      // L9
      p_i = P[i];
      updateState({ p_i: p_i });

      L_lower.push(p_i);
      updateState({
        L_lower: Immutable.fromJS(L_lower)
      });


      // L10
      while(L_lower.length > 2 && notRightTurn(L_lower)) {
        // L11
        L_lower.splice(-2, 1);
        updateState({
          L_lower: Immutable.fromJS(L_lower)
        });
      }
    }

    // L12
    L_lower.shift();
    L_lower.pop();
    updateState({
      L_lower: Immutable.fromJS(L_lower)
    });

    // L13
    L = L_upper.concat(L_lower);

    updateState({
      L: Immutable.fromJS(L)
    });


    return my;
  }

  my.log = function(index) {
    if (index !== undefined) {
      return log[index].toJS();
    }

    return log.map(function(v) { return v.toJS() });
  }

  my.reset = function() {
    log = [Immutable.OrderedMap()];
  }

  return my;
}

module.exports = LoggingConvexHull;
