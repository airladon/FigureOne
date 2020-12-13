import { staticTester } from '../../staticTester';

const { getShapes, updates, getValues, move } = require('./static.js');

staticTester('Collection: Line - Static', getShapes, updates, getValues, move);
