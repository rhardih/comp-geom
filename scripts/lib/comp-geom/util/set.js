var Set = {
  // Input: Two sets A and B
  // Output: The set of all ordered pairs (a, b),
  // such that a ∈ A and b ∈ B
  //
  // https://en.wikipedia.org/wiki/Cartesian_product
  cartesianProduct: function(A, B) {
    var result = [];

    A.forEach(function(a) {
      B.forEach(function(b) {
        result.push([a, b]);
      });
    });

    return result;
  }
};

module.exports = Set;
