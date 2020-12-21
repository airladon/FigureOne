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
    // // Arrow
    shape('arrow-tri', { width: 0.025, arrow: 'triangle' }),
    shape('arrow-barb', { width: 0.025, arrow: 'barb' }),
    shape('arrow-rev', { width: 0.025, arrow: 'reverseTriangle' }),
    shape('arrow-pol', { width: 0.025, arrow: 'polygon' }),
    shape('arrow-circ', { width: 0.025, arrow: 'circle' }),
    shape('arrow-bar', { width: 0.025, arrow: 'bar' }),
    shape('arrow-line', { width: 0.025, arrow: 'line' }),


    shape('arrow-tail-false-tri', { width: 0.025, arrow: { head: 'triangle', tail: false } }),
    shape('arrow-tail-false-barb', { width: 0.025, arrow: { head: 'barb', tail: false } }),
    shape('arrow-tail-false-rev', { width: 0.025, arrow: { head: 'reverseTriangle', tail: false } }),
    shape('arrow-tail-false-pol', { width: 0.025, arrow: { head: 'polygon', tail: false } }),
    shape('arrow-tail-false-circ', { width: 0.025, arrow: { head: 'circle', tail: false } }),
    shape('arrow-tail-false-bar', { width: 0.025, arrow: { head: 'bar', tail: false } }),
    shape('arrow-tail-false-line', { width: 0.025, arrow: { head: 'line', tail: false } }),


    shape('arrow-scale-tri', { arrow: { head: 'triangle', scale: 0.5 } }),
    shape('arrow-scale-barb', { arrow: { head: 'barb', scale: 0.5 } }),
    shape('arrow-scale-rev', { arrow: { head: 'reverseTriangle', scale: 0.5 } }),
    shape('arrow-scale-poly', { arrow: { head: 'polygon', scale: 0.5, sides: 6, align: 'mid' } }),
    shape('arrow-tail-false', { arrow: { head: 'polygon', scale: 0.5, sides: 6, align: 'mid', tail: false } }),
    shape('arrow-tail-pos-tip', { arrow: { head: 'polygon', scale: 0.5, sides: 6, align: 'tip', tail: 0.1 } }),
    shape('arrow-pos-mid', { arrow: { head: 'polygon', scale: 0.5, sides: 6, align: 'mid', tail: 0.1 } }),
    shape('arrow-scale-circ', { arrow: { head: 'circle', scale: 0.5 } }),
    shape('arrow-bar-tip', { arrow: { head: 'bar', align: 'tip' } }),
    shape('arrow-bar-mid', { arrow: { head: 'bar', align: 'mid' } }),
    shape('arrow-scale-bar', { arrow: { head: 'bar', align: 'mid', scale: 0.5 } }),
    shape('arrow-scale-line', { arrow: { head: 'line', scale: 0.6 } }),


    shape('arrow-diff', { arrow: { start: 'triangle', end: 'reverseTriangle', scale: 0.5 } }),

    shape('arrow-diff2', { arrow: {
      start: { head: 'triangle', length: 0.2 },
      end: { head: 'reverseTriangle', length: 0.1 },
      scale: 0.5,
    } }),

    // Line Primitives
    shape('linePrimitives', { linePrimitives: true, lineNum: 5 }),
    shape('linePrimitives-close', { linePrimitives: true, lineNum: 5, close: true }),

    // Special case inside
    shape('arrow-special-inside', {
      points: [[0, 0], [1, 0], [0.5, 0.1]],
      widthIs: 'inside',
      close: true,
    }),

    shape('update'),
    shape('update-width'),
    // shape('update-arrow'),

    shape('simple', { simple: true }),
    shape('simple-close', { simple: true, close: true }),
  ];
}

let timeoutId;
let startUpdates;
let startGetValues;
let startMove;

const updates = {
  update: (e) => {
    e.custom.updatePoints({ points: [[0.3, 0.2], [-0.2, 0.2], [-0.2, -0.3]] });
  },
  'update-width': (e) => {
    e.custom.updatePoints({ width: 0.02 });
  },
  // 'update-arrow': (e) => {
  //   e.custom.updatePoints({ arrow: 'tri' });
  // },
};

const getValues = {
  // getAngle: {
  //   element: 'border-children',
  //   expect: 1,
  //   when: e => tools.math.round(e.getAngle(), 3),
  // },
};


const move = {
  // movePad: {
  //   element: 'move-pad',
  //   events: [
  //     ['touchDown', [0, 0]],
  //     ['touchMove', [-0.1, -0.1]],
  //     ['touchMove', [-0.1, -0.1]],
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
