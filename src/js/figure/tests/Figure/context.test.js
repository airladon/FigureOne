import * as tools from '../../../tools/tools';
import makeFigure from '../../../__mocks__/makeFigure';

tools.isTouchDevice = jest.fn();

jest.useFakeTimers();

describe('Figure context loss', () => {
  let figure;
  let rafSpy;

  beforeEach(() => {
    jest.useFakeTimers();
    rafSpy = jest.spyOn(window, 'requestAnimationFrame').mockImplementation(() => {});
    figure = makeFigure();
  });
  afterEach(() => {
    rafSpy.mockRestore();
  });

  test('adding an element during context loss does not crash', () => {
    // Simulate context loss: getProgram returns -1, useProgram returns null
    figure.webglLow.getProgram = () => -1;
    figure.webglLow.useProgram = () => null;

    // This should not throw — matches the bug scenario where React
    // creates a new FigureOne element while the WebGL context is lost
    expect(() => {
      figure.add({
        name: 'rect',
        make: 'rectangle',
        width: 0.5,
        height: 0.3,
      });
    }).not.toThrow();

    expect(figure.elements._rect).toBeDefined();
  });

  test('drawing after context loss does not crash', () => {
    // Add element normally
    figure.add({
      name: 'rect',
      make: 'rectangle',
      width: 0.5,
      height: 0.3,
    });

    // Simulate context loss
    figure.webglLow.getProgram = () => -1;
    figure.webglLow.useProgram = () => null;

    // Drawing should silently skip the element, not crash
    expect(() => {
      figure.mock.timeStep(0);
    }).not.toThrow();
  });

  test('element works after context is restored', () => {
    // Start with context lost
    figure.webglLow.getProgram = () => -1;
    figure.webglLow.useProgram = () => null;

    // Add element during context loss
    figure.add({
      name: 'rect',
      make: 'rectangle',
      width: 0.5,
      height: 0.3,
    });

    // Draw during context loss — should not crash
    expect(() => {
      figure.mock.timeStep(0);
    }).not.toThrow();

    // Restore context: getProgram returns valid index, useProgram returns locations
    figure.webglLow.getProgram = () => 0;
    figure.webglLow.useProgram = () => ({
      a_vertex: '',
      u_worldViewProjectionMatrix: '',
    });

    // Drawing should work now
    expect(() => {
      figure.mock.timeStep(0.1);
    }).not.toThrow();

    expect(figure.elements._rect).toBeDefined();
  });

  test('adding multiple element types during context loss does not crash', () => {
    // Simulate context loss
    figure.webglLow.getProgram = () => -1;
    figure.webglLow.useProgram = () => null;

    expect(() => {
      figure.add([
        {
          name: 'poly',
          make: 'polygon',
          sides: 6,
          radius: 0.3,
        },
        {
          name: 'rect',
          make: 'rectangle',
          width: 0.5,
          height: 0.3,
        },
        {
          name: 'line',
          make: 'line',
          p1: [0, 0],
          p2: [1, 1],
          width: 0.01,
        },
      ]);
    }).not.toThrow();

    expect(figure.elements._poly).toBeDefined();
    expect(figure.elements._rect).toBeDefined();
    expect(figure.elements._line).toBeDefined();

    // Drawing all of them should not crash
    expect(() => {
      figure.mock.timeStep(0);
    }).not.toThrow();
  });
});
