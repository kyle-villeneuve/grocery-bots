import GenericCell from './GenericCell';
import Item from './Item';

class GridCell extends GenericCell {
  item: Item | null = null;

  constructor(x: number, y: number) {
    super(x, y, '#FFF8DC', 'GRID');
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
    this.item = null;
    this.endTask();
    return item;
  }

  draw(ctx: CanvasRenderingContext2D) {
    super.draw(ctx);

    if (this.item) {
      this.item.draw(ctx, this.x, this.y);
    }
  }
}

export default GridCell;
