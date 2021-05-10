/* eslint no-unused-vars: ["error", {
  "varsIgnorePattern": "[(timeoutId)|(step)|(duration)]",
  "vars": "local",
  }] */
/* global figure getShapes getPosition */
/* eslint-disable block-scoped-var */

if (typeof process === 'object') {
  // eslint-disable-next-line global-require, no-unused-vars, vars-on-top, no-var
  var { tools } = require('../../../index.js').default;
}


function getShapes(getPos) {
  let index = 0;
  const line = (name, options, mods) => {
    const { x, y } = getPos(index);
    const indexName = `${index}`;
    index += 1;
    const o = {
      name,
      make: 'collections.line',
      options: tools.misc.joinObjects({}, {
        color: [1, 0, 0, 0.7],
        p1: [-0.2, 0],
        width: 0.05,
        length: 0.4,
      }, options),
      mods: tools.misc.joinObjects({}, {
        isTouchable: true,
        onClick: () => tools.misc.Console(`${indexName}: ${name}`),
      }, mods),
    };
    o.options.p1 = tools.g2.getPoint(o.options.p1).add(x, y);
    if (o.options.p2 != null) {
      o.options.p2 = tools.g2.getPoint(o.options.p2).add(x, y);
    }
    return o;
  };

  /* eslint-disable object-curly-newline */
  return [
    /*
    .......########...#######..########..########..########.########.
    .......##.....##.##.....##.##.....##.##.....##.##.......##.....##
    .......##.....##.##.....##.##.....##.##.....##.##.......##.....##
    .......########..##.....##.########..##.....##.######...########.
    .......##.....##.##.....##.##...##...##.....##.##.......##...##..
    .......##.....##.##.....##.##....##..##.....##.##.......##....##.
    .......########...#######..##.....##.########..########.##.....##
    */
    line('border-default'),
    line('border-diagonal-p2', { p2: [0.2, 0.4] }),
    line('border-diagonal-angle', { angle: Math.PI / 4 }),
    line('border-arrow', { arrow: { head: 'triangle', scale: 0.3 } }),
    line('border-diagonal-arrow', { angle: Math.PI / 4, arrow: { head: 'triangle', scale: 0.3 } }),
    line('border-label', { label: 'a' }),
    line('border-label-diagonal', { label: 'a', angle: Math.PI / 4 }),

    line('border-children', { border: 'children', angle: Math.PI / 4 }),
    line('border-rect', { border: 'rect', angle: Math.PI / 4 }),
    line('border-number', { border: 0.05, angle: Math.PI / 4 }),
    line('border-bufferX', { border: [0.05, 0], angle: Math.PI / 4 }),
    line('border-bufferY', { border: [0, 0.05], angle: Math.PI / 4 }),
    line('border-bufferRect', { border: [0, 0.05, 0.1, 0.15], angle: Math.PI / 4 }),
    line('border-custom1d', { border: [[0, 0], [0.3, 0], [0, 0.3]], angle: Math.PI / 4 }),
    line('border-custom2d', { border: [[[0, 0], [0.3, 0], [0, 0.3]]], angle: Math.PI / 4 }),

    line('touchBorder-children', { touchBorder: 'children', angle: Math.PI / 4 }),
    line('touchBorder-rect', { touchBorder: 'rect', angle: Math.PI / 4 }),
    line('touchBorder-number', { touchBorder: 0.05, angle: Math.PI / 4 }),
    line('touchBorder-bufferX', { touchBorder: [0.05, 0], angle: Math.PI / 4 }),
    line('touchBorder-bufferY', { touchBorder: [0, 0.05], angle: Math.PI / 4 }),
    line('touchBorder-bufferRect', { touchBorder: [0, 0.05, 0.1, 0.15], angle: Math.PI / 4 }),
    line('touchBorder-custom1d', { touchBorder: [[0, 0], [0.3, 0], [0, 0.3]], angle: Math.PI / 4 }),
    line('touchBorder-custom2d', { touchBorder: [[[0, 0], [0.3, 0], [0, 0.3]]], angle: Math.PI / 4 }),
    line('touchBorder-arrow-label', {
      arrow: { head: 'triangle', scale: 0.3 },
      label: 'a',
      angle: Math.PI / 4,
    }),
    line('touchBorder-rect-arrow-label', {
      arrow: { head: 'triangle', scale: 0.3 },
      label: 'a',
      angle: Math.PI / 4,
      touchBorder: 'rect',
    }),
    line('touchBorder-rect-arrow-label1', {
      arrow: { head: 'triangle', scale: 0.3 },
      label: {
        text: 'a',
        touchBorder: [[]],
      },
      angle: Math.PI / 4,
      touchBorder: 'rect',
    }),
    line('translateRotate', {
      align: 'center',
      move: { type: 'centerTranslateEndRotation' },
    }, { isTouchable: false }),
    line('translateRotateMid', {
      align: 'center',
      move: { type: 'centerTranslateEndRotation', middleLength: 0.6 },
    }, { isTouchable: false }),

    /*
    .......########..########.########.####.##....##.########
    .......##.....##.##.......##........##..###...##.##......
    .......##.....##.##.......##........##..####..##.##......
    .......##.....##.######...######....##..##.##.##.######..
    .......##.....##.##.......##........##..##..####.##......
    .......##.....##.##.......##........##..##...###.##......
    .......########..########.##.......####.##....##.########
    */
    line('p1p2', { p1: [0.2, -0.2], p2: [-0.2, 0.2] }),
    line('p1LengthAngle', { p1: [0.2, -0.2], length: 0.4, angle: Math.PI / 2 }),
    line('override', { p1: [0.2, -0.2], p2: [-0.2, 0.2], length: 0.4, angle: Math.PI / 2 }),
    line('offset-pos', { offset: 0.2, p1: [0.2, -0.2], p2: [-0.2, 0.2] }),
    line('offset-net', { offset: -0.2, p1: [0.2, -0.2], p2: [-0.2, 0.2] }),
    line('align-start', { align: 'start' }),
    line('align-center', { align: 'center' }),
    line('align-end', { align: 'end' }),
    line('align-neg', { align: -0.2 }),
    line('width', { width: 0.1 }),

    /*
    .......########.....###.....######..##.....##
    .......##.....##...##.##...##....##.##.....##
    .......##.....##..##...##..##.......##.....##
    .......##.....##.##.....##..######..#########
    .......##.....##.#########.......##.##.....##
    .......##.....##.##.....##.##....##.##.....##
    .......########..##.....##..######..##.....##
    */
    line('dash', { dash: [0.05, 0.05] }),
    line('dash-offset', { dash: [0.025, 0.05, 0.05] }),


    /*
    ..........###....########..########...#######..##......##
    .........##.##...##.....##.##.....##.##.....##.##..##..##
    ........##...##..##.....##.##.....##.##.....##.##..##..##
    .......##.....##.########..########..##.....##.##..##..##
    .......#########.##...##...##...##...##.....##.##..##..##
    .......##.....##.##....##..##....##..##.....##.##..##..##
    .......##.....##.##.....##.##.....##..#######...###..###.
    */
    line('arrow', { width: 0.01, arrow: 'triangle' }),
    line('arrow-start', { arrow: {
      start: 'triangle',
    } }),
    line('arrow-detail', { arrow: {
      head: 'barb',
      scale: 0.4,
      tail: 0,
    } }),

    /*
    .......##..........###....########..########.##......
    .......##.........##.##...##.....##.##.......##......
    .......##........##...##..##.....##.##.......##......
    .......##.......##.....##.########..######...##......
    .......##.......#########.##.....##.##.......##......
    .......##.......##.....##.##.....##.##.......##......
    .......########.##.....##.########..########.########
    */
    line('label', { label: 'a' }),
    line('label-null', { label: null }),
    line('label-offset', { label: { text: 'a', offset: 0.05 } }),
    line('label-scale', { label: { text: 'a', scale: 2, offset: 0.05 } }),
    line('label-color', { label: { text: 'a', color: [1, 0, 1, 1] } }),
    line('label-linePosition', { label: { text: 'a', offset: 0.05, linePosition: 0.3 } }),
    line('label-location-left-horizontal', {
      angle: Math.PI / 4,
      label: {
        text: 'a', location: 'left', orientation: 'horizontal', offset: 0.05,
      },
    }),
    line('label-location-right-baseToLine', {
      angle: Math.PI / 4,
      label: {
        text: 'a', location: 'right', orientation: 'baseToLine', offset: 0.05,
      },
    }),
    line('label-location-top-baseAway', {
      angle: Math.PI / 4,
      label: {
        text: 'a', location: 'top', orientation: 'baseAway', offset: 0.05,
      },
    }),
    line('label-location-bottom-upright', {
      angle: Math.PI / 4,
      label: {
        text: 'a', location: 'bottom', orientation: 'upright', offset: 0.05,
      },
    }),
    line('label-subLocation-horizontal-bottom', {
      angle: 0,
      label: {
        text: 'a', location: 'right', subLocation: 'bottom', offset: 0.05,
      },
    }),
    line('label-subLocation-horizontal-top', {
      angle: 0,
      label: {
        text: 'a', location: 'right', subLocation: 'top', offset: 0.05,
      },
    }),
    line('label-subLocation-vertical-left', {
      angle: Math.PI / 2,
      label: {
        text: 'a', location: 'top', subLocation: 'left', offset: 0.05,
      },
    }),
    line('label-subLocation-vertical-right', {
      angle: Math.PI / 2,
      label: {
        text: 'a', location: 'top', subLocation: 'right', offset: 0.05,
      },
    }),
    line('label-equation', {
      angle: Math.PI / 4,
      label: { text: { forms: { 0: { frac: ['a', 'vinculum', 'b'] } } } },
    }),
    line('label-autoForm', {
      label: { text: ['form1', 'form2'] },
    }),
    line('label-updateOff', {
      label: { text: 'a', orientation: 'horizontal', update: false },
    }),
    line('label-updateOn', {
      label: { text: 'a', orientation: 'horizontal', update: true },
    }),

    /*
    .......##.....##.########.########.##.....##..#######..########...######.
    .......###...###.##..........##....##.....##.##.....##.##.....##.##....##
    .......####.####.##..........##....##.....##.##.....##.##.....##.##......
    .......##.###.##.######......##....#########.##.....##.##.....##..######.
    .......##.....##.##..........##....##.....##.##.....##.##.....##.......##
    .......##.....##.##..........##....##.....##.##.....##.##.....##.##....##
    .......##.....##.########....##....##.....##..#######..########...######.
    */
    line('setLength'),
    line('setLength-dash', { dash: [0.025, 0.05, 0.05] }),
    line('setLength-align-center', { align: 'center', p1: [0, 0], p2: [0.2, 0] }),
    line('setLength-align-end', { align: 'end', p1: [0, 0], p2: [0.2, 0] }),
    line('setLabelToRealLength', { label: 'a' }),
    line('setLabel', { label: 'a' }),
    line('setEndPoints', { p1: [0, 0], align: 'start' }),

    /*
    .............##.....##..#######..##.....##.########
    .............###...###.##.....##.##.....##.##......
    .............####.####.##.....##.##.....##.##......
    .............##.###.##.##.....##.##.....##.######..
    .............##.....##.##.....##..##...##..##......
    .............##.....##.##.....##...##.##...##......
    .............##.....##..#######.....###....########
    */
    line('translator', { move: { type: 'translation' } }),
    line('start-rotator', { align: 'start', move: { type: 'rotation' } }),
    line('center-rotator', { align: 'center', move: { type: 'rotation' } }),
    line('end-rotator', { align: 'end', move: { type: 'rotation' } }),
    line('translate-rotate', { align: 'center', move: { type: 'centerTranslateEndRotation' } }, { isTouchable: false }),
  ];
}

let timeoutId;
let startUpdates;
let startGetValues;
let startMove;

const updates = {
  'align-start': (e) => {
    e.setRotation(Math.PI / 4);
  },
  'align-center': (e) => {
    e.setRotation(Math.PI / 4);
  },
  'align-end': (e) => {
    e.setRotation(Math.PI / 4);
  },
  'align-neg': (e) => {
    e.setRotation(Math.PI / 4);
  },
  'label-autoForm': (e) => {
    e.label.eqn.showForm('1');
  },
  'label-updateOff': (e) => {
    e.setRotation(Math.PI / 4);
  },
  'label-updateOn': (e) => {
    e.setRotation(Math.PI / 4);
  },
  setLength: (e) => {
    e.setLength(0.7);
  },
  'setLength-dash': (e) => {
    e.setLength(0.7);
  },
  setLabelToRealLength: (e) => {
    e.setLabelToRealLength();
  },
  setLabel: (e) => {
    e.setLabel('b');
  },
  setEndPoints: (e) => {
    const p = e.getPosition('figure');
    e.setEndPoints(
      [-0.2 + p.x, -0.2 + p.y],
      [-0.2 + p.x, 0.2 + p.y],
      -0.1,
    );
  },
  'setLength-align-center': (e) => {
    e.setLength(0.4);
  },
  'setLength-align-end': (e) => {
    e.setLength(0.4);
  },
};

const getValues = {
  getLength: {
    element: 'border-default',
    expect: 0.4,
    when: e => tools.math.round(e.getLength(), 3),
  },
  'getAngle - rad': {
    element: 'border-diagonal-angle',
    expect: tools.math.round(Math.PI / 4, 3),
    when: e => tools.math.round(e.getAngle(), 3),
  },
  'getAngle - degrees': {
    element: 'border-diagonal-angle',
    expect: tools.math.round(45, 3),
    when: e => tools.math.round(e.getAngle('deg'), 3),
  },
  getLabel: {
    element: 'label',
    expect: 'a',
    when: e => e.getLabel(),
  },
  'getP1-local': {
    element: 'p1LengthAngle',
    expect: [0, 0],
    when: (e) => {
      const offset = e.getPosition('figure');
      const p = e.getP1('figure').sub(offset).round(3);
      return [p.x, p.y];
    },
  },
  'getP2-local': {
    element: 'p1LengthAngle',
    expect: [0, 0.4],
    when: (e) => {
      const offset = e.getPosition('figure');
      const p = e.getP2('figure').sub(offset).round(3);
      return [p.x, p.y];
    },
  },
  'getP1-setLength-align-center': {
    element: 'setLength-align-center',
    expect: [-0.2, 0],
    when: (e) => {
      const offset = e.getPosition('figure');
      const p = e.getP1('figure').sub(offset).round(3);
      return [p.x, p.y];
    },
  },
  'getP1-setLength-align-end': {
    element: 'setLength-align-end',
    expect: [-0.4, 0],
    when: (e) => {
      const offset = e.getPosition('figure');
      const p = e.getP1('figure').sub(offset).round(3);
      return [p.x, p.y];
    },
  },
};


const move = {
  translate: {
    element: 'translator',
    events: [
      ['touchDown', [0.1, 0]],
      ['touchMove', [0.2, 0]],
      ['touchMove', [0.2, 0]],
      ['touchUp'],
    ],
  },
  rotateStart: {
    element: 'start-rotator',
    events: [
      ['touchDown', [0.3, 0]],
      ['touchMove', [0.3, 0.1]],
      ['touchMove', [0.3, 0.1]],
      ['touchUp'],
    ],
  },
  rotateCenter: {
    element: 'center-rotator',
    events: [
      ['touchDown', [0.1, 0]],
      ['touchMove', [0.1, 0.1]],
      ['touchMove', [0.1, 0.1]],
      ['touchUp'],
    ],
  },
  rotateEnd: {
    element: 'end-rotator',
    events: [
      ['touchDown', [-0.3, 0]],
      ['touchMove', [-0.3, 0.1]],
      ['touchMove', [-0.3, 0.1]],
      ['touchUp'],
    ],
  },
  translateRotate: {
    element: 'translate-rotate',
    events: [
      ['touchDown', [0, 0]],
      ['touchMove', [0.2, 0]],
      ['touchMove', [0.2, 0]],
      ['touchUp'],
      ['touchDown', [0.1, 0]],
      ['touchMove', [0.1, 0.1]],
      ['touchMove', [0.1, 0.1]],
      ['touchUp'],
    ],
  },
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

  startGetValues = () => {
    tools.misc.Console('');
    tools.misc.Console('Get Values');
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

  startMove = () => {
    tools.misc.Console('');
    tools.misc.Console('Move');
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
}
