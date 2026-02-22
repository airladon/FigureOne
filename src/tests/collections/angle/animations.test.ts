import { staticTester } from '../../staticTester';

const { getShapes, updates } = require('./animations');

staticTester('Collection: Angle - Animations', getShapes, updates);
