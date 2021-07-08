import { BotTask, Coord, Direction } from '../types/index';
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
  path: Coord[] = []; // [start, leg, leg, destination]
  onTaskCompleted?: (bot: this) => void;

  constructor(name: string, x: number, y: number) {
    this.id = shortId('Bot');
    this.name = name;
    this.x = x;
    this.y = y;
  }

  tick() {
    this.getDirection();
    this.x += this.dx;
    this.y += this.dy;
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

  assignTask(
    task: BotTask,
    path: Coord[],
    onTaskCompleted: (bot: this) => void,
  ) {
    if (this.task) {
      throw new Error('Bot already has task assigned to it');
    }
    this.task = task;
    this.path = path;
    this.onTaskCompleted = onTaskCompleted;
  }

  getDirection() {
    let next: undefined | Coord = this.path[0];

    while (next && this.x === next.x && this.y === next.y) {
      [next, ...this.path] = this.path;
    }

    let dx: number, dy: number;

    if (!next) {
      this.onTaskCompleted?.(this);
      [dx, dy] = directionDeltaMap[Direction.STOPPED];
    } else if (this.x > next.x) {
      [dx, dy] = directionDeltaMap[Direction.LEFT];
    } else if (this.x < next.x) {
      [dx, dy] = directionDeltaMap[Direction.RIGHT];
    } else if (this.y < next.y) {
      [dx, dy] = directionDeltaMap[Direction.DOWN];
    } else if (this.y > next.y) {
      [dx, dy] = directionDeltaMap[Direction.UP];
    } else {
      [dx, dy] = directionDeltaMap[Direction.STOPPED];
    }

    this.dx = dx;
    this.dy = dy;
  }

  addItem(item: Item) {
    this.storage = {
      ...this.storage,
      [item.id]: item,
    };
    return this.storage;
  }

  removeItem(itemId: string) {
    const item = this.storage[itemId];
    if (!item) {
      throw new Error('Item with id ${itemId} doesnt exist in bot');
    }
    this.storage = { ...this.storage };
    delete this.storage[itemId];

    return item;
  }

  completeTask() {
    if (!this.task) throw new Error('No task to complete');
    this.task = null;
  }
}

export default Bot;
