'use strict';

const { square } = require('./helpers');

const euclidWay = (mazeData, node) => {
  const endCoords = mazeData.cellEnd;
  const curCoords = node.coords;

  const [ endRowNum, endColNum ] = endCoords;
  const [ curRowNum, curColNum ] = curCoords;

  const rowDiff = endRowNum > curRowNum ? endRowNum - curRowNum : curRowNum - endRowNum;
  const colDiff = endColNum > curColNum ? endColNum - curColNum : curColNum - endColNum;

  const squareSum = square(rowDiff) + square(colDiff)
  const result = Math.sqrt(squareSum);
  return result;
};

const passedWay = (mazeData, node) => {
  let passed = 0;
  let current = node;
  let parentCoords = current.parent;
  let parent = null;
  if (parentCoords) {
    parent = mazeData.grid[parentCoords[0]][parentCoords[1]];
  }

  while(parentCoords) {
    const curChildInfo = parent.children.filter(x => {
      return x.coords[0] === current.coords[0] && 
      x.coords[1] === current.coords[1];
    })[0];

    passed += curChildInfo.route;
    current = parent;
    parentCoords = current.parent;
    if (parentCoords) {
      parent = mazeData.grid[parentCoords[0]][parentCoords[1]];
    }
  }

  return passed;
};

const heuristic = (mazeData, node) => euclidWay(mazeData, node) + passedWay(mazeData, node);

module.exports = {
  heuristic,
};
