'use strict';

const { showMaze, drawWay } = require('../helpers/serialization');

const { heuristic } = require('../helpers/heuristic');

const MARKERS = {
  failure: 1,
  success: 2,
};

//RBFS modified algorithm

const rbfsRecursive = (mazeData, node, limit, analyzeData) => {
  analyzeData.iterations += 1;

  let succesors = [];

  const [ curRowNum, curColNum ] = node.coords;
  const [ solRowNum, solColNum ] = mazeData.cellEnd;

  if (!node.uniqVisited) {
    analyzeData.allStates += 1;
  }
  node.uniqVisited = 1;

  if (curRowNum === solRowNum && curColNum === solColNum) {
    return {
      marker: MARKERS.success,
    }
  }

  if (!node.children) {
    analyzeData.deadEnds += 1;

    return {
      marker: MARKERS.failure,
      limit: Infinity,
    }
  }

  for (const child of node.children) {
    const [ chRowNum, chColNum ] = child.coords;
    const childCell = mazeData.grid[chRowNum][chColNum];

    if (!childCell.heuristicValue) {
      childCell.heuristicValue = heuristic(mazeData, childCell);
    }

    succesors.push({
      cell: childCell,
      childInfo: child,
    });

    analyzeData.statesInMemory += 1;
  }

  while(true) {
    succesors.sort((a, b) => a.cell.heuristicValue - b.cell.heuristicValue);
    
    const best = succesors[0];
    const bestCell = best.cell;

    if (best.heuristicValue > limit) {
      return {
        marker: MARKERS.failure,
        limit: best.heuristicValue,
      };
    }

    const alternativeSuccesor = succesors[1];

    let newLimit = 0;
    if (alternativeSuccesor) {
      const alternativeLimit = alternativeSuccesor.cell.heuristicValue;
      newLimit = Math.min(alternativeLimit, limit);
    } else {
      newLimit = limit;
    }

    drawWay(mazeData, node, best.childInfo);
    const result = rbfsRecursive(mazeData, bestCell, newLimit, analyzeData);
    if (result.marker !== MARKERS.failure) {
      return result;
    }

    bestCell.heuristicValue = result.limit;

    const availableWays = succesors.filter((x) => x.cell.heuristicValue != Infinity);
    if (availableWays.length === 0) {
      return {
        marker: MARKERS.failure,
        limit: Infinity,
      };
    }
  }
};

const rbfs = (mazeData) => {
  const analyzeData = {
    startStates: mazeData.nodesCount,
    iterations: 0,
    deadEnds: 0,
    allStates: 0,
    statesInMemory: 1,
  };

  const [ startRowNum, startColNum ] = mazeData.cellStart;
  const startNode = mazeData.grid[startRowNum][startColNum];

  const result = rbfsRecursive(mazeData, startNode, Infinity, analyzeData);

  showMaze(mazeData);
  console.table(analyzeData);

  return result;
};

//end RBFS modified algorithm

module.exports = {
  rbfs,
};
