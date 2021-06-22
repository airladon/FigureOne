/* globals Fig figure testCases cursor mark markContainer cursorContainer*/
/* eslint-disable no-global-assign, no-inner-declarations */


testCases = {
  beforeEach: () => {
    figure.scene = new Fig.Scene();
    cursorContainer.scene = new Fig.Scene();
  },
  '2D conversions': {
    beforeEach: () => {
      figure.scene.setProjection({
        left: -0.5, right: 0.5, bottom: -0.5, top: 0.5,
      });
      mark.setPosition(0.1, 0.2, 0);
      markContainer.setPosition(0.2, 0.1, 0);
      cursorContainer.setPosition(0, 0, 0);
      cursor.setPosition(0, 0, 0);
      figure.elements.updateDrawTransforms([new Fig.Transform()], figure.scene);
    },
    'draw to local': () => {
      // draw is 0, 0
      // local is 0.1, 0.2
      // cursor represents the local values in it's own figure space
      const p = mark.getPosition('local');
      cursor.setPosition(p);
    },
    'draw to figure': () => {
      // draw is 0, 0
      // local is 0.1, 0.2
      // markContainer is 0.2, 0.1
      // figure is 0.3, 0.3
      // cursor represents the local values in it's own figure space
      const p = mark.getPosition('figure');
      cursor.setPosition(p);
    },
    'draw to gl': () => {
      // draw is 0, 0
      // local is 0.1, 0.2
      // markContainer is 0.2, 0.1
      // figure is 0.3, 0.3
      // gl is 0.6, 0.6 (as figure is zoomed in so width 0.5 fs = 1 gls)
      // cursor represents the gl values in it's own figure space
      const p = mark.getPosition('gl');
      cursorContainer.setPosition(0, 0);
      cursor.setPosition(p);
    },
    'local to figure': () => {
      // markContainer is 0.2, 0.1
      // figure is 0.2, 0.1
      // cursor represents the gl values in it's own figure space
      const p = new Fig.Point(0, 0).transformBy(mark.spaceTransformMatrix('local', 'figure'));
      cursor.setPosition(p);
    },
    'local to gl': () => {
      // markContainer is 0.2, 0.1
      // figure is 0.2, 0.1
      // gl is 0.4, 0.2 (as zoomed in)
      // cursor represents the gl values in it's own figure space
      const p = new Fig.Point(0, 0).transformBy(mark.spaceTransformMatrix('local', 'gl'));
      cursor.setPosition(p);
    },
    'figure to gl': () => {
      // figure point 0.3, 0.4 should by 0.6, 0.8 in gl (as zoomed in)
      // gl is 0.6, 0.8 (as zoomed in)
      // cursor represents the gl values in it's own figure space
      const p = new Fig.Point(0.3, 0.4).transformBy(mark.spaceTransformMatrix('figure', 'gl'));
      cursor.setPosition(p);
    },
  },
  '2D': {
    beforeEach: () => {
      figure.scene.setProjection({
        left: -1, right: 1, bottom: -1, top: 1,
      });
      figure.elements.updateDrawTransforms([new Fig.Transform()], figure.scene);
    },
    posPos: () => {
      mark.setPosition([0.5, 0.5]);
      const p = mark.getPosition('figure');
      cursor.setPosition(p);
    },
    zero: () => {
      mark.setPosition([0, 0]);
      const p = mark.getPosition('figure');
      cursor.setPosition(p);
    },
    negNeg: () => {
      mark.setPosition([-0.8, -0.8]);
      const p = mark.getPosition('figure');
      cursor.setPosition(p);
    },
    posNeg: () => {
      mark.setPosition([0.8, -0.8]);
      const p = mark.getPosition('figure');
      cursor.setPosition(p);
    },
    negPos: () => {
      mark.setPosition([-0.8, 0.8]);
      const p = mark.getPosition('figure');
      cursor.setPosition(p);
    },
    toGL: () => {
      mark.setPosition([-0.8, 0.8]);
      const p = mark.getPosition('gl');
      cursor.setPosition(p.transformBy(figure.spaceTransformMatrix('gl', 'figure')));
    },
  },
  '2D zoom out': {
    beforeEach: () => {
      figure.scene.setProjection({
        left: -2, right: 2, bottom: -2, top: 2,
      });
      figure.elements.updateDrawTransforms([new Fig.Transform()], figure.scene);
    },
    toGL: () => {
      mark.setPosition([-0.8, 0.8]);
      const p = mark.getPosition('gl');
      cursor.setPosition(p.transformBy(cursor.spaceTransformMatrix('gl', 'local')));
    },
  },
  '2D zoom in': {
    beforeEach: () => {
      figure.scene.setProjection({
        left: -0.5, right: 0.5, bottom: -0.5, top: 0.5,
      });
      figure.elements.updateDrawTransforms([new Fig.Transform()], figure.scene);
    },
    toGL: () => {
      mark.setPosition([-0.2, 0.2]);
      const p = mark.getPosition('gl');
      cursor.setPosition(p.transformBy(cursor.spaceTransformMatrix('gl', 'local')));
    },
  },
  '2D offset': {
    beforeEach: () => {
      figure.scene.setProjection({
        left: 0, right: 1, bottom: 0, top: 1,
      });
      figure.elements.updateDrawTransforms([new Fig.Transform()], figure.scene);
    },
    toGL: () => {
      mark.setPosition([0.5, 0.2]);
      const p = mark.getPosition('gl');
      cursor.setPosition(p.transformBy(cursor.spaceTransformMatrix('gl', 'local')));
    },
  },
};

if (typeof process === 'object') {
  module.exports = {
    testCases,
  };
} else {
  // Uncomment and change this to test in browser
  // Make sure to comment it again when testing with jest
  function runTestCase(tc, tcs) {
    if (tcs.beforeEach != null) {
      tcs.beforeEach();
    }
    // console.log(tc, tcs)
    if (typeof tc === 'string') {
      return tcs[tc]();
    }
    const next = tc[0];
    if (tc.length === 1) {
      // console.log(next)
      return tcs[next]();
    }
    return runTestCase(tc.slice(1), tcs[next]);
  }

  runTestCase(['2D conversions', 'figure to gl'], testCases);
}
