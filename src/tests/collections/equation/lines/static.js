/* eslint no-unused-vars: ["error", {
  "varsIgnorePattern": "[(timeoutId)|(step)|(duration)]",
  "vars": "local",
  }] */
/* global figure getShapes getPosition */
/* eslint-disable block-scoped-var, object-property-newline */

if (typeof process === 'object') {
  /* eslint-disable global-require, no-unused-vars, vars-on-top, no-var */
  var { tools } = require('../../../../index.js').default;
}


let index = 0;
function makeShape(name, options, mods, getPos) {
  const { x, y } = getPos(index);
  const indexName = `${index}`;
  index += 1;
  const o = {
    name,
    make: 'collections.equation',
    options: tools.misc.joinObjects({}, {
      color: [1, 0, 0, 0.9],
      position: [0, 0],
      scale: 0.5,
    }, options),
    mods: tools.misc.joinObjects({}, {
      isTouchable: true,
      onClick: () => tools.misc.Console(`${indexName}: ${name}`),
    }, mods),
  };
  o.options.position = tools.g2.getPoint(options.position).add(x, y);
  return o;
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
    shape('array form', {
      forms: { 0: {
        lines: [[
          ['Lorem', ' ', 'ipsum'],
          ['dolor'],
          ['sit', ' ', 'amet', ' ', 'consectetur'],
        ]],
      } },
    }),
    shape('object form', {
      forms: { 0: {
        lines: {
          content: [
            ['Lorem', ' ', 'ipsum'],
            ['dolor'],
            ['sit', ' ', 'amet', ' ', 'consectetur'],
          ],
        },
      } },
    }),
    /*
    .......##.##.....##..######..########.####.########.##....##
    .......##.##.....##.##....##....##.....##..##........##..##.
    .......##.##.....##.##..........##.....##..##.........####..
    .......##.##.....##..######.....##.....##..######......##...
    .##....##.##.....##.......##....##.....##..##..........##...
    .##....##.##.....##.##....##....##.....##..##..........##...
    ..######...#######...######.....##....####.##..........##...
    */
    shape('justify right', {
      forms: { 0: {
        lines: {
          content: [
            ['Lorem', ' ', 'ipsum'],
            ['dolor'],
            ['sit', ' ', 'amet', ' ', 'consectetur'],
          ],
          justify: 'right',
        },
      } },
    }),
    shape('justify left', {
      forms: { 0: {
        lines: {
          content: [
            ['Lorem', ' ', 'ipsum'],
            ['dolor'],
            ['sit', ' ', 'amet', ' ', 'consectetur'],
          ],
          justify: 'left',
        },
      } },
    }),
    shape('justify element', {
      forms: { 0: {
        lines: {
          content: [
            { content: ['Lorem', ' ', 'ipsum'], justify: 'ipsum' },
            { content: ['dolor'], justify: 'dolor' },
            { content: ['sit', ' ', 'amet', ' ', 'consectetur'], justify: 'amet' },
          ],
          justify: 'element',
        },
      } },
    }),

    /*
    ..#######..########.########..######..########.########
    .##.....##.##.......##.......##....##.##..........##...
    .##.....##.##.......##.......##.......##..........##...
    .##.....##.######...######....######..######......##...
    .##.....##.##.......##.............##.##..........##...
    .##.....##.##.......##.......##....##.##..........##...
    ..#######..##.......##........######..########....##...
    */
    shape('offset positive', {
      forms: { 0: {
        lines: {
          content: [
            { content: ['Lorem', ' ', 'ipsum'] },
            { content: ['dolor'], offset: 0.1 },
            { content: ['sit', ' ', 'amet', ' ', 'consectetur'] },
          ],
          justify: 'left',
        },
      } },
    }),

    shape('offset negative', {
      forms: { 0: {
        lines: {
          content: [
            { content: ['Lorem', ' ', 'ipsum'] },
            { content: ['dolor'], offset: -0.1 },
            { content: ['sit', ' ', 'amet', ' ', 'consectetur'] },
          ],
          justify: 'left',
        },
      } },
    }),

    /*
    .##....##....###....##.......####..######...##....##
    ..##..##....##.##...##........##..##....##..###...##
    ...####....##...##..##........##..##........####..##
    ....##....##.....##.##........##..##...####.##.##.##
    ....##....#########.##........##..##....##..##..####
    ....##....##.....##.##........##..##....##..##...###
    ....##....##.....##.########.####..######...##....##
    */
    shape('yAlign: Top', {
      forms: { 0: {
        lines: {
          content: [
            { content: ['Lorem', ' ', 'ipsum'] },
            { content: ['dolor'] },
            { content: ['sit', ' ', 'amet', ' ', 'consectetur'] },
          ],
          yAlign: 'top',
        },
      } },
    }),
    shape('yAlign: Middle', {
      forms: { 0: {
        lines: {
          content: [
            { content: ['Lorem', ' ', 'ipsum'] },
            { content: ['dolor'] },
            { content: ['sit', ' ', 'amet', ' ', 'consectetur'] },
          ],
          yAlign: 'middle',
        },
      } },
    }),
    shape('yAlign: Bottom', {
      forms: { 0: {
        lines: {
          content: [
            { content: ['Lorem', ' ', 'ipsum'] },
            { content: ['dolor'] },
            { content: ['sit', ' ', 'amet', ' ', 'consectetur'] },
          ],
          yAlign: 'bottom',
        },
      } },
    }),
    shape('yAlign: line 0', {
      forms: { 0: {
        lines: {
          content: [
            { content: ['Lorem', ' ', 'ipsum'] },
            { content: ['dolor'] },
            { content: ['sit', ' ', 'amet', ' ', 'consectetur'] },
          ],
          yAlign: 0,
        },
      } },
    }),
    shape('yAlign: line 1', {
      forms: { 0: {
        lines: {
          content: [
            { content: ['Lorem', ' ', 'ipsum'] },
            { content: ['dolor'] },
            { content: ['sit', ' ', 'amet', ' ', 'consectetur'] },
          ],
          yAlign: 1,
        },
      } },
    }),
    shape('yAlign: line 2', {
      forms: { 0: {
        lines: {
          content: [
            { content: ['Lorem', ' ', 'ipsum'] },
            { content: ['dolor'] },
            { content: ['sit', ' ', 'amet', ' ', 'consectetur'] },
          ],
          yAlign: 2,
        },
      } },
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
  figure.add(getShapes(i => getPosition(i)));
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
