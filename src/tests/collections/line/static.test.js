import { staticTester } from '../../staticTester';

const { getShapes, updates } = require('./static.js');

staticTester('Collection: Line - Static', getShapes, updates);
