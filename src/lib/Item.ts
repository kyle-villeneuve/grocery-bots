import { inverseColor, shortId } from '../utils';
import Grid from './Grid';

class Item {
  id: string;
  quantity: number;
  name: string;
  color: string;
  labelColor: string;

  constructor(quantity: number, name: string, color: string) {
    this.quantity = quantity;
    this.name = name;
    this.id = shortId('Item');
    this.color = color;
    this.labelColor = inverseColor(color);
  }

  draw(ctx: CanvasRenderingContext2D, x: number, y: number) {
    ctx.fillStyle = this.color;

    const mid = Grid.scale / 2;
    const _x = x * Grid.scale + mid;
    const _y = y * Grid.scale + mid;
    const radius = Grid.scale / 3;

    ctx.arc(_x, _y, radius, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillStyle = this.labelColor;
    ctx.fillText(this.quantity + '', _x, _y);
  }
}

export default Item;
