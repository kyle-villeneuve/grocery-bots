import { Coord } from '../types/index';

export function manhattanDistance(pt1: Coord, pt2: Coord) {
  return Math.abs(pt2.y - pt1.y) + Math.abs(pt2.x - pt1.x);
}

export const sortNearest =
  (nearest: Coord) =>
  (a: Coord, b: Coord): number => {
    return manhattanDistance(a, nearest) - manhattanDistance(b, nearest);
  };

export function findNearest<T extends Coord>(
  nearest: Coord,
  things: T[],
): T | undefined {
  let closest: T | undefined = undefined;
  let closestDistance = Infinity;

  things.forEach((thing) => {
    const distance = manhattanDistance(nearest, thing);
    if (distance < closestDistance) {
      closest = thing;
      closestDistance = distance;
    }
  });

  return closest;
}
