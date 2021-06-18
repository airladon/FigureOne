/* globals Fig, figure testCases */
/* eslint-disable no-global-assign */


testCases = {
  '2D': {
    standard: () => {
      figure.scene.setProjection({
        left: -1, right: 1, bottom: -1, top: 1,
      });
    },
    'zoom out': () => {
      figure.scene.setProjection({
        left: -2, right: 2, bottom: -2, top: 2,
      });
    },
    'zoom in': () => {
      figure.scene.setProjection({
        left: -0.5, right: 0.5, bottom: -0.5, top: 0.5,
      });
    },
  },
  ortho: {
    'fully capture': () => {
      figure.scene.setCamera({ position: [0, 0, 2] });
      figure.scene.setProjection({
        near: 0.1, far: 5,
      });
    },
    'cut near': () => {
      figure.scene.setCamera({ position: [0, 0, 2] });
      figure.scene.setProjection({
        near: 1.45, far: 5,
      });
    },
    'cut far': () => {
      figure.scene.setCamera({ position: [0, 0, 2] });
      figure.scene.setProjection({
        near: 1.45, far: 1.985,
      });
    },
  },
};

if (typeof process === 'object') {
  module.exports = {
    testCases,
  };
} else {
  // Change this to test in browser
  // testCases['ortho']['cut far']();
}
