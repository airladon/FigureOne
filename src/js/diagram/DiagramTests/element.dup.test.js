import {
  Point, rectToPolar,
} from '../../tools/g2';
import {
  round,
} from '../../tools/math';
import makeDiagram from '../../__mocks__/makeDiagram';

jest.useFakeTimers();

describe('Move Freely', () => {
  let diagram;
  let a;
  beforeEach(() => {
    diagram = makeDiagram();
    diagram.addElements([
      {
        name: 'a',
        method: 'polygon',
        options: {
          radius: 1,
          sides: 4,
        },
      },
    ]);
    diagram.initialize();
  });
  test('Primitive', () => {
    const dup = diagram.elements._a._dup();
    expect(dup).not.toEqual(null);
    // console.log(Object.keys(diagram.elements._a))
  });
});
