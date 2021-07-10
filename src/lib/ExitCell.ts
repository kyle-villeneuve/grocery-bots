import GenericCell from '../lib/GenericCell';
import Item from './Item';
import Order from './Order';

class ExitCell extends GenericCell {
  // where completed orders leave the grid
  order: Order | null = null;
  items: Item[] = [];

  constructor(x: number, y: number) {
    super(x, y, '#F0F8FF', 'EXIT');
  }

  addItem(item: Item) {
    this.items = [...this.items, item];
    this.task = true;
  }

  draw(ctx: CanvasRenderingContext2D) {
    super.draw(ctx);
    if (this.items.length) {
      this.items[0].draw(ctx, this.x, this.y);
    }
  }
}

export default ExitCell;
