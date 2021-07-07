import Grid from './Grid.js';
import Item from './Item.js';

class GenericCell {
  x: number;
  y: number;
  item: Item | null;
  color: string;

  constructor(x: number, y: number, color: string) {
    this.x = x;
    this.y = y;
    this.item = null;
    this.color = color;
  }

  addItem(item: Item) {
    if (this.item) {
      throw new Error('Cannot add item to occupied cell');
    }
    this.item = item;
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
      ctx.fillStyle = this.item.color;

      const mid = Grid.scale / 2;
      const x = this.x * Grid.scale + mid;
      const y = this.y * Grid.scale + mid;
      const radius = Grid.scale / 3;

      ctx.arc(x, y, radius, 0, 2 * Math.PI);
      ctx.fill();
      ctx.font = '10px monospace';
      ctx.fillStyle = this.item.labelColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.item.quantity + '', x, y);
    }
    ctx.stroke();
  }
}

export default GenericCell;
