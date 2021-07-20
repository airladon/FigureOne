import * as tools from '../../../tools/tools';
import {
  Point,
} from '../../../tools/g2';
import makeFigure from '../../../__mocks__/makeFigure';

tools.isTouchDevice = jest.fn();

const point = (x, y, z) => new Point(x, y, z);
describe('Figure', () => {
  test('Figure To GL - Ortho, square', () => {
    const figure = makeFigure(
      [0, 0, 100, 100],
      {
        left: -1, bottom: -1, right: 1, top: 1,
      },
    );
    figure.scene.setCamera({ position: [0, 0, 2], lookAt: [0, 0], up: [0, 1, 0] });
    figure.scene.setProjection({
      type: 'orthographic', near: 1, far: 3, left: -1, right: 1, bottom: -1, top: 1,
    });
    const mat = figure.spaceTransformMatrix('figure', 'gl');
    expect(point(0, 0, 0).transformBy(mat)).toEqual(point(0, 0, 0));
    expect(point(1, 0, 0).transformBy(mat)).toEqual(point(1, 0, 0));
    expect(point(1, 1, 1).transformBy(mat)).toEqual(point(1, 1, -1));
    expect(point(-1, -1, -1).transformBy(mat)).toEqual(point(-1, -1, 1));
  });
  test('Figure To GL - Ortho, rectangle', () => {
    const figure = makeFigure(
      [0, 0, 200, 100],
      {
        left: -2, bottom: -1, right: 2, top: 1,
      },
    );
    // const figure = makeFigure([0, 0, 200, 100], [-2, -1, 4, 2]);
    figure.scene.setCamera({ position: [0, 0, 2], lookAt: [0, 0], up: [0, 1, 0] });
    figure.scene.setProjection({
      type: 'orthographic', near: 1, far: 3, left: -2, right: 2, bottom: -1, top: 1,
    });
    const mat = figure.spaceTransformMatrix('figure', 'gl');
    expect(point(0, 0, 0).transformBy(mat)).toEqual(point(0, 0, 0));
    expect(point(1, 0, 0).transformBy(mat)).toEqual(point(0.5, 0, 0));
    expect(point(1, 1, 1).transformBy(mat)).toEqual(point(0.5, 1, -1));
    expect(point(-1, -1, -1).transformBy(mat)).toEqual(point(-0.5, -1, 1));
  });
  test('Figure To Pixel - Ortho, square', () => {
    // const figure = makeFigure([0, 0, 100, 100], [-1, -1, 2, 2]);
    const figure = makeFigure(
      [0, 0, 100, 100],
      {
        left: -1, bottom: -1, right: 1, top: 1,
      },
    );
    figure.scene.setCamera({ position: [0, 0, 2], lookAt: [0, 0], up: [0, 1, 0] });
    figure.scene.setProjection({
      type: 'orthographic', near: 1, far: 3, left: -1, right: 1, bottom: -1, top: 1,
    });
    const mat = figure.spaceTransformMatrix('figure', 'pixel');
    expect(point(0, 0, 0).transformBy(mat)).toEqual(point(50, 50, 0));
    expect(point(1, 0, 0).transformBy(mat)).toEqual(point(100, 50, 0));
    expect(point(1, 1, 0).transformBy(mat)).toEqual(point(100, 0, 0));
    expect(point(-1, -1, 0).transformBy(mat)).toEqual(point(0, 100, 0));
  });
  test('Figure To Pixel - Ortho, rectangle', () => {
    // const figure = makeFigure([0, 0, 200, 100], [-2, -1, 4, 2]);
    const figure = makeFigure(
      [0, 0, 200, 100],
      {
        left: -2, bottom: -1, right: 2, top: 1,
      },
    );
    figure.scene.setCamera({ position: [0, 0, 2], lookAt: [0, 0], up: [0, 1, 0] });
    figure.scene.setProjection({
      type: 'orthographic', near: 1, far: 3, left: -2, right: 2, bottom: -1, top: 1,
    });
    const mat = figure.spaceTransformMatrix('figure', 'pixel');
    expect(point(0, 0, 0).transformBy(mat)).toEqual(point(100, 50, 0));
    expect(point(2, 0, 0).transformBy(mat)).toEqual(point(200, 50, 0));
    expect(point(2, 1, 0).transformBy(mat)).toEqual(point(200, 0, 0));
    expect(point(-2, -1, 0).transformBy(mat)).toEqual(point(0, 100, 0));
  });
  test('Figure To Pixel - Ortho, square, camera rotation around y', () => {
    // const figure = makeFigure([0, 0, 100, 100], [-1, -1, 2, 2]);
    const figure = makeFigure(
      [0, 0, 100, 100],
      {
        left: -1, bottom: -1, right: 1, top: 1,
      },
    );
    figure.scene.setCamera({ position: [2, 0, 2], lookAt: [0, 0], up: [0, 1, 0] });
    figure.scene.setProjection({
      type: 'orthographic', near: 1, far: 3, left: -1, right: 1, bottom: -1, top: 1,
    });
    const mat = figure.spaceTransformMatrix('figure', 'pixel');
    expect(point(0, 0, 0).transformBy(mat)).toEqual(point(50, 50, 0));
    expect(point(1, 0, 0).transformBy(mat)).toEqual(point(50 + 50 * Math.cos(Math.PI / 4), 50, 0).round());
    expect(point(1, 1, 0).transformBy(mat)).toEqual(point(50 + 50 * Math.cos(Math.PI / 4), 0, 0).round());
  });
});
