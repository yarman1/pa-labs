'use strict';

const fs = require('fs');
const { serializeMazeData } = require('../helpers/serialization');
const { rbfs } = require('../algorithms/better-rbfs');

// the size of the generated maze will be 2n + 1
const N_PARAMETER = 10;
const MAZE_AMOUNT = 20;

serializeMazeData(MAZE_AMOUNT, N_PARAMETER);

const mazeArrayJSON = fs.readFileSync('maze-data.json');
const mazeArray = JSON.parse(mazeArrayJSON);
for (let i = 0; i < MAZE_AMOUNT; i++) {
  console.log(i + 1);
  const maze = mazeArray[i];

  rbfs(maze);
};
