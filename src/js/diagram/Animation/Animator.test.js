import Animator from './Animator';
// import {
//   Transform,
// } from '../tools/g2';
import * as tools from '../../tools/tools';
// import * as math from '../../tools/math';
import makeDiagram from '../../__mocks__/makeDiagram';

tools.isTouchDevice = jest.fn();

jest.mock('../Gesture');
jest.mock('../webgl/webgl');
jest.mock('../DrawContext2D');

describe('Animator API', () => {
  let element;
  beforeEach(() => {
    const diagram = makeDiagram();
    element = diagram.objects.line();
    element.transform = element.transform.zero();
  });
  test('Basic', () => {
    const animator = new Animator(element);
    // animator.moveTo({ position: { target: element.transform.one() } })
  });
});
