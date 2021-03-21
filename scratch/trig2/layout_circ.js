/* eslint-disable camelcase, no-restricted-globals */
/* globals figure, colTheta, colCot, colTan, colSin, colCos, colSec, colCsc,
   colGrey, Fig, thin, thick, colText, colRad, colDarkGrey */

function layoutCirc() {
  const radius = 1.8;
  const defaultAngle = 0.7;
  const defaultSin = radius * Math.sin(defaultAngle);
  const defaultCos = radius * Math.cos(defaultAngle);
  const t = [];
  t.push(performance.now() / 1000);
  const line = (name, color, width = thick, p1 = [0, 0], length = 1, ang = 0, dash = []) => ({
    name,
    method: 'primitives.line',
    options: {
      p1, length, angle: ang, width, color, dash,
    },
  });

  const lineWithLabel = (name, color, text, width = thick, p1, length, ang, location = 'negative', linePosition = 0.5, style = 'normal') => ({
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
          forms: { 0: text },
        },
        location,
        offset: 0.03,
        linePosition,
        orientation: 'horizontal',
        update: true,
      },
    },
  });

  function arc(name, color, width = thin, sides = 100, angleToDraw = Math.PI * 2, rotation = 0) {
    return {
      name,
      method: 'primitives.polygon',
      options: {
        radius, line: { width }, sides, angleToDraw: angleToDraw + 0.001, rotation, color,
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
    name, text, rad = 0.2, curvePosition = 0.5, position = [0, 0], startAngle = 0, angleSize = 0, color = colTheta,
  ) {
    return {
      name,
      method: 'collections.angle',
      options: {
        color,
        curve: {
          width: 0.01,
          radius: rad,
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
      line('x', colGrey, thin, [0, 0], radius, 0),
      line('y', colGrey, thin, [0, 0], radius, Math.PI / 2),
      {
        name: 'tri',
        method: 'polyline',
        options: {
          points: [
            [0, 0],
            [defaultCos, defaultSin],
            [defaultCos, 0],
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
      angle('theta', '\u03b8'),
      angle('thetaCompSin', {
        forms: { 0: ['_90', '_\u00b0\u2212\u03b8'] },
      }, 0.45, 0.7, [0, 0], 0, 0, colCos),
      angle('thetaCompCot', {
        forms: { 0: ['_90', '_\u00b0\u2212\u03b8'] },
      }, 0.45, 0.7),
      rightAngle('rightSin', [radius, 0], Math.PI / 2),
      rightAngle('rightTan', [radius, 0], Math.PI / 2),
      rightAngle('rightUnit', [radius, 0], Math.PI / 2),
      lineWithLabel('unitHyp', colRad, '1', thick, [0, 0], radius, 0, 'left', 0.4),
      lineWithLabel('unitAdj', colRad, '1', thick, [0, 0], radius, 0, 'bottom'),
      lineWithLabel('unitOpp', colRad, '1', thick, [0, 0], radius, 0, 'right', 0.55),
      lineWithLabel('sin', colSin, 'sin', thick, [0, 0], radius, 0, 'right'),
      lineWithLabel('cos', colCos, 'cos', thick, [0, 0], radius, 0, 'bottom'),
      lineWithLabel('tan', colTan, 'tan', thick, [0, 0], radius, 0, 'right'),
      lineWithLabel('sec', colSec, 'sec', thick, [0, 0], radius, 0, 'left'),
      lineWithLabel('cot', colCot, 'cot', thick, [0, 0], radius, 0, 'bottom'),
      lineWithLabel('csc', colCsc, 'csc', thick, [0, 0], radius, 0, 'left'),
      lineWithLabel('xSide', colText, 'x', 0, [0, 0], radius, 0, 'bottom', 0.5, 'italic'),
      lineWithLabel('ySide', colText, 'y', 0, [0, 0], radius, 0, 'right', 0.5, 'italic'),
      lineWithLabel('sinTheta', colSin, [{ sin: { color: [0, 0, 0, 0] } }, ' ', { theta: { text: '\u03b8', color: colTheta, style: 'italic' } }], 0, [0, 0], radius, 0, 'right'),
      lineWithLabel('cosTheta', colCos, [{ cos: { color: [0, 0, 0, 0] } }, ' ', { container: [{ theta: { text: '\u03b8', color: colTheta, style: 'italic' } }, null, false] }], 0, [0, 0], radius, 0, 'bottom'),
      lineWithLabel('sinThetaComp', colCos, [
        { sin: { color: colCos } },
        { brac: [{ lb_bracket: { side: 'left', color: colCos } }, ['_90', '_\u00b0\u2212', { theta: { text: '\u03b8', color: colCos, style: 'italic' } }], { rb_bracket: { side: 'right', color: colCos } }] }], 0, [0, 0], radius, 0, 'bottom'),
      {
        name: 'point',
        method: 'polygon',
        options: {
          sides: 30,
          radius: 0.02,
          fill: colText,
          position: [defaultCos, defaultSin],
        },
      },
      {
        name: 'rotator',
        method: 'collections.line',
        options: {
          length: radius,
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
  const [sinTheta, sinThetaComp, cosTheta] = get(['sinTheta', 'sinThetaComp', 'cosTheta']);

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
    const x = radius * cosR;
    const y = radius * sinR;
    const tanVal = Math.abs(radius * sinR / cosR);
    const secVal = Math.abs(radius / cosR);
    const cotVal = Math.abs(radius * cosR / sinR);
    const cscVal = Math.abs(radius / sinR);

    if (rotator.isShown) {
      rotator.transform.updateRotation(rIn);
    }
    if (theta.isShown) {
      theta.setAngle({ angle: r });
    }
    if (thetaCompSin.isShown) {
      if (Math.abs(y) > 0.6 && Math.abs(x) > 0.4) {
        thetaCompSin.setAngle({
          position: [x, y], startAngle: r + Math.PI, angle: Math.PI / 2 - r,
        });
        thetaCompSin.setOpacity(1);
      } else {
        thetaCompSin.setOpacity(0);
      }
    }
    if (thetaCompCot.isShown) {
      if (Math.abs(y) > 0.6 && Math.abs(x) > 0.4) {
        thetaCompCot.setAngle({
          position: [cotVal, radius], startAngle: r + Math.PI, angle: Math.PI / 2 - r,
        });
        thetaCompCot.setOpacity(1);
      } else {
        thetaCompCot.setOpacity(0);
      }
    }

    if (p.isShown) {
      p.setPosition(x, y);
    }

    if (unitHyp.isShown) {
      unitHyp.setRotation(r);
    }

    if (unitAdj.isShown) {
      unitAdj.setLength(radius);
    }

    if (unitOpp.isShown) {
      let offsetY = 0;
      if (cos.isShown) {
        offsetY = thick;
      }
      unitOpp.setEndPoints([cotVal, 0 - offsetY], [cotVal, radius + offsetY]);
    }

    if (tri.isShown) {
      tri.custom.updatePoints({ points: [[0, 0], [x, y], [x, 0]] });
    }

    if (xSide.isShown) {
      xSide.setEndPoints([0, 0], [x, 0]);
    }
    if (ySide.isShown) {
      ySide.setEndPoints([x, 0], [x, y]);
    }
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
        if ((tan._label.isShown) && Math.abs(x) > radius * 0.8) {
          sin.label.location = 'left';
        } else {
          sin.label.location = 'right';
        }
      }
      sin.setEndPoints([x, 0], [x, y]);
    }
    if (sinTheta.isShown) {
      sinTheta.setEndPoints([x, 0], [x, y]);
    }

    if (cos.isShown) {
      cos.setEndPoints([0, 0], [x + thick / 2, 0]);
    }

    if (sinThetaComp.isShown) {
      sinThetaComp.setEndPoints([0, 0], [x + thick / 2, 0]);
    }

    if (cosTheta.isShown) {
      cosTheta.setEndPoints([0, 0], [x + thick / 2, 0]);
    }

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
        [radius, 0],
        [radius, tanVal],
      );
      if (tan._label.transform.t().x > radius * 1.2) {
        tan._label.transform.updateTranslation(radius * 1.2, tan._label.transform.t().y);
      }
    }

    if (sec.isShown) {
      if (sec._label.isShown) {
        if (secVal > radius * 2) {
          sec.label.linePosition = radius * 0.65 * 2 / secVal;
        } else {
          sec.label.linePosition = 0.65;
        }
      }
      sec.setEndPoints(
        [0, 0], [radius, tanVal],
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
      const labelX = Math.min(cot._label.transform.t().x, radius * 1.2);
      let labelY = -0.075;
      // labelX = Math.min(labelX, radius * 1.2);
      if (cos.isShown) {
        if (labelX < radius * 0.5) {
          labelY = Math.max(cot._label.transform.t().y - (radius * 0.5 - labelX), -0.17);
        }
      }
      cot._label.transform.updateTranslation(labelX, labelY);
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
        if (cscVal > radius * 2) {
          csc.label.linePosition = radius * 0.65 * 2 / cscVal;
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
        [cotVal + thickOffset + offsetX, radius + offsetY + thickOffset],
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
      rightSin,
      x > 0.3 && y > 0.3,
      [x, 0],
      Math.PI / 2,
    );
    setRightAng(
      rightUnit,
      x > 0.3 && y > 0.3,
      [cotVal, cos.isShown ? -thick / 2 : 0],
      Math.PI / 2,
    );
    setRightAng(
      rightTan,
      y > 0.3,
      [radius, 0],
      Math.PI / 2,
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
    rotator.setRotation(defaultAngle);
  });
  rotator.subscriptions.add('setState', 'updateCircle');
  rotator.subscriptions.add('setTransform', 'updateCircle');

  const addPulseFn = (name, element, xAlign, yAlign) => {
    figure.fnMap.global.add(name, () => {
      element.pulse({ xAlign, yAlign, duration: 1.5 });
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

  addPulseFn('circPulseTan', tan._label, 'left', 'middle');
  addPulseFn('circPulseCot', cot._label, 'center', 'bottom');
  addPulseFn('circPulseCsc', csc._label, 'right', 'bottom');
  addPulseFn('circPulseCos', cos._label, 'center', 'top');
  addPulseFn('circPulseSec', sec._label, 'left', 'top');
  addPulseFn('circPulseSin', sin._label, 'left', 'middle');
  addPulseWidthFn('circPulseWidthSin', sin);
  addPulseWidthFn('circPulseWidthCos', cos);
  unitHyp.subscriptions.add('setTransform', () => {
    unitHyp.updateLabel();
  });

  const triToX = (x) => {
    tri.customState.xLength = x;
    const y = Math.tan(defaultAngle) * x;
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
        duration: 2,
      })
      .start();
  };
  add('circTriAnimateToTan', () => animateTri(defaultCos, radius));
  add('circTriAnimateToCot', () => animateTri(radius, radius / Math.tan(defaultAngle)));
  add('circTriToTan', () => triToX(radius));
  add('circTriToCos', () => triToX(defaultCos));
  add('circTriToCot', () => triToX(radius / Math.tan(defaultAngle)));
}
