import { staticTester } from '../../staticTester';

const {
  getShapes, updates, getValues, move,
} = require('./static');

staticTester('Collection: Angle - Static', getShapes, updates, getValues, move);
