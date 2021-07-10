import { BotTask, Coord } from '../types';
import { findMatrix, findNearest } from '../utils';
import Bot from './Bot';
import EntryCell from './EntryCell';
import ExitCell from './ExitCell';
import Grid from './Grid';
import GridCell from './GridCell';
import Item from './Item';
import Order from './Order';

class HIVE {
  bots: Bot[] = [];
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

    // base context
    this.c.font = '10px monospace';
    this.c.textAlign = 'center';
    this.c.textBaseline = 'middle';

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
      return cell instanceof EntryCell && !cell.item;
    });

    if (!cell) throw new Error('all entry cells occupied');

    (cell as EntryCell).addItem(item);
  }

  addOrder(order: Order) {
    this.orders = [...this.orders, order];
  }

  getUnoccupiedBot(nearest?: Coord): Bot | undefined {
    if (!nearest) {
      return this.bots.find((bot) => bot.isIdle());
    }

    const bots = this.bots.filter((bot) => bot.isIdle());
    return findNearest(nearest, bots);
  }

  getItem(
    itemId: string,
    nearest: Coord,
  ): (Coord & { item: Item }) | undefined {
    const items = this.grid.cells.reduce(
      (total: (Coord & { item: Item })[], row) => {
        row.forEach((cell) => {
          if (cell instanceof GridCell && cell.item?.id === itemId) {
            total.push({ x: cell.x, y: cell.y, item: cell.item });
          }
        });
        return total;
      },
      [],
    );

    return findNearest(nearest, items);
  }

  getUnfulfilledOrder(nearest?: Coord): Order | undefined {
    // if (!nearest) {
    return this.orders.find((order) => order.status === 'INIT');
    // }
    // TODO
    // get closest item from any unfulfilled order
    // not optimal, but a decent heuristic without too much brute forcing
  }

  onBotTaskCompleted(bot: Bot, task: BotTask) {
    switch (task.type) {
      case 'RETRIEVE_ITEM': {
        const cell = this.grid.cells[task.x][task.y];
        if (!(cell instanceof EntryCell)) {
          throw new Error('expected EntryCell');
        }
        const item = cell.removeItem();
        bot.addItem(item);

        const entryCell = this.grid.getEmptyGridCell(bot);
        if (entryCell) {
          bot.assignTasks(
            {
              x: entryCell.x,
              y: entryCell.y,
              type: 'PLACE_ITEM',
              payload: { itemId: item.id },
            },
            this.onBotTaskCompleted,
          );
          entryCell.startTask();
        } else {
          // TODO
          throw new Error('Nowhere to place item');
        }
        break;
      }

      case 'PLACE_ITEM': {
        const item = bot.removeItem(task.payload.itemId);
        const cell = this.grid.cells[task.x][task.y];
        cell.addItem(item);
        break;
      }

      case 'PLACE_ORDER': {
        const cell = this.grid.cells[task.x][task.y];
        if (!(cell instanceof ExitCell)) {
          throw new Error('Expected ExitCell');
        }
        const order = this.orders.find(
          (order) => order.id === task.payload.orderId,
        );
        order?.items.forEach((item) => {
          cell.addItem(bot.removeItem(item.id));
        });
        break;
      }

      case 'PICK_ITEM': {
        const cell = this.grid.cells[task.x][task.y];
        if (!(cell instanceof GridCell)) {
          throw new Error('Cell should be a GridCell');
        }
        const item = cell.removeItem();
        bot.addItem(item);

        // XXX
        // if done picking
        if (!bot.tasks.length) {
          const cell = this.grid.getUnoccupiedExitCell(bot);
          if (!cell) throw new Error('TODO');
          bot.assignTasks(
            [
              {
                type: 'PLACE_ORDER',
                x: cell.x,
                y: cell.y,
                payload: { orderId: task.payload.orderId },
              },
            ],
            this.onBotTaskCompleted,
          );
        }

        break;
      }

      default: {
        // @ts-ignore
        throw new Error(`Unknown task ${task.type}`);
      }
    }
  }

  assignTasks() {
    let availableBot = this.getUnoccupiedBot();

    while (availableBot) {
      const order = this.getUnfulfilledOrder(availableBot);

      if (order) {
        const pickTasks = order.getPickTask(this.grid.cells, availableBot);
        order.setStatus('PICKING');
        availableBot.assignTasks(pickTasks, this.onBotTaskCompleted);
        availableBot = this.getUnoccupiedBot();
        continue;
      }

      const entry = this.grid.getOccupiedEntryCell(availableBot);

      if (entry) {
        entry.task = true;
        availableBot.assignTasks(
          {
            x: entry.x,
            y: entry.y,
            type: 'RETRIEVE_ITEM',
            payload: { itemId: entry.item!.id },
          },
          this.onBotTaskCompleted,
        );
        availableBot = this.getUnoccupiedBot();
        continue;
      }

      break;
    }
  }

  tick() {
    this.ticking = setTimeout(() => {
      this.bots.forEach((bot) => bot.tick());
      this.ticking = this.tick();
    }, 10);

    this.assignTasks();

    return this.ticking;
  }

  draw() {
    this.drawing = window.requestAnimationFrame(() => {
      this.grid.draw(this.c);
      this.bots.forEach((bot) => bot.draw(this.c));
      this.drawing = this.draw();
    });

    return this.drawing;
  }

  init() {
    console.log('init');
    this.tick();
    this.draw();
  }

  halt() {
    this.ticking && window.clearTimeout(this.ticking);
    this.drawing && window.cancelAnimationFrame(this.drawing);
    this.ticking = null;
    this.drawing = null;
  }
}

export default HIVE;
