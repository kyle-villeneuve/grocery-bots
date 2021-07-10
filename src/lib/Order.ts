import travelingSalesman from '../salesman';
import { BotPickItem, BotPlaceOrder, Coord } from '../types';
import { findNearest, shortId } from '../utils';
import EntryCell from './EntryCell';
import ExitCell from './ExitCell';
import GridCell from './GridCell';
import Item from './Item';

type OrderStatus = 'INIT' | 'PICKING' | 'FULFILLED';

class Order {
  id = shortId('Order');
  items: Item[];
  status: OrderStatus = 'INIT';

  constructor(items: Item[]) {
    this.items = items;
  }

  setStatus(status: OrderStatus) {
    this.status = status;
    return status;
  }

  getPickTask(
    cells: (ExitCell | EntryCell | GridCell)[][],
    nearest: Coord,
  ): (BotPickItem | BotPlaceOrder)[] {
    const itemIds = this.items.map((item) => item.id);

    // get all cells that have an item in this order
    const itemCells: GridCell[] = cells.reduce((cells: GridCell[], row) => {
      row.forEach((cell) => {
        if (!(cell instanceof GridCell)) return;
        if (!cell.item) return;
        if (!itemIds.includes(cell.item.id)) return;
        cells.push(cell);
      });
      return cells;
    }, []);

    const pickTasks = itemIds.map((itemId): BotPickItem => {
      const thisItemCells = itemCells.filter(
        (cell) => cell.item!.id === itemId,
      );

      const nearestCell = findNearest(nearest, thisItemCells);
      if (!nearestCell) throw new Error('Cannot find closest cell');

      return {
        x: nearestCell.x,
        y: nearestCell.y,
        type: 'PICK_ITEM',
        payload: { itemId, orderId: this.id },
      };
    });

    // TODO, this doesnt account for starting position
    const optimized = travelingSalesman(pickTasks);

    return optimized;
  }
}

export default Order;
