import { staticTester } from '../../staticTester';

const { getShapes, updates, move } = require('./animations.js');

staticTester('Collection: Line - Animations', getShapes, updates, move);
