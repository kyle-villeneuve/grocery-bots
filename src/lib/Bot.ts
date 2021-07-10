import { BotTask, Coord, Direction } from '../types/index';
import { arrayIfy, last, roundTo, shortId } from '../utils';
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
  tasks: BotTask[] = [];
  direction = Direction.STOPPED;
  onTaskCompleted?: (bot: this, task: BotTask) => void;
  trajectory: null | Coord[] = null;
  trajectoryColor: string;

  constructor(name: string, x: number, y: number, trajectoryColor = '#000') {
    this.id = shortId('Bot');
    this.name = name;
    this.x = x;
    this.y = y;
    this.trajectoryColor = trajectoryColor;
  }

  isIdle() {
    return !this.tasks.length;
  }

  currentTask() {
    return last(this.tasks);
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
        const size = 2;
        ctx.fillRect(
          pt.x * Grid.scale + Grid.mid - size / 2,
          pt.y * Grid.scale + Grid.mid - size / 2,
          size,
          size,
        );
      });
    }
  }

  extrapolateTrajectoryForLeg(from: Coord, to?: Coord): Coord[] {
    const legs: Coord[] = [from];

    if (!to) return legs;

    let lastLeg = from;
    let direction = this.calculateDirection(to, lastLeg);

    while (direction !== Direction.STOPPED) {
      const [dx, dy] = directionDeltaMap[direction];

      const x = roundTo(5)(lastLeg.x + dx * 0.2);
      const y = roundTo(5)(lastLeg.y + dy * 0.2);
      lastLeg = { x, y };
      legs.push(lastLeg);
      direction = this.calculateDirection(to, lastLeg);
    }

    return legs;
  }

  extrapolateTrajectory(): null | Coord[] {
    // naively extrapolate where the bot will go in the future
    // note: the hive will be responsible for detecting collisions and
    // changing path when necessary

    if (this.isIdle()) return null;

    const currentLocation: Coord = { x: this.x, y: this.y };

    return this.tasks.flatMap((task, index) => {
      const from = index === 0 ? currentLocation : this.tasks[index - 1];
      return this.extrapolateTrajectoryForLeg(from, task);
    });
  }

  assignTasks(
    tasks: BotTask | BotTask[],
    onTaskCompleted: (bot: this, task: BotTask) => void,
  ) {
    if (!this.isIdle()) {
      throw new Error('Cannot assign tasks, bot is busy');
    }
    this.tasks = arrayIfy(tasks);
    this.onTaskCompleted = onTaskCompleted;
  }

  calculateDirection(
    end: undefined | Coord,
    start: Coord = { x: this.x, y: this.y },
  ): Direction {
    if (!end) {
      return Direction.STOPPED;
    }
    // bot will always go clockwise
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
    let [currentTask, ...remainingTasks] = this.tasks;

    while (
      currentTask &&
      this.x === currentTask.x &&
      this.y === currentTask.y
    ) {
      [, ...remainingTasks] = this.tasks;
      this.tasks = remainingTasks;
      this.onTaskCompleted?.(this, currentTask);
      currentTask = remainingTasks[0];
    }

    this.direction = this.calculateDirection(currentTask);
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
}

export default Bot;
