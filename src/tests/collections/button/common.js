/* eslint-disable block-scoped-var */

if (typeof process === 'object') {
  // eslint-disable-next-line global-require, no-unused-vars, vars-on-top, no-var
  var { tools } = require('../../../index').default;
}

let index = 0;
function makeShape(name, options, mods, getPos) {
  const { x, y } = getPos(index);
  const indexName = `${index}`;
  index += 1;
  const o = {
    name,
    make: 'collections.button',
    options: tools.misc.joinObjects({}, {
      width: 0.5,
      height: 0.3,
      label: 'button',
      position: [x, y],
      line: { width: 0.03 },
      touch: {  // eslint-disable-next-line
        onClick: () => console.log(indexName, name),
      },
    }, options),
  };
  return o;
}

if (typeof process === 'object') {
  // eslint-disable-next-line global-require, no-unused-vars, vars-on-top, no-var
  module.exports = {
    makeShape,
  };
}
