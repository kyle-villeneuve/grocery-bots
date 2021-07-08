import GenericCell from './GenericCell';

class GridCell extends GenericCell {
  constructor(x: number, y: number) {
    super(x, y, '#FFF8DC', 'GRID');
  }
}

export default GridCell;
