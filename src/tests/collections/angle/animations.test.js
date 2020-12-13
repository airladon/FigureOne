import { staticTester } from '../../staticTester';

const { getShapes, updates, move } = require('./animations.js');

staticTester('Collection: Angle - Animations', getShapes, updates, move);
