/* eslint-disable block-scoped-var */

if (typeof process === 'object') {
  // eslint-disable-next-line global-require, no-unused-vars, vars-on-top, no-var
  var { tools } = require('../../../index').default;
}

let index = 0;
function makeShape(name, options, mods, getPos) {
  const { x, y } = getPos(index);
  // const indexName = `${index}`;
  index += 1;
  const o = {
    name,
    make: 'collection',
    elements: [
      {
        name: 'text',
        make: 'collections.text',
        options: tools.misc.joinObjects({}, {
          font: { family: 'Times New Roman' },
          text: ['This |is| a', 'test of', 'multi-lines'],
        }, options),
      },
      {
        name: 'count',
        make: 'text',
        position: [0, 0.3],
        text: '0',
        // border: [[0, 0], [0, 0], [0, 0], [0, 0]],
        // touchBorder: [[0, 0], [0, 0], [0, 0], [0, 0]],
      },
    ],
    position: [x, y],
  };
  return o;
}

if (typeof process === 'object') {
  // eslint-disable-next-line global-require, no-unused-vars, vars-on-top, no-var
  module.exports = {
    makeShape,
  };
}
