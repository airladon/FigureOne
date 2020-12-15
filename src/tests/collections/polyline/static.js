/* eslint no-unused-vars: ["error", {
  "varsIgnorePattern": "[(timeoutId)|(step)|(duration)]",
  "vars": "local",
  }] */
/* global figure getShapes getPosition */
/* eslint-disable block-scoped-var, object-property-newline */

if (typeof process === 'object') {
  /* eslint-disable global-require, no-unused-vars, vars-on-top, no-var */
  var { tools } = require('../../../index.js').default;
  var { makeShape } = require('./common.js');
}


function getShapes(getPos) {
  const shape = (name, options, mods) => makeShape(name, options, mods, getPos);

  /* eslint-disable object-curly-newline */
  return [
    // /*
    // .............########..########.########.####.##....##.########
    // .............##.....##.##.......##........##..###...##.##......
    // .............##.....##.##.......##........##..####..##.##......
    // .............##.....##.######...######....##..##.##.##.######..
    // .............##.....##.##.......##........##..##..####.##......
    // .............##.....##.##.......##........##..##...###.##......
    // .............########..########.##.......####.##....##.########
    // */
    shape('define-default'),
    shape('define-custom', {
      points: [[0, 0], [-0.3, 0], [0, 0.3]],
      dash: [0.05, 0.05],
      close: true,
    }),

    // /*
    // .......########...#######..########..########..########.########.
    // .......##.....##.##.....##.##.....##.##.....##.##.......##.....##
    // .......##.....##.##.....##.##.....##.##.....##.##.......##.....##
    // .......########..##.....##.########..##.....##.######...########.
    // .......##.....##.##.....##.##...##...##.....##.##.......##...##..
    // .......##.....##.##.....##.##....##..##.....##.##.......##....##.
    // .......########...#######..##.....##.########..########.##.....##
    // */
    shape('border-label', {
      side: {
        label: { text: 'a', location: 'negative' },
        width: 0.02, offset: -0.15, arrow: { head: 'triangle', scale: 0.5 },
      },
    }),
    shape('border-label-side', {
      side: {
        border: 'rect',
        label: { text: 'a', location: 'negative' },
        width: 0.02, offset: -0.15, arrow: { head: 'triangle', scale: 0.5 },
      },
    }),
    shape('border-label-rect', {
      border: 'rect',
      side: {
        // border: 'rect',
        label: { text: 'a', location: 'negative' },
        width: 0.02, offset: -0.15, arrow: { head: 'triangle', scale: 0.5 },
      },
    }),
    shape('border-label-number', {
      border: 0.05,
      side: {
        label: { text: 'a', location: 'negative' },
        width: 0.02, offset: -0.15, arrow: { head: 'triangle', scale: 0.5 },
      },
    }),
    shape('border-label-bufferRect', {
      border: [0.2, 0.1, 0.15, 0.05],
      side: {
        label: { text: 'a', location: 'negative' },
        width: 0.02, offset: -0.15, arrow: { head: 'triangle', scale: 0.5 },
      },
    }),
    shape('border-label-custom', {
      border: [[0, 0], [0.3, 0], [0, 0.3]],
      side: {
        label: { text: 'a', location: 'negative' },
        width: 0.02, offset: -0.15, arrow: { head: 'triangle', scale: 0.5 },
      },
    }),
    shape('border-label-side-custom', {
      side: {
        border: [[0, 0], [0.3, 0], [0, 0.3]],
        label: { text: 'a', location: 'negative' },
        width: 0.02, offset: -0.15, arrow: { head: 'triangle', scale: 0.5 },
      },
    }),

    shape('touchBorder-line', {
      drawBorderBuffer: 0.05,
      side: {
        label: { text: 'a', location: 'negative' },
        width: 0.02, offset: -0.15, arrow: { head: 'triangle', scale: 0.5 },
      },
    }),
    shape('touchBorder-label', {
      side: {
        label: { text: 'a', location: 'negative' },
        width: 0.02, offset: -0.15, arrow: { head: 'triangle', scale: 0.5 },
      },
    }),
    shape('touchBorder-label-side', {
      side: {
        touchBorder: 'rect',
        label: { text: 'a', location: 'negative' },
        width: 0.02, offset: -0.15, arrow: { head: 'triangle', scale: 0.5 },
      },
    }),
    shape('touchBorder-label-rect', {
      touchBorder: 'rect',
      side: {
        // touchBorder: 'rect',
        label: { text: 'a', location: 'negative' },
        width: 0.02, offset: -0.15, arrow: { head: 'triangle', scale: 0.5 },
      },
    }),
    shape('touchBorder-label-number', {
      touchBorder: 0.05,
      side: {
        label: { text: 'a', location: 'negative' },
        width: 0.02, offset: -0.15, arrow: { head: 'triangle', scale: 0.5 },
      },
    }),
    shape('touchBorder-label-bufferRect', {
      touchBorder: [0.2, 0.1, 0.15, 0.05],
      side: {
        label: { text: 'a', location: 'negative' },
        width: 0.02, offset: -0.15, arrow: { head: 'triangle', scale: 0.5 },
      },
    }),
    shape('touchBorder-label-custom', {
      touchBorder: [[0, 0], [0.3, 0], [0, 0.3]],
      side: {
        label: { text: 'a', location: 'negative' },
        width: 0.02, offset: -0.15, arrow: { head: 'triangle', scale: 0.5 },
      },
    }),
    shape('touchBorder-label-side-custom', {
      side: {
        touchBorder: [[0, 0], [0.3, 0], [0, 0.3]],
        label: { text: 'a', location: 'negative' },
        width: 0.02, offset: -0.15, arrow: { head: 'triangle', scale: 0.5 },
      },
    }),
    shape('touchBorder-angle', {
      angle: {
        direction: -1,
        label: null,
        curve: {
          radius: 0.2,
          width: 0.03,
        },
      },
    }),
    shape('touchBorder-angle-rect', {
      touchBorder: 'rect',
      angle: {
        direction: -1,
        label: null,
        curve: {
          radius: 0.2,
          width: 0.03,
        },
      },
    }),


    /*
    .......########.....###.....######..##.....##
    .......##.....##...##.##...##....##.##.....##
    .......##.....##..##...##..##.......##.....##
    .......##.....##.##.....##..######..#########
    .......##.....##.#########.......##.##.....##
    .......##.....##.##.....##.##....##.##.....##
    .......########..##.....##..######..##.....##
    */
    shape('dash', { dash: [0.05, 0.05] }),
    shape('dash-offset', { dash: [0.025, 0.05, 0.05] }),


    /*
    ..........###....########..########...#######..##......##
    .........##.##...##.....##.##.....##.##.....##.##..##..##
    ........##...##..##.....##.##.....##.##.....##.##..##..##
    .......##.....##.########..########..##.....##.##..##..##
    .......#########.##...##...##...##...##.....##.##..##..##
    .......##.....##.##....##..##....##..##.....##.##..##..##
    .......##.....##.##.....##.##.....##..#######...###..###.
    */
    shape('arrow', { width: 0.02, arrow: 'triangle' }),

    /*
    ..............######..####.########..########
    .............##....##..##..##.....##.##......
    .............##........##..##.....##.##......
    ..............######...##..##.....##.######..
    ...................##..##..##.....##.##......
    .............##....##..##..##.....##.##......
    ..............######..####.########..########
    */
    shape('side-labels', { side: { label: { text: 'a', location: 'negative' } } }),
    shape('side-labels-value', { side: { label: { text: null, location: 'negative' } } }),

    // /*
    // ........######...#######..########..##....##.########.########.
    // .......##....##.##.....##.##.....##.###...##.##.......##.....##
    // .......##.......##.....##.##.....##.####..##.##.......##.....##
    // .......##.......##.....##.########..##.##.##.######...########.
    // .......##.......##.....##.##...##...##..####.##.......##...##..
    // .......##....##.##.....##.##....##..##...###.##.......##....##.
    // ........######...#######..##.....##.##....##.########.##.....##
    // */
    // angle('corner-width', { corner: { width: 0.02 } }),
    // angle('corner-length', { corner: { length: 0.5 } }),
    // angle('corner-color', { corner: { color: [0, 1, 0, 1] } }),
    // angle('corner-corner-auto', { corner: { style: 'auto' } }),
    // angle('corner-corner-none', { corner: { style: 'none' } }),
    // angle('corner-corner-fill', { corner: { style: 'fill' } }),

    // /*
    // ..............######..##.....##.########..##.....##.########
    // .............##....##.##.....##.##.....##.##.....##.##......
    // .............##.......##.....##.##.....##.##.....##.##......
    // .............##.......##.....##.########..##.....##.######..
    // .............##.......##.....##.##...##....##...##..##......
    // .............##....##.##.....##.##....##....##.##...##......
    // ..............######...#######..##.....##....###....########
    // */
    // angle('curve-fill', { curve: { fill: true } }),
    // angle('curve-radius', { curve: { radius: 0.2 } }),
    // angle('curve-num', {
    //   curve: { radius: 0.2, width: 0.02, num: 3, step: 0.05 },
    // }),
    // angle('curve-num-neg', {
    //   curve: { radius: 0.4, width: 0.02, num: 3, step: -0.05 },
    // }),
    // angle('curve-autoHide-show', { curve: { autoHide: 1 }, angle: 1 }),
    // angle('curve-autoHide-hide', { curve: { autoHide: 1.1 }, angle: 1 }),
    // angle('curve-autoHideMax-hide', { curve: { autoHideMax: 0.9 }, angle: 1 }),
    // angle('curve-rightAngle', { curve: { autoRightAngle: true }, angle: Math.PI / 2 }),
    // angle('curve-rightAngleRange-default', { curve: { autoRightAngle: true }, angle: Math.PI / 2 - 0.05 }),
    // angle('curve-rightAngleRange', {
    //   curve: { autoRightAngle: true, rightAngleRange: 0.1 },
    //   angle: Math.PI / 2 - 0.05,
    // }),

    // // /*
    // // .......##.....##.########.########.##.....##..#######..########...######.
    // // .......###...###.##..........##....##.....##.##.....##.##.....##.##....##
    // // .......####.####.##..........##....##.....##.##.....##.##.....##.##......
    // // .......##.###.##.######......##....#########.##.....##.##.....##..######.
    // // .......##.....##.##..........##....##.....##.##.....##.##.....##.......##
    // // .......##.....##.##..........##....##.....##.##.....##.##.....##.##....##
    // // .......##.....##.########....##....##.....##..#######..########...######.
    // // */
    // angle('setAngle'),
    // angle('setAngle-P1P2P3'),
    // angle('setLabel', { label: 'a' }),
    // angle('setLabelToRealAngle', { label: 'a' }),
    // angle('updateLabel', { label: 'a' }),
    // angle('updateLabelCustom', { label: 'a' }),

    // /*
    // .............##.....##..#######..##.....##.########
    // .............###...###.##.....##.##.....##.##......
    // .............####.####.##.....##.##.....##.##......
    // .............##.###.##.##.....##.##.....##.######..
    // .............##.....##.##.....##..##...##..##......
    // .............##.....##.##.....##...##.##...##......
    // .............##.....##..#######.....###....########
    // */
    // angle('move-start-rotation', {}, { isTouchable: false }),
    // angle('move-start-angle', {}, { isTouchable: false }),
    // angle('move-end-rotation', {}, { isTouchable: false }),
    // angle('move-end-angle', {}, { isTouchable: false }),
    // angle('move-translate', {}, { isTouchable: false }),
    // angle('move-all', {}, { isTouchable: false }),
    // angle('move-all-reverse', {}, { isTouchable: false }),
    // angle('move-all-angle', {}, { isTouchable: false }),
  ];
}

let timeoutId;
let startUpdates;
let startGetValues;
let startMove;

const updates = {
  // 'label-autoForm': (e) => {
  //   e.label.eqn.showForm('1');
  // },
  // 'label-updateOff': (e) => {
  //   e.setRotation(Math.PI / 4);
  // },
  // 'label-updateOn': (e) => {
  //   e.setRotation(Math.PI / 4);
  // },
  // setAngle: (e) => {
  //   e.setAngle({ startAngle: 1, angle: 2 });
  // },
  // 'setAngle-P1P2P3': (e) => {
  //   const p = e.getPosition('figure');
  //   e.setAngle({
  //     p1: [0 + p.x, 0.3 + p.y],
  //     p2: [0 + p.x, 0 + p.y],
  //     p3: [-0.3 + p.x, 0 + p.y] });
  // },
  // setLabel: (e) => {
  //   e.setLabel('b');
  // },
  // setLabelToRealAngle: (e) => {
  //   e.setLabelToRealAngle();
  // },
  // updateLabel: (e) => {
  //   e.setRotation(1);
  //   e.updateLabel();
  // },
  // updateLabelCustom: (e) => {
  //   e.setRotation(1);
  //   e.updateLabel(2.57);
  // },
  // 'move-start-rotation': (e) => {
  //   e.setMovable({ startArm: 'rotation', width: 0.1 });
  // },
  // 'move-start-angle': (e) => {
  //   e.setMovable({ startArm: 'angle', movePadRadius: 0.2, width: 0.1 });
  // },
  // 'move-end-rotation': (e) => {
  //   e.setMovable({ endArm: 'rotation', width: 0.1 });
  // },
  // 'move-end-angle': (e) => {
  //   e.setMovable({ endArm: 'angle', movePadRadius: 0.2, width: 0.1 });
  // },
  // 'move-translate': (e) => {
  //   e.setMovable({ movePadRadius: 0.2 });
  // },
  // 'move-all': (e) => {
  //   e.setMovable({ startArm: 'rotation', endArm: 'angle', movePadRadius: 0.2, width: 0.1 });
  // },
  // 'move-all-reverse': (e) => {
  //   e.setMovable({ startArm: 'angle', endArm: 'rotation', movePadRadius: 0.2, width: 0.1 });
  // },
  // 'move-all-angle': (e) => {
  //   e.setMovable({ startArm: 'angle', endArm: 'angle', movePadRadius: 0.2, width: 0.1 });
  // },
};

const getValues = {
  // getAngle: {
  //   element: 'border-children',
  //   expect: 1,
  //   when: e => tools.math.round(e.getAngle(), 3),
  // },
  // getAngleDegrees: {
  //   element: 'border-children',
  //   expect: 57.296,
  //   when: e => tools.math.round(e.getAngle('deg'), 3),
  // },
  // getLabelReal: {
  //   element: 'border-children',
  //   expect: '57\u00b0',
  //   when: e => e.getLabel(),
  // },
  // getLabelText: {
  //   element: 'label-scale',
  //   expect: 'a',
  //   when: e => e.getLabel(),
  // },
};


const move = {
  // moveStartRotation: {
  //   element: 'move-start-rotation',
  //   events: [
  //     ['touchDown', [0.2, 0]],
  //     ['touchMove', [0.2, 0.1]],
  //     ['touchMove', [0.2, 0.1]],
  //     ['touchUp'],
  //   ],
  // },
  // moveStartAngle: {
  //   element: 'move-start-angle',
  //   events: [
  //     ['touchDown', [0.2, 0]],
  //     ['touchMove', [0.2, -0.1]],
  //     ['touchMove', [0.2, -0.1]],
  //     ['touchUp'],
  //   ],
  // },
  // moveEndRotation: {
  //   element: 'move-end-rotation',
  //   events: [
  //     ['touchDown', [0.1, 0.15]],
  //     ['touchMove', [0, 0.15]],
  //     ['touchMove', [0, 0.15]],
  //     ['touchUp'],
  //   ],
  // },
  // moveEndAngle: {
  //   element: 'move-end-angle',
  //   events: [
  //     ['touchDown', [0.1, 0.15]],
  //     ['touchMove', [0, 0.15]],
  //     ['touchMove', [0, 0.15]],
  //     ['touchUp'],
  //   ],
  // },
  // moveTranslate: {
  //   element: 'move-translate',
  //   events: [
  //     ['touchDown', [0.0, 0]],
  //     ['touchMove', [0.0, -0.1]],
  //     ['touchMove', [0.0, -0.1]],
  //     ['touchUp'],
  //   ],
  // },
  // moveAll: {
  //   element: 'move-all',
  //   events: [
  //     ['touchDown', [0.1, 0.15]],
  //     ['touchMove', [0, 0.15]],
  //     ['touchMove', [0, 0.15]],
  //     ['touchUp'],
  //     ['touchDown', [0.3, 0]],
  //     ['touchMove', [0.3, -0.1]],
  //     ['touchMove', [0.3, -0.1]],
  //     ['touchUp'],
  //   ],
  // },
  // moveAllReverse: {
  //   element: 'move-all-reverse',
  //   events: [
  //     ['touchDown', [0.3, 0]],
  //     ['touchMove', [0.3, -0.2]],
  //     ['touchMove', [0.3, -0.2]],
  //     ['touchUp'],
  //     ['touchDown', [0.1, 0.15]],
  //     ['touchMove', [0.2, 0.15]],
  //     ['touchMove', [0.2, 0.15]],
  //     ['touchUp'],
  //   ],
  // },
  // moveAllAngle: {
  //   element: 'move-all-angle',
  //   events: [
  //     ['touchDown', [0.3, 0]],
  //     ['touchMove', [0.3, -0.2]],
  //     ['touchMove', [0.3, -0.2]],
  //     ['touchUp'],
  //     ['touchDown', [0.1, 0.15]],
  //     ['touchMove', [0, 0.15]],
  //     ['touchMove', [0, 0.15]],
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
}
