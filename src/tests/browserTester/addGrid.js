/* global */
/* eslint-disable no-param-reassign */
// eslint-disable-next-line no-unused-vars
function __addGrid(__figure) {
  __figure.add([
    {
      name: '__minorGrid',
      method: 'primitives.grid',
      options: {
        position: [0, 0],
        color: [0.9, 0.9, 0.9, 1],
        line: { width: 0.002 },
        xStep: 0.1,
        yStep: 0.1,
        bounds: __figure.limits._dup(),
      },
    },
    {
      name: '__majorGrid',
      method: 'primitives.grid',
      options: {
        position: [0, 0],
        color: [0.9, 0.9, 0.9, 1],
        line: { width: 0.005 },
        xStep: 0.5,
        yStep: 0.5,
        bounds: __figure.limits._dup(),
      },
    },
    {
      name: '__origin',
      method: 'primitives.polygon',
      options: {
        color: [0.9, 0.9, 0.9, 1],
        radius: 0.025,
        sides: 10,
      },
    },
  ]);
  __figure.elements.toBack(['__origin', '__majorGrid', '__minorGrid']);
  const __nav = __figure.getElement('nav');

  if (__nav != null && __nav.nav != null) {
    __nav.nav.notifications.add('steady', () => {
      __figure.elements.exec(['show'], ['__minorGrid', '__majorGrid', '__origin']);
    });
    __nav.nav.notifications.add('beforeTransition', () => {
      __figure.elements.exec(['show'], ['__minorGrid', '__majorGrid', '__origin']);
    });
  }
}
// __addGrid();
