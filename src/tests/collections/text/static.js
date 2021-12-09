/* eslint no-unused-vars: ["error", {
  "varsIgnorePattern": "[(timeoutId)|(step)|(duration)]",
  "vars": "local",
  }] */
/* global figure getShapes getPosition */
/* eslint-disable block-scoped-var, object-property-newline */

if (typeof process === 'object') {
  /* eslint-disable global-require, no-unused-vars, vars-on-top, no-var */
  var { tools } = require('../../../index').default;
  var { makeShape } = require('./common');
}

const click = (point, element) => {
  tools.misc.Console(element.name);
  if (element.count == null) {
    element.count = 1;
  } else {
    element.count += 1;
  }
  element.parent.parent._count.setText(element.count.toString())
  figure.animateNextFrame();
};

function getShapes(getPos) {
  const shape = (name, options, mods) => makeShape(name, options, mods, getPos);

  /* eslint-disable object-curly-newline */
  return [
    shape('default'),

    /*
    .......##.##.....##..######..########.####.########.##....##
    .......##.##.....##.##....##....##.....##..##........##..##.
    .......##.##.....##.##..........##.....##..##.........####..
    .......##.##.....##..######.....##.....##..######......##...
    .##....##.##.....##.......##....##.....##..##..........##...
    .##....##.##.....##.##....##....##.....##..##..........##...
    ..######...#######...######.....##....####.##..........##...
    */
    shape('justify-center', { justify: 'center' }),
    shape('justify-right', { justify: 'right' }),

    /*
    .########...#######..########..########..########.########.
    .##.....##.##.....##.##.....##.##.....##.##.......##.....##
    .##.....##.##.....##.##.....##.##.....##.##.......##.....##
    .########..##.....##.########..##.....##.######...########.
    .##.....##.##.....##.##...##...##.....##.##.......##...##..
    .##.....##.##.....##.##....##..##.....##.##.......##....##.
    .########...#######..##.....##.########..########.##.....##
    */
    shape('b2', { border: 'children' }),
    shape('b3', { border: 0.1 }),
    shape('b4', { border: 'rect' }),
    shape('b5', { border: [[0, 0], [0.5, 0], [0, 0.5]] }),
    shape('b6', { border: [[[0, 0], [0.5, 0], [0, 0.5]]] }),
    shape('b7', { border: { left: 0.1, top: 0.2, bottom: 0.3, right: 0.4 } }),

    /*
    .########..#######..##.....##..######..##.....##
    ....##....##.....##.##.....##.##....##.##.....##
    ....##....##.....##.##.....##.##.......##.....##
    ....##....##.....##.##.....##.##.......#########
    ....##....##.....##.##.....##.##.......##.....##
    ....##....##.....##.##.....##.##....##.##.....##
    ....##.....#######...#######...######..##.....##
    */
    shape('tb1', { border: 0.05, touchBorder: 'border' }),
    shape('tb2', { border: 0.05, touchBorder: 'rect' }),
    shape('tb3', { border: 0.05, touchBorder: 0.1 }),
    shape('tb4', { border: 0.05, touchBorder: 'children' }),
    shape('tb6', { border: 0.05, touchBorder: [[0, 0], [0.5, 0], [0, 0.5]] }),
    shape('tb7', { border: 0.05, touchBorder: [[[0, 0], [0.5, 0], [0, 0.5]]] }),
    shape('tb8', { border: 0.05, touchBorder: { left: 0.1, top: 0.2, bottom: 0.3, right: 0.4 } }),

    /*
    ..#######..##....##..######..##.......####..######..##....##
    .##.....##.###...##.##....##.##........##..##....##.##...##.
    .##.....##.####..##.##.......##........##..##.......##..##..
    .##.....##.##.##.##.##.......##........##..##.......#####...
    .##.....##.##..####.##.......##........##..##.......##..##..
    .##.....##.##...###.##....##.##........##..##....##.##...##.
    ..#######..##....##..######..########.####..######..##....##
    */
    shape('itb1', {
      modifiers: {
        is: {
          touch: [0.1, 0.2],
          onClick: (p, e) => click(p, e),
        },
      },
      touchBorder: 'children',
    }),
    shape('itb2', {
      modifiers: {
        is: {
          touch: [0.1, 0.2],
          onClick: (p, e) => click(p, e),
        },
      },
    }),


    /*
    ....###....##.......####..######...##....##
    ...##.##...##........##..##....##..###...##
    ..##...##..##........##..##........####..##
    .##.....##.##........##..##...####.##.##.##
    .#########.##........##..##....##..##..####
    .##.....##.##........##..##....##..##...###
    .##.....##.########.####..######...##....##
    */
    shape('a1', { justify: 'left', xAlign: 'left', yAlign: 'bottom' }),
    shape('a2', { justify: 'left', xAlign: 'left', yAlign: 'baseline' }),
    shape('a3', { justify: 'left', xAlign: 'center', yAlign: 'middle' }),
    shape('a4', { justify: 'left', xAlign: 'right', yAlign: 'top' }),
    shape('a5', { justify: 'center', xAlign: 'left', yAlign: 'bottom' }),
    shape('a6', { justify: 'center', xAlign: 'left', yAlign: 'baseline' }),
    shape('a7', { justify: 'center', xAlign: 'center', yAlign: 'middle' }),
    shape('a8', { justify: 'center', xAlign: 'right', yAlign: 'top' }),
    shape('a9', { justify: 'right', xAlign: 'left', yAlign: 'bottom' }),
    shape('a10', { justify: 'right', xAlign: 'left', yAlign: 'baseline' }),
    shape('a11', { justify: 'right', xAlign: 'center', yAlign: 'middle' }),
    shape('a12', { justify: 'right', xAlign: 'right', yAlign: 'top' }),

    /*
    ..######..########.....###.....######..########
    .##....##.##.....##...##.##...##....##.##......
    .##.......##.....##..##...##..##.......##......
    ..######..########..##.....##.##.......######..
    .......##.##........#########.##.......##......
    .##....##.##........##.....##.##....##.##......
    ..######..##........##.....##..######..########
    */
    shape('s1', { lineSpace: 0.2 }),
    shape('s2', { lineSpace: 0.2, baselineSpace: 0.2 }),
    shape('s3', { lineSpace: 0.1, text: ['Hello', { text: 'There', lineSpace: 0.2 }, 'World'] }),
    shape('s4', { lineSpace: 0.1, text: ['Hello', { text: 'There', lineSpace: 0.2, baselineSpace: 0.4 }, 'World'] }),
    shape('s5 - lineSpace cannot override baselineSpace', { baselineSpace: 0.2, text: ['Hello', { text: 'There', lineSpace: 0.2 }, 'World'] }),
    shape('s6', { baselineSpace: 0.2, text: ['Hello', { text: 'There', lineSpace: 0.2, baselineSpace: 0.3 }, 'World'] }),

    /*
    .########..#######..##.....##..######..##.....##
    ....##....##.....##.##.....##.##....##.##.....##
    ....##....##.....##.##.....##.##.......##.....##
    ....##....##.....##.##.....##.##.......#########
    ....##....##.....##.##.....##.##.......##.....##
    ....##....##.....##.##.....##.##....##.##.....##
    ....##.....#######...#######...######..##.....##
    */
    shape('t1', { touchBorder: 'children', modifiers: { is: { touch: true, onClick: (p, e) => click(p, e) } } }),
    shape('t2', { touchBorder: 'children', modifiers: { is: { touch: 0.1 } } }),
    shape('t3', { touchBorder: 'children', modifiers: { is: { touch: [0.1, 0.2] } } }),
    shape('t4', { touchBorder: 'children', modifiers: { is: { touch: [0.05, 0.1, 0.15, 0.2] } } }),

    /*
    .########..#######..##....##
    .##.......##.....##.###...##
    .##.......##.....##.####..##
    .######...##.....##.##.##.##
    .##.......##..##.##.##..####
    .##.......##....##..##...###
    .########..#####.##.##....##
    */
    shape('e1', { text: ['hello |eqn| now', 'there is'], modifiers: { eqn: { eqn: { frac: ['1', 'vinculum', '2'] } } } }),
    shape('e2', { text: ['hello |eqn| now', 'there is'], modifiers: { eqn: { eqn: { frac: ['1', 'v', 'b'] } } }, elements: { v: { symbol: 'vinculum' }, b: { text: 'abc', color: [0, 1, 0, 1], font: { size: 0.3 } } } }),

    /*
    .########..#######..##....##.########
    .##.......##.....##.###...##....##...
    .##.......##.....##.####..##....##...
    .######...##.....##.##.##.##....##...
    .##.......##.....##.##..####....##...
    .##.......##.....##.##...###....##...
    .##........#######..##....##....##...
    */
    shape('f1', { font: { size: 0.15 } }),
    shape('f2', { font: { size: 0.15 }, text: ['line1', { text: 'line2 |accent|', font: { size: 0.1 } }], modifiers: { accent: { font: { size: 0.25 } } } }),
    shape('f3', { font: { style: 'italic' }, text: ['line1', { text: 'line2 |accent|', font: { style: 'normal' } }], modifiers: { accent: { font: { style: 'italic' } } } }),
    shape('f4', { font: { weight: 'bold' }, text: ['line1', { text: 'line2 |accent|', font: { weight: 'lighter' } }], modifiers: { accent: { font: { weight: 'bolder' } } } }),
    shape('f5', { font: { family: 'Times New Roman' }, text: ['line1', { text: 'line2 |accent|', font: { family: 'Arial' } }], modifiers: { accent: { font: { family: 'Courier' } } } }),

    /*
    ..######...#######..##........#######..########.
    .##....##.##.....##.##.......##.....##.##.....##
    .##.......##.....##.##.......##.....##.##.....##
    .##.......##.....##.##.......##.....##.########.
    .##.......##.....##.##.......##.....##.##...##..
    .##....##.##.....##.##.......##.....##.##....##.
    ..######...#######..########..#######..##.....##
    */
    shape('c1', { color: [0, 0, 1, 1] }),
    shape('c2', { color: [0, 0, 1, 1], font: { color: [0, 1, 0, 1] } }),
    shape('c3', { font: { color: [0, 0, 1, 1] }, text: ['line1', { text: 'line2 |accent|', font: { color: [1, 0, 1, 1] } }], modifiers: { accent: { font: { color: [0, 1, 0, 1] } } } }),

    /*
    .########.##....##.########..########
    ....##.....##..##..##.....##.##......
    ....##......####...##.....##.##......
    ....##.......##....########..######..
    ....##.......##....##........##......
    ....##.......##....##........##......
    ....##.......##....##........########
    */
    shape('type1', { font: { render: '2d' } }),
    shape('type2', { font: { render: 'gl' } }),

    /*
    ....###.....######...######..########.##....##.########
    ...##.##...##....##.##....##.##.......###...##....##...
    ..##...##..##.......##.......##.......####..##....##...
    .##.....##.##.......##.......######...##.##.##....##...
    .#########.##.......##.......##.......##..####....##...
    .##.....##.##....##.##....##.##.......##...###....##...
    .##.....##..######...######..########.##....##....##...
    */
    shape('ac1'),
    shape('ac2', { accent: { color: [0, 0, 1, 1], style: 'normal' } }),
    shape('ac3', { accent: { weight: 'bold' } }),

    /*
    .##.....##..#######..########...######.
    .###...###.##.....##.##.....##.##....##
    .####.####.##.....##.##.....##.##......
    .##.###.##.##.....##.##.....##..######.
    .##.....##.##.....##.##.....##.......##
    .##.....##.##.....##.##.....##.##....##
    .##.....##..#######..########...######.
    */
    shape('m1', { modifiers: { is: { text: 'be more' } } }),
    shape('m2', { modifiers: { is: { offset: [0.1, 0.1] } } }),
    shape('m3', { modifiers: { is: { offset: [-0.1, 0.1] } } }),
    shape('m4', { modifiers: { is: { offset: [0, 0.1], inLine: false } } }),
    shape('m5', { modifiers: { is: { space: 0.1 } } }),

    /*
    ..######..########.########..####.##....##..######..
    .##....##....##....##.....##..##..###...##.##....##.
    .##..........##....##.....##..##..####..##.##.......
    ..######.....##....########...##..##.##.##.##...####
    .......##....##....##...##....##..##..####.##....##.
    .##....##....##....##....##...##..##...###.##....##.
    ..######.....##....##.....##.####.##....##..######..
    */
    shape('st1', { text: 'single string' }),

    /*
    .##.....##.########..########.....###....########.########
    .##.....##.##.....##.##.....##...##.##......##....##......
    .##.....##.##.....##.##.....##..##...##.....##....##......
    .##.....##.########..##.....##.##.....##....##....######..
    .##.....##.##........##.....##.#########....##....##......
    .##.....##.##........##.....##.##.....##....##....##......
    ..#######..##........########..##.....##....##....########
    */
    shape('u1', { text: ['hello', 'world'] }),
    shape('u2', { text: ['hello', 'world'] }),
    shape('u3', { text: ['hello |e|', 'world'], modifiers: { e: { eqn: { frac: ['1', 'vinculum', '2'] } } } }),
    shape('u4', { text: ['hello', 'world'] }),
  ];
}

let timeoutId;
let startUpdates;
let startGetValues;
let startMove;

const updates = {
  // default: (e) => {
  //   // e._e01.showMap();
  // },
  // 'move-pad': (e) => {
  //   e.setPositionWithoutMoving(e.points[0]);
  // },
  type1: (e) => {
    const elements = e._text.getChildren().filter(el => el.text == null);
    e._count.setText(elements.length.toString());
  },
  type2: (e) => {
    const elements = e._text.getChildren().filter(el => el.text == null);
    e._count.setText(elements.length.toString());
  },
  u1: (e) => {
    const elements = e._text.setText({ text: ['hello', 'there'] });
  },
  u2: (e) => {
    const elements = e._text.setText({
      text: ['hello fun', 'world', 'you are great'], reform: true,
    });
  },
  u3: (e) => {
    const elements = e._text.setText({
      text: ['hello fun', 'world', 'you are great'], reform: true,
    });
  },
  u4: (e) => {
    const elements = e._text.setText({
      text: ['hello |e|', 'world'],
      modifiers: { e: { eqn: { frac: ['1', 'vinculum', '2'] } } },
      reform: true,
    });
  },
  default: () => {
    const gls = figure.elements.getAllPrimitives().filter(e => e.text != null);
    const d2s = figure.elements.getAllPrimitives().filter(e => e.drawingObject.text != null);
    figure.add({
      make: 'text',
      text: `gl: ${gls.length.toString()}`,
      position: [-5, 4.8],
      font: { size: 0.1 },
    });
    figure.add({
      make: 'text',
      text: `2d: ${d2s.length.toString()}`,
      position: [-4, 4.8],
      font: { size: 0.1 },
    });
  },
};

const getValues = {
  itb1: {
    element: 'itb1.text.e0_1',
    expect: 1,
    when: e => e.count,
  },
  itb2: {
    element: 'itb2.text.e0_1',
    expect: 1,
    when: e => e.count,
  },
};


const move = {
  itb1: {
    element: 'itb1',
    events: [
      ['touchDown', [0.15, 0.25]],
      ['touchUp'],
    ],
  },
  itb2: {
    element: 'itb2',
    events: [
      ['touchDown', [0.15, 0.25]],
      ['touchUp'],
    ],
  },
  t1: {
    element: 't1',
    events: [
      ['touchDown', [0.25, 0.05]],
      ['touchUp'],
    ],
  },
  // 'on-color': {
  //   element: 'on-color',
  //   events: [
  //     ['touchDown', [0, 0]],
  //   ],
  // },
  // 'colors-switch': {
  //   element: 'colors-switch',
  //   events: [
  //     ['touchDown', [0, 0]],
  //   ],
  // },
  // movePad: {
  //   element: 'move-pad',
  //   events: [
  //     ['touchDown', [0, 0]],
  //     ['touchMove', [-0.1, -0.1]],
  //     ['touchMove', [-0.1, -0.1]],
  //     ['touchUp'],
  //     ['touchDown', [0.3, 0]],
  //     ['touchMove', [0.4, 0.1]],
  //     ['touchMove', [0.4, 0.1]],
  //     ['touchUp'],
  //     ['touchDown', [0, 0.3]],
  //     ['touchMove', [-0.1, 0.4]],
  //     ['touchMove', [-0.1, 0.4]],
  //     ['touchUp'],
  //   ],
  // },
};

if (typeof process === 'object') {
  module.exports = {
    getShapes,
    updates,
    getValues,
    move,
  };
} else {
  figure.add(getShapes(index => getPosition(index)));
  startUpdates = () => {
    Object.keys(updates).forEach((name) => {
      updates[name](figure.getElement(name));
      figure.setFirstTransform();
    });
  };
  startUpdates();

  startMove = () => {
    if (move == null || Object.keys(move).length === 0) {
      return;
    }
    Object.keys(move).forEach((name) => {
      const element = figure.getElement(move[name].element);
      const p = element.getPosition('figure');
      move[name].events.forEach((event) => {
        const [action] = event;
        const loc = tools.g2.getPoint(event[1] || [0, 0]);
        figure[action]([loc.x + p.x, loc.y + p.y]);
      });
    });
    figure.setFirstTransform();
  };
  startMove();

  startGetValues = () => {
    if (getValues == null || Object.keys(getValues).length === 0) {
      return;
    }
    // tools.misc.Console('');
    // tools.misc.Console('Get Values');
    Object.keys(getValues).forEach((title) => {
      const value = getValues[title].when(figure.getElement(getValues[title].element));
      const expected = getValues[title].expect;
      const result = JSON.stringify(expected) === JSON.stringify(value);
      if (result) {
        tools.misc.Console(`pass: ${title}`);
      } else {
        tools.misc.Console(`fail: ${title}: Expected: ${getValues[title].expect} - Got: ${value}`);
      }
    });
  };
  startGetValues();
}
