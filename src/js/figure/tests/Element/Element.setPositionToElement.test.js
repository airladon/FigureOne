import {
  Point,
} from '../../../tools/g2';
import * as tools from '../../../tools/tools';
import makeFigure from '../../../__mocks__/makeFigure';

tools.isTouchDevice = jest.fn();

describe('Figure Recorder', () => {
  let figure;
  let a;
  let aa;
  let b;
  let bb;
  // let c;
  beforeEach(() => {
    jest.useFakeTimers();
    figure = makeFigure();
    figure.addElements([
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
    // figure.initialize();
    a = figure.getElement('a');
    aa = figure.getElement('a.a');
    b = figure.getElement('b');
    bb = figure.getElement('b.b');

    a.setPosition(0, 1);
    b.setPosition(0, -1);
    aa.setPosition(0, 1);
    bb.setPosition(0, -1);
    figure.mock.timeStep(0);
  });
  test('check', () => {
    expect(a.getPosition('figure')).toEqual(new Point(0, 1));
    expect(aa.getPosition('figure')).toEqual(new Point(0, 2));
    expect(b.getPosition('figure')).toEqual(new Point(0, -1));
    expect(bb.getPosition('figure')).toEqual(new Point(0, -2));
    expect(a.getPosition('local')).toEqual(new Point(0, 1));
    expect(aa.getPosition('local')).toEqual(new Point(0, 1));
    expect(b.getPosition('local')).toEqual(new Point(0, -1));
    expect(bb.getPosition('local')).toEqual(new Point(0, -1));
  });
  test('local - collection', () => {
    a.setPositionToElement(b, 'local');
    figure.mock.timeStep(0);
    expect(a.getPosition()).toEqual(new Point(0, -1));
    expect(a.getPosition('figure')).toEqual(new Point(0, -1));
  });
  test('local - primitive', () => {
    aa.setPositionToElement(bb, 'local');
    figure.mock.timeStep(0);
    expect(aa.getPosition()).toEqual(new Point(0, -3));
    expect(aa.getPosition('figure')).toEqual(new Point(0, -2));
  });
  test('figure - primitive', () => {
    aa.setPositionToElement(bb, 'figure');
    figure.mock.timeStep(0);
    expect(aa.getPosition()).toEqual(new Point(0, -3));
    expect(aa.getPosition('figure')).toEqual(new Point(0, -2));
  });
});
