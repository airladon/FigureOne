import { staticTester } from '../../staticTester';

const {
  getShapes, updates, getValues, move,
} = require('./static');

staticTester('Collection: Line - Static', getShapes, updates, getValues, move);
