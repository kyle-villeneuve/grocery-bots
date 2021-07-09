import { PI_2 } from '../constants';
import { inverseColor, shortId } from '../utils';
import Grid from './Grid';

const ITEM_RADIUS = Grid.scale / 3;

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

    const _x = x * Grid.scale + Grid.mid;
    const _y = y * Grid.scale + Grid.mid;

    ctx.arc(_x, _y, ITEM_RADIUS, 0, PI_2);
    ctx.fill();
    ctx.fillStyle = this.labelColor;
    ctx.fillText(this.quantity + '', _x, _y);
  }
}

export default Item;
