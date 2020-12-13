import { testAnimation } from '../../../tools';

const { getShapes, updates } = require('./animations.js');

testAnimation('Collection: Line', getShapes, updates);
