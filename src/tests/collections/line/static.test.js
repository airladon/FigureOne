import { staticTester } from '../../staticTester';

const { getShapes, updates, getValues } = require('./static.js');

staticTester('Collection: Line - Static', getShapes, updates, getValues);
