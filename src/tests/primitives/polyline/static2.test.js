import { staticTester } from '../../staticTester';

const {
  getShapes, updates, getValues, move,
} = require('./static2.js');

staticTester('Collection: Angle - Static', getShapes, updates, getValues, move);
