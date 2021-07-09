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
  trajectory: null | Coord[] = null;
  trajectoryColor: string;

  constructor(name: string, x: number, y: number, trajectoryColor = '#000') {
    this.id = shortId('Bot');
    this.name = name;
    this.x = x;
    this.y = y;
    this.trajectoryColor = trajectoryColor;
  }

  tick() {
    this.changeDirection();
    [this.dx, this.dy] = directionDeltaMap[this.direction];

    this.x = roundTo(5)(this.x + this.dx * 0.2);
    this.y = roundTo(5)(this.y + this.dy * 0.2);

    this.trajectory = this.extrapolateTrajectory();
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
    const x = this.x * Grid.scale + Grid.mid;
    const y = this.y * Grid.scale + Grid.mid;
    ctx.fillText(this.name, x, y);
    ctx.stroke();

    const item = this.storage[0];

    if (item) {
      item.draw(ctx, this.x, this.y);
    }

    if (this.trajectory) {
      //  using points here to illustrate acceleration in the future
      this.trajectory.forEach((pt) => {
        ctx.fillStyle = this.trajectoryColor;
        ctx.fillRect(
          pt.x * Grid.scale + Grid.mid,
          pt.y * Grid.scale + Grid.mid,
          2,
          2,
        );
      });
    }
  }

  extrapolateTrajectory(): null | Coord[] {
    // naively extrapolate where the bot will go in the future
    // note: the hive will be responsible for detecting collisions and
    // changing path when necessary

    if (!this.path.length) return null;

    const destination = this.path[this.path.length - 1];
    const currentLocation: Coord = { x: this.x, y: this.y };

    const legs: Coord[] = [currentLocation];
    let lastLeg: Coord = currentLocation;

    while (lastLeg.x !== destination.x || lastLeg.y !== destination.y) {
      const direction = this.calculateDirection(
        destination,
        legs[legs.length - 1],
      );
      const [dx, dy] = directionDeltaMap[direction];

      const x = roundTo(5)(lastLeg.x + dx * 0.2);
      const y = roundTo(5)(lastLeg.y + dy * 0.2);
      lastLeg = { x, y };
      legs.push(lastLeg);
    }

    return legs;
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

  calculateDirection(
    end: undefined | Coord,
    start: Coord = { x: this.x, y: this.y },
  ): Direction {
    if (!end) {
      return Direction.STOPPED;
    }
    if (start.x > end.x) {
      return Direction.LEFT;
    }
    if (start.x < end.x) {
      return Direction.RIGHT;
    }
    if (start.y < end.y) {
      return Direction.DOWN;
    }
    if (start.y > end.y) {
      return Direction.UP;
    }

    return Direction.STOPPED;
  }

  changeDirection() {
    const initialPath: undefined | Coord = this.path[0];
    let next: undefined | Coord = initialPath;

    while (next && this.x === next.x && this.y === next.y) {
      [next, ...this.path] = this.path;
    }

    if (!next && this.task) {
      this.onTaskCompleted?.(this);
    }

    this.direction = this.calculateDirection(next);
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
