import Bot from './Bot.js';
import EntryCell from './EntryCell.js';
import ExitCell from './ExitCell.js';
import Grid from './Grid.js';
import GridCell from './GridCell.js';
import Item from './Item.js';
import Order from './Order.js';

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
    const cell = this.grid.cells.reduce(
      (found: CellTypes | undefined, row: CellTypes[], rowIndex: number) => {
        if (found) return found;
        return row.find((col, colIndex) => {
          if (rowIndex !== 0 && colIndex !== 0) return false;
          if (rowIndex === 0 && colIndex === this.width - 1) return false;
          return col.item === null;
        });
      },
      undefined,
    );

    if (!cell) throw new Error('all entry cells occupied');

    cell.addItem(item);
  }

  addOrder(order: Order) {
    this.orders = [...this.orders, order];
  }

  tick() {
    this.ticking = setTimeout(() => {
      this.bots.forEach((bot) => bot.tick());
      this.ticking = this.tick();
    }, 100);

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
