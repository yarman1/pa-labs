'use strict';

const { drawWay, showMaze } = require('../helpers/serialization');

const MARKERS = {
  cutoff: 1,
  failure: 2,
  success: 3,
  deadEnd: 4,
};

//IDS algorithm

const recursiveDLS = function(node, mazeData, limit, analyzeData) {
  const [ curRowNum, curColNum ] = node.coords;
  const [ solRowNum, solColNum ] = mazeData.cellEnd;

  analyzeData.allStates += 1;

  if (curRowNum === solRowNum && curColNum === solColNum) {
    return {
      marker: MARKERS.success,
    }
  } else if (node.depth === limit) {
    return {
      marker: MARKERS.cutoff,
    }
  }

  if (node.children) {
    analyzeData.statesInMemory += node.children.length;
    for (const child of node.children) {
      drawWay(mazeData, node, child);

      const [ chRowNum, chColNum ] = child.coords;
      const childCell = mazeData.grid[chRowNum][chColNum];
      const childResult = recursiveDLS(childCell, mazeData, limit, analyzeData);

      if (childResult.marker === MARKERS.success) {
        return {
          marker: MARKERS.success,
        }
      }

      if (childResult.marker === MARKERS.cutoff) {
        return {
          marker: MARKERS.cutoff,
        }
      }
    }

    return {
      marker: MARKERS.failure,
    }
  }

  analyzeData.deadEnds += 1;
  return {
    marker: MARKERS.failure,
  }
  
};

const dls = function(mazeData, limit, analyzeData) {
  const startCoords = mazeData.cellStart;
  const [ startRow, startCol ] = startCoords;
  const startNode = mazeData.grid[startRow][startCol];

  return recursiveDLS(startNode, mazeData, limit, analyzeData);
};

const ids = function(mazeData) {
  const analyzeData = {
    startStates: mazeData.nodesCount,
    iterations: 0,
    deadEnds: 0,
    allStates: 0,
    statesInMemory: 1,
  };

  let depth = 0;
  let result = null;
  do {
    result = dls(mazeData, depth, analyzeData);
    depth += 1;
    analyzeData.iterations += 1;
  } while (result.marker != MARKERS.success && result.marker != MARKERS.failure)

  showMaze(mazeData);
  console.table(analyzeData);

  return {
    result,
    analyzeData,
  };
};

//end IDS algorithm

module.exports = {
  ids,
};
