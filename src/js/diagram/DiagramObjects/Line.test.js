import {
  Point, Transform, Rect,
} from '../../tools/g2';
import {
  round,
} from '../../tools/math';
import * as tools from '../../tools/tools';
import makeDiagram from '../../__mocks__/makeDiagram';

tools.isTouchDevice = jest.fn();

// jest.mock('./recorder.worker');

describe('Advanced line tests', () => {
  let diagram;
  let create;
  let l;
  beforeEach(() => {
    diagram = makeDiagram();
    const diagramOptions = {
      simple: {
        p1: [0, 0],
        p2: [1, 0],
        width: 0.1,
      },
      diagonal: {
        p1: [-1, -1],
        p2: [1, 1],
        width: 0.1,
      },
      alignStart: {
        p1: [0, 0],
        p2: [1, 0],
        width: 0.1,
        align: 'start',
      },
      alignEnd: {
        p1: [0, 0],
        p2: [1, 0],
        width: 0.1,
        align: 'end',
      },
      alignCenter: {
        p1: [0, 0],
        p2: [1, 0],
        width: 0.1,
        align: 'center',
      },
      align25: {
        p1: [0, 0],
        p2: [1, 0],
        width: 0.1,
        align: 0.25,
      },
      lengthAngle: {
        p1: [0, 0],
        length: 1,
        angle: Math.PI / 2,
        width: 0.1,
      },
      touchBorderBorder: {
        p1: [0, 0],
        p2: [1, 0],
        width: 0.1,
        touchBorder: 'border',
      },
      touchBorderNumber: {
        p1: [0, 0],
        p2: [1, 0],
        width: 0.1,
        touchBorder: 0.1,
      },
      touchBorderRect: {
        p1: [0, 0],
        p2: [1, 1],
        width: 0.1,
        touchBorder: 'rect',
      },
      touchBorderCustom: {
        p1: [0, 0],
        p2: [1, 1],
        width: 0.1,
        touchBorder: [[
          [-1, -1],
          [2, -1],
          [2, 1],
          [-1, 1],
        ]],
      },
      arrow: {
        p1: [0, 0],
        p2: [1, 0],
        width: 0.1,
        arrow: {
          head: 'triangle',
          width: 0.2,
          length: 0.2,
        },
        touchBorder: 'rect',
      },
    };
    create = (option) => {
      diagram.addElement({
        name: 'l',
        method: 'advanced.line',
        options: diagramOptions[option],
      });
      l = diagram.getElement('l');
    };
  });
  test('Simple', () => {
    create('simple');
    expect(l.getLength()).toBe(1);
    expect(l.getAngle()).toBe(0);
    expect(l.getP1()).toEqual(new Point(0, 0));
    expect(l.getP2()).toEqual(new Point(1, 0));
  });
  test('Diagonal', () => {
    create('diagonal');
    expect(round(l.getLength(), 3)).toBe(round(2 * Math.sqrt(2), 3));
    expect(round(l.getAngle(), 3)).toBe(round(Math.PI / 4, 3));
    expect(l.getP1()).toEqual(new Point(-1, -1));
    expect(l.getP2()).toEqual(new Point(1, 1));
  });
  test('Align Start', () => {
    create('alignStart');
    l.setLength(2);
    expect(l.getP1().round(3)).toEqual(new Point(0, 0).round(3));
    expect(l.getP2().round(3)).toEqual(new Point(2, 0).round(3));
  });
  test('Align Center', () => {
    create('alignCenter');
    l.setLength(2);
    expect(l.getP1().round(3)).toEqual(new Point(-0.5, 0).round(3));
    expect(l.getP2().round(3)).toEqual(new Point(1.5, 0).round(3));
  });
  test('Align End', () => {
    create('alignEnd');
    l.setLength(2);
    expect(l.getP1().round(3)).toEqual(new Point(-1, 0).round(3));
    expect(l.getP2().round(3)).toEqual(new Point(1, 0).round(3));
  });
  test('Align 25%', () => {
    create('align25');
    l.setLength(2);
    expect(l.getP1().round(3)).toEqual(new Point(-0.25, 0).round(3));
    expect(l.getP2().round(3)).toEqual(new Point(1.75, 0).round(3));
  });
  test('Define Length and Angle', () => {
    create('lengthAngle');
    expect(l.getP1().round(3)).toEqual(new Point(0, 0).round(3));
    expect(l.getP2().round(3)).toEqual(new Point(0, 1).round(3));
  });
  test('Touch border is border', () => {
    create('touchBorderBorder');
    const c = jest.fn();
    l.onClick = c;
    l.setTouchable();
    expect(c.mock.calls.length).toBe(0);
    diagram.mock.touchDown([0.01, 0]);
    expect(c.mock.calls.length).toBe(1);
    diagram.mock.touchDown([0.01, 0.049]);
    expect(c.mock.calls.length).toBe(2);
    diagram.mock.touchDown([0.01, 0.051]);
    expect(c.mock.calls.length).toBe(2);
    diagram.mock.touchDown([0.01, -0.049]);
    expect(c.mock.calls.length).toBe(3);
    diagram.mock.touchDown([0.01, -0.051]);
    expect(c.mock.calls.length).toBe(3);
    const border = l.getBorder('draw', 'touchBorder');
    expect(round(border, 3)).toEqual([[
      new Point(0, -0.05),
      new Point(1, -0.05),
      new Point(1, 0.05),
      new Point(0, 0.05),
    ]]);
  });
  test('Touch border is number', () => {
    create('touchBorderNumber');
    const border = l.getBorder('draw', 'touchBorder');
    expect(round(border, 3)).toEqual([[
      new Point(-0.1, -0.15),
      new Point(1.1, -0.15),
      new Point(1.1, 0.15),
      new Point(-0.1, 0.15),
    ]]);
  });
  test('Touch border is custom', () => {
    create('touchBorderCustom');
    const border = l.getBorder('draw', 'touchBorder');
    expect(round(border, 3)).toEqual([[
      new Point(-1, -1),
      new Point(2, -1),
      new Point(2, 1),
      new Point(-1, 1),
    ]]);
  });
  test('Arrow', () => {
    create('arrow');
    const border = l.getBorder('draw', 'touchBorder');
    expect(round(border, 3)).toEqual([[
      new Point(0, -0.1),
      new Point(1, -0.1),
      new Point(1, 0.1),
      new Point(0, 0.1),
    ]]);
    expect(l._line.getScale().round(3)).toEqual(new Point(0.6, 1));
    expect(l._line.getPosition().round(3)).toEqual(new Point(0.2, 0));
    expect(l._arrow1.getPosition().round(3)).toEqual(new Point(0, 0));
    expect(l._arrow2.getPosition().round(3)).toEqual(new Point(1, 0));
  });
});
