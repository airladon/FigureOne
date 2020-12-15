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
    shape('side-labels-value', { side: {
      label: { text: null, location: 'negative' },
    } }),
    shape('side-labels-line', {
      close: true,
      side: {
        label: { text: null, location: 'negative' },
        showLine: true,
        width: 0.02,
        offset: -0.1,
        arrow: 'triangle',
        show: [1, 2],
        1: { label: { text: 'a' } },
      },
    }),

    /*
    ................###....##....##..######...##.......########
    ...............##.##...###...##.##....##..##.......##......
    ..............##...##..####..##.##........##.......##......
    .............##.....##.##.##.##.##...####.##.......######..
    .............#########.##..####.##....##..##.......##......
    .............##.....##.##...###.##....##..##.......##......
    .............##.....##.##....##..######...########.########
    */
    shape('side-angle-value', {
      angle: {
        label: { text: null },
        curve: { width: 0.03, radius: 0.2 },
        direction: -1,
      },
    }),
    shape('side-angle-line', {
      points: [[-0.3, -0.3], [0.5, -0.3], [-0.3, 0.3]],
      close: true,
      angle: {
        label: { text: null },
        curve: { width: 0.03, radius: 0.15 },
        show: [1, 2],
        1: { label: { text: 'a' } },
        direction: -1,
      },
    }),


    /*
    .............########.....###....########.
    .............##.....##...##.##...##.....##
    .............##.....##..##...##..##.....##
    .............########..##.....##.##.....##
    .............##........#########.##.....##
    .............##........##.....##.##.....##
    .............##........##.....##.########.
    */
    shape('side-pad-value', {
      pad: {
        radius: 0.15,
        line: { width: 0.01 },
      },
    }),
    shape('side-pad-line', {
      points: [[-0.3, -0.3], [0.5, -0.3], [-0.3, 0.3]],
      close: true,
      pad: {
        show: [1, 2],
        radius: 0.1,
      },
    }),

    /*
    .............##.....##..#######..##.....##.########
    .............###...###.##.....##.##.....##.##......
    .............####.####.##.....##.##.....##.##......
    .............##.###.##.##.....##.##.....##.######..
    .............##.....##.##.....##..##...##..##......
    .............##.....##.##.....##...##.##...##......
    .............##.....##..#######.....###....########
    */
    shape('move-pad', {
      pad: {
        radius: 0.15,
        line: { width: 0.01 },
        isMovable: true,
      },
    }, { isTouchable: false }),
  ];
}

let timeoutId;
let startUpdates;
let startGetValues;
let startMove;

const updates = {
  'move-pad': (e) => {
    e.setPositionWithoutMoving(e.points[0]);
  },
};

const getValues = {
  // getAngle: {
  //   element: 'border-children',
  //   expect: 1,
  //   when: e => tools.math.round(e.getAngle(), 3),
  // },
};


const move = {
  movePad: {
    element: 'move-pad',
    events: [
      ['touchDown', [0, 0]],
      ['touchMove', [-0.1, -0.1]],
      ['touchMove', [-0.1, -0.1]],
      ['touchUp'],
      ['touchDown', [0.3, 0]],
      ['touchMove', [0.4, 0.1]],
      ['touchMove', [0.4, 0.1]],
      ['touchUp'],
      ['touchDown', [0, 0.3]],
      ['touchMove', [-0.1, 0.4]],
      ['touchMove', [-0.1, 0.4]],
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
