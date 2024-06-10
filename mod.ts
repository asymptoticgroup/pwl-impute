import Matrix from "jsr:@asymptoticgroup/symba@1.0";

/**
 * Fill in missing (NaN) values in a list of points in a reasonable manner.
 *
 * @param points The list of points to update in place
 * @param x The x-coordinate property
 * @param y The y-coordinate property
 * @param x0 The "central" x-value to fill, if no other data available
 * @param y0 The "central" y-value to fill, if no other data available
 *
 * @example Illustrated usage
 * ```ts
 * const points = [
 *  { x: 0.5, y: 1 },
 *  { x: 2, y: Number.NaN },
 *  { x: Number.NaN, y: 2 },
 *  { x: 3, y: 3 },
 * ];
 *
 * impute(points, "x", "y", 0, 0);
 *
 * // `impute` has updated `points` as follows:
 * // points[1].y === 1.5
 * // points[2].x === 2.5
 * ```
 */
export default function impute<
  X extends string | symbol,
  Y extends string | symbol,
  P extends { [_ in X]: number } & { [_ in Y]: number }
>(points: P[], x: X, y: Y, x0: number, y0: number): void {
  // We solve the tridiagonal system that evenly spaces out the unknown values.
  // For monotone curves, this corresponds to a choosing the collinear values,
  // which also (typically) minimizes the arclength.
  const n = points.length;
  const mat = new Matrix(n, 3);
  const vec = new Float64Array(mat.dim);
  solve(mat, vec, points, x, x0);
  solve(mat, vec, points, y, y0);
}

// Setup and solve the tridiagonal system associated to our inference
function solve<X extends string | symbol, P extends { [_ in X]: number }>(
  matrix: Matrix,
  rhs: Float64Array,
  points: P[],
  x: X,
  x0: number
) {
  const n = points.length;

  matrix.band(0).fill(2);
  matrix.band(1).fill(-1);
  matrix.set(0, 0, 1);
  matrix.set(n - 1, n - 1, 1);
  rhs.fill(0);

  let needSolve = false;
  let illPosed = true;

  // Setup the x-coordinates
  for (let i = 0; i < n; i++) {
    const value = points[i][x];
    if (!Number.isNaN(value)) {
      // If the x-coordinate is known, preserve it
      rhs[i] = value;
      matrix.set(i, i, 1);
      // Also flag the system being non-singular
      illPosed = false;

      // We also need to zero-out the off-diagonal terms; we do this in a way
      // to preserve symmetry so that we benefit from the Cholesky
      // factorization.
      if (i > 0) {
        rhs[i - 1] -= matrix.set(i, i - 1, 0) * value;
      }
      if (i + 1 < n) {
        rhs[i + 1] -= matrix.set(i, i + 1, 0) * value;
      }
    } else {
      needSolve = true;
    }
  }

  // We should be good to go now.
  if (illPosed) {
    rhs.fill(x0);
  } else if (needSolve) {
    matrix.factor();
    matrix.solve(rhs);
  }

  // Back-fill any missing values
  for (let i = 0; i < n; i++) {
    if (Number.isNaN(points[i][x])) {
      points[i][x] = rhs[i] as P[X];
    }
  }
}
