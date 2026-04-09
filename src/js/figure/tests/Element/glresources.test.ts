import makeFigure from '../../../__mocks__/makeFigure';
import * as tools from '../../../tools/tools';

tools.isTouchDevice = jest.fn();

jest.mock('../../Gesture');
jest.mock('../../webgl/webgl');
jest.mock('../../DrawContext2D');

describe('WebGL Resource Tracking', () => {
  let figure;
  let gl;
  let bufferCount: number;

  beforeEach(() => {
    figure = makeFigure();
    gl = figure.webglLow.gl;

    // Replace stub gl methods with resource-tracking versions
    bufferCount = 0;
    let nextBufferId = 1;

    gl.createBuffer = () => {
      bufferCount += 1;
      const id = nextBufferId;
      nextBufferId += 1;
      return { _id: id };
    };
    gl.deleteBuffer = (buf: any) => {
      if (buf != null) {
        bufferCount -= 1;
      }
    };
  });

  const addElements = () => {
    figure.add([
      { name: 'poly', make: 'polygon', options: { sides: 6, radius: 0.3 } },
      { name: 'rect', make: 'rectangle', options: { width: 0.5, height: 0.3 } },
      { name: 'line', make: 'primitives.line', options: { p1: [0, 0], p2: [1, 1], width: 0.01 } },
      {
        name: 'col',
        make: 'collection',
        elements: [
          { name: 'p1', make: 'polygon', options: { radius: 0.2 } },
          { name: 'p2', make: 'rectangle', options: { width: 0.1, height: 0.1 } },
        ],
      },
    ]);
  };

  const removeElements = () => {
    figure.elements.remove('poly');
    figure.elements.remove('rect');
    figure.elements.remove('line');
    figure.elements.remove('col');
  };

  test('Buffer count returns to baseline after add/remove cycle', () => {
    const baseline = bufferCount;

    addElements();
    expect(bufferCount).toBeGreaterThan(baseline);

    removeElements();
    expect(bufferCount).toBe(baseline);
  });

  test('Buffer count stable across multiple add/remove cycles', () => {
    const baseline = bufferCount;

    addElements();
    removeElements();

    addElements();
    removeElements();

    addElements();
    removeElements();

    expect(bufferCount).toBe(baseline);
  });

  test('Buffer count same whether added once or three times', () => {
    addElements();
    const afterFirstAdd = bufferCount;
    removeElements();

    addElements();
    removeElements();
    addElements();
    expect(bufferCount).toBe(afterFirstAdd);
    removeElements();
  });
});
