import { Coord } from '../types/index';
import { distance, findMatrix } from '../utils';
import Bot from './Bot';
import EntryCell from './EntryCell';
import ExitCell from './ExitCell';
import Grid from './Grid';
import GridCell from './GridCell';
import Item from './Item';
import Order from './Order';

type CellTypes = GridCell | ExitCell | EntryCell;

class HIVE {
  bots: Bot[] = [];
  items: Item[] = [];
  orders: Order[] = [];
  grid: Grid;
  width: number;
  height: number;
  canvas: HTMLCanvasElement;
  c: CanvasRenderingContext2D;
  ticking: NodeJS.Timeout | null = null;
  drawing: number | null = null;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.grid = new Grid(width, height);
    this.canvas = document.createElement('canvas');
    this.canvas.setAttribute('height', this.height * Grid.scale + 'px');
    this.canvas.setAttribute('width', this.width * Grid.scale + 'px');
    this.c = this.canvas.getContext('2d')!;

    document.body.appendChild(this.canvas);
  }

  addBot(bot: Bot) {
    this.bots = [...this.bots, bot];
  }

  removeBot(botId: string) {
    this.bots = this.bots.filter((b) => b.id !== botId);
  }

  addItem(item: Item) {
    const cell = findMatrix(this.grid.cells, (cell, rowIndex, colIndex) => {
      if (rowIndex !== 0 && colIndex !== 0) return false;
      if (rowIndex === 0 && colIndex === this.width - 1) return false;
      return cell.item === null;
    });

    if (!cell) throw new Error('all entry cells occupied');

    cell.addItem(item);
  }

  addOrder(order: Order) {
    this.orders = [...this.orders, order];
  }

  getUnoccupiedBot(nearest?: Coord): Bot | undefined {
    if (!nearest) {
      return this.bots.find((bot) => !bot.task);
    }

    const bots = this.bots
      .filter((bot) => !bot.task)
      .sort((a, b) => {
        return distance(a, nearest) - distance(b, nearest);
      });

    return bots[0];
  }

  getOccupiedEntryCell() {
    const item = findMatrix(this.grid.cells, (item): item is EntryCell =>
      Boolean(item instanceof EntryCell && !item.task && item.item),
    );
    return item;
  }

  assignTasks() {
    let unassignedWork = true;

    while (unassignedWork) {
      // TODO for now just assign one task at a time
      const entry = this.getOccupiedEntryCell();

      if (entry) {
        const closestBot = this.getUnoccupiedBot(entry);
        if (closestBot) {
          entry.task = true;
          closestBot.assignTask({
            type: 'RETRIEVE_ITEM',
            location: { x: entry.x, y: entry.y },
          });
          continue;
        }
      }

      unassignedWork = false;
    }
  }

  tick() {
    this.ticking = setTimeout(() => {
      this.bots.forEach((bot) => bot.tick());
      this.ticking = this.tick();
    }, 100);

    this.assignTasks();

    return this.ticking;
  }

  draw() {
    this.drawing = window.requestAnimationFrame(() => {
      this.grid.draw(this.c);
      this.bots.forEach((bot) => {
        bot.draw(this.c);
      });
      this.drawing = this.draw();
    });

    return this.drawing;
  }

  init() {
    this.tick();
    this.draw();
  }

  halt() {
    this.ticking && window.clearTimeout(this.ticking);
    this.drawing && window.cancelAnimationFrame(this.drawing);
  }
}

export default HIVE;
