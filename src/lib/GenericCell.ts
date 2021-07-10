import Grid from './Grid';

class GenericCell {
  type: string;
  x: number;
  y: number;
  color: string;
  task: boolean; // true when there is a bot making use of the cell

  constructor(x: number, y: number, color: string, type: string) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.task = false;
    this.type = type;
  }

  startTask() {
    this.task = true;
  }

  endTask() {
    this.task = false;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.fillRect(
      this.x * Grid.scale + 1,
      this.y * Grid.scale + 1,
      Grid.scale - 2,
      Grid.scale - 2,
    );

    ctx.stroke();
  }
}

export default GenericCell;
