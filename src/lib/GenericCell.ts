import Grid from './Grid';
import Item from './Item';

class GenericCell {
  type: string;
  x: number;
  y: number;
  item: Item | null;
  color: string;
  task: boolean; // true when there is a bot making use of the cell

  constructor(x: number, y: number, color: string, type: string) {
    this.x = x;
    this.y = y;
    this.item = null;
    this.color = color;
    this.task = false;
    this.type = type;
  }

  addItem(item: Item) {
    if (this.item) {
      throw new Error('Cannot add item to occupied cell');
    }
    this.item = item;
  }

  startTask() {
    this.task = true;
  }

  endTask() {
    this.task = false;
  }

  removeItem() {
    if (!this.item) {
      throw new Error('No item to remove');
    }
    const item = this.item;
    this.item = null;
    return item;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.fillRect(
      this.x * Grid.scale + 1,
      this.y * Grid.scale + 1,
      Grid.scale - 2,
      Grid.scale - 2,
    );

    if (this.item) {
      this.item.draw(ctx, this.x, this.y);
    }
    ctx.stroke();
  }
}

export default GenericCell;
