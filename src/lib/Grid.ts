import { Coord } from '../types/index';
import { findNearest } from '../utils';
import EntryCell from './EntryCell';
import ExitCell from './ExitCell';
import GridCell from './GridCell';

class Grid {
  static scale = 35;
  static mid = Grid.scale / 2;

  cells: (ExitCell | GridCell | EntryCell)[][];
  width: number;
  height: number;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;

    this.cells = new Array(this.width).fill(null).map((_, x) => {
      return new Array(this.height).fill(null).map((_, y) => {
        if ((x === 0 || y === 0) && y !== this.width - 1) {
          return new EntryCell(x, y);
        }
        if (x === this.width - 1 || y === this.width - 1) {
          return new ExitCell(x, y);
        }
        return new GridCell(x, y);
      });
    });
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, this.width * Grid.scale, this.height * Grid.scale);
    this.cells.forEach((row) => {
      row.forEach((cell) => cell.draw(ctx));
    });
  }

  getOccupiedEntryCell(nearest: Coord): EntryCell | undefined {
    const cells = this.cells
      .flat()
      .filter((cell): cell is EntryCell =>
        Boolean(cell instanceof EntryCell && !cell.task && cell.item),
      );

    return findNearest(nearest, cells);
  }

  getUnoccupiedExitCell(nearest: Coord) {
    if (nearest) {
      const cells = this.cells
        .flat()
        .filter((cell): cell is ExitCell =>
          Boolean(cell instanceof ExitCell && !cell.task && !cell.order),
        );

      return findNearest(nearest, cells);
    }
  }

  getEmptyGridCell(nearest: Coord): GridCell | undefined {
    const cells = this.cells
      .flat()
      .filter(
        (cell): cell is GridCell => cell instanceof GridCell && !cell.task,
      );

    return findNearest(nearest, cells);
  }
}

export default Grid;
