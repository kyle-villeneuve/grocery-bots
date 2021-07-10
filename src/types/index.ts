/** @file Typescript typing information
 * If you want to break your types out from your code, you can
 * place them into the 'types' folder. Note that if you using
 * the type declaration extention ('.d.ts') your files will not
 * be compiled -- if you need to deliver your types to consumers
 * of a published npm module use the '.ts' extension instead.
 */

export enum Direction {
  STOPPED, // not fulfilling any tasks
  UP,
  DOWN,
  RIGHT,
  LEFT,
}

export type Coord = { x: number; y: number };

// when items enter the grid, the bot will go to the item's location, grab it, and move it to an empty (?) cell
export type BotTaskTemplate<
  T extends { type: string; payload?: Record<string, any> },
> = Coord & T;

export type BotRetrieveItem = BotTaskTemplate<{
  type: 'RETRIEVE_ITEM';
  payload: { itemId: string };
}>;

export type BotPlaceItem = BotTaskTemplate<{
  type: 'PLACE_ITEM';
  payload: { itemId: string };
}>;

export type BotPickItem = BotTaskTemplate<{
  type: 'PICK_ITEM';
  payload: { itemId: string; orderId: string };
}>;

export type BotPlaceOrder = BotTaskTemplate<{
  type: 'PLACE_ORDER';
  payload: { orderId: string };
}>;

export type BotTask =
  | BotRetrieveItem
  | BotPlaceItem
  | BotPlaceOrder
  | BotPickItem;
