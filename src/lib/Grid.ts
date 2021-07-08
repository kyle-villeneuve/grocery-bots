import EntryCell from './EntryCell';
import ExitCell from './ExitCell';
import GridCell from './GridCell';

class Grid {
  static scale = 35;

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

  // tick() {}

  draw(ctx: CanvasRenderingContext2D) {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, this.width * Grid.scale, this.height * Grid.scale);
    this.cells.forEach((row) => {
      row.forEach((cell) => cell.draw(ctx));
    });
  }
}

export default Grid;
