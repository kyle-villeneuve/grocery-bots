import GenericCell from './GenericCell';
import Item from './Item';

class EntryCell extends GenericCell {
  item: Item | null = null;

  // where items are added to the grid
  constructor(x: number, y: number) {
    super(x, y, '#F0FFFF', 'ENTRY');
  }

  addItem(item: Item) {
    if (this.item) throw new Error('Item already in cell');
    this.item = item;
    return item;
  }

  removeItem() {
    if (!this.item) {
      throw new Error('No item to remove');
    }
    const item = this.item;
    this.endTask();
    this.item = null;
    return item;
  }

  draw(ctx: CanvasRenderingContext2D) {
    super.draw(ctx);

    if (this.item) {
      this.item.draw(ctx, this.x, this.y);
    }
  }
}

export default EntryCell;
