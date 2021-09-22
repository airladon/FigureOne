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
    make: 'collections.toggle',
    options: tools.misc.joinObjects({}, {
      position: [x, y],
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
