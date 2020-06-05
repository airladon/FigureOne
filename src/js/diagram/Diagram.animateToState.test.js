import {
  Point, Transform,
} from '../tools/g2';
import {
  round,
} from '../tools/math';
import * as tools from '../tools/tools';
import makeDiagram from '../__mocks__/makeDiagram';

tools.isTouchDevice = jest.fn();

jest.mock('./recorder.worker');

describe('Diagram Recorder', () => {
  let diagram;
  let p1;
  let p2;
  let p3;
  let c;
  beforeEach(() => {
    diagram = makeDiagram();
    diagram.addElements([
      {
        name: 'c',
        method: 'collection',
        addElements: [
          {
            name: 'p2',
            method: 'polygon',
          },
          {
            name: 'p3',
            method: 'polygon',
            mods: {
              transformUpdatesIndependantly: false,
            },
          },
        ],
      },
      {
        name: 'p1',
        method: 'polygon',
      }
    ]);
    c = diagram.elements._c;
    p1 = diagram.elements._p1;
    p2 = c._p2;
    p3 = c._p3;
    p2.setTransformCallback = () => {
      p3.setPosition(p2.getPosition());
    };
    diagram.initialize();
  });
  test('Simple', () => {
    p1.setPosition(2, 2);
    p2.setPosition(1, 1);
    c.setPosition(1, 1);
    diagram.setFirstTransform();
    expect(p1.getPosition('diagram').round(3)).toEqual(new Point(2, 2));
    expect(p2.getPosition('diagram').round(3)).toEqual(new Point(2, 2));
    expect(p3.getPosition('diagram').round(3)).toEqual(new Point(2, 2));
    expect(c.getPosition('diagram').round(3)).toEqual(new Point(1, 1));
    const state = diagram.getState();
    p1.setPosition(0, 0);
    p2.setPosition(0, 0);
    c.setPosition(0, 0);
    diagram.setFirstTransform();
    diagram.animateToState(state, { duration: 1 });
    diagram.draw(0);
    diagram.draw(0.5);
    expect(p1.getPosition('diagram').round(3)).toEqual(new Point(1, 1));
    expect(p2.getPosition('diagram').round(3)).toEqual(new Point(1, 1));
    expect(p3.getPosition('diagram').round(3)).toEqual(new Point(1, 1));
    expect(c.getPosition('diagram').round(3)).toEqual(new Point(0.5, 0.5));

  });
});
