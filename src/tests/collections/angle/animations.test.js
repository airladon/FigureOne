import { staticTester } from '../../staticTester';

const { getShapes, updates } = require('./animations.js');

staticTester('Collection: Angle - Animations', getShapes, updates);
