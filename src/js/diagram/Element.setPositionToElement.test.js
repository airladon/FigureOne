import {
  Point, Transform,
} from '../tools/g2';
import * as tools from '../tools/tools';
import makeDiagram from '../__mocks__/makeDiagram';

tools.isTouchDevice = jest.fn();

describe('Diagram Recorder', () => {
  let diagram;
  let a;
  let aa;
  let b;
  let bb;
  // let c;
  beforeEach(() => {
    jest.useFakeTimers();
    diagram = makeDiagram();
    diagram.addElements([
      {
        name: 'a',
        method: 'collection',
        addElements: [
          {
            name: 'a',
            method: 'polygon',
          },
        ],
      },
      {
        name: 'b',
        method: 'collection',
        addElements: [
          {
            name: 'b',
            method: 'polygon',
          },
        ],
      },
    ]);
    diagram.initialize();
    a = diagram.getElement('a');
    aa = diagram.getElement('a.a');
    b = diagram.getElement('b');
    bb = diagram.getElement('b.b');

    a.setPosition(0, 1);
    b.setPosition(0, -1);
    aa.setPosition(0, 1);
    bb.setPosition(0, -1);
    diagram.mock.timeStep(0);
  });
  test('check', () => {
    expect(a.getPosition('diagram')).toEqual(new Point(0, 1));
    expect(aa.getPosition('diagram')).toEqual(new Point(0, 2));
    expect(b.getPosition('diagram')).toEqual(new Point(0, -1));
    expect(bb.getPosition('diagram')).toEqual(new Point(0, -2));
  });
  test('local - collection', () => {
    a.setPositionToElement(b);
    diagram.mock.timeStep(0);
    expect(a.getPosition()).toEqual(new Point(0, -1));
    expect(a.getPosition('diagram')).toEqual(new Point(0, -1));
  });
  test('local - primitive', () => {
    aa.setPositionToElement(bb);
    diagram.mock.timeStep(0);
    expect(aa.getPosition()).toEqual(new Point(0, -1));
    expect(aa.getPosition('diagram')).toEqual(new Point(0, 0));
  });
  test('diagram - primitive', () => {
    aa.setPositionToElement(bb, 'diagram');
    diagram.mock.timeStep(0);
    expect(aa.getPosition()).toEqual(new Point(0, -3));
    expect(aa.getPosition('diagram')).toEqual(new Point(0, -2));
  });
});
