/* eslint no-unused-vars: ["error", {
  "varsIgnorePattern": "[(timeoutId)|(step)|(duration)]",
  "vars": "local",
  }] */
/* global figure getShapes getPosition */
/* eslint-disable block-scoped-var, object-property-newline */

if (typeof process === 'object') {
  /* eslint-disable global-require, no-unused-vars, vars-on-top, no-var */
  var { tools } = require('../../../index.js').default;
  var { makeAngle } = require('./angle.js');
}


function getShapes(getPos) {
  const angle = (name, options, mods) => makeAngle(name, options, mods, getPos);

  /* eslint-disable object-curly-newline */
  return [
    /*
    .............########..########.########.####.##....##.########
    .............##.....##.##.......##........##..###...##.##......
    .............##.....##.##.......##........##..####..##.##......
    .............##.....##.######...######....##..##.##.##.######..
    .............##.....##.##.......##........##..##..####.##......
    .............##.....##.##.......##........##..##...###.##......
    .............########..########.##.......####.##....##.########
    */
    angle('define-angle', {
      position: [0, 0], angle: Math.PI / 4, startAngle: Math.PI / 4,
    }),
    angle('define-p1p2p3', {
      p1: [0.3 / Math.sqrt(2), 0.3 / Math.sqrt(2)], p2: [0, 0], p3: [0, 0.3],
    }),
    angle('define-override', {
      position: [0.1, 0.2], angle: 0.1, startAngle: Math.PI / 3,
      p1: [0.3 / Math.sqrt(2), 0.3 / Math.sqrt(2)], p2: [0, 0], p3: [0, 0.3],
    }),

    angle('direction-1-pos', {
      direction: 1, angle: Math.PI / 4, startAngle: 0.1, label: { text: null, offset: 0.01 },
    }),
    angle('direction--1-pos', {
      direction: -1, angle: Math.PI / 4, startAngle: 0.1, label: { text: null, offset: 0.01 },
    }),
    angle('direction-1-neg', {
      direction: 1, angle: -Math.PI / 4, startAngle: 0.1, label: { text: null, offset: 0.01 },
    }),
    angle('direction--1-neg', {
      direction: -1, angle: -Math.PI / 4, startAngle: 0.1, label: { text: null, offset: 0.01 },
    }),

    /*
    .......########...#######..########..########..########.########.
    .......##.....##.##.....##.##.....##.##.....##.##.......##.....##
    .......##.....##.##.....##.##.....##.##.....##.##.......##.....##
    .......########..##.....##.########..##.....##.######...########.
    .......##.....##.##.....##.##...##...##.....##.##.......##...##..
    .......##.....##.##.....##.##....##..##.....##.##.......##....##.
    .......########...#######..##.....##.########..########.##.....##
    */
    angle('border-default'),
    angle('border-label', { label: { text: null, offset: 0.01 } }),
    angle('border-arrows', { arrow: 'barb', curve: { width: 0.01 } }),

    angle('border-children', {
      border: 'children', label: { text: null, offset: 0.01 },
    }),
    angle('border-rect', {
      border: 'rect', label: { text: null, offset: 0.01 },
    }),
    angle('border-number', {
      border: 0.1, label: { text: null, offset: 0.01 },
    }),
    angle('border-bufferX', {
      border: [0.05, 0],
      label: { text: null, offset: 0.01 },
    }),
    angle('border-bufferY', {
      border: [0, 0.05],
      label: { text: null, offset: 0.01 },
    }),
    angle('border-bufferRect', {
      border: [0, 0.05, 0.1, 0.15],
      label: { text: null, offset: 0.01 },
    }),
    angle('border-custom1d', {
      border: [[0, 0], [0.3, 0], [0, 0.3]],
      label: { text: null, offset: 0.01 },
    }),
    angle('border-custom2d', {
      border: [[[0, 0], [0.3, 0], [0, 0.3]]],
      label: { text: null, offset: 0.01 },
    }),

    angle('touchBorder-children', {
      touchBorder: 'children', label: { text: null, offset: 0.01 },
    }),
    angle('touchBorder-rect', {
      touchBorder: 'rect', label: { text: null, offset: 0.01 },
    }),
    angle('touchBorder-number', {
      touchBorder: 0.1, label: { text: null, offset: 0.01 },
    }),
    angle('touchBorder-bufferX', {
      touchBorder: [0.05, 0],
      label: { text: null, offset: 0.01 },
    }),
    angle('touchBorder-bufferY', {
      touchBorder: [0, 0.05],
      label: { text: null, offset: 0.01 },
    }),
    angle('touchBorder-bufferRect', {
      touchBorder: [0, 0.05, 0.1, 0.15],
      label: { text: null, offset: 0.01 },
    }),
    angle('touchBorder-custom1d', {
      touchBorder: [[0, 0], [0.3, 0], [0, 0.3]],
      label: { text: null, offset: 0.01 },
    }),
    angle('touchBorder-custom2d', {
      touchBorder: [[[0, 0], [0.3, 0], [0, 0.3]]],
      label: { text: null, offset: 0.01 },
    }),

    angle('touchBorder-label', {
      touchBorder: 'children', label: { text: null, offset: 0.01, touchBorder: 0.1 },
    }),

    // /*
    // .......########.....###.....######..##.....##
    // .......##.....##...##.##...##....##.##.....##
    // .......##.....##..##...##..##.......##.....##
    // .......##.....##.##.....##..######..#########
    // .......##.....##.#########.......##.##.....##
    // .......##.....##.##.....##.##....##.##.....##
    // .......########..##.....##..######..##.....##
    // */
    // angle('dash', { curve: { dash: [0.05, 0.05] } }),
    // angle('dash-offset', { curve: { dash: [0.025, 0.05, 0.05] } }),


    /*
    ..........###....########..########...#######..##......##
    .........##.##...##.....##.##.....##.##.....##.##..##..##
    ........##...##..##.....##.##.....##.##.....##.##..##..##
    .......##.....##.########..########..##.....##.##..##..##
    .......#########.##...##...##...##...##.....##.##..##..##
    .......##.....##.##....##..##....##..##.....##.##..##..##
    .......##.....##.##.....##.##.....##..#######...###..###.
    */
    angle('arrow', { curve: { width: 0.01 }, arrow: 'triangle' }),
    angle('arrow-start', { curve: { width: 0.01 }, arrow: {
      start: 'triangle',
    } }),
    angle('arrow-detail', { curve: { width: 0.02 }, arrow: {
      head: 'barb',
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
    angle('label', { label: 'a' }),
    angle('label-null', { label: null }),
    angle('label-offset', { label: { text: 'a', offset: 0.05 } }),
    angle('label-scale', { label: { text: 'a', scale: 2, offset: 0.05 } }),
    angle('label-color', { label: { text: 'a', color: [0, 0, 1, 1] } }),
    angle('label-curvePosition', { label: { text: 'a', offset: 0.05, curvePosition: 0.3 } }),
    angle('label-location-start', { label: { text: 'a', offset: 0.05, location: 'start' } }),
    angle('label-location-end', { label: { text: 'a', offset: 0.05, location: 'end' } }),
    angle('label-location-left-horizontal', {
      angle: Math.PI / 4,
      label: {
        text: 'a', location: 'left', orientation: 'horizontal', offset: 0.05,
      },
    }),
    angle('label-location-right-baseToLine', {
      angle: Math.PI / 4,
      label: {
        text: 'a', location: 'right', orientation: 'baseToLine', offset: 0.05,
      },
    }),
    angle('label-location-top-baseAway', {
      angle: Math.PI / 4,
      label: {
        text: 'a', location: 'top', orientation: 'baseAway', offset: 0.05,
      },
    }),
    angle('label-location-bottom-upright', {
      angle: Math.PI / 4,
      label: {
        text: 'a', location: 'bottom', orientation: 'upright', offset: 0.05,
      },
    }),
    angle('label-location-outside-positive', {
      angle: Math.PI / 4,
      label: {
        text: 'a', location: 'outside', offset: 0.05,
      },
    }),
    angle('label-location-outside-negative', {
      angle: -Math.PI / 4,
      direction: 1,
      label: {
        text: 'a', location: 'outside', offset: 0.05,
      },
    }),
    angle('label-location-inside-positive', {
      angle: Math.PI / 4,
      label: {
        text: 'a', location: 'inside', offset: 0.05,
      },
    }),
    angle('label-location-inside-negative', {
      angle: -Math.PI / 4,
      direction: 1,
      label: {
        text: 'a', location: 'inside', offset: 0.05,
      },
    }),
    angle('label-equation', {
      angle: Math.PI / 4,
      label: { text: { forms: { 0: { frac: ['a', 'vinculum', 'b'] } } } },
    }),
    angle('label-autoForm', {
      label: { text: ['form1', 'form2'] },
    }),
    angle('label-updateOff', {
      label: { text: 'a', orientation: 'horizontal', update: false },
    }),
    angle('label-updateOn', {
      label: { text: 'a', orientation: 'horizontal', update: true },
    }),

    // /*
    // .......##.....##.########.########.##.....##..#######..########...######.
    // .......###...###.##..........##....##.....##.##.....##.##.....##.##....##
    // .......####.####.##..........##....##.....##.##.....##.##.....##.##......
    // .......##.###.##.######......##....#########.##.....##.##.....##..######.
    // .......##.....##.##..........##....##.....##.##.....##.##.....##.......##
    // .......##.....##.##..........##....##.....##.##.....##.##.....##.##....##
    // .......##.....##.########....##....##.....##..#######..########...######.
    // */
    // line('setLength'),
    // line('setLength-dash', { dash: [0.025, 0.05, 0.05] }),
    // line('setLabelToRealLength', { label: 'a' }),
    // line('setLabel', { label: 'a' }),
    // line('setEndPoints', { p1: [0, 0], align: 'start' }),

    // /*
    // .............##.....##..#######..##.....##.########
    // .............###...###.##.....##.##.....##.##......
    // .............####.####.##.....##.##.....##.##......
    // .............##.###.##.##.....##.##.....##.######..
    // .............##.....##.##.....##..##...##..##......
    // .............##.....##.##.....##...##.##...##......
    // .............##.....##..#######.....###....########
    // */
    // line('translator', { move: { type: 'translation' } }),
    // line('start-rotator', { align: 'start', move: { type: 'rotation' } }),
    // line('center-rotator', { align: 'center', move: { type: 'rotation' } }),
    // line('end-rotator', { align: 'end', move: { type: 'rotation' } }),
    // line('translate-rotate', { align: 'center', move: { type: 'centerTranslateEndRotation' } }, { isTouchable: false }),
  ];
}

let timeoutId;
let startUpdates;
let startGetValues;
let startMove;

const updates = {
  // 'align-start': (e) => {
  //   e.setRotation(Math.PI / 4);
  // },
  // 'align-center': (e) => {
  //   e.setRotation(Math.PI / 4);
  // },
  // 'align-end': (e) => {
  //   e.setRotation(Math.PI / 4);
  // },
  // 'align-neg': (e) => {
  //   e.setRotation(Math.PI / 4);
  // },
  'label-autoForm': (e) => {
    e.label.eqn.showForm('1');
  },
  'label-updateOff': (e) => {
    e.setRotation(Math.PI / 4);
  },
  'label-updateOn': (e) => {
    e.setRotation(Math.PI / 4);
  },
  // setLength: (e) => {
  //   e.setLength(0.7);
  // },
  // 'setLength-dash': (e) => {
  //   e.setLength(0.7);
  // },
  // setLabelToRealLength: (e) => {
  //   e.setLabelToRealLength();
  // },
  // setLabel: (e) => {
  //   e.setLabel('b');
  // },
  // setEndPoints: (e) => {
  //   const p = e.getPosition('figure');
  //   e.setEndPoints(
  //     [-0.2 + p.x, -0.2 + p.y],
  //     [-0.2 + p.x, 0.2 + p.y],
  //     -0.1,
  //   );
  // },
};

const getValues = {
  // getLength: {
  //   element: 'border-default',
  //   expect: 0.4,
  //   when: e => tools.math.round(e.getLength(), 3),
  // },
  // 'getAngle - rad': {
  //   element: 'border-diagonal-angle',
  //   expect: tools.math.round(Math.PI / 4, 3),
  //   when: e => tools.math.round(e.getAngle(), 3),
  // },
  // 'getAngle - degrees': {
  //   element: 'border-diagonal-angle',
  //   expect: tools.math.round(45, 3),
  //   when: e => tools.math.round(e.getAngle('deg'), 3),
  // },
  // getLabel: {
  //   element: 'label',
  //   expect: 'a',
  //   when: e => e.getLabel(),
  // },
  // 'getP1-local': {
  //   element: 'p1LengthAngle',
  //   expect: [0, 0],
  //   when: (e) => {
  //     const offset = e.getPosition('figure');
  //     const p = e.getP1('figure').sub(offset).round(3);
  //     return [p.x, p.y];
  //   },
  // },
  // 'getP2-local': {
  //   element: 'p1LengthAngle',
  //   expect: [0, 0.4],
  //   when: (e) => {
  //     const offset = e.getPosition('figure');
  //     const p = e.getP2('figure').sub(offset).round(3);
  //     return [p.x, p.y];
  //   },
  // },
};


const move = {
  // translate: {
  //   element: 'translator',
  //   events: [
  //     ['touchDown', [0.1, 0]],
  //     ['touchMove', [0.2, 0]],
  //     ['touchMove', [0.2, 0]],
  //     ['touchUp'],
  //   ],
  // },
  // rotateStart: {
  //   element: 'start-rotator',
  //   events: [
  //     ['touchDown', [0.3, 0]],
  //     ['touchMove', [0.3, 0.1]],
  //     ['touchMove', [0.3, 0.1]],
  //     ['touchUp'],
  //   ],
  // },
  // rotateCenter: {
  //   element: 'center-rotator',
  //   events: [
  //     ['touchDown', [0.1, 0]],
  //     ['touchMove', [0.1, 0.1]],
  //     ['touchMove', [0.1, 0.1]],
  //     ['touchUp'],
  //   ],
  // },
  // rotateEnd: {
  //   element: 'end-rotator',
  //   events: [
  //     ['touchDown', [-0.3, 0]],
  //     ['touchMove', [-0.3, 0.1]],
  //     ['touchMove', [-0.3, 0.1]],
  //     ['touchUp'],
  //   ],
  // },
  // translateRotate: {
  //   element: 'translate-rotate',
  //   events: [
  //     ['touchDown', [0, 0]],
  //     ['touchMove', [0.2, 0]],
  //     ['touchMove', [0.2, 0]],
  //     ['touchUp'],
  //     ['touchDown', [0.1, 0]],
  //     ['touchMove', [0.1, 0.1]],
  //     ['touchMove', [0.1, 0.1]],
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

  startGetValues = () => {
    if (getValues == null || Object.keys(getValues).length === 0) {
      return;
    }
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
    if (move == null || Object.keys(move).length === 0) {
      return;
    }
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
