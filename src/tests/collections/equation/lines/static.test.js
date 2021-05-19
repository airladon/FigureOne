import { staticTester } from '../../../staticTester';

const {
  getShapes, updates, getValues, move,
} = require('./static');

staticTester('Collection: Equation - Lines', getShapes, updates, getValues, move);
