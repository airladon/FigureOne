import { testElements } from '../../../tools';

const { getShapes, updates } = require('./animations.js');

testElements('Collection: Line', getShapes, updates);
