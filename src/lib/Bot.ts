import { BotTask, Direction } from '../types/index';
import { shortId } from '../utils';
import Grid from './Grid';
import Item from './Item';

const directionDeltaMap: Record<Direction, [number, number]> = {
  // tuple: [dx, dy]
  [Direction.UP]: [0, -1],
  [Direction.DOWN]: [0, 1],
  [Direction.LEFT]: [-1, 0],
  [Direction.RIGHT]: [1, 0],
  [Direction.STOPPED]: [0, 0],
  [Direction.STANDBY]: [0, 0],
};

class Bot {
  id: string;
  name: string;
  x: number;
  y: number;
  dx = 0;
  dy = 0;
  storage: { [itemId: string]: Item } = {};
  task: null | BotTask = null;
  direction = Direction.STOPPED;

  constructor(name: string, x: number, y: number) {
    this.id = shortId('Bot');
    this.name = name;
    this.x = x;
    this.y = y;
  }

  tick() {
    this.getDirection();

    const x = this.x + this.dx;
    const y = this.y + this.dy;

    this.x = x;
    this.y = y;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.fillStyle = 'orange';
    ctx.fillRect(
      this.x * Grid.scale,
      this.y * Grid.scale,
      Grid.scale,
      Grid.scale,
    );
    ctx.font = '10px monospace';
    ctx.fillStyle = '#000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const mid = Grid.scale / 2;
    const x = this.x * Grid.scale + mid;
    const y = this.y * Grid.scale + mid;
    ctx.fillText(this.name, x, y);
    ctx.stroke();
  }

  assignTask(task: BotTask, force?: boolean) {
    if (this.task && !force) {
      throw new Error('Bot already has task assigned to it');
    }
    this.task = task;
  }

  getDirection() {
    if (!this.task) return;
    let dx: number, dy: number;

    if (this.x > this.task.location.x) {
      [dx, dy] = directionDeltaMap[Direction.LEFT];
    } else if (this.x < this.task.location.x) {
      [dx, dy] = directionDeltaMap[Direction.RIGHT];
    } else if (this.y < this.task.location.y) {
      [dx, dy] = directionDeltaMap[Direction.DOWN];
    } else if (this.y > this.task.location.y) {
      [dx, dy] = directionDeltaMap[Direction.UP];
    } else {
      dx = 0;
      dy = 0;
    }

    this.dx = dx;
    this.dy = dy;
  }
}

export default Bot;
