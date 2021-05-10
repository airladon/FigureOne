/* eslint-disable camelcase, no-restricted-globals */
/* globals figure, colTheta, colCot, colTan, colSin, colCos, colSec, colCsc,
   colGrey, thin, thick, colText, colRad, colDarkGrey, colThetaComp */

/**
 * This file creates the geometry that relates the circle to the right angle
 * triangle. The right angle triangle can grow between three different sizes
 * where the hypotenuse, adjacent side to theta, and opposite side to theta
 * can each be unit length.
 */
// eslint-disable-next-line
function layoutCirc() {
  // Default radius, angle and trig values related to angle
  const rad = 1.8;
  const piOn2 = Math.PI / 2;
  const dAng = 0.7;
  const dSin = rad * Math.sin(dAng);
  const dCos = rad * Math.cos(dAng);
  const dTan = rad * Math.tan(dAng);
  const dCot = rad / Math.tan(dAng);
  const dSec = rad / Math.cos(dAng);
  const dCsc = rad / Math.sin(dAng);

  // Helper function that creates a line primitive definition object with
  // default width, p1, length, angle and dash pattern
  function linePrimitve(
    name, color, width = thick, p1 = [0, 0], length = 1, ang = 0, dash = [],
  ) {
    return {
      name,
      make: 'primitives.line',
      options: {
        p1, length, angle: ang, width, color, dash,
      },
    };
  }

  // Helper function that creates a line collection definition object with
  // default properties as well as label positions and styles
  const line = (name, color, text, includeTheta, width = thick, p1, length, ang, location = 'negative', linePosition = 0.5, style = 'normal') => {
    let forms = { 0: text };
    if (includeTheta === true) {
      forms = { 0: [text, ' ', { theta: { text: '\u03b8', color: colTheta, style: 'italic' } }] };
    }
    if (includeTheta === 'comp') {
      forms = {
        0: [
          text,
          {
            brac: [
              { lb_bracket: { side: 'left', color: colText } },
              [
                { _90: { color: colThetaComp, style: 'normal' } },
                { '_\u00b0\u2212': { color: colThetaComp } },
                { _\u03b8: { color: colThetaComp, style: 'italic' } },
              ],
              { rb_bracket: { side: 'right', color: colText } },
            ],
          },
        ],
      };
    }
    return {
      name,
      make: 'collections.line',
      options: {
        width,
        color,
        p1,
        length,
        angle: ang,
        label: {
          text: {
            textFont: { style },
            forms,
          },
          location,
          offset: 0.03,
          linePosition,
          orientation: 'horizontal',
          update: true,
        },
      },
    };
  };

  // Helper function to create an arc definition object
  function arc(name, color, width = thin, sides = 100, angleToDraw = Math.PI * 2, rotation = 0) {
    return {
      name,
      make: 'primitives.polygon',
      options: {
        radius: rad, line: { width }, sides, angleToDraw: angleToDraw + 0.001, rotation, color,
      },
    };
  }

  // Helper function to create a right angle definition object
  const rightAngle = (name, position, startAngle, r = 0.15, color = colGrey) => ({
    name,
    make: 'collections.angle',
    options: {
      position,
      startAngle,
      angle: Math.PI / 2,
      curve: { autoRightAngle: true, width: thin, radius: r },
      color,
    },
  });

  // Helper function to create a generic angle definition object
  function angle(
    name,
    text,
    r = 0.2,
    curvePosition = 0.5,
    position = [0, 0],
    startAngle = 0,
    angleSize = 0,
    color = colTheta,
  ) {
    return {
      name,
      make: 'collections.angle',
      options: {
        color,
        curve: {
          width: 0.01,
          radius: r,
          sides: 400,
        },
        startAngle,
        angle: angleSize,
        label: {
          text,
          offset: 0.01,
          curvePosition,
        },
        position,
      },
    };
  }

  const circle = figure.add({
    name: 'circ',
    make: 'collection',
    elements: [
      // Unit circle arc and axes
      arc('arc', colGrey, thin, 300, Math.PI / 2, 0),
      linePrimitve('x', colGrey, thin, [0, 0], rad, 0),
      linePrimitve('y', colGrey, thin, [0, 0], rad, Math.PI / 2),

      // Main triangle
      {
        name: 'tri',
        make: 'polyline',
        options: {
          points: [
            [0, 0],
            [dCos, dSin],
            [dCos, 0],
          ],
          line: { width: thick },
          color: colDarkGrey,
          close: true,
          angle: {
            curve: {
              width: thin,
              autoRightAngle: true,
            },
            show: 0,
          },
        },
      },
      // Angles
      angle('theta', '\u03b8', 0.2, 0.5, [0, 0], 0, dAng),
      angle('thetaCompSin', {
        forms: { 0: ['_90', '_\u00b0\u2212\u03b8'] },
      }, 0.45, 0.7, [dCos, dSin], dAng + Math.PI, Math.PI / 2 - dAng, colThetaComp),
      angle('thetaCompCot', {
        forms: { 0: ['_90', '_\u00b0\u2212\u03b8'] },
      }, 0.45, 0.7, [dCot, rad], dAng + Math.PI, Math.PI / 2 - dAng, colThetaComp),
      rightAngle('rightSin', [dCos, 0], Math.PI / 2),
      rightAngle('rightTan', [rad, 0], Math.PI / 2),
      rightAngle('rightUnit', [dCot, 0], Math.PI / 2),
      line('xy', colText, 'x, y', false, 0, [0, 0], rad, dAng, 'end', 0, 'italic'),

      // Unit lines
      line('unitHyp', colRad, '1', false, thick, [0, 0], rad, dAng, 'left'),
      line('unitAdj', colRad, '1', false, thick, [0, 0], rad, 0, 'bottom'),
      line('unitOpp', colRad, '1', false, thick, [dCot, 0], rad, piOn2, 'right', 0.5),

      // Triangle side labels
      line('xSide', colText, 'x', false, 0, [0, 0], dCos, 0, 'bottom', 0.5, 'italic'),
      line('ySide', colText, 'y', false, 0, [dCos, 0], dSin, Math.PI / 2, 'right', 0.5, 'italic'),

      // Triangle sides associated with trig functions
      line('sinTheta', colSin, 'sin', true, thick, [dCos, 0], dSin, piOn2, 'right'),
      line('tanTheta', colTan, 'tan', true, thick, [rad, 0], dTan, piOn2, 'right'),
      line('secTheta', colSec, 'sec', true, thick, [0, 0], dSec, dAng, 'left'),
      line('cosTheta', colCos, 'cos', true, thick, [0, 0], dCos, 0, 'bottom'),
      line('cotTheta', colCot, 'cot', true, thick, [0, 0], dCot, 0, 'bottom'),
      line('cscTheta', colCsc, 'csc', true, thick, [0, 0], dCsc, dAng, 'left'),

      // Complementary trig function side labels
      line('sinThetaComp', colCos, 'sin', 'comp', 0, [0, 0], dCos, 0, 'bottom'),
      line('tanThetaComp', colCot, 'tan', 'comp', 0, [0, 0], dCot, 0, 'bottom'),
      line('secThetaComp', colCsc, 'sec', 'comp', 0, [0, 0], dCsc, dAng, 'left'),

      // Center point
      {
        name: 'point',
        make: 'polygon',
        options: {
          sides: 30,
          radius: 0.02,
          fill: colText,
          position: [dCos, dSin],
        },
      },
      // {
      //   name: 'rotator',
      //   make: 'collections.line',
      //   options: {
      //     length: rad,
      //     width: 0.1,
      //     color: [0, 0, 0, 0],
      //   },
      //   mods: {
      //     move: { type: 'rotation', bounds: { rotation: { min: 0, max: Math.PI / 2 * 0.999 } } },
      //     dimColor: [0, 0, 0, 0],
      //     isMovable: true,
      //     touchBorder: [0, 0.5, 1.5, 0.5],
      //   },
      // },
    ],
    mods: {
      scenarios: {
        center: { scale: 1, position: [-0.5, -0.9] },
        circRight: { scale: 1, position: [0.2, -0.9] },
      },
    },
  });

  // Helper function to get figure elements from the circle element
  const get = list => circle.getElements(list);
  const [tri] = get('tri');

  // Helper functions to add functions to the global function map
  const addPulseFn = (name, element, xAlign, yAlign, scale = 1.8) => {
    figure.fnMap.global.add(name, () => {
      circle.getElement(element).pulse({
        xAlign, yAlign, duration: 1.5, scale,
      });
    });
  };
  const add = (name, fn) => figure.fnMap.global.add(name, fn);
  add('circPulsePoint', () => {
    circle._point.show();
    circle._point.animations.new()
      .pulse({ scale: 5, duration: 1.5 })
      .start();
  });

  // Functions that pulse various figure elements which will be called during
  // the slide show
  addPulseFn('circPulseTan', 'tanTheta.label', 'left', 'middle');
  addPulseFn('circPulseCot', 'cotTheta.label', 'center', 'top');
  addPulseFn('circPulseCsc', 'cscTheta.label', 'right', 'bottom');
  addPulseFn('circPulseCos', 'cosTheta.label', 'center', 'top');
  addPulseFn('circPulseSec', 'secTheta.label', 'right', 'bottom');
  addPulseFn('circPulseSin', 'sinTheta.label', 'left', 'middle');
  addPulseFn('circPulseUnitAdj', 'unitAdj.label', 'center', 'top', 2.7);
  addPulseFn('circPulseUnitOpp', 'unitOpp.label', 'left', 'middle', 2.7);
  addPulseFn('circPulseUnitHyp', 'unitHyp.label', 'right', 'bottom', 2.7);
  addPulseFn('circPulseX', 'xSide.label', 'center', 'top', 2);
  addPulseFn('circPulseY', 'ySide.label', 'left', 'middle', 2);

  // Set tri.customState.xLength and update triangle points for new xLength.
  // tri.customState.xLength will be saved in all recorder seek states. Whenever
  // a state is set, the xLength will be used to generate the triangle points
  // to the correct size.
  const triToX = (x) => {
    tri.customState.xLength = x;
    const y = Math.tan(dAng) * x;
    tri.custom.updatePoints({ points: [[0, 0], [x, y], [x, 0]] });
  };

  // Set triangle size between cos triangle and tan triangle
  add('circTriCosToTan', (percent) => {
    const from = dCos;
    const to = rad;
    const delta = to - from;
    const x = from + percent * delta;
    triToX(x);
  });

  // Set triangle size between tan triangle and cot triangle
  add('circTriTanToCot', (percent) => {
    const from = rad;
    const to = rad / Math.tan(dAng);
    const delta = to - from;
    const x = from + percent * delta;
    triToX(x);
  });

  // Animate triangle size where callback will be 'circTriCosToTan' or
  // 'circTriTanToCot'
  const animateTri = (callback) => {
    circle.animations.new()
      .custom({
        callback,
        duration: 2.5,
      })
      .start();
  };

  // Animate or set triangle sizes
  add('circTriAnimateToTan', () => animateTri('circTriCosToTan'));
  add('circTriAnimateToCot', () => animateTri('circTriTanToCot'));
  add('circTriToTan', () => triToX(rad));
  add('circTriToCos', () => triToX(dCos));
  add('circTriToCot', () => triToX(rad / Math.tan(dAng)));

  // Whenever a state is set, regenerate the triangles points based on the
  // xLength stored in the state
  add('circSetState', () => {
    triToX(tri.customState.xLength);
  });
  tri.notifications.add('setState', 'circSetState');
  triToX(dCos);
}
