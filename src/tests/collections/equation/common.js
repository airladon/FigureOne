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
    make: 'collections.equation',
    options: tools.misc.joinObjects({}, {
      color: [1, 0, 0, 0.9],
      position: [0, 0],
      scale: 0.5,
    }, options),
    mods: tools.misc.joinObjects({}, mods),
    // mods: tools.misc.joinObjects({}, {
    //   isTouchable: true,
    //   onClick: () => tools.misc.Console(`${indexName}: ${name}`),
    // }, mods),
  };
  o.options.position = tools.g2.getPoint(options.position || [0, 0]).add(x, y);
  return o;
}

if (typeof process === 'object') {
  // eslint-disable-next-line global-require, no-unused-vars, vars-on-top, no-var
  module.exports = {
    makeShape,
  };
}
