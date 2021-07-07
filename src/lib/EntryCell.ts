import GenericCell from './GenericCell.js';

class EntryCell extends GenericCell {
  // where items are added to the grid

  constructor(x: number, y: number) {
    super(x, y, '#F0FFFF');
  }
}

export default EntryCell;
