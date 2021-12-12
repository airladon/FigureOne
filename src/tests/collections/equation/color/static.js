/* eslint no-unused-vars: ["error", {
  "varsIgnorePattern": "[(timeoutId)|(step)|(duration)]",
  "vars": "local",
  }] */
/* global figure getShapes getPosition */
/* eslint-disable block-scoped-var, object-property-newline */

if (typeof process === 'object') {
  /* eslint-disable global-require, no-unused-vars, vars-on-top, no-var */
  var { tools } = require('../../../../index').default;
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
      scale: 1,
    }, options),
    mods: tools.misc.joinObjects({}, {
      isTouchable: true,
      onClick: () => tools.misc.Console(`${indexName}: ${name}`),
    }, mods),
  };
  o.options.position = tools.g2.getPoint(options.position || [0, 0]).add(x, y);
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
      forms: {
        0: [
          'a',
          { color: ['b', [0, 0, 1, 1]] },
          'c',
        ],
      },
    }),
    shape('object form', {
      forms: {
        0: [
          'a',
          { color: { content: 'b', color: [0, 0, 1, 1] } },
          'c',
        ],
      },
    }),
    /*
    .########.########.....###.....######.
    .##.......##.....##...##.##...##....##
    .##.......##.....##..##...##..##......
    .######...########..##.....##.##......
    .##.......##...##...#########.##......
    .##.......##....##..##.....##.##....##
    .##.......##.....##.##.....##..######.
    */
    shape('frac1', {
      elements: {
        v: { symbol: 'vinculum', lineWidth: 0.05 },
      },
      forms: {
        0: [
          'a',
          { color: [{ frac: ['b', 'v', 'd'] }, [0, 0, 1, 1]] },
          'c',
        ],
      },
    }),
    shape('frac2', {
      elements: {
        v: { symbol: 'vinculum', lineWidth: 0.05 },
      },
      forms: {
        0: [
          'a',
          { frac: ['b', 'v', { color: ['d', [0, 0, 1, 1]] }] },
          'c',
        ],
      },
    }),
    /*
    ..######...#######..##.....##.##.....##.########.##....##.########
    .##....##.##.....##.###...###.###...###.##.......###...##....##...
    .##.......##.....##.####.####.####.####.##.......####..##....##...
    .##.......##.....##.##.###.##.##.###.##.######...##.##.##....##...
    .##.......##.....##.##.....##.##.....##.##.......##..####....##...
    .##....##.##.....##.##.....##.##.....##.##.......##...###....##...
    ..######...#######..##.....##.##.....##.########.##....##....##...
    */
    shape('com1', {
      elements: {
        br: { symbol: 'brace', lineWidth: 0.02, side: 'top' },
      },
      forms: {
        0: [
          'a',
          { color: [{ topComment: ['befgh', 'dfgh', 'br'] }, [0, 0, 1, 1]] },
          'c',
        ],
      },
    }),
    shape('com2', {
      elements: {
        br: { symbol: 'brace', lineWidth: 0.02, side: 'top' },
      },
      forms: {
        0: [
          'a',
          { topComment: ['befgh', { color: ['dfgh', [0, 0, 1, 1]] }, 'br'] },
          'c',
        ],
      },
    }),
    /*
    ..######...#######..##....##.########....###....####.##....##
    .##....##.##.....##.###...##....##......##.##....##..###...##
    .##.......##.....##.####..##....##.....##...##...##..####..##
    .##.......##.....##.##.##.##....##....##.....##..##..##.##.##
    .##.......##.....##.##..####....##....#########..##..##..####
    .##....##.##.....##.##...###....##....##.....##..##..##...###
    ..######...#######..##....##....##....##.....##.####.##....##
    */
    shape('container', {
      forms: {
        0: [
          'a',
          { color: [{ container: ['befgh', 0.6] }, [0, 0, 1, 1]] },
          'c',
        ],
      },
    }),
    /*
    .########...#######...#######..########
    .##.....##.##.....##.##.....##....##...
    .##.....##.##.....##.##.....##....##...
    .########..##.....##.##.....##....##...
    .##...##...##.....##.##.....##....##...
    .##....##..##.....##.##.....##....##...
    .##.....##..#######...#######.....##...
    */
    shape('root', {
      forms: {
        0: [
          'a',
          { color: [{ root: ['radical', 'befgh'] }, [0, 0, 1, 1]] },
          'c',
        ],
      },
    }),
    /*
    ..######..##.....##.##.....##.########..########...#######..########.
    .##....##.##.....##.###...###.##.....##.##.....##.##.....##.##.....##
    .##.......##.....##.####.####.##.....##.##.....##.##.....##.##.....##
    ..######..##.....##.##.###.##.########..########..##.....##.##.....##
    .......##.##.....##.##.....##.##........##...##...##.....##.##.....##
    .##....##.##.....##.##.....##.##........##....##..##.....##.##.....##
    ..######...#######..##.....##.##........##.....##..#######..########.
    */
    shape('sum', {
      forms: {
        0: [
          'a',
          { color: [{ sumOf: ['sum', 'x', 'b', 'd'] }, [0, 0, 1, 1]] },
          'c',
        ],
      },
    }),
    shape('prod', {
      forms: {
        0: [
          'a',
          { color: [{ prodOf: ['prod', 'x', 'b', 'd'] }, [0, 0, 1, 1]] },
          'c',
        ],
      },
    }),
    /*
    .##.....##....###....########.########..####.##.....##
    .###...###...##.##......##....##.....##..##...##...##.
    .####.####..##...##.....##....##.....##..##....##.##..
    .##.###.##.##.....##....##....########...##.....###...
    .##.....##.#########....##....##...##....##....##.##..
    .##.....##.##.....##....##....##....##...##...##...##.
    .##.....##.##.....##....##....##.....##.####.##.....##
    */
    shape('matrix', {
      elements: {
        lb: { symbol: 'squareBracket', side: 'left' },
        rb: { symbol: 'squareBracket', side: 'right' },
      },
      forms: {
        0: [
          'a',
          { color: [{ matrix: [[2, 2], 'lb', ['d', 'e', 'f', 'g'], 'rb'] }, [0, 0, 1, 1]] },
          'c',
        ],
      },
    }),
    shape('matrix2', {
      elements: {
        lb: { symbol: 'squareBracket', side: 'left' },
        rb: { symbol: 'squareBracket', side: 'right' },
      },
      forms: {
        0: [
          'a',
          { color: [{ matrix: [[2, 2], 'lb', [{ color: ['d', [0, 1, 0, 1]] }, 'e', 'f', 'g'], 'rb'] }, [0, 0, 1, 1]] },
          'c',
        ],
      },
    }),
  ];
}

let timeoutId;
let startUpdates;
let startGetValues;
let startMove;

const updates = {
  simple: () => {
    const gls = figure.elements.getAllPrimitives().filter(e => e.text != null);
    const d2s = figure.elements.getAllPrimitives().filter(e => e.drawingObject.text != null);
    figure.add({
      make: 'text',
      text: `gl: ${gls.length.toString()}`,
      position: [-5, 4.8],
      font: { size: 0.15 },
    });
    figure.add({
      make: 'text',
      text: `2d: ${d2s.length.toString()}`,
      position: [-4, 4.8],
      font: { size: 0.15 },
    });
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
