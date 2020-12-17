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
  const shape = (name, options, line, mods) => makeShape(name, options, line, mods, getPos);
  const triArrow = (name, options = {}, lineOptions = null, mods = {}) => shape(name, tools.misc.joinObjects({}, { head: 'triangle' }, options), lineOptions);
  const revtriArrow = (name, options = {}, lineOptions = null, mods = {}) => shape(name, tools.misc.joinObjects({}, { head: 'reverseTriangle' }, options), lineOptions);
  const barbArrow = (name, options = {}, lineOptions = null, mods = {}) => shape(name, tools.misc.joinObjects({}, { head: 'barb' }, options), lineOptions);
  const polygonArrow = (name, options = {}, lineOptions = null, mods = {}) => shape(name, tools.misc.joinObjects({}, { head: 'polygon' }, options), lineOptions);
  const barArrow = (name, options = {}, lineOptions = null, mods = {}) => shape(name, tools.misc.joinObjects({}, { head: 'bar', length: 0.1 }, options), lineOptions);
  const lineArrow = (name, options = {}, lineOptions = null, mods = {}) => shape(name, tools.misc.joinObjects({}, { head: 'line', tailWidth: 0.05 }, options), lineOptions);

  /* eslint-disable object-curly-newline */
  return [
    /*
    .########.########..####....###....##....##..######...##.......########
    ....##....##.....##..##....##.##...###...##.##....##..##.......##......
    ....##....##.....##..##...##...##..####..##.##........##.......##......
    ....##....########...##..##.....##.##.##.##.##...####.##.......######..
    ....##....##...##....##..#########.##..####.##....##..##.......##......
    ....##....##....##...##..##.....##.##...###.##....##..##.......##......
    ....##....##.....##.####.##.....##.##....##..######...########.########
    */
    triArrow('tri-default'),
    triArrow('tri-define', { length: 0.6, width: 0.2 }),
    triArrow('tri-tail-neg', { tail: -0.1 }),
    triArrow('tri-tail-0', { tail: 0 }),
    triArrow('tri-tail-pos', { tail: 0.1 }),
    triArrow('tri-line', {}, { width: 0.05 }),
    triArrow('tri-line-tail-neg', { tail: -0.1 }, { width: 0.05 }),
    triArrow('tri-line-tail-0', { tail: 0 }, { width: 0.05 }),
    triArrow('tri-line-tail-pos', { tail: 0.1 }, { width: 0.05 }),
    triArrow('tri-dash', {}, { width: 0.02, dash: [0.03, 0.01] }),
    triArrow('tri-dash-tail-neg', { tail: -0.1 }, { width: 0.02, dash: [0.03, 0.01] }),
    triArrow('tri-dash-tail-0', { tail: 0 }, { width: 0.02, dash: [0.03, 0.01] }),
    triArrow('tri-dash-tail-pos', { tail: 0.1 }, { width: 0.02, dash: [0.03, 0.01] }),

    triArrow('tri-align-start', { align: 'start', tail: 0.1 }),
    triArrow('tri-align-tail', { align: 'tail', tail: 0.1 }),
    triArrow('tri-align-mid', { align: 'mid', tail: 0.1 }),
    triArrow('tri-align-tip', { align: 'tip', tail: 0.1 }),

    triArrow('tri-inside-t0', { tail: 0 }, { widthIs: 'inside' }),
    triArrow('tri-outside-t0', { tail: 0 }, { widthIs: 'outside' }),
    triArrow('tri-inside-tp', { tail: 0.1 }, { widthIs: 'inside' }),
    triArrow('tri-outside-tp', { tail: 0.1 }, { widthIs: 'outside' }),
    triArrow('tri-inside-t0d', { tail: 0 }, { widthIs: 'inside', dash: [0.03, 0.02] }),
    triArrow('tri-outside-t0d', { tail: 0 }, { widthIs: 'outside', dash: [0.03, 0.02] }),
    triArrow('tri-inside-tpd', { tail: 0.1 }, { widthIs: 'inside', dash: [0.03, 0.02] }),
    triArrow('tri-outside-tpd', { tail: 0.1 }, { widthIs: 'outside', dash: [0.03, 0.02] }),

    // Barb Arrow
    barbArrow('barb-default'),
    barbArrow('barb-define', { length: 0.6, width: 0.2 }),
    barbArrow('barb-tn', { tail: -0.05 }),
    barbArrow('barb-t0', { tail: 0 }),
    barbArrow('barb-tp', { tail: 0.1 }),
    barbArrow('barb-line', {}, { width: 0.05 }),
    barbArrow('barb-line-tn', { tail: -0.05 }, { width: 0.05 }),
    barbArrow('barb-line-t0', { tail: 0 }, { width: 0.05 }),
    barbArrow('barb-line-tp', { tail: 0.1 }, { width: 0.05 }),
    barbArrow('barb-dash', {}, { width: 0.02, dash: [0.03, 0.01] }),
    barbArrow('barb-dash-tn', { tail: -0.05 }, { width: 0.02, dash: [0.03, 0.01] }),
    barbArrow('barb-dash-t0', { tail: 0 }, { width: 0.02, dash: [0.03, 0.01] }),
    barbArrow('barb-dash-tp', { tail: 0.1 }, { width: 0.02, dash: [0.03, 0.01] }),

    barbArrow('barb-align-start', { align: 'start', tail: -0.05 }),
    barbArrow('barb-align-tail', { align: 'tail', tail: -0.05 }),
    barbArrow('barb-align-mid', { align: 'mid', tail: -0.05 }),
    barbArrow('barb-align-tip', { align: 'tip', tail: -0.05 }),

    barbArrow('barb-inside-t0', { tail: 0 }, { widthIs: 'inside' }),
    barbArrow('barb-outside-t0', { tail: 0, align: 'mid' }, { widthIs: 'outside' }),
    barbArrow('barb-inside-tp', { tail: 0.1 }, { widthIs: 'inside' }),
    barbArrow('barb-outside-tp', { tail: 0.1 }, { widthIs: 'outside' }),

    // Reverse Triangle Arrow
    revtriArrow('rev-default'),
    revtriArrow('rev-tn', { tail: -0.05 }),
    revtriArrow('rev-t0', { tail: 0 }),
    revtriArrow('rev-tp', { tail: 0.1 }),
    revtriArrow('rev-line', {}, {}),
    revtriArrow('rev-line-tn', { tail: -0.05 }, {}),
    revtriArrow('rev-line-t0', { tail: 0 }, {}),
    revtriArrow('rev-line-tp', { tail: 0.1 }, {}),
    revtriArrow('rev-dash', {}, { width: 0.02, dash: [0.03, 0.01] }),
    revtriArrow('rev-dash-tn', { tail: -0.05 }, { width: 0.02, dash: [0.03, 0.01] }),
    revtriArrow('rev-dash-t0', { tail: 0 }, { width: 0.02, dash: [0.03, 0.01] }),
    revtriArrow('rev-dash-tp', { tail: 0.1 }, { width: 0.02, dash: [0.03, 0.01] }),

    revtriArrow('rev-align-start', { align: 'start', tail: -0.05 }),
    revtriArrow('rev-align-tail', { align: 'tail', tail: -0.05 }),
    revtriArrow('rev-align-mid', { align: 'mid', tail: -0.05 }),
    revtriArrow('rev-align-tip', { align: 'tip', tail: -0.05 }),

    revtriArrow('rev-inside', {}, { widthIs: 'inside' }),
    revtriArrow('rev-outside', {}, { widthIs: 'outside' }),
    revtriArrow('rev-inside-tp', { tail: 0.1 }, { widthIs: 'inside' }),
    revtriArrow('rev-outside-tp', { tail: 0.1 }, { widthIs: 'outside' }),

    // Line Arrow
    lineArrow('line-default'),
    lineArrow('line-tn', { tail: -0.05 }),
    lineArrow('line-t0', { tail: 0 }),
    lineArrow('line-tp', { tail: 0.1 }),
    lineArrow('line-line', { tailWidth: 0.1 }, {}),
    lineArrow('line-line-tn', { tailWidth: 0.1, tail: -0.05 }, {}),
    lineArrow('line-line-t0', { tailWidth: 0.1, tail: 0 }, {}),
    lineArrow('line-line-tp', { tailWidth: 0.1, tail: 0.1 }, {}),
    lineArrow('line-dash', { tailWidth: 0.1 }, { width: 0.02, dash: [0.03, 0.02] }),
    lineArrow('line-dash-tn', { tailWidth: 0.1, tail: -0.05 }, { width: 0.02, dash: [0.03, 0.02] }),
    lineArrow('line-dash-t0', { tailWidth: 0.1, tail: 0 }, { width: 0.02, dash: [0.03, 0.02] }),
    lineArrow('line-dash-tp', { tailWidth: 0.1, tail: 0.1 }, { width: 0.02, dash: [0.03, 0.02] }),

    lineArrow('line-align-start', { align: 'start', tail: -0.05 }),
    lineArrow('line-align-tail', { align: 'tail', tail: -0.05 }),
    lineArrow('line-align-mid', { align: 'mid', tail: -0.05 }),
    lineArrow('line-align-tip', { align: 'tip', tail: -0.05 }),

    lineArrow('line-inside', { tailWidth: 0.1, tail: -0.05 }, { width: 0.04, widthIs: 'inside' }),
    lineArrow('line-outside', { tailWidth: 0.1, tail: -0.05 }, { width: 0.04, widthIs: 'outside' }),
    lineArrow('line-inside-tp', { tailWidth: 0.1, tail: 0 }, { width: 0.04, widthIs: 'inside' }),
    lineArrow('line-outside-tp', { tailWidth: 0.1, tail: 0 }, { width: 0.04, widthIs: 'outside' }),

    // Polygon Arrow
    polygonArrow('poly-default'),
    polygonArrow('poly-define', { radius: 0.3, sides: 4 }),
    polygonArrow('poly-tn', { tail: -0.05 }),
    polygonArrow('poly-t0', { tail: 0 }),
    polygonArrow('poly-tp', { tail: 0.1 }),
    polygonArrow('poly-line', {}, {}),
    polygonArrow('poly-line-tn', { tail: -0.05 }, {}),
    polygonArrow('poly-line-t0', { tail: 0 }, {}),
    polygonArrow('poly-line-tp', { tail: 0.1 }, {}),
    polygonArrow('poly-dash', {}, { width: 0.02, dash: [0.03, 0.01] }),
    polygonArrow('poly-dash-tn', { tail: -0.05 }, { width: 0.02, dash: [0.03, 0.01] }),
    polygonArrow('poly-dash-t0', { tail: 0 }, { width: 0.02, dash: [0.03, 0.01] }),
    polygonArrow('poly-dash-tp', { tail: 0.1 }, { width: 0.02, dash: [0.03, 0.01] }),

    polygonArrow('poly-align-start', { align: 'start', tail: -0.05 }),
    polygonArrow('poly-align-tail', { align: 'tail', tail: -0.05 }),
    polygonArrow('poly-align-mid', { align: 'mid', tail: -0.05 }),
    polygonArrow('poly-align-tip', { align: 'tip', tail: -0.05 }),

    polygonArrow('poly-inside', {}, { widthIs: 'inside' }),
    polygonArrow('poly-outside', {}, { widthIs: 'outside' }),
    polygonArrow('poly-inside-tp', { tail: 0.1 }, { widthIs: 'inside' }),
    polygonArrow('poly-outside-tp', { tail: 0.1 }, { widthIs: 'outside' }),

    // Bar Arrow
    barArrow('bar-default'),
    barArrow('bar-define', { radius: 0.3, sides: 4 }),
    barArrow('bar-tn', { tail: -0.05 }),
    barArrow('bar-t0', { tail: 0 }),
    barArrow('bar-tp', { tail: 0.05 }),
    barArrow('bar-dash', {}, { width: 0.02, dash: [0.03, 0.01] }),
    barArrow('bar-dash-tn', { tail: -0.05 }, { width: 0.02, dash: [0.03, 0.01] }),
    barArrow('bar-dash-t0', { tail: 0 }, { width: 0.02, dash: [0.03, 0.01] }),
    barArrow('bar-dash-tp', { tail: 0.05 }, { width: 0.02, dash: [0.03, 0.01] }),

    barArrow('bar-align-start', { align: 'start', tail: 0.05 }),
    barArrow('bar-align-tail', { align: 'tail', tail: 0.05 }),
    barArrow('bar-align-mid', { align: 'mid', tail: 0.05 }),
    barArrow('bar-align-tip', { align: 'tip', tail: 0.05 }),

    // Circle:
    shape('circle', {
      head: 'polygon',
      radius: 0.2,
      sides: 20,
    }),

    // Rectangle
    shape('rectangle', {
      head: 'rectangle',
      width: 0.3,
      length: 0.3,
      tail: 0.1,
    }),
  ];
}

let timeoutId;
let startUpdates;
let startGetValues;
let startMove;

const updates = {
  // 'move-pad': (e) => {
  //   e.setPositionWithoutMoving(e.points[0]);
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
