// import {
//   Point, rectToPolar,
// } from '../../tools/g2';
// import {
//   round,
// } from '../../tools/math';
import makeFigure from '../../../__mocks__/makeFigure';

jest.useFakeTimers();

describe('Move Freely', () => {
  let figure;
  // let a;
  beforeEach(() => {
    figure = makeFigure();
    figure.add([
      {
        name: 'primitive',
        make: 'polygon',
      },
      {
        name: 'polyline',
        make: 'opolyline',
      },
      {
        name: 'line',
        make: 'oline',
      },
      {
        name: 'angle',
        make: 'angle',
      },
    ]);
    figure.initialize();
  });
  test('Primitive', () => {
    const dup = figure.elements._primitive._dup();
    expect(dup).not.toEqual(null);
  });
  test('Polyline', () => {
    const dup = figure.elements._polyline._dup();
    expect(dup).not.toEqual(null);
  });
  test('line', () => {
    const dup = figure.elements._line._dup();
    expect(dup).not.toEqual(null);
  });
  test('angle', () => {
    const dup = figure.elements._angle._dup();
    expect(dup).not.toEqual(null);
  });
  test('Collection', () => {
    const dup = figure.elements._dup();
    expect(dup).not.toEqual(null);
  });
});
