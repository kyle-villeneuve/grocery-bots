import Item from './Item';

class Order {
  items: Item[];
  status = 'INIT';

  constructor(items: Item[]) {
    this.items = items;
  }
}

export default Order;
