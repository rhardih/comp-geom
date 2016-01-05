var Point = {
  // Input: Bounds given as width, height, offset and then a count.
  // Output: A list of count points, with random x and y coordinates, such that,
  // 0 + offset <= x <= width - offset and
  // 0 + offset <= y <= height - offset
  //
  // https://en.wikipedia.org/wiki/Cartesian_product
  random: function(width, height, offset, count) {
    var points = new Array(count);
    var i;

    for(i = 0; i < points.length; i++) {
      points[i] = {
        x: offset + Math.random() * (width - 2 * offset),
        y: offset + Math.random() * (height - 2 * offset)
      };
    }

    return points;
  },

  // Input: A list of points with x and y properties.
  // Output: The same list of points, but  converted to x, y array tuples.
  otoa: function(points) {
    return points.map(function(p) {
      return [p.x, p.y];
    });
  },

  // Input: A point and a bounding box.
  // Output: True, false, wether the points lies within the bounding box.
  bboxIntersect: function(p, bbox) {
    return p.x >= bbox.x1 &&
      p.x <= bbox.x2 &&
      p.y >= bbox.y1 &&
      p.y <= bbox.y2;
  },

  // Input: A set P of points.
  // Output: None. Sorts the points in-place, by lexicographic ordering
  // x before y.
  lexSort: function(P) {
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
}

module.exports = Point;
