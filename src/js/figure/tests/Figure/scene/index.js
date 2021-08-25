/* globals Fig, figure testCases */
/* eslint-disable no-global-assign, no-inner-declarations */


testCases = {
  beforeEach: () => {
    figure.scene = new Fig.Scene({ style: 'orthographic' });
    figure.elements.scene = figure.scene;
    figure.get('cube').hide();
  },
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
    clipping: {
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
          near: 0.1, far: 1.975,
        });
      },
    },
    camera: {
      'position 2, 1, 1': () => {
        figure.scene.setCamera({ position: [2, 1, 1] });
      },
      'position -2, 1, -1': () => {
        figure.scene.setCamera({ position: [-2, 1, -1] });
      },
      'up: [-0.5, 1, 0], position: [0, 0, 2]': () => {
        figure.scene.setCamera({ up: [-0.5, 1, 0], position: [0, 0, 2] });
      },
      'lookAt: [0.5, 0, 0], position: [0.5, 0, 2]': () => {
        figure.scene.setCamera({ lookAt: [0.5, 0, 0], position: [0.5, 0, 2] });
      },
    },
    light: {
      'direction 1, 0, 0': () => {
        figure.scene.setCamera({ position: [2, 1, 1] });
        figure.scene.setLight({ directional: [1, 0, 0] });
      },
      'direction 1, 0, 1': () => {
        figure.scene.setCamera({ position: [2, 1, 1] });
        figure.scene.setLight({ directional: [1, 0, 1] });
      },
      'direction 1, 1, 1': () => {
        figure.scene.setCamera({ position: [2, 1, 1] });
        figure.scene.setLight({ directional: [1, 1, 1] });
      },
      'direction 0, 0, 1': () => {
        figure.scene.setCamera({ position: [2, 1, 1] });
        figure.scene.setLight({ directional: [0, 0, 1] });
      },
      'direction 0, 0, 1, ambient: 0': () => {
        figure.scene.setCamera({ position: [2, 1, 1] });
        figure.scene.setLight({ directional: [0, 0, 1], ambient: 0 });
      },
      'direction 0, 0, 1, ambient: 0.7': () => {
        figure.scene.setCamera({ position: [2, 1, 1] });
        figure.scene.setLight({ directional: [0, 0, 1], ambient: 0.7 });
      },
    },
    pointLight: {
      beforeEach: () => {
        figure.get('cube').show();
      },
      'point light close': () => {
        figure.scene.setCamera({ position: [0, 0, 2] });
        figure.scene.setLight({ point: [-0.3, 0.3, 1.1], ambient: 0 });
      },
      'point light further': () => {
        figure.scene.setCamera({ position: [0, 0, 2] });
        figure.scene.setLight({ point: [-0.3, 0.3, 1.4], ambient: 0 });
      },
    },
  },
  perspective: {
    'camera position 0.5, 0.5, 2, wide angle': () => {
      figure.scene.setCamera({ position: [0.5, 0.5, 2] });
      figure.scene.setProjection({ style: 'perspective', fieldOfView: 2 });
    },
    'camera position 0.5, 0.5, 2, middle': () => {
      figure.scene.setCamera({ position: [0.5, 0.5, 2] });
      figure.scene.setProjection({ style: 'perspective', fieldOfView: 1.1 });
    },
    'camera position 0.5, 0.5, 2, telephoto': () => {
      figure.scene.setCamera({ position: [0.5, 0.5, 2] });
      figure.scene.setProjection({ style: 'perspective', fieldOfView: 0.5 });
    },
  },
};

if (typeof process === 'object') {
  module.exports = {
    testCases,
  };
} else {
  function runTestCase(tc, tcs) {
    if (tcs.beforeEach != null) {
      tcs.beforeEach();
    }
    if (typeof tc === 'string') {
      return tcs[tc]();
    }
    const next = tc[0];
    if (tc.length === 1) {
      return tcs[next]();
    }
    return runTestCase(tc.slice(1), tcs[next]);
  }

  // Uncomment and change this to test in browser
  // Make sure to comment it again when testing with jest
  runTestCase(['ortho', 'pointLight', 'point light further'], testCases);
}
