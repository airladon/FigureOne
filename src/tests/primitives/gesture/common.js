/* eslint-disable block-scoped-var */
/* global figure */

if (typeof process === 'object') {
  // eslint-disable-next-line global-require, no-unused-vars, vars-on-top, no-var
  var { tools } = require('../../../index').default;
}

let index = 0;
function makeShape(name, options, mods, getPos) {
  const { x, y } = getPos(index);
  // const indexName = `${index}`;
  index += 1;
  const scene = figure.scene._dup();
  const o = {
    name,
    make: 'gesture',
    options: tools.misc.joinObjects({}, {
      position: [x, y],
      color: [0, 1, 0, 0.3],
      width: 0.8,
      height: 0.4,
      pan: { momentum: false },
      zoom: true,
      changeScene: scene,
    }, options),
  };
  return [
    {
      make: 'rectangle', width: 0.2, height: 0.2, position: [-0.15 + x, y], scene,
    },
    {
      make: 'triangle', width: 0.2, height: 0.2, position: [0.15 + x, -0.025 + y], scene,
    },
    o,
  ];
}

if (typeof process === 'object') {
  // eslint-disable-next-line global-require, no-unused-vars, vars-on-top, no-var
  module.exports = {
    makeShape,
  };
}
