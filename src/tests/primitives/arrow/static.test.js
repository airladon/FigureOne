import { staticTester } from '../../staticTester';

const {
  getShapes, updates, getValues, move,
} = require('./static.js');

staticTester('Collection: Arrow - Static', getShapes, updates, getValues, move);
