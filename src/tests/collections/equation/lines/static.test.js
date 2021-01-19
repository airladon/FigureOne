import { staticTester } from '../../../staticTester';

const {
  getShapes, updates, getValues, move,
} = require('./static.js');

staticTester('Collection: Equation - Lines', getShapes, updates, getValues, move);
