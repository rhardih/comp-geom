var Immutable = require('immutable');

var CompGeom = require('../lib/comp-geom.js');

//------------------------------------------------------------------------------

var LoggingSlowConvexHull = function(selection) {
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

    var orderedPairs = CompGeom.Util.Set.cartesianProduct(P, P).
      map(function(pair) {
        return { p: pair[0], q: pair[1] };
      }).
      filter(function(pair) {
        // p not equal to q
        return pair.p.x != pair.q.x && pair.p.y != pair.q.y;
      });

    var liesLeft = function(r, p, q) {
      var d = CompGeom.Util.Matrix.determinant([
        [1, r.x, r.y],
        [1, p.x, p.y],
        [1, q.x, q.y]
      ]);

      return d < 0;
    }

    //--------------------------------------------------------------------------

    var E, p, q, valid, r, L;

    E = [];
    updateState({ E: Immutable.List() });

    orderedPairs.forEach(function(pair) {
      p = pair.p;
      q = pair.q;

      valid = true;
      updateState({ p: p, q: q, valid: true, r: null });

      P.filter(function(r) {
        var equal_p = r.x == p.x && r.y == p.y;
        var equal_q = r.x == q.x && r.y == q.y;
        return !(equal_p || equal_q)
      })
      .forEach(function(r) {
        updateState({ r: r });

        if (liesLeft(r, pair.p, pair.q)) {
          valid = false;
          updateState({ valid: false });
        }
      })

      if(valid) {
        E.push([pair.p, pair.q])
        updateState({
          E: currentState().get('E').push(Immutable.List([pair.p, pair.q]))
        });
      }
    });

    var L = [];
    updateState({ L: Immutable.List() });

    var clockwiseOrderedVertices = function(edges) {
      var e1 = edges.splice(0, 1)[0];
      var origin = e1[0];
      var destination = e1[1];;
      var i, index, e;

      L.push(origin, destination); 
      updateState({
        L: currentState().get('L').push(Immutable.Map(origin))
      });
      updateState({
        L: currentState().get('L').push(Immutable.Map(destination))
      });

      do {
        for (i = 0; i < edges.length; i++) {
          e = edges[i];
          origin = e[0];

          if (origin.x == destination.x && origin.y == destination.y) {
            destination = e[1];
            index = i;
            break;
          }
        }

        e = edges.splice(index, 1);

        if (destination.x != L[0].x && destination.y != L[0].y) {
          L.push(destination);
          updateState({
            L: currentState().get('L').push(Immutable.Map(destination))
          });
        }
      } while (edges.length > 0);

      L.forEach(function(d) {
        d.convex = true;
      });

      return L;
    }

    clockwiseOrderedVertices(E);

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

module.exports = LoggingSlowConvexHull;
