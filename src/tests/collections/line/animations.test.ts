import { staticTester } from '../../staticTester';

const { getShapes, updates, move } = require('./animations');

staticTester('Collection: Line - Animations', getShapes, updates, move);
