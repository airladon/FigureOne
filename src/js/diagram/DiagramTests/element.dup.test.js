// import {
//   Point, rectToPolar,
// } from '../../tools/g2';
// import {
//   round,
// } from '../../tools/math';
import makeDiagram from '../../__mocks__/makeDiagram';

jest.useFakeTimers();

describe('Move Freely', () => {
  let diagram;
  // let a;
  beforeEach(() => {
    diagram = makeDiagram();
    diagram.addElements([
      {
        name: 'primitive',
        method: 'polygon',
      },
      {
        name: 'polyline',
        method: 'polyline',
      },
      {
        name: 'line',
        method: 'line',
      },
      {
        name: 'angle',
        method: 'angle',
      },
    ]);
    diagram.initialize();
  });
  test('Primitive', () => {
    const dup = diagram.elements._primitive._dup();
    expect(dup).not.toEqual(null);
  });
  test('Polyline', () => {
    const dup = diagram.elements._polyline._dup();
    expect(dup).not.toEqual(null);
  });
  test('line', () => {
    const dup = diagram.elements._line._dup();
    expect(dup).not.toEqual(null);
  });
  test('angle', () => {
    const dup = diagram.elements._angle._dup();
    expect(dup).not.toEqual(null);
  });
  test('Collection', () => {
    const dup = diagram.elements._dup();
    expect(dup).not.toEqual(null);
  });
});
