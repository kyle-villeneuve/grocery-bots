import { inverseColor, shortId } from '../utils.js';

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
}

export default Item;
