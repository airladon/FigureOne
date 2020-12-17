/* eslint-disable block-scoped-var */

if (typeof process === 'object') {
  // eslint-disable-next-line global-require, no-unused-vars, vars-on-top, no-var
  var { tools } = require('../../../index.js').default;
}

let index = 0;
function makeShape(name, options, lineOptions, mods, getPos) {
  const { x, y } = getPos(index);
  const indexName = `${index}`;
  index += 1;
  const o = {
    name,
    method: 'primitives.arrow',
    options: tools.misc.joinObjects({}, {
      width: 0.4,
      length: 0.4,
      sides: 6,
      radius: 0.2,
      drawBorderBuffer: 0.1,
      color: [1, 0, 0, 0.6],
      tailWidth: 0.15,
    }, options),
    mods: tools.misc.joinObjects({}, {
      isTouchable: true,
      onClick: () => tools.misc.Console(`${indexName}: ${name}`),
    }, mods),
  };
  if (lineOptions != null) {
    o.options.line = tools.misc.joinObjects({}, {
      width: 0.05,
      widthIs: 'mid',
    }, o.options.line, lineOptions);
  }
  o.options.position = tools.g2.getPoint(o.options.position).add(x, y);
  return o;
}

if (typeof process === 'object') {
  // eslint-disable-next-line global-require, no-unused-vars, vars-on-top, no-var
  module.exports = {
    makeShape,
  };
}
