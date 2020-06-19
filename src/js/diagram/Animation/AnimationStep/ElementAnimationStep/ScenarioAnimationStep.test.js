import { Point, Transform } from '../../../../tools/g2';
import { round } from '../../../../tools/math';
import * as tools from '../../../../tools/tools';
import makeDiagram from '../../../../__mocks__/makeDiagram';
// import timeStep from '../../../../__mocks__/timeStep';

// tools.isTouchDevice = jest.fn();

describe('Diagram Recorder', () => {
  let diagram;
  let a;
  beforeEach(() => {
    diagram = makeDiagram();
    diagram.addElements([
      {
        name: 'a',
        method: 'polygon',
        options: {
          color: [1, 0, 0, 1],
        },
      },
    ]);
    diagram.initialize();
    a = diagram.getElement('a');
  });
  test('Simple Position', () => {
    a.animations.new()
      .scenario({ target: { position: [1, 1] }, duration: 1 })
      .start();
    diagram.mock.timeStep(0);
    expect(a.getPosition()).toEqual(new Point(0, 0));
    diagram.mock.timeStep(0.5);
    expect(a.getPosition()).toEqual(new Point(0.5, 0.5));
    diagram.mock.timeStep(1);
    expect(a.getPosition()).toEqual(new Point(1, 1));
  });
  test('Position, Rotation, Scale', () => {
    a.animations.new()
      .scenario({
        target: {
          rotation: 1,
          position: [1, 1],
          scale: [2, 2],
        },
        duration: 1,
      })
      .start();
    diagram.mock.timeStep(0);
    expect(a.getPosition()).toEqual(new Point(0, 0));
    expect(a.getRotation()).toEqual(0);
    expect(a.getScale()).toEqual(new Point(1, 1));
    diagram.mock.timeStep(0.5);
    expect(a.getPosition()).toEqual(new Point(0.5, 0.5));
    expect(a.getRotation()).toEqual(0.5);
    expect(a.getScale()).toEqual(new Point(1.5, 1.5));
    diagram.mock.timeStep(1);
    expect(a.getPosition()).toEqual(new Point(1, 1));
    expect(a.getRotation()).toEqual(1);
    expect(a.getScale()).toEqual(new Point(2, 2));
  });
});
