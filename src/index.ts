import Bot from './lib/Bot';
import GridCell from './lib/GridCell';
import HIVE from './lib/HIVE';
import Item from './lib/Item';
import Order from './lib/Order';
import { debupeBy, hexGenerator, randomElement, randomInt } from './utils';

const hive = new HIVE(22, 22);
const bot1 = new Bot('A', 2, 2, '#f00');
const bot2 = new Bot('B', 3, 8, '#0f0');
const bot3 = new Bot('C', 6, 9, '#00f');

const items = [
  'Spring water',
  'Nutella pate a tartiner noisettes-cacao t.400 pot de 400 gr',
  'Prince Chocolat',
  'Coca Cola',
  'Cocacola Zero',
  'Nutella',
  'Muesli Raisin, Figue, Abricot',
  'Biscuit Sésame',
  'Nutella biscuits',
  '100% mie complet',
  'Soupe 3 poissons aux algues',
  'Céréales chocapic',
  'Nocciolata Pâte à tartiner au cacao et noisettes',
  'Pain 100% mie nature PT',
  'Nesquik',
  "flocons d'avoine",
  'Lindt Chocolate Excellence',
  'Fourrés Chocolat noir',
  'Special Muesli 30% fruits & noix céréales complètes',
  'Pains au lait',
  'Biscuit lait chocolat',
  'Cristaline Eau de source',
  'NESQUIK Poudre Cacaotée boîte',
  'Excellence 85% Cacao Chocolat Noir Puissant Lindt % Lindt',
  'Quaker Cruesli Mélange de noix',
  'Pain de mie à la farine complète',
  'country crisp',
  'Biscottes heudebert',
  'Biscuit pomme noisette',
  'Primevère Bio doux Tartine & Cuisson',
  'Pur beurre de cacahuète',
  'American Sandwich Complet',
  'NESTLE CHOCAPIC BIO Céréales',
  'Lipton Ice Tea saveur Pêche',
  'Cracotte Céréales Complètes',
  "Céréales Extra Pepites Kellogg's Chocolat Noisettes",
  'NESQUIK Moins de Sucres',
  'Cacao en poudre non sucré',
  'Goûter pépites de chocolat',
  'Harrys beau & bon pain de mie farine de ble cereales & graines',
  'Evian 1.5L',
  'Yaourt nature',
]
  .slice(5, randomInt(10, 15))
  .map((name) => {
    return new Item(randomInt(1, 20), name, hexGenerator());
  });

items.forEach((item) => hive.addItem(item));

hive.addBot(bot1);
hive.addBot(bot2);
hive.addBot(bot3);

hive.draw();

console.log(hive);

let itemTimeout: null | NodeJS.Timeout;
let orderTimeout: null | NodeJS.Timeout;

function placeItemSporadically(min: number, max: number) {
  return setTimeout(() => {
    const randomItem = randomElement(items);
    try {
      if (randomItem) {
        hive.addItem(randomItem);
        itemTimeout = placeItemSporadically(100, 500);
        return;
      }
    } catch (err) {}
    itemTimeout = placeItemSporadically(300, 3000);
  }, randomInt(min, max));
}

function placeOrderSporadically(min: number, max: number) {
  return setTimeout(() => {
    const items = hive.grid.cells.flatMap((row) =>
      row
        .map((cell) => cell instanceof GridCell && cell.item)
        .filter((item): item is Item => !!item),
    );

    const orderItems = new Array(randomInt(1, 4))
      .fill(null)
      .map(() => randomElement(items))
      .filter((item): item is Item => !!item);

    const uniqueOrderItems = debupeBy(orderItems, (i) => i.id);

    try {
      if (uniqueOrderItems.length) {
        const order = new Order(uniqueOrderItems);
        hive.addOrder(order);
        orderTimeout = placeOrderSporadically(1000, 5000);
        return;
      }
    } catch (err) {}
    orderTimeout = placeOrderSporadically(2000, 5000);
  }, randomInt(min, max));
}

window.addEventListener('click', () => {
  if (hive.ticking) {
    hive.halt();
    orderTimeout && clearTimeout(orderTimeout);
    itemTimeout && clearTimeout(itemTimeout);
  } else {
    itemTimeout = placeItemSporadically(100, 1000);
    orderTimeout = placeOrderSporadically(100, 1000);
    hive.init();
  }
});

// const order1 = new Order([items[2]]);
// hive.addOrder(order1);
// hive.getOrders()

/**
- 1. insert order into hive
- 2. hive finds closest unoccupied bot to closest item
- 3. find path to nearest item
- 4. traveling salesman
- 5. last stop, 

*/
