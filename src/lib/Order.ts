import Item from './Item.js';

class Order {
  items: Item[];
  status = 'INIT';

  constructor(items: Item[]) {
    this.items = items;
  }
}

export default Order;
