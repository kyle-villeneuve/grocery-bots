import { Coord } from '../types/index';
import { findMatrix, sortNearest } from '../utils';
import Bot from './Bot';
import EntryCell from './EntryCell';
import Grid from './Grid';
import GridCell from './GridCell';
import Item from './Item';
import Order from './Order';

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

    this.onBotTaskCompleted = this.onBotTaskCompleted.bind(this);
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
      .sort(sortNearest(nearest));

    return bots[0];
  }

  getOccupiedEntryCell(nearest: Coord) {
    if (nearest) {
      const cells = this.grid.cells
        .flat()
        .filter((cell): cell is EntryCell =>
          Boolean(cell instanceof EntryCell && !cell.task && cell.item),
        )
        .sort(sortNearest(nearest));

      return cells[0];
    }

    const item = findMatrix(this.grid.cells, (item): item is EntryCell =>
      Boolean(item instanceof EntryCell && !item.task && item.item),
    );
    return item;
  }

  getEmptyGridCell(nearest: Coord): GridCell | undefined {
    const cell = this.grid.cells
      .flat()
      .filter(
        (cell): cell is GridCell => cell instanceof GridCell && !cell.task,
      )
      .sort(sortNearest(nearest));

    return cell[0];
  }

  onBotTaskCompleted(bot: Bot) {
    if (!bot.task)
      throw new Error('Task completed but no task assigned to bot');

    const task = bot.task;
    bot.completeTask();

    switch (task.type) {
      case 'RETRIEVE_ITEM': {
        const cell = this.grid.cells[bot.x][bot.y];
        if (!(cell instanceof EntryCell)) {
          throw new Error(
            'Cannot retrieve item because cell is not entry type',
          );
        }

        const item = cell.removeItem();
        bot.addItem(item);

        const entryCell = this.getEmptyGridCell(bot);
        if (entryCell) {
          bot.assignTask(
            { type: 'PLACE_ITEM', payload: { itemId: item.id } },
            [{ x: entryCell.x, y: entryCell.y }],
            this.onBotTaskCompleted,
          );
          entryCell.task = true;
        } else {
          // TODO
        }
        break;
      }
      case 'PLACE_ITEM': {
        const item = bot.removeItem(task.payload.itemId);
        const cell = this.grid.cells[bot.x][bot.y];
        cell.addItem(item);
        break;
      }
    }
  }

  assignTasks() {
    let availableBot = this.getUnoccupiedBot();

    while (availableBot) {
      const entry = this.getOccupiedEntryCell(availableBot);

      if (!entry) break;

      if (entry) {
        entry.task = true;
        availableBot.assignTask(
          { type: 'RETRIEVE_ITEM', payload: { itemId: entry.item!.id } },
          [{ x: entry.x, y: entry.y }],
          this.onBotTaskCompleted,
        );
      } else {
        break;
      }

      // TODO check for other tasks like orders...

      availableBot = this.getUnoccupiedBot();
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
