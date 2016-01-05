var Matrix = {
  // Input: A matrix M of points in a plane.
  // Output: The determinant of the submatrix of M
  // formed by deleting the i-th row and j-th column.
  //
  // https://en.wikipedia.org/wiki/Minor_(linear_algebra)
  firstMinor: function(M, i, j) {
    var submatrix = M.map(function(row) {
      return row.filter(function(_, index) {
        return index != j;
      });
    }).filter(function(_, index) {
      return index != i;
    });

    return Matrix.determinant(submatrix);
  },

  // Input: A matrix M of points in a plane
  // Output: The determinant of M
  determinant: function(M) {
    var a, b, c, d;

    if (M.length == 2) {
      a = M[0][0];
      b = M[0][1];
      c = M[1][0];
      d = M[1][1];

      return a * d - b * c;
    }

    return M[0].map(function(c, i) {
      return c * Matrix.firstMinor(M, 0, i);
    }).reduce(function(p, c, i) {
      return i % 2 == 0 ? p + c : p - c;
    });
  }
};

module.exports = Matrix;
