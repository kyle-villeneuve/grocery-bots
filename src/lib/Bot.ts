import { Direction } from '../types/index.js';
import { shortId } from '../utils.js';
import Grid from './Grid.js';
import Item from './Item.js';

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
  x: number;
  y: number;
  dx = 0;
  dy = 0;
  storage: { [itemId: string]: Item } = {};
  destination: null | { x: number; y: number } = null;
  direction = Direction.STOPPED;

  constructor(x: number, y: number) {
    this.id = shortId('Bot');
    this.x = x;
    this.y = y;
  }

  changeDirection(direction: Direction) {
    const [dx, dy] = directionDeltaMap[direction];
    this.dx = dx;
    this.dy = dy;
  }

  tick() {
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
    ctx.stroke();
  }
}

export default Bot;
