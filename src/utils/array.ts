import { randomInt } from './number';

export function randomElement<T>(array: T[]): T | undefined {
  return array[randomInt(0, array.length - 1)];
}

export function findMatrix<T>(
  matrix: T[][],
  cb: (item: T, rowIndex: number, colIndex: number) => boolean,
) {
  // using for loops for early return
  for (let i = 0; i < matrix.length; i++) {
    const row = matrix[i];
    for (let j = 0; j < row.length; j++) {
      const item: T = row[j];
      if (cb(item, i, j)) {
        return item;
      }
    }
  }
}

export function last<T>(array: T[]): T | undefined {
  return array[array.length - 1];
}

export function debupeBy<T>(
  array: T[],
  getId: (el: T) => string | number,
): T[] {
  const seen: Record<string | number, true> = {};
  return array.filter((element) => {
    const id = getId(element);
    if (seen[id]) return false;
    seen[id] = true;
    return true;
  });
}

export function arrayIfy<T>(maybeArray: T | T[]): T[] {
  if (Array.isArray(maybeArray)) return maybeArray;
  return [maybeArray];
}
