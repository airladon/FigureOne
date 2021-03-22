/* eslint-disable camelcase, no-restricted-globals */
/* globals figure, colTheta, colCot, colTan, colSin, colCos, colSec, colCsc,
   colGrey, Fig, thin, thick, colText, colRad, colDarkGrey */

function layoutCirc() {
  const rad = 1.8;
  // /const rad = 1.8;
  const piOn2 = Math.PI / 2;
  const dAng = 0.7;
  const dSin = rad * Math.sin(dAng);
  const dCos = rad * Math.cos(dAng);
  const dTan = rad * Math.tan(dAng);
  const dCot = rad / Math.tan(dAng);
  const dSec = rad / Math.cos(dAng);
  const dCsc = rad / Math.sin(dAng);
  const t = [];
  t.push(performance.now() / 1000);
  const linePrimitve = (name, color, width = thick, p1 = [0, 0], length = 1, ang = 0, dash = []) => ({
    name,
    method: 'primitives.line',
    options: {
      p1, length, angle: ang, width, color, dash,
    },
  });

  const staticLineLabel = (name, color, text, includeTheta, p1, p2, location = 'negative', linePosition = 0.5, style = 'normal') => {
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
                { '_90': { color: colThetaComp, style: 'normal' } },
                { '_\u00b0\u2212': { color: colThetaComp } },
                { '_\u03b8': { color: colThetaComp, style: 'italic' } }
              ],
              { rb_bracket: { side: 'right', color: colText } },
            ],
          },
        ],
      };
    }
    return {
      name,
      method: 'collections.line',
      options: {
        width: 0,
        color,
        p1,
        p2,
        label: {
          text: {
            textFont: { style },
            forms,
          },
          location,
          offset: 0.03,
          linePosition,
          orientation: 'horizontal',
        },
      },
    };
  };

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
                { '_90': { color: colThetaComp, style: 'normal' } },
                { '_\u00b0\u2212': { color: colThetaComp } },
                { '_\u03b8': { color: colThetaComp, style: 'italic' } }
              ],
              { rb_bracket: { side: 'right', color: colText } },
            ],
          },
        ],
      };
    }
    return {
      name,
      method: 'collections.line',
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

  function arc(name, color, width = thin, sides = 100, angleToDraw = Math.PI * 2, rotation = 0) {
    return {
      name,
      method: 'primitives.polygon',
      options: {
        radius: rad, line: { width }, sides, angleToDraw: angleToDraw + 0.001, rotation, color,
      },
    };
  }

  const rightAngle = (name, position, startAngle, r = 0.15, color = colGrey) => ({
    name,
    method: 'collections.angle',
    options: {
      position,
      startAngle,
      angle: Math.PI / 2,
      curve: { autoRightAngle: true, width: thin, radius: r },
      color,
    },
  });

  function angle(
    name, text, r = 0.2, curvePosition = 0.5, position = [0, 0], startAngle = 0, angleSize = 0, color = colTheta,
  ) {
    return {
      name,
      method: 'collections.angle',
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

  const [circle] = figure.add({
    name: 'circ',
    method: 'collection',
    elements: [
      arc('arc', colGrey, thin, 300, Math.PI / 2, 0),
      linePrimitve('x', colGrey, thin, [0, 0], rad, 0),
      linePrimitve('y', colGrey, thin, [0, 0], rad, Math.PI / 2),
      {
        name: 'tri',
        method: 'polyline',
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
      angle('theta', '\u03b8'),
      angle('thetaCompSin', {
        forms: { 0: ['_90', '_\u00b0\u2212\u03b8'] },
      }, 0.45, 0.7, [dCos, dSin], dAng + Math.PI, Math.PI / 2 - dAng, colThetaComp),
      angle('thetaCompCot', {
        forms: { 0: ['_90', '_\u00b0\u2212\u03b8'] },
      }, 0.45, 0.7, [dCot, rad], dAng + Math.PI, Math.PI / 2 - dAng, colThetaComp),
      rightAngle('rightSin', [rad, 0], Math.PI / 2),
      rightAngle('rightTan', [rad, 0], Math.PI / 2),
      rightAngle('rightUnit', [rad, 0], Math.PI / 2),
      line('xy', colText, 'x, y', false, 0, [0, 0], rad, dAng, 'end', 0, 'italic'),

      // Unit lines
      line('unitHyp', colRad, '1', false, thick, [0, 0], rad, dAng, 'left'),
      line('unitAdj', colRad, '1', false, thick, [0, 0], rad, 0, 'bottom'),
      line('unitOpp', colRad, '1', false, thick, [0, 0], rad, piOn2, 'right', 0.5),

      // movable lines
      line('sin', colSin, 'sin', false, thick, [0, 0], rad, 0, 'right'),
      line('cos', colCos, 'cos', false, thick, [0, 0], rad, 0, 'bottom'),
      line('tan', colTan, 'tan', false, thick, [0, 0], rad, 0, 'right'),
      line('sec', colSec, 'sec', false, thick, [0, 0], rad, 0, 'left'),
      line('cot', colCot, 'cot', false, thick, [0, 0], rad, 0, 'bottom'),
      line('csc', colCsc, 'csc', false, thick, [0, 0], rad, 0, 'left'),

      line('xSide', colText, 'x', false, 0, [0, 0], dCos, 0, 'bottom', 0.5, 'italic'),
      line('ySide', colText, 'y', false, 0, [dCos, 0], dSin, Math.PI / 2, 'right', 0.5, 'italic'),

      line('sinTheta', colSin, 'sin', true, thick, [dCos, 0], dSin, piOn2, 'right'),
      line('tanTheta', colTan, 'tan', true, thick, [rad, 0], dTan, piOn2, 'right'),
      line('secTheta', colSec, 'sec', true, thick, [0, 0], dSec, dAng, 'left'),
      line('cosTheta', colCos, 'cos', true, thick, [0, 0], dCos, 0, 'bottom'),
      line('cotTheta', colCot, 'cot', true, thick, [0, 0], dCot, 0, 'bottom'),
      line('cscTheta', colCsc, 'csc', true, thick, [0, 0], dCsc, dAng, 'left'),
      line('sinThetaComp', colCos, 'sin', 'comp', 0, [0, 0], dCos, 0, 'bottom'),
      line('tanThetaComp', colCot, 'tan', 'comp', 0, [0, 0], dCot, 0, 'bottom'),
      line('secThetaComp', colCsc, 'sec', 'comp', 0, [0, 0], dCsc, dAng, 'left'),
      {
        name: 'point',
        method: 'polygon',
        options: {
          sides: 30,
          radius: 0.02,
          fill: colText,
          position: [dCos, dSin],
        },
      },
      {
        name: 'rotator',
        method: 'collections.line',
        options: {
          length: rad,
          width: 0.1,
          color: [0, 0, 0, 0],
        },
        mods: {
          move: { type: 'rotation', bounds: { rotation: { min: 0, max: Math.PI / 2 * 0.999 } } },
          dimColor: [0, 0, 0, 0],
          isMovable: true,
          touchBorder: [0, 0.5, 1.5, 0.5],
        },
      },
      // {
      //   name: 'tanSec',
      //   method: 'collection',
      //   elements: [
      //     lineWithLabel('tan', colTan, 'tan', thick, [radius, 0], radius * Math.tan(dAng), Math.PI / 2, 'right'),
      //     lineWithLabel('sec', colSec, 'sec', thick, [0, 0], radius / Math.tan(dAng), dAng, 'left'),
      //     lineWithLabel('unitAdj', colRad, '1', thick, [0, 0], radius, 0, 'bottom'),
      //   ],
      //   options: {
      //     position: [-2, -1],
      //   },
      // }
    ],
    mods: {
      scenarios: {
        center: { scale: 1, position: [-0.5, -0.9] },
        circRight: { scale: 1, position: [0.2, -0.9] },
      },
    },
  });
  t.push(performance.now() / 1000);
  const get = list => circle.getElements(list);
  const [rotator] = get(['rotator']);
  const [theta, thetaCompSin, thetaCompCot] = get(
    ['theta', 'thetaCompSin', 'thetaCompCot'],
  );
  const [cos, sin, tan] = get(['cos', 'sin', 'tan']);
  const [cot, csc, sec] = get(['cot', 'csc', 'sec']);
  const [p] = get(['point']);
  const [unitHyp, unitAdj, unitOpp] = get(['unitHyp', 'unitAdj', 'unitOpp']);
  const [rightSin, rightUnit, rightTan] = get(
    ['rightSin', 'rightUnit', 'rightTan'],
  );
  const [xSide, ySide] = get(['xSide', 'ySide']);
  const [tri] = get('tri');
  // const [sinTheta, sinThetaComp, cosTheta] = get(['sinTheta', 'sinThetaComp', 'cosTheta']);
  const [tanThetaComp, secThetaComp] = get(['tanThetaComp', 'secThetaComp']);

  const setRightAng = (element, test, position, startAngle) => {
    if (element.isShown) {
      if (test) {
        element.setAngle({ position, startAngle, angle: Math.PI / 2 });
        element.setOpacity(1);
      } else {
        element.setOpacity(0);
      }
    }
  };

  /*
  .##.....##.########..########.....###....########.########.########.
  .##.....##.##.....##.##.....##...##.##......##....##.......##.....##
  .##.....##.##.....##.##.....##..##...##.....##....##.......##.....##
  .##.....##.########..##.....##.##.....##....##....######...########.
  .##.....##.##........##.....##.#########....##....##.......##...##..
  .##.....##.##........##.....##.##.....##....##....##.......##....##.
  ..#######..##........########..##.....##....##....########.##.....##
  */
  function updateCircle(rIn) {
    const r = rIn > Math.PI / 4 ? rIn - 0.00001 : rIn + 0.00001;
    const cosR = Math.cos(r);
    const sinR = Math.sin(r);
    const x = rad * cosR;
    const y = rad * sinR;
    const tanVal = Math.abs(rad * sinR / cosR);
    const secVal = Math.abs(rad / cosR);
    const cotVal = Math.abs(rad * cosR / sinR);
    const cscVal = Math.abs(rad / sinR);

    if (rotator.isShown) {
      rotator.transform.updateRotation(rIn);
    }
    if (theta.isShown) {
      theta.setAngle({ angle: r });
    }

    if (unitOpp.isShown) {
      let offsetY = 0;
      if (cos.isShown) {
        offsetY = thick;
      }
      unitOpp.setEndPoints([cotVal, 0 - offsetY], [cotVal, rad + offsetY]);
    }

    // if (tri.isShown) {
    //   tri.custom.updatePoints({ points: [[0, 0], [x, y], [x, 0]] });
    // }

    // if (xSide.isShown) {
    //   xSide.setEndPoints([0, 0], [x, 0]);
    // }
    // if (ySide.isShown) {
    //   ySide.setEndPoints([x, 0], [x, y]);
    // }
    /*
    ..######..####.##....##.....######...#######...######.
    .##....##..##..###...##....##....##.##.....##.##....##
    .##........##..####..##....##.......##.....##.##......
    ..######...##..##.##.##....##.......##.....##..######.
    .......##..##..##..####....##.......##.....##.......##
    .##....##..##..##...###....##....##.##.....##.##....##
    ..######..####.##....##.....######...#######...######.
    */
    if (sin.isShown) {
      if (sin._label.isShown) {
        if ((tan._label.isShown) && Math.abs(x) > rad * 0.8) {
          sin.label.location = 'left';
        } else {
          sin.label.location = 'right';
        }
      }
      sin.setEndPoints([x, 0], [x, y]);
    }
    // if (sinTheta.isShown) {
    //   sinTheta.setEndPoints([x, 0], [x, y]);
    // }

    if (cos.isShown) {
      cos.setEndPoints([0, 0], [x + thick / 2, 0]);
    }

    // if (sinThetaComp.isShown) {
    //   sinThetaComp.setEndPoints([0, 0], [x + thick / 2, 0]);
    // }

    // if (cosTheta.isShown) {
    //   cosTheta.setEndPoints([0, 0], [x + thick / 2, 0]);
    // }

    /*
    .########....###....##....##.....######..########..######.
    ....##......##.##...###...##....##....##.##.......##....##
    ....##.....##...##..####..##....##.......##.......##......
    ....##....##.....##.##.##.##.....######..######...##......
    ....##....#########.##..####..........##.##.......##......
    ....##....##.....##.##...###....##....##.##.......##....##
    ....##....##.....##.##....##.....######..########..######.
    */
    if (tan.isShown) {
      tan.setEndPoints(
        [rad, 0],
        [rad, tanVal],
      );
      if (tan._label.transform.t().x > rad * 1.2) {
        tan._label.transform.updateTranslation(rad * 1.2, tan._label.transform.t().y);
      }
    }

    if (sec.isShown) {
      if (sec._label.isShown) {
        if (secVal > rad * 2) {
          sec.label.linePosition = rad * 0.65 * 2 / secVal;
        } else {
          sec.label.linePosition = 0.65;
        }
      }
      sec.setEndPoints(
        [0, 0], [rad, tanVal],
      );
    }

    /*
    ..######...#######..########.....######...######...######.
    .##....##.##.....##....##.......##....##.##....##.##....##
    .##.......##.....##....##.......##.......##.......##......
    .##.......##.....##....##.......##........######..##......
    .##.......##.....##....##.......##.............##.##......
    .##....##.##.....##....##.......##....##.##....##.##....##
    ..######...#######.....##........######...######...######.
    */
    if (cot.isShown) {
      let offsetY = 0;
      if (cos.isShown) {
        offsetY = thick;
      }
      cot.setEndPoints([0, 0 - offsetY], [cotVal + thick / 2, 0 - offsetY]);
      const labelX = Math.min(cot._label.transform.t().x, rad * 1.2);
      let labelY = -0.075;
      // labelX = Math.min(labelX, rad * 1.2);
      if (cos.isShown) {
        if (labelX < rad * 0.5) {
          labelY = Math.max(cot._label.transform.t().y - (rad * 0.5 - labelX), -0.17);
        }
      }
      cot._label.transform.updateTranslation(labelX, labelY);
    }
    if (tanThetaComp.isShown) {
      tanThetaComp.setEndPoints([0, 0], [cotVal + thick / 2, 0]);
    }
    if (csc.isShown) {
      let offsetX = 0;
      let offsetY = 0;
      let thickOffset = 0;
      if (sec.isShown) {
        offsetX = thick * Math.cos(r + Math.PI / 2);
        offsetY = thick * Math.sin(r + Math.PI / 2);
        thickOffset = thick * Math.cos(r);
      }
      if (csc._label.isShown) {
        if (cscVal > rad * 2) {
          csc.label.linePosition = rad * 0.65 * 2 / cscVal;
        } else {
          csc.label.linePosition = 0.65;
        }
        // Guassian hump over the sec keyword
        if (sec.isShown && r > 0.7 && r < 0.9) {
          csc.label.offset = 0.03 + 0.2 * Math.exp(-((r - 0.8) ** 2) / (2 * 0.03 ** 2));
        } else {
          csc.label.offset = 0.03;
        }
      }
      csc.setEndPoints(
        [0 + offsetX, 0 + offsetY],
        [cotVal + thickOffset + offsetX, rad + offsetY + thickOffset],
      );
    }

    // /*
    // .########..####..######...##.....##.########
    // .##.....##..##..##....##..##.....##....##...
    // .##.....##..##..##........##.....##....##...
    // .########...##..##...####.#########....##...
    // .##...##....##..##....##..##.....##....##...
    // .##....##...##..##....##..##.....##....##...
    // .##.....##.####..######...##.....##....##...
    // */
    setRightAng(
      rightSin, x > 0.3 && y > 0.3, [x, 0], Math.PI / 2,
    );
    setRightAng(
      rightUnit, x > 0.3 && y > 0.3, [cotVal, cos.isShown ? -thick / 2 : 0], Math.PI / 2,
    );
    setRightAng(
      rightTan, y > 0.3, [rad, 0], Math.PI / 2,
    );
  }

  /*
  .########.##.....##.##....##..######...######.
  .##.......##.....##.###...##.##....##.##....##
  .##.......##.....##.####..##.##.......##......
  .######...##.....##.##.##.##.##........######.
  .##.......##.....##.##..####.##.............##
  .##.......##.....##.##...###.##....##.##....##
  .##........#######..##....##..######...######.
  */
  const rotatorUpdateCircle = () => {
    // if (rotator.isShown) {
    updateCircle(Fig.tools.g2.clipAngle(rotator.transform.r(), '0to360'));
    // }
  };

  rotator.fnMap.add('updateCircle', () => rotatorUpdateCircle());
  // figure.fnMap.global.add('circSetup', (payload) => {
  //   const [ang] = payload;
  //   rotator.setRotation(ang);
  // });
  figure.fnMap.global.add('circDefault', () => {
    rotator.setRotation(dAng);
  });
  rotator.subscriptions.add('setState', 'updateCircle');
  rotator.subscriptions.add('setTransform', 'updateCircle');

  const addPulseFn = (name, element, xAlign, yAlign, scale = 1.8) => {
    figure.fnMap.global.add(name, () => {
      circle.getElement(element).pulse({ xAlign, yAlign, duration: 1.5, scale });
    });
  };
  const addPulseWidthFn = (name, element) => {
    figure.fnMap.global.add(name, () => {
      element.pulseWidth({ line: 8, duration: 1.5, label: 1 });
    });
  };
  const add = (name, fn) => figure.fnMap.global.add(name, fn);

  add('circToRot', () => {
    rotator.animations.new()
      .rotation({ target: 0.9, duration: 1 })
      .start();
  });
  add('circPulsePoint', () => {
    circle._point.show();
    circle._point.animations.new()
      .pulse({ scale: 5, duration: 1.5 })
      .start();
  });

  addPulseFn('circPulseTan', 'tanTheta.label', 'left', 'middle');
  addPulseFn('circPulseCot', 'cotTheta.label', 'center', 'top');
  addPulseFn('circPulseCsc', 'cscTheta.label', 'right', 'bottom');
  addPulseFn('circPulseCos', 'cosTheta.label', 'center', 'top');
  addPulseFn('circPulseSec', 'secTheta.label', 'right', 'bottom');
  addPulseFn('circPulseSin', 'sinTheta.label', 'left', 'middle');
  addPulseFn('circPulseUnitAdj', 'unitAdj.label', 'center', 'top', 2.7);
  addPulseFn('circPulseUnitOpp', 'unitOpp.label', 'left', 'middle', 2.7);
  addPulseFn('circPulseUnitHyp', 'unitHyp.label', 'right', 'bottom', 2.7);
  addPulseFn('circPulseX', 'xSide.label', 'center', 'top');
  addPulseFn('circPulseY', 'ySide.label', 'left', 'middle');
  // addPulseWidthFn('circPulseWidthSin', sin);
  // addPulseWidthFn('circPulseWidthCos', cos);
  unitHyp.subscriptions.add('setTransform', () => {
    unitHyp.updateLabel();
  });

  const triToX = (x) => {
    tri.customState.xLength = x;
    const y = Math.tan(dAng) * x;
    tri.custom.updatePoints({ points: [[0, 0], [x, y], [x, 0]] });
  };
  const animateTri = (from, to) => {
    circle.animations.new()
      .custom({
        callback: (percent) => {
          const delta = to - from;
          const x = from + percent * delta;
          triToX(x);
        },
        duration: 2.5,
      })
      .start();
  };
  add('circTriAnimateToTan', () => animateTri(dCos, rad));
  add('circTriAnimateToCot', () => animateTri(rad, rad / Math.tan(dAng)));
  add('circTriToTan', () => triToX(rad));
  add('circTriToCos', () => triToX(dCos));
  add('circTriToCot', () => triToX(rad / Math.tan(dAng)));
}
