var CompGeom = require('../../scripts/lib/comp-geom.js');

//------------------------------------------------------------------------------

describe("CompGeom", function() {
  describe("Util", function() {
    describe("Set", function() {
      describe("cartesianProduct", function() {
        it("returns a list of ordered pairs", function() {
          var A = [
            {x: 1, y: 2},
            {x: 3, y: 4}
          ]

          var B = [
            {x: 5, y: 6},
            {x: 7, y: 8}
          ]

          var result = CompGeom.Util.Set.cartesianProduct(A, B);
          var expected = [
            [ { x: 1, y: 2 }, { x: 5, y: 6 } ],
            [ { x: 1, y: 2 }, { x: 7, y: 8 } ],
            [ { x: 3, y: 4 }, { x: 5, y: 6 } ],
            [ { x: 3, y: 4 }, { x: 7, y: 8 } ]
          ]

          expect(result).toEqual(expected);
        });
      });
    });

    describe("Point", function() {
      describe("otoa", function() {
        it("converts a point object to x,y tuple", function() {
          var points = [
            { x: 1, y: 2 },
            { x: 3, y: 4 },
          ];

          var expected = [
            [1, 2],
            [3, 4]
          ]

          expect(CompGeom.Util.Point.otoa(points)).toEqual(expected);
        });
      });

      describe("bboxIntersect", function() {
        it("returns true if the points is within the bounding box", function() {
          var point = { x: 2, y: 2};
          var box = {
            x1: 1, y1: 1,
            x2: 3, y2: 3
          };

          expect(CompGeom.Util.Point.bboxIntersect(point, box)).toBe(true);
        });

        it("returns false if the points falls outside the bounding box", function() {
          var point = { x: 4, y: 4};
          var box = {
            x1: 1, y2: 1,
            x2: 3, y2: 3
          };

          expect(CompGeom.Util.Point.bboxIntersect(point, box)).toBe(false);
        });
      });

      describe("lexSort", function() {
        it("lexicographically sorts a set of points in place", function() {
          var points = [
            { x: 2, y: 2 },
            { x: 2, y: 3 },
            { x: 1, y: 2 },
            { x: 2, y: 2 }
          ];

          var expected = [
            { x: 1, y: 2 },
            { x: 2, y: 2 },
            { x: 2, y: 2 },
            { x: 2, y: 3 }
          ];

          CompGeom.Util.Point.lexSort(points);

          expect(points).toEqual(expected);
        });
      });
    });

    describe("Matrix", function() {
      describe("firstMinor", function() {
        it("calculates the determinant of the submatrix of M \
           formed by deleting the i-th row and j-th column.", function() {
             var matrix = [
               [1,2,3],
               [4,5,6],
               [7,8,9]
             ];

             expect(CompGeom.Util.Matrix.firstMinor(matrix, 0, 0)).toEqual(-3);
           });
      });

      describe("determinant", function() {
        it("calculates the determinant of a matrix", function() {
          var matrix = [
            [12, 23, 34],
            [45, 56, 67],
            [78, 89, 90]
          ];

          expect(CompGeom.Util.Matrix.determinant(matrix)).toEqual(3630);
        });
      });
    });
  });
});
