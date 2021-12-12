import { staticTester } from '../../../staticTester';

const { getShapes, updates } = require('./animations');

staticTester('Collection: Equation Color - Animations', getShapes, updates);
