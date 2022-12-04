'use strict';

class MazeGenerator {
  constructor(rows, columns) {
    this.rows = rows;
    this.columns = columns;
    this.grid = [];

    this.current = null;
    this.stack = [];
    this.endDepth = 0;
    this.start = null;
    this.end = null;
    this.nodes = 1;
    this.childrenStorage = [];
  }

  fill() {
    const height = this.rows * 2 + 1;
    const width = this.columns * 2 + 1;

    for (let i = 0; i < height; i++) {
      if (i % 2 === 0) {
        this.grid[i] = [];
        for (let j = 0; j < width; j++) {
          this.grid[i].push(new Wall(i, j, this.grid));
        }
      } else {
        this.grid[i] = [];
        for (let j = 0; j < width; j++) {
          if (j % 2 === 0) {
            this.grid[i].push(new Wall(i, j, this.grid));
          } else {
            this.grid[i].push(new Cell(i, j, this.grid));
          }
        }
      }
    }

    this.current = this.grid[1][1];
    this.grid[0][1] = new Cell(0, 1, this.grid);
    this.grid[0][1].isStart = true;
    this.start = [0, 1];
    this.grid[0][1].neighbours.bottom = this.current;
    this.current.neighbours.top = this.grid[0][1];
    this.grid[0][1].visitedMaze = true;
  }
  
  createMaze() {
    this.current.visitedMaze = true;

    const next = this.current.choosePathMaze();

    if (next) {
      next.visitedMaze = true;
      this.stack.push(this.current);
      this.current.removeWall(next);
      this.current = next;

    } else if (this.stack.length > 0) {
      if (this.stack.length > this.endDepth) {
        if (this.end) {
          const [ oldEndRow, oldEndCol ] = this.end;
          this.grid[oldEndRow][oldEndCol].isEnd = false;
        }

        this.end = [this.current.rowNum, this.current.colNum];
        this.endDepth = this.stack.length;
        this.current.isEnd = true;
      }
      const cell = this.stack.pop();
      this.current = cell;
    }

    if (this.stack.length === 0) {
      return this;
    }

    this.createMaze();
  }

  buildTree(cell) {
    let current = null;
    if (cell) {
      current = cell;
    } else {
      current = this.grid[0][1];
    }
    
    current.visitedGraph = true;
    const children = [];
    let nextData = current.choosePathGraph();
    let direction = '';
    let next = null;
    if (nextData) {
      direction = nextData.direction;
      next = nextData.cell;
    }
    let nextCount = 0;
    if (nextData) {
      nextCount++;
      while(nextData) {
        nextCount++;

        this.stack.push(current);
        const child = this.buildTree(next);
        child.direction = direction;
        children.push(child); 
  
        nextData = current.choosePathGraph();
        if (nextData) {
          direction = nextData.direction;
        next = nextData.cell;
        }
      }
      
      if (children.length >= 2) {
        current.isNode = true;
        this.nodes++;
        for (const child of children) {
          const [rowNum, colNum] = child.coords;
          this.grid[rowNum][colNum].parent = [current.rowNum, current.colNum];
        }
        current.children = children;
      }
    }
    
    if (nextCount === 0) {
      current.isNode = true;
      this.nodes++;
    }
    
    if (this.stack.length > 0) {
      if (this.stack.length > this.endDepth) {
        if (this.end) {
          const [ oldEndRow, oldEndCol ] = this.end;
          this.grid[oldEndRow][oldEndCol].isEnd = false;
        }

        this.end = [current.rowNum, current.colNum];
        this.endDepth = this.stack.length;
        current.isEnd = true;
      }
      this.stack.pop();
      if (!current.isNode) {
        const child = children[0];
        child.route += 1;
        return child;
      } else {
        return {
          route: 1,
          coords: [current.rowNum, current.colNum],
        }
      }
    }

    if (this.stack.length === 0) {
      const child = children[0];
      child.route += 1;
      current.children.push(child);
      current.depth = 0;
      const [chRowNum, chColNum] = child.coords;
      this.grid[chRowNum][chColNum].parent = [current.rowNum, current.colNum];

      const queue = [current];

      while (queue.length > 0) {
        const curChildren = queue[0].children;
        if (curChildren.length > 0) {
          for (const child of curChildren) {
            
            const [chRowNum, chColNum] = child.coords;
            const [pRowNum, pColNum] = this.grid[chRowNum][chColNum].parent;
            
            const childMain = this.grid[chRowNum][chColNum];
            const parentMain =  this.grid[pRowNum][pColNum];
            childMain.depth = parentMain.depth + 1;
            queue.push(this.grid[chRowNum][chColNum]);
          }
        }
        queue.shift();
      }
      return this;
    }
  }

};

class Cell {
  constructor(rowNum, colNum, parentGrid) {
    this.rowNum = rowNum;
    this.colNum = colNum;
    this.parentGrid = parentGrid;
    this.visitedMaze = false;
    this.visitedTree = false;
    this.isStart = false;
    this.isEnd = false;

    this.neighbours = {
      top: null,
      right: null,
      bottom: null,
      left: null,
    }

    this.children = [];

  }

  choosePathMaze() {
    const grid = this.parentGrid;
    const row = this.rowNum;
    const col = this.colNum;
    const neighbours = [];

    const top = row !== 1 ? grid[row - 2][col] : undefined;
    const right = col !== grid[0].length - 2 ? grid[row][col + 2] : undefined;
    const bottom = row !== grid.length - 2 ? grid[row + 2][col] : undefined;
    const left = col !== 1 ? grid[row][col - 2] : undefined;
  
    if (top && !top.visitedMaze) neighbours.push(top);
    if (right && !right.visitedMaze) neighbours.push(right);
    if (bottom && !bottom.visitedMaze) neighbours.push(bottom);
    if (left && !left.visitedMaze) neighbours.push(left);

    if (neighbours.length > 0) {
      const randIndex = Math.floor(Math.random() * neighbours.length);
      return neighbours[randIndex];
    } else {
      return undefined;
    }
  }

  choosePathGraph() {
    const grid = this.parentGrid;
    const row = this.rowNum;
    const col = this.colNum;
    const paths = {
      top: null,
      right: null,
      bottom: null,
      left: null,
    };

    const result = [];

    if(!this.isStart) {
      paths.top = row !== 1 ? grid[row - 1][col] : undefined;
      paths.right = col !== grid[0].length - 2 ? grid[row][col + 1] : undefined;
      paths.left = col !== 1 ? grid[row][col - 1] : undefined;
    }
    paths.bottom = row !== grid.length - 2 ? grid[row + 1][col] : undefined;
  
    if (paths.top && !paths.top.isWall && !paths.top.visitedGraph) {
      result.push({
        cell: paths.top,
        direction: 'top',
      });
    }
    if (paths.right && !paths.right.isWall && !paths.right.visitedGraph) {
      result.push({
        cell: paths.right,
        direction: 'right',
      });
    }
    if (paths.bottom && !paths.bottom.isWall && !paths.bottom.visitedGraph) {
      result.push({
        cell: paths.bottom,
        direction: 'bottom',
      });
    }
    if (paths.left && !paths.left.isWall && !paths.left.visitedGraph) {
      result.push({
        cell: paths.left,
        direction: 'left',
      });
    }

    if (result.length > 0) {
      const randIndex = Math.floor(Math.random() * result.length);
      return result[randIndex];
    } else {
      return null;
    }
  }

  removeWall(next) {
    const colDiff = this.colNum - next.colNum;

    if (colDiff === 2) {
      const newCellRow = this.rowNum;
      const newCellCol = this.colNum - 1;

      this.parentGrid[newCellRow][newCellCol] = new Cell(newCellRow, newCellCol, this.parentGrid);
      const newCell = this.parentGrid[newCellRow][newCellCol];
      newCell.visitedMaze = true;
      
      this.neighbours.left = newCell;
      newCell.neighbours.right = this;
      newCell.neighbours.left = next;
      next.neighbours.right = newCell;
    } else if (colDiff === -2) {
      const newCellRow = this.rowNum;
      const newCellCol = this.colNum + 1;

      this.parentGrid[newCellRow][newCellCol] = new Cell(newCellRow, newCellCol, this.parentGrid);
      const newCell = this.parentGrid[newCellRow][newCellCol];
      newCell.visitedMaze = true;

      this.neighbours.right = newCell;
      newCell.neighbours.left = this;
      newCell.neighbours.right = next;
      next.neighbours.left = newCell;
    }

    const rowDiff = this.rowNum - next.rowNum;

    if (rowDiff === -2) {
      const newCellRow = this.rowNum + 1;
      const newCellCol = this.colNum;

      this.parentGrid[newCellRow][newCellCol] = new Cell(newCellRow, newCellCol, this.parentGrid);

      const newCell = this.parentGrid[newCellRow][newCellCol];
      newCell.visitedMaze = true;

      this.neighbours.bottom = newCell;
      newCell.neighbours.top = this;
      newCell.neighbours.bottom = next;
      next.neighbours.top = newCell;
    } else if (rowDiff === 2) {
      const newCellRow = this.rowNum - 1;
      const newCellCol = this.colNum;

      this.parentGrid[newCellRow][newCellCol] = new Cell(newCellRow, newCellCol, this.parentGrid);

      const newCell = this.parentGrid[newCellRow][newCellCol];
      newCell.visitedMaze = true;

      this.neighbours.top = newCell;
      newCell.neighbours.bottom = this;
      newCell.neighbours.top = next;
      next.neighbours.bottom = newCell;
    }
  }
};

class SquareMazeGenerator extends MazeGenerator {
  constructor(size) {
    super(size, size);
  }

  serialize() {
    const maze = this.grid;

    const gridHeight = 2 * this.rows + 1;
    const gridWidth = gridHeight;

    const mazeData = {
      grid: [],
      cellStart: [],
      cellEnd: [],
      nodesCount: this.nodes,
    };

    for (let i = 0; i < gridHeight; i++) {
      const row = [];
      let rowLog = '';
      for (let j = 0; j < gridWidth; j++) {
        const cell = maze[i][j];

        if (cell.isWall) {
          row.push({
            coords: [cell.rowNum, cell.colNum],
            isWall: true,
          });
        } else {
          const way = {};

          const neighbours = {
            top: false,
            right: false,
            bottom: false,
            left: false,
          };
          const neighboursKeys = Object.keys(cell.neighbours);
          
          for (const key of neighboursKeys) {
            if (cell.neighbours[key]) {
              neighbours[key] = true;
            }
          }
          
          way.neighbours = neighbours;
          way.coords = [cell.rowNum, cell.colNum];
          if (cell.children.length > 0) {
            way.children = cell.children;
          } else {
            way.children = null;
          }
          if (cell.isNode) {
            way.isNode = true;
          }

          way.parent = cell.parent;
          way.depth = cell.depth;

          row.push(way);
        }
    
      }
      mazeData.grid.push(row);
    }

    mazeData.cellStart = this.start;
    mazeData.cellEnd = this.end;
    
    return mazeData;
  }

}

class Wall {
  constructor(rowNum, colNum, parentGrid) {
    this.rowNum = rowNum;
    this.colNum = colNum;
    this.parentGrid = parentGrid;
    this.isWall = true;
  }
};

module.exports = {
  MazeGenerator,
  SquareMazeGenerator,
}
