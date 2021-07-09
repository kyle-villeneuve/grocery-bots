import { BotTask, Coord, Direction } from '../types/index';
import { roundTo, shortId } from '../utils';
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
  storage: Item[] = [];
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
    [this.dx, this.dy] = directionDeltaMap[this.direction];

    this.x = roundTo(10)(this.x + this.dx * 0.1);
    this.y = roundTo(10)(this.y + this.dy * 0.1);
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.fillStyle =
      this.direction === Direction.STOPPED ? 'goldenrod' : 'orange';
    ctx.fillRect(
      this.x * Grid.scale,
      this.y * Grid.scale,
      Grid.scale,
      Grid.scale,
    );
    ctx.fillStyle = '#000';
    const mid = Grid.scale / 2;
    const x = this.x * Grid.scale + mid;
    const y = this.y * Grid.scale + mid;
    ctx.fillText(this.name, x, y);
    ctx.stroke();

    const item = this.storage[0];

    if (item) {
      item.draw(ctx, this.x, this.y);
    }
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
    const initialPath: undefined | Coord = this.path[0];
    let next: undefined | Coord = initialPath;

    while (next && this.x === next.x && this.y === next.y) {
      [next, ...this.path] = this.path;
    }

    // bots will always go clockwise
    if (!next) {
      if (this.task) this.onTaskCompleted?.(this);
      this.direction = Direction.STOPPED;
    } else if (this.x > next.x) {
      this.direction = Direction.LEFT;
    } else if (this.x < next.x) {
      this.direction = Direction.RIGHT;
    } else if (this.y < next.y) {
      this.direction = Direction.DOWN;
    } else if (this.y > next.y) {
      this.direction = Direction.UP;
    } else {
      this.direction = Direction.STOPPED;
    }
  }

  addItem(item: Item) {
    this.storage = [...this.storage, item];
    return this.storage;
  }

  removeItem(itemId: string) {
    const itemIdx = this.storage.findIndex((item) => item.id === itemId);
    if (itemIdx === -1) {
      throw new Error(`Item "${itemId}" doesnt exist in bot`);
    }
    const [item] = this.storage.splice(itemIdx, 1);
    return item;
  }

  completeTask(): BotTask {
    if (!this.task) throw new Error('No task to complete');
    const task = { ...this.task };
    this.task = null;
    return task;
  }
}

export default Bot;
