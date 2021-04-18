/* global */
/* eslint-disable no-param-reassign */
// eslint-disable-next-line no-unused-vars
function __addCursor(__figure) {
  __figure.add({
    name: '_cursor_',
    method: 'collections.cursor',
    options: {
      position: [0, 0],
      color: [0.8, 0.8, 0, 1],
      radius: 0.03,
    },
  });

  __figure.cursorElementName = '_cursor_';
}
// __addCursor();
