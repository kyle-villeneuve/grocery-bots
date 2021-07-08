import GenericCell from './GenericCell';

class EntryCell extends GenericCell {
  // where items are added to the grid
  constructor(x: number, y: number) {
    super(x, y, '#F0FFFF', 'ENTRY');
  }
}

export default EntryCell;
