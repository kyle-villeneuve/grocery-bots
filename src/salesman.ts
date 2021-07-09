import { Coord } from './types/index';
import { manhattanDistance } from './utils.js';

/**
 * @module
 * @author Ophir LOJKINE
 * salesman npm module
 *
 * Good heuristic for the traveling salesman problem using simulated annealing.
 * @see {@link https://lovasoa.github.io/salesman.js/|demo}
 **/

/**
 * @private
 */

class Path {
  points: Coord[];
  order: any[];
  distances: any[];

  constructor(points: Coord[]) {
    this.points = points;
    this.order = new Array(points.length);
    this.distances = new Array(points.length * points.length);

    for (let i = 0; i < points.length; i++) this.order[i] = i;

    for (let i = 0; i < points.length; i++)
      for (let j = 0; j < points.length; j++)
        this.distances[j + i * points.length] = manhattanDistance(
          points[i],
          points[j],
        );
  }

  change(temp: number) {
    const i = this.randomPos(),
      j = this.randomPos();
    const delta = this.delta_distance(i, j);
    if (delta < 0 || Math.random() < Math.exp(-delta / temp)) {
      this.swap(i, j);
    }
  }

  size() {
    let s = 0;
    for (let i = 0; i < this.points.length; i++) {
      s += this.distance(i, (i + 1) % this.points.length);
    }
    return s;
  }

  swap(i: number, j: number) {
    const tmp = this.order[i];
    this.order[i] = this.order[j];
    this.order[j] = tmp;
  }

  delta_distance(i: number, j: number) {
    const jm1 = this.index(j - 1),
      jp1 = this.index(j + 1),
      im1 = this.index(i - 1),
      ip1 = this.index(i + 1);
    let s =
      this.distance(jm1, i) +
      this.distance(i, jp1) +
      this.distance(im1, j) +
      this.distance(j, ip1) -
      this.distance(im1, i) -
      this.distance(i, ip1) -
      this.distance(jm1, j) -
      this.distance(j, jp1);
    if (jm1 === i || jp1 === i) s += 2 * this.distance(i, j);
    return s;
  }

  index(i: number) {
    return (i + this.points.length) % this.points.length;
  }

  access(i: number) {
    return this.points[this.order[this.index(i)]];
  }

  distance(i: number, j: number) {
    return this.distances[this.order[i] * this.points.length + this.order[j]];
  }

  // Random index between 1 and the last position in the array of points
  randomPos() {
    return 1 + Math.floor(Math.random() * (this.points.length - 1));
  }
}

/**
 * Solves the following problem:
 *  Given a list of points and the distances between each pair of points,
 *  what is the shortest possible route that visits each point exactly
 *  once and returns to the origin point?
 *
 * @param {Coord[]} points The points that the path will have to visit.
 * @param {Number} [temp_coeff=0.999] changes the convergence speed of the algorithm: the closer to 1, the slower the algorithm and the better the solutions.
 * @param {Function} [callback=] An optional callback to be called after each iteration.
 *
 * @returns {Number[]} An array of indexes in the original array. Indicates in which order the different points are visited.
 *
 * @example
 * var points = [
 *       new salesman.Point(2,3)
 *       //other points
 *     ];
 * var solution = salesman.solve(points);
 * var ordered_points = solution.map(i => points[i]);
 * // ordered_points now contains the points, in the order they ought to be visited.
 **/
export default function solve(points: Coord[], temp_coeff = 0.999) {
  const path = new Path(points);
  if (points.length < 2) return path.order; // There is nothing to optimize
  if (!temp_coeff)
    temp_coeff = 1 - Math.exp(-10 - Math.min(points.length, 1e6) / 1e5);

  for (
    let temperature = 100 * manhattanDistance(path.access(0), path.access(1));
    temperature > 1e-6;
    temperature *= temp_coeff
  ) {
    path.change(temperature);
  }
  return path.order;
}
