import { staticTester } from '../../staticTester';

const { getShapes, updates } = require('./move.js');

staticTester('Collection: Line - Move', getShapes, updates);
