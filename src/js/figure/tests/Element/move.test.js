/* eslint-disable object-curly-newline, object-property-newline */
// import {
//   Point, Line, // Rect, RectBounds,
// } from '../../../tools/g2';
import {
  round,
} from '../../../tools/math';
import makeFigure from '../../../__mocks__/makeFigure';
import { cube } from '../../../tools/g2';

jest.useFakeTimers();

describe('Element Move', () => {
  let figure;
  let a;
  let move;
  let move3;
  beforeEach(() => {
    figure = makeFigure();
    move = (moveOptions) => {
      a = figure.add({
        name: 'a',
        make: 'polygon',
        radius: 0.5,
        move: moveOptions,
      });
    };
    move3 = (moveOptions, position = [0, 0, 0]) => {
      const [cubeV] = cube({
        side: 0.5,
        position: [0, 0, 0],
      });
      a = figure.add({
        name: 'a',
        make: 'gl',
        vertexShader: { dimension: 3 },
        vertices3: { data: cubeV },
        position,
        move: moveOptions,
      });
    };
  });
  describe('2D', () => {
    test('Simple', () => {
      move(true);
      figure.mock.touchDown([0, 0]);
      figure.mock.touchMove([1, 0]);
      expect(a.getPosition('figure').toArray()).toEqual([1, 0, 0]);
      figure.mock.touchMove([1, 1]);
      expect(a.getPosition('figure').toArray()).toEqual([1, 1, 0]);
      figure.mock.touchMove([-1, -1]);
      expect(a.getPosition('figure').toArray()).toEqual([-1, -1, 0]);
    });
    test('Translation with no bounds', () => {
      move({
        type: 'translation',
      });
      figure.mock.touchDown([0, 0]);
      figure.mock.touchMove([1, 0]);
      expect(a.getPosition('figure').toArray()).toEqual([1, 0, 0]);
      figure.mock.touchMove([1, 1]);
      expect(a.getPosition('figure').toArray()).toEqual([1, 1, 0]);
      figure.mock.touchMove([-1, -1]);
      expect(a.getPosition('figure').toArray()).toEqual([-1, -1, 0]);
    });
    test('Rotation with no bounds', () => {
      move({
        type: 'rotation',
      });
      figure.mock.touchDown([0.4, 0]);
      figure.mock.touchMove([0, 0.4]);
      expect(round(a.getRotation('figure'))).toEqual(round(Math.PI / 2));
      figure.mock.touchMove([0, -0.4]);
      expect(round(a.getRotation('figure'))).toEqual(round(-Math.PI / 2));
      figure.mock.touchMove([-0.4, -0.4]);
      expect(round(a.getRotation('figure'))).toEqual(round(-Math.PI / 4 * 3));
    });
    test('Rotation with bounds', () => {
      move({
        type: 'rotation',
        bounds: { min: -1, max: Math.PI / 2 },
      });
      figure.mock.touchDown([0.4, 0]);
      figure.mock.touchMove([0, 0.4]);
      expect(round(a.getRotation('figure'))).toEqual(round(Math.PI / 2));
      figure.mock.touchMove([-0.1, 0.4]);
      expect(round(a.getRotation('figure'))).toEqual(round(Math.PI / 2));
      figure.mock.touchMove([0.1, 0.4]);
      figure.mock.touchMove([0, -0.4]);
      expect(round(a.getRotation('figure'))).toEqual(round(-1));
      figure.mock.touchMove([-0.4, -0.4]);
      expect(round(a.getRotation('figure'))).toEqual(round(-1));
    });
    test('Scale with no bounds', () => {
      move({
        type: 'scale',
      });
      figure.mock.touchDown([0.25, 0]);
      figure.mock.touchMove([0.5, 0]);
      expect(a.getScale('figure').toArray()).toEqual([2, 2, 2]);
      figure.mock.touchMove([-0.5, 0]);
      expect(a.getScale('figure').toArray()).toEqual([2, 2, 2]);
    });
    test('ScaleX with no bounds', () => {
      move({
        type: 'scaleX',
      });
      figure.mock.touchDown([0.25, 0]);
      figure.mock.touchMove([0.5, 0]);
      expect(a.getScale('figure').toArray()).toEqual([2, 1, 1]);
      figure.mock.touchMove([-0.5, 0]);
      expect(a.getScale('figure').toArray()).toEqual([2, 1, 1]);
    });
    test('ScaleY with no bounds', () => {
      move({
        type: 'scaleY',
      });
      figure.mock.touchDown([0, 0.25]);
      figure.mock.touchMove([0, 0.5]);
      expect(a.getScale('figure').toArray()).toEqual([1, 2, 1]);
      figure.mock.touchMove([0, -0.5]);
      expect(a.getScale('figure').toArray()).toEqual([1, 2, 1]);
    });
    test('Translation with bounds', () => {
      move({
        type: 'translation',
        bounds: { left: 1, bottom: 1, right: 2, top: 2 },
      });
      figure.mock.touchDown([0, 0]);
      figure.mock.touchMove([1, 0]);
      expect(a.getPosition('figure').round().toArray()).toEqual([1, 0, 0]);
      figure.mock.touchMove([3, 0]);
      expect(a.getPosition('figure').round().toArray()).toEqual([2, 0, 0]);
      // Moving back in left direction moves the shape the same delta
      figure.mock.touchMove([2, 0]);
      expect(a.getPosition('figure').round().toArray()).toEqual([1, 0, 0]);
      figure.mock.touchMove([2, -1]);
      expect(a.getPosition('figure').round().toArray()).toEqual([1, -1, 0]);
      figure.mock.touchMove([2, -2]);
      expect(a.getPosition('figure').round().toArray()).toEqual([1, -1, 0]);
      figure.mock.touchMove([2, 0.5]);
      expect(a.getPosition('figure').round().toArray()).toEqual([1, 1.5, 0]);
      figure.mock.touchMove([2, 4]);
      expect(a.getPosition('figure').round().toArray()).toEqual([1, 2, 0]);
      figure.mock.touchMove([0, 4]);
      expect(a.getPosition('figure').round().toArray()).toEqual([-1, 2, 0]);
      figure.mock.touchMove([-1, 4]);
      expect(a.getPosition('figure').round().toArray()).toEqual([-1, 2, 0]);
      figure.mock.touchMove([0, 2]);
      expect(a.getPosition('figure').round().toArray()).toEqual([0, 0, 0]);
    });
  });
  describe('3D', () => {
    test('Translation with no bounds in ZY plane', () => {
      move3({
        type: 'translation',
        plane: [[0, 0, 0], [1, 0, 0]],
      });
      // Need to set scene as otherwise ZY plane is just a line when viewed
      // from +z
      figure.scene.setCamera({ position: [2, 2, 2] });
      figure.scene.setProjection({
        near: 0.1, far: 10, left: -2, right: 2, bottom: -2, top: 2,
      });
      figure.mock.touchElement(a, [0, 0, 0]);
      figure.mock.touchMove([0, 1, 0]);
      expect(a.getPosition('figure').round().toArray()).toEqual([0, 1, 0]);
      figure.mock.touchMove([0, 1, 1]);
      expect(a.getPosition('figure').round().toArray()).toEqual([0, 1, 1]);
      figure.mock.touchMove([0, -10, -1]);
      expect(a.getPosition('figure').round().toArray()).toEqual([0, -10, -1]);
    });
    test('Translation with bounds in XZ with Y offset', () => {
      move3({
        type: 'translation',
        plane: [[0, 1, 0], [0, 1, 0]],
        bounds: {
          left: 1, bottom: 1, right: 2, top: 2,
          rightDirection: [0, 0, -1],
        },
      });
      figure.scene.setCamera({ position: [2, 2, 2] });
      figure.scene.setProjection({
        near: 0.1, far: 10, left: -2, right: 2, bottom: -2, top: 2,
      });
      figure.mock.touchElement(a, [0, 1, 0]);
      figure.mock.touchMove([1, 1, 0]);
      expect(a.getPosition('figure').round().toArray()).toEqual([1, 1, 0]);
      figure.mock.touchMove([2, 1, 0]);
      expect(a.getPosition('figure').round().toArray()).toEqual([1, 1, 0]);
      figure.mock.touchMove([-1, 1, 0]);
      expect(a.getPosition('figure').round().toArray()).toEqual([-2, 1, 0]);
      figure.mock.touchMove([-2, 1, 0]);
      expect(a.getPosition('figure').round().toArray()).toEqual([-2, 1, 0]);
      figure.mock.touchMove([-2, 1, 1]);
      expect(a.getPosition('figure').round().toArray()).toEqual([-2, 1, 1]);
      figure.mock.touchMove([-2, 1, 2]);
      expect(a.getPosition('figure').round().toArray()).toEqual([-2, 1, 1]);
      figure.mock.touchMove([-2, 1, -1]);
      expect(a.getPosition('figure').round().toArray()).toEqual([-2, 1, -2]);
      figure.mock.touchMove([-2, 1, -2]);
      expect(a.getPosition('figure').round().toArray()).toEqual([-2, 1, -2]);
    });
    test('Translation with line bounds', () => {
      move3({
        type: 'translation',
        plane: [[0, 1, 0], [0, 1, 0]],
        bounds: {
          p1: [0, 1, -1],
          p2: [0, 1, 1],
        },
      });
      figure.scene.setCamera({ position: [2, 2, 2] });
      figure.scene.setProjection({
        near: 0.1, far: 10, left: -2, right: 2, bottom: -2, top: 2,
      });
      figure.mock.touchElement(a, [0, 1, 0]);
      figure.mock.touchMove([1, 1, 0]);
      expect(a.getPosition('figure').round().toArray()).toEqual([0, 1, 0]);
      figure.mock.touchMove([1, 1, 0.5]);
      expect(a.getPosition('figure').round().toArray()).toEqual([0, 1, 0.5]);
      figure.mock.touchMove([1, 1, 2]);
      expect(a.getPosition('figure').round().toArray()).toEqual([0, 1, 1]);
      figure.mock.touchMove([-10, 1, -1]);
      expect(a.getPosition('figure').round().toArray()).toEqual([0, 1, -1]);
    });
    test('Rotation with bounds in XZ with Y offset', () => {
      move3({
        type: 'rotation',
        plane: [[0, 1, 0], [0, 1, 0]],
        bounds: { min: -1, max: 1 },
      }, [0, 1, 0]);
      a.transform.updateRotation(0, [0, 1, 0]);
      figure.scene.setCamera({ position: [2, 2, 2] });
      figure.scene.setProjection({
        near: 0.1, far: 10, left: -2, right: 2, bottom: -2, top: 2,
      });
      figure.mock.touchElement(a, [0.4, 1, 0]);
      figure.mock.touchMove([0.4, 1, -0.4]);
      expect(round(a.getRotation())).toEqual(round(Math.PI / 4));
      figure.mock.touchMove([0, 1, -0.4]);
      expect(round(a.getRotation())).toEqual(round(1));
    });
  });
});
describe('Element Move with custom Scene', () => {
  let figure;
  let a;
  let move;
  beforeEach(() => {
    figure = makeFigure({
      scene: {
        left: 1, bottom: 1, right: 3, top: 3,
      },
    });
    move = (moveOptions) => {
      a = figure.add({
        name: 'a',
        make: 'polygon',
        radius: 0.5,
        move: moveOptions,
        position: [2, 2],
      });
    };
  });
  describe('2D', () => {
    test('Rotation with no bounds', () => {
      move({
        type: 'rotation',
      });
      figure.mock.touchDown([2.4, 2]);
      figure.mock.touchMove([2, 2.4]);
      expect(round(a.getRotation('figure'))).toEqual(round(Math.PI / 2));
      figure.mock.touchMove([2, 1.6]);
      expect(round(a.getRotation('figure'))).toEqual(round(-Math.PI / 2));
      figure.mock.touchMove([1.6, 1.6]);
      expect(round(a.getRotation('figure'))).toEqual(round(-Math.PI / 4 * 3));
    });
  });
});
