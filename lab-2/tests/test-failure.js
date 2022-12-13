'use strict'

// test that checks correct handling of mazes which don't have path to the end
const fs = require('fs');
const assert = require('assert');
const path = require('path');

const { ids } = require('../algorithms/ids');
const { rbfs } = require('../algorithms/rbfs');

const MARKERS_IDS = {
  cutoff: 1,
  failure: 2,
  success: 3,
  deadEnd: 4,
};

const MARKERS_RBFS = {
  failure: 1,
  success: 2,
};

const TEST_RESULTS_IDS_FAILURE = {
  marker: MARKERS_IDS.failure,
};

const TEST_RESULTS_IDS_SUCCESS = {
  marker: MARKERS_IDS.success,
};

{
  console.log('IDS')
  //result will be failure because maze doesn't have path to the end
  const mazeArrayJSON = fs.readFileSync(path.resolve('tests/test-data.json'));
  const mazeArray = JSON.parse(mazeArrayJSON);

  const failureMaze = mazeArray[0];
  const mazeWithPath = mazeArray[1];

  const resultFirst = ids(failureMaze);
  try {
    assert.deepStrictEqual(resultFirst.result, TEST_RESULTS_IDS_FAILURE)
  } catch (err) {
    console.log(err.message);
  }

  //result will be success
  const resultSecond = ids(mazeWithPath);
  try {
    assert.deepStrictEqual(resultSecond.result, TEST_RESULTS_IDS_SUCCESS)
  } catch (err) {
    console.log(err.message);
  }
  console.log('\n');
}

const TEST_RESULTS_RBFS_FAILURE = {
  marker: MARKERS_RBFS.failure,
  limit: Infinity,
};

const TEST_RESULTS_RBFS_SUCCESS = {
  marker: MARKERS_RBFS.success,
};

{
  console.log('RBFS');
  //result will be failure because maze doesn't have path to the end
  const mazeArrayJSON = fs.readFileSync(path.resolve('tests/test-data.json'));
  const mazeArray = JSON.parse(mazeArrayJSON);
  
  const failureMaze = mazeArray[0];
  const mazeWithPath = mazeArray[1];
  
  const resultFirst = rbfs(failureMaze);
  try {
    assert.deepStrictEqual(resultFirst.result, TEST_RESULTS_RBFS_FAILURE)
  } catch (err) {
    console.log(err.message);
  }

  //result will be success
  const resultSecond = rbfs(mazeWithPath);
  try {
    assert.deepStrictEqual(resultSecond.result, TEST_RESULTS_RBFS_SUCCESS)
  } catch (err) {
    console.log(err.message);
  }
}

