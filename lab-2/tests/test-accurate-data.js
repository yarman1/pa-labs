'use strict';

const fs = require('fs');
const assert = require('assert');
const path = require('path');

const { ids } = require('../algorithms/ids');
const { rbfs } = require('../algorithms/rbfs');

const MAZE_RESULTS_IDS = {
  startStates: 22,
  iterations: 9,
  deadEnds: 23,
  allStates: 73,
  statesInMemory: 75,
};

const MAZE_RESULTS_RBFS = {
  startStates: 22,
  iterations: 23,
  deadEnds: 7,
  allStates: 16,
  statesInMemory: 30,
};

{
  console.log('IDS')
  const mazeArrayJSON = fs.readFileSync(path.resolve('tests/test-data.json'));
  const mazeArray = JSON.parse(mazeArrayJSON);

  let errorFlag = false;

  const mazeWithPath = mazeArray[1];

  const result = ids(mazeWithPath);
  try {
    assert.deepStrictEqual(result.analyzeData, MAZE_RESULTS_IDS)
  } catch (err) {
    console.log(err.message);
    errorFlag = true;
  }

  if (!errorFlag) {
    console.log('Test passed succesfully!');
  } else {
    console.log('Test failed!');
  }

  console.log('\n');
}

{
  console.log('RBFS')
  const mazeArrayJSON = fs.readFileSync(path.resolve('tests/test-data.json'));
  const mazeArray = JSON.parse(mazeArrayJSON);

  let errorFlag = false;

  const mazeWithPath = mazeArray[1];

  const result = rbfs(mazeWithPath);
  try {
    assert.deepStrictEqual(result.analyzeData, MAZE_RESULTS_RBFS)
  } catch (err) {
    console.log(err.message);
    errorFlag = true;
  }

  if (!errorFlag) {
    console.log('Test passed succesfully!');
  } else {
    console.log('Test failed!');
  }
}
