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
    shape('default'),
    shape('border-line', { close: true, drawBorder: 'line' }),
    shape('border-negative', { close: true, drawBorder: 'negative' }),
    shape('border-positive', { close: true, drawBorder: 'positive' }),


    // DrawBorder
    shape('drawBorder-line', { drawBorder: 'line' }),
    shape('drawBorder-neg', { drawBorder: 'negative' }),
    shape('drawBorder-pos', { drawBorder: 'positive' }),
    shape('drawBorder-custom', { drawBorder: [[-0.1, -0.1], [0.5, -0.1], [0.5, 0.5]] }),

    // DrawBorderBuffer
    shape('drawBorderBuffer-num', { drawBorder: 'line', drawBorderBuffer: 0.2 }),
    shape('drawBorderBuffer-0', { drawBorder: 'line', drawBorderBuffer: 0 }),
    shape('drawBorderBuffer-custom1', {
      drawBorder: 'line',
      drawBorderBuffer: [[-0.1, -0.1], [0.5, -0.1], [0.5, 0.5]],
    }),
    shape('drawBorderBuffer-custom2', {
      drawBorder: 'line',
      drawBorderBuffer: [[[-0.1, -0.1], [0.5, -0.1], [0.5, 0.5]]],
    }),
    shape('drawBorderBuffer-custom3', {
      drawBorder: 'line',
      drawBorderBuffer: [
        [[-0.1, -0.1], [0.5, -0.1], [0.5, 0.5]],
        [[0.1, 0.4], [0.2, 0.4], [0.1, 0.5]],
      ],
    }),

    // border
    shape('border-draw', { border: 'draw' }),
    shape('border-buffer', { border: 'buffer', touchBorder: 0.1 }),
    shape('border-rect', { border: 'rect' }),
    shape('border-num', { border: 0.1 }),
    shape('border-custom1', { border: [[-0.1, -0.1], [0.5, -0.1], [0.5, 0.5]] }),
    shape('border-custom2', {
      border: [
        [[-0.1, -0.1], [0.5, -0.1], [0.5, 0.5]],
        [[0.1, 0.4], [0.2, 0.4], [0.1, 0.5]],
      ],
    }),

    // touchBorder
    shape('touchBorder-draw', { touchBorder: 'draw', border: 0.1 }),
    shape('touchBorder-buffer', { touchBorder: 'buffer' }),
    shape('touchBorder-rect', { touchBorder: 'rect' }),
    shape('touchBorder-num', { touchBorder: 0.1 }),
    shape('touchBorder-custom1', { touchBorder: [[-0.1, -0.1], [0.5, -0.1], [0.5, 0.5]] }),
    shape('touchBorder-custom2', {
      touchBorder: [
        [[-0.1, -0.1], [0.5, -0.1], [0.5, 0.5]],
        [[0.1, 0.4], [0.2, 0.4], [0.1, 0.5]],
      ],
    }),
    shape('touchBorder-border', { touchBorder: 'border', border: 0.1 }),

    // Corner Style
    shape('corner-none', { cornerStyle: 'none' }),
    shape('corner-auto', { cornerStyle: 'auto' }),
    shape('corner-fill', { cornerStyle: 'fill' }),
    shape('corner-radius', { cornerStyle: 'radius', cornerSize: 0.1, cornerSides: 3 }),
    shape('corner-none-close', { cornerStyle: 'none', close: true }),
    shape('corner-auto-close', { cornerStyle: 'auto', close: true }),
    shape('corner-fill-close', { cornerStyle: 'fill', close: true }),
    shape('corner-radius-close', { cornerStyle: 'radius', cornerSize: 0.1, cornerSides: 3, close: true }),

    // Corners Only
    shape('cornersOnly', { cornersOnly: 'true', cornerLength: 0.15, close: true }),

    // Min Auto Corner Angle
    shape('minAutoCornerAngle-false', {
      points: [[0, 0], [0.5, 0], [0, 0.5]],
      minAutoCornerAngle: Math.PI / 6,
    }),
    shape('minAutoCornerAngle-true', {
      points: [[0, 0], [0.5, 0], [0, 0.2]],
      minAutoCornerAngle: Math.PI / 6,
    }),

    // Dash
    shape('dash', { dash: [0.05, 0.02] }),
    shape('dash-close', { dash: [0.05, 0.02], close: true }),
    shape('dash-offset-ref', {
      points: [[0, 0], [0.5, 0]],
      dash: [0.05, 0.05],
    }),
    shape('dash-offset', {
      points: [[0, 0], [0.5, 0]],
      dash: [0.025, 0.05, 0.05],
    }),

    // WidthIs
    shape('widthIs-mid', { widthIs: 'mid' }),
    shape('widthIs-p', { widthIs: 'positive' }),
    shape('widthIs-n', { widthIs: 'negative' }),
    shape('widthIs-m-close', { widthIs: 'mid', close: true }),
    shape('widthIs-p-close', { widthIs: 'positive', close: true }),
    shape('widthIs-n-close', { widthIs: 'negative', close: true }),
    shape('widthIs-num', { widthIs: 0.3 }),
    shape('widthIs-num-close', { widthIs: 0.3, close: true }),
    shape('widthIs-inside', { points: [[0, 0], [0.5, 0], [0, 0.5]], widthIs: 'inside' }),
    shape('widthIs-inside-rev', { points: [[0, 0.5], [0.5, 0], [0, 0]], widthIs: 'inside' }),
    shape('widthIs-inside-close', {
      points: [[0, 0], [0.5, 0], [0, 0.5]],
      widthIs: 'inside',
      close: true,
    }),
    shape('widthIs-inside-close-rev', {
      points: [[0, 0.5], [0.5, 0], [0, 0]],
      widthIs: 'inside',
      close: true,
    }),

    shape('widthIs-outside', { points: [[0, 0], [0.5, 0], [0, 0.5]], widthIs: 'outside' }),
    shape('widthIs-outside-rev', { points: [[0, 0.5], [0.5, 0], [0, 0]], widthIs: 'outside' }),
    shape('widthIs-outside-close', {
      points: [[0, 0], [0.5, 0], [0, 0.5]],
      widthIs: 'outside',
      close: true,
    }),
    shape('widthIs-outside-close-rev', {
      points: [[0, 0.5], [0.5, 0], [0, 0]],
      widthIs: 'outside',
      close: true,
    }),

    // shape('update'),
    // shape('update-width'),
    // // shape('update-arrow'),

    // shape('simple', { simple: true }),
    // shape('simple-close', { simple: true, close: true }),
  ];
}

let timeoutId;
let startUpdates;
let startGetValues;
let startMove;

const updates = {
  // update: (e) => {
  //   e.custom.updatePoints({ points: [[0.3, 0.2], [-0.2, 0.2], [-0.2, -0.3]] });
  // },
  // 'update-width': (e) => {
  //   e.custom.updatePoints({ width: 0.02 });
  // },
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
