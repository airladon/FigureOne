import { staticTester } from '../../staticTester';

const {
  getShapes, updates, getValues, move,
} = require('./static');

staticTester('Collection: Arrow - Static', getShapes, updates, getValues, move);
