import { staticTester } from '../../staticTester';

const {
  getShapes, updates, getValues, move,
} = require('./static');

staticTester('3D Touch', getShapes, updates, getValues, move);
