'use strict';

const fs = require('fs');

const { COLORS } = require('../constants/constants');

const { MazeGenerator, SquareMazeGenerator } = require('./maze-generator');

const DIRECTION_DATA = {
  top: {
    step: -1,
    axis: 'row',
    opose: 'bottom',
  },
  right: {
    step: 1,
    axis: 'col',
    opose: 'left',
  },
  bottom: {
    step: 1,
    axis: 'row',
    opose: 'top',
  },
  left: {
    step: -1,
    axis: 'col',
    opose: 'right',
  },
};

const showMaze = (mazeData) => {
  const sideLength = mazeData.grid.length;

  for (let i = 0; i < sideLength; i++) {
    let rowLog = '';
    for (let j = 0; j < sideLength; j++) {
      const cell = mazeData.grid[i][j];
      if (cell.isWall) {
        rowLog += COLORS.walls + '1' + COLORS.default;
      } else {
        if (cell.coords[0] === mazeData.cellEnd[0] &&
          cell.coords[1] === mazeData.cellEnd[1]) {
          rowLog += COLORS.end + '0' + COLORS.default;
        } else if (cell.coords[0] === mazeData.cellStart[0] &&
          cell.coords[1] === mazeData.cellStart[1]) {
          rowLog += COLORS.start + '0' + COLORS.default;
        }else if (cell.isVisited) {
          rowLog += COLORS.way + '0' + COLORS.default;
        } else {
          rowLog += COLORS.path + '0' + COLORS.default;
        }
      }
    }
    console.log(rowLog);
  }

};

const drawWay = (mazeData, parentNode, childInfo) => {
  const wayDirection = childInfo.direction;
  const [ chRowNum, chColNum ] = childInfo.coords;

  const [ parRowNum, parColNum ] = parentNode.coords;
  const currentCoords = {
    rowNum: parRowNum,
    colNum: parColNum,
  }

  let directionInfo = DIRECTION_DATA[wayDirection];
  currentCoords[directionInfo.axis + 'Num'] += directionInfo.step;

  let currentCell = mazeData.grid[currentCoords.rowNum][currentCoords.colNum];
  if (!currentCell.isVisited) {
    currentCell.isVisited = true;
  }
  let prev = directionInfo.opose;
  let direction = '';
  
  do {
    const directions = Object.keys(DIRECTION_DATA).filter(x => x !== prev);
    do {
      direction = directions.shift();
    } while (currentCell.neighbours[direction] === false)

    directionInfo = DIRECTION_DATA[direction];
    currentCoords[directionInfo.axis + 'Num'] += directionInfo.step;

    currentCell = mazeData.grid[currentCoords.rowNum][currentCoords.colNum];
    currentCell.isVisited = true;
    prev = directionInfo.opose;
  } while (currentCoords.rowNum !== chRowNum || currentCoords.colNum !== chColNum)

};

const serializeMazeData = (amount, mazeRows, mazeColumns) => {
  if (!mazeColumns) {
    mazeColumns = mazeRows;
  }

  const result = [];

  for (let k = 0; k < amount; k++) {
    let mazeGen = null;

    if (mazeRows === mazeColumns) {
      mazeGen = new SquareMazeGenerator(mazeRows);
    } else {
      mazeGen = new MazeGenerator(mazeRows, mazeColumns)
    }

    mazeGen.fill();
    mazeGen.createMaze();
    mazeGen.buildTree();
    const maze = mazeGen.serialize();

    result.push(maze);
  }

  const jsonResult = JSON.stringify(result);
  fs.writeFileSync('maze-data.json', jsonResult);
};

module.exports = {
  showMaze,
  drawWay,
  serializeMazeData,
};
