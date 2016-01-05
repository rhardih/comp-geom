/**
 * CompGeom module
 *
 * This module contains the algorithms and datastructures introduced in the
 * book Computational Geometry: Algorithms and Applications.
 *
 * http://www.cs.uu.nl/geobook/
 *
 * Notes
 *
 * All implementations in this module has been written with the goal of being
 * as close to the corresponding pseudocode in the book as possible. This means
 * variable naming and casing is usually the same. However since Javascript does
 * impose some limitations in that regard, the convention for conversion is as
 * follows:
 *
 * - Subscript is denoted with underscores.
 *     p<sub>1</sub>           -> p_1
 *
 * - Dashes are replaced by concatenation.
 *     p<sub>n-1</sub>         -> p_n1
 *
 * Another detail is a difference in indexing. In Javascript the base index is
 * zero, but throughout the book examples are given with a base index of one.
 * This offset is, for the most part, corrected with the addition of a literal
 * -1 after the original boundary conditions. Again, this is intentional to
 * keep the implemenations looking as close to the examples as possible.
 * 
 */
var CompGeom = {
  // Input. A set P of points in the plane.
  // Output. A list L containing the vertices of
  // the convex hull of P, CH(P), in clockwise order.
  SlowConvexHull: function(P) {
    var ordered_pairs = CompGeom.Util.Set.cartesianProduct(P, P)
    .map(function(pair) {
      return { p: pair[0], q: pair[1] };
    })
    .filter(function(pair) {
      // p not equal to q
      return pair.p.x != pair.q.x && pair.p.y != pair.q.y;
    });

    var lies_left = function(r, p, q) {
      var d = CompGeom.Util.Matrix.determinant([
        [1, r.x, r.y],
        [1, p.x, p.y],
        [1, q.x, q.y]
      ]);

      return d < 0;
    }

    var clockwise_ordered_vertices = function(edges) {
      var e1 = edges.splice(0, 1)[0];
      var origin = e1[0];
      var destination = e1[1];;
      var result = [];
      var i, index, e;

      result.push(origin, destination); 

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

        if (destination.x != result[0].x && destination.y != result[0].y) {
          result.push(destination);
        }
      } while (edges.length > 0);

      return result;
    }

    //--------------------------------------------------------------------------

    var E, p, q, valid, r, L;

    // L1
    E = [];

    // L2
    ordered_pairs.forEach(function(pair) {
      // L3
      valid = true;

      // L4
      P.filter(function(r) {
        // r ∈ P not equal to p or q
        var equal_p = r.x == pair.p.x && r.y == pair.p.y;
        var equal_q = r.x == pair.q.x && r.y == pair.q.y;
        return !(equal_p || equal_q)
      })
      .forEach(function(r) {
        // L5
        if (lies_left(r, pair.p, pair.q)) {
          // L6
          valid = false;
        }
      })

      // L7
      if(valid) {
        E.push([pair.p, pair.q])
      }
    });

    // L8
    L = clockwise_ordered_vertices(E);

    return L;
  },

  // Input. A set P of points in the plane.
  // Output. A list containing the vertices of CH(P) in clockwise order.
  ConvexHull: function(P) {
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

    // L2
    p_1 = P[0];
    p_2 = P[1];
    L_upper = [p_1, p_2];

    // L3
    for(i = 3 - 1; i < n; i++) {
      // L4
      p_i = P[i];
      L_upper.push(p_i);

      // L5
      while(L_upper.length > 2 && !rightTurn(L_upper.slice(-3))) {
        L_upper.splice(-2, 1)
      }
    }

    // L7
    p_n = P.slice(-1)[0];
    p_n1 = P.slice(-2, -1)[0];
    L_lower = [p_n, p_n1];

    // L8
    for (i = n - 2 - 1; i >= 1 - 1; i--) {
      // L9
      p_i = P[i];
      L_lower.push(p_i);

      // L10
      while(L_lower.length > 2 && !rightTurn(L_lower.slice(-3))) {
        // L11
        L_lower.splice(-2, 1);
      }
    }

    // L12
    L_lower.shift();
    L_lower.pop();

    // L13
    L = L_upper.concat(L_lower);

    // L14
    return L;
  },

  //----------------------------------------------------------------------------
  //  Util namespace
  //----------------------------------------------------------------------------

  Util: {
    Point: require('./comp-geom/util/point.js'),
    Set: require('./comp-geom/util/set.js'),
    Matrix: require('./comp-geom/util/matrix.js')
  }
};

module.exports = CompGeom;
