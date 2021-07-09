/**
 * @file This is the entrypoint for your project.
 * If used as a node module, when someone runs
 * `import stuff from 'your-module'` (typescript)
 * or `const stuff = require('your-module')` (javascript)
 * whatever is exported here is what they'll get.
 * For small projects you could put all your code right in this file.
 */

import Bot from './lib/Bot';
import HIVE from './lib/HIVE';
import Item from './lib/Item';
import { hexGenerator, randomInt } from './utils';

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
].map((name) => {
  return new Item(randomInt(1, 20), name, hexGenerator());
});

items.forEach((item) => hive.addItem(item));

hive.addBot(bot1);
hive.addBot(bot2);
hive.addBot(bot3);

hive.init();

console.log(hive);

function placeItemSporadically(min: number, max: number) {
  setTimeout(() => {
    const randomItem = items[randomInt(0, items.length)];
    try {
      hive.addItem(randomItem);
      placeItemSporadically(200, 2000);
    } catch (err) {
      placeItemSporadically(300, 3000);
    }
  }, randomInt(min, max));
}

placeItemSporadically(100, 1000);

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
