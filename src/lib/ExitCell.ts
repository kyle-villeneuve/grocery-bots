import GenericCell from '../lib/GenericCell.js';

class ExitCell extends GenericCell {
  // where completed orders leave the grid

  constructor(x: number, y: number) {
    super(x, y, '#F0F8FF');
  }
}

export default ExitCell;
