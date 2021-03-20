/* eslint-disable camelcase, no-restricted-globals */
/* globals figure, colTheta, colCot, colTan, colSin, colCos, colSec, colCsc,
   colGrey, Fig, thin, thick, colText, colRad, colDarkGrey */

function layoutCirc() {
  const radius = 1.8;
  const defaultAngle = 0.9;
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

  const lineWithLabel = (name, color, text, width = thick, p1, length, ang, location = 'negative', linePosition = 0.5) => ({
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
          textFont: { style: 'normal' },
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
    name, text, rad = 0.2, curvePosition = 0.5, position = [0, 0], startAngle = 0, angleSize = 0,
  ) {
    return {
      name,
      method: 'collections.angle',
      options: {
        color: colTheta,
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
  // const tri = (name, elements, position, rotation, trans1 = {}, trans2 = {}) => ({
  //   name,
  //   method: 'collection',
  //   elements,
  //   mods: {
  //     scenarios: {
  //       noSplit: { scale: [1, 1], position: [0, 0], rotation: 0 },
  //       split: { scale: [1, 1], position, rotation },
  //       trans1,
  //       trans2,
  //     },
  //   },
  // });

  // const ln = (...content) => ({
  //   lines: {
  //     content: [...content],
  //     justify: 'left',
  //     xAlign: 'left',
  //     yAlign: 'baseline',
  //     baselineSpace: 0.3,
  //   },
  // });

  const [circle] = figure.add({
    name: 'circ',
    method: 'collection',
    elements: [
      // Light Lines
      // arc('circle', colGrey, thin),
      arc('arc', colGrey, thin, 300, Math.PI / 2, 0),
      line('xQ1', colGrey, thin, [0, 0], radius, 0),
      line('yQ1', colGrey, thin, [0, 0], radius, Math.PI / 2),
      {
        name: 'tri',
        method: 'polyline',
        options: {
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
      // line('x', colGrey, thin, [-radius, 0], radius * 2, 0),
      // line('y', colGrey, thin, [0, -radius], radius * 2, Math.PI / 2),
      // line('tanLight', colGrey, thin),
      // line('secLight', colGrey, thin),
      // line('cotLight', colGrey, thin),
      // line('cscLight', colGrey, thin),
      // line('sinLight', colGrey, thin),
      // line('tanLightAlt', colGrey, thin),
      // line('secLightAlt', colGrey, thin),
      // line('cotLightAlt', colGrey, thin),
      // line('cscLightAlt', colGrey, thin),
      // line('radiusLight', colGrey, thin),
      // lineWithLabel('xy', colGrey, 'x, y', thin),
      // {
      //   name: 'xy',
      //   method: 'collections.line',
      //   options: {
      //     width: thin,
      //     color: colGrey,
      //     label: {
      //       text: {
      //         textFont: { style: 'italic', color: colText, size: 0.25 },
      //         forms: { 0: 'x, y' },
      //       },
      //       location: 'end',
      //       orientation: 'horizontal',
      //       update: true,
      //     },
      //   },
      // },
      // rightAngle('rightCotAlt', [radius, 0], Math.PI / 2),
      // rightAngle('rightTanAlt', [radius, 0], Math.PI / 2),
      // rightAngle('rightSinAlt', [0, 0], Math.PI / 2),
      // lineWithLabel('radius', colGrey, '1', thin),
      // lineWithLabel('radiusAlt', colGrey, '1', thin),
      // lineWithLabel('xRadius', colGrey, '1', thin, [0, 0], radius, 0),
      angle('theta', '\u03b8'),
      // angle('thetaVal', null),
      // angle('thetaCot', '\u03b8'),
      angle('thetaCompSin', {
        forms: { 0: ['_90', '_\u00b0\u2212\u03b8'] },
      }, 0.45, 0.7),
      angle('thetaCompCot', {
        forms: { 0: ['_90', '_\u00b0\u2212\u03b8'] },
      }, 0.45, 0.7),
      // angle('thetaCompCos', {
      //   forms: { 0: ['_90', '_\u00b0\u2212\u03b8'] },
      // }, 0.35, 0.7),
      // angle('q2', {
      //   forms: { 0: ['_180', '_\u00b0\u2212\u03b8'] },
      // }, 0.45, 0.5, [0, 0], 0, Math.PI - defaultAngle),
      // angle('q3', {
      //   forms: { 0: ['_\u03b8+', '_180', '_\u00b0'] },
      // }, 0.45, 0.5, [0, 0], 0, Math.PI + defaultAngle),
      // angle('q4', {
      //   forms: { 0: ['_360', '_\u00b0\u2212\u03b8'] },
      // }, 0.45, 0.5, [0, 0], 0, 2 * Math.PI - defaultAngle),
      // tri('triSym', [
      //   lineWithLabel('sin', colSin, '', thick, [defaultCos, 0], defaultSin, Math.PI / 2),
      //   lineWithLabel('cos', colCos, '', thick, [0, 0], defaultCos, 0),
      //   lineWithLabel('unit', colGrey, '', thin, [0, 0], radius, defaultAngle),
      //   angle('theta', '\u03b8', 0.2, 0.5, [0, 0], 0, defaultAngle),
      //   {
      //     name: 'xy',
      //     method: 'collections.line',
      //     options: {
      //       width: thin,
      //       color: colGrey,
      //       label: {
      //         text: {
      //           textFont: { style: 'italic', color: colText, size: 0.25 },
      //           forms: {
      //             1: ['x', '_, ', 'y'],
      //             2: ['_-x', '_, ', 'y'],
      //             3: ['_-x', '_, ', '_-y'],
      //             4: ['x', '_, ', '_-y'],
      //           },
      //         },
      //         orientation: 'horizontal',
      //         location: 'end',
      //         update: true,
      //       },
      //     },
      //   },
      //   { name: 'point', method: 'polygon', options: { sides: 30, radius: 0.02, fill: colText, position: [defaultCos, defaultSin ] } },
      // ]),
      // tri('triSinCos', [
      //   angle('theta', '\u03b8', 0.2, 0.5, [0, 0], 0, defaultAngle),
      //   lineWithLabel('unit', colText, '1', thick, [0, 0], radius, defaultAngle),
      //   lineWithLabel('sin', colSin, 'sin'),
      //   lineWithLabel('cos', colCos, 'cos'),
      //   rightAngle('rightSin', [0, 0], Math.PI / 2),
      // ], [-0.3 - 1.6, 0.8 + 0.2], 0),
      // tri(
      //   'triTanSec',
      //   [
      //     angle('theta', '\u03b8', 0.2, 0.5, [0, 0], 0, defaultAngle),
      //     lineWithLabel('unit', colText, '1', thick, [radius + thick / 2, 0], radius + thick * 0.7, Math.PI),
      //     lineWithLabel('tan', colTan, 'tan'),
      //     lineWithLabel('sec', colSec, 'sec'),
      //     rightAngle('rightTan', [radius, 0], Math.PI / 2),
      //   ],
      //   [0, 0],
      //   0,
      //   { scale: [1, -1], rotation: 0, position: [0, 0] },
      //   { scale: [1, -1], rotation: defaultAngle, position: [0, 0] },
      // ),
      // lineWithLabel('tanTheta', colTan, [{ tan: { color: [0, 0, 0, 0] } }, ' ', { theta: { text: '\u03b8', color: colTheta, style: 'italic' } }]),
      // tri(
      //   'triCotCsc',
      //   [
      //     angle('theta', '\u03b8', 0.2, 0.5, [radius / Math.sin(defaultAngle) * Math.cos(defaultAngle), radius / Math.sin(defaultAngle) * Math.sin(defaultAngle)], Math.PI, defaultAngle - 0.05),
      //     lineWithLabel('unit', colText, '1', thick, [-thick / 2, thick], radius - thick / 2, Math.PI / 2),
      //     lineWithLabel('csc', colCsc, 'csc'),
      //     lineWithLabel('cot', colCot, 'cot'),
      //     rightAngle('rightCot', [0, radius], -Math.PI / 2),
      //   ],
      //   [0.1, radius - 0.2 + 0.5 + 0.2],
      //   Math.PI,
      //   { scale: [-1, 1], rotation: 0, position: [0, 0] },
      //   { scale: [-1, 1], rotation: -(Math.PI / 2 - defaultAngle), position: [0, 0] },
      // ),
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
      // {
      //   name: 'eqn',
      //   method: 'equation',
      //   options: {
      //     textFont: { style: 'normal' },
      //     elements: {
      //       eq: { text: ' = ', color: colText },
      //       theta: { text: '\u03b8', color: colTheta, style: 'italic' },
      //       theta1: { text: '\u03b8', color: colTheta, style: 'italic' },
      //       comp: { text: '\u00b0\u2212\u03b8', color: colTheta, style: 'italic' },
      //       _90: { color: colTheta },
      //       lb: { symbol: 'bracket', side: 'left' },
      //       rb: { symbol: 'bracket', side: 'right' },
      //       lb1: { symbol: 'bracket', side: 'left' },
      //       rb1: { symbol: 'bracket', side: 'right' },
      //       tan: { color: colCot },
      //       c_1: { color: colCot },
      //       o_1: { color: colCot },
      //       t_1: { color: colCot },
      //       gent_1: { color: colCot },
      //       an_1: { color: colCot },
      //       mplementary_1: { color: colCot },
      //       '_ of _1': { color: colCot },
      //       '_ of _2': { color: colCsc },
      //       '_ of _3': { color: colCos },
      //       sec: { color: colCsc },
      //       c_2: { color: colCsc },
      //       c_21: { color: colCsc },
      //       o_2: { color: colCsc },
      //       s_2: { color: colCsc },
      //       e_2: { color: colCsc },
      //       angent_2: { color: colCsc },
      //       mplementary_2: { color: colCsc },
      //       ant_2: { color: colCsc },
      //       //
      //       sin: { color: colCos },
      //       mplementary_3: { color: colCos },
      //       c_3: { color: colCos },
      //       o_3: { color: colCos },
      //       s_3: { color: colCos },
      //       ine_3: { color: colCos },
      //     },
      //     formDefaults: {
      //       alignment: { yAlign: 'baseline', xAlign: 'left' },
      //     },
      //     phrases: {
      //       compAngle: { brac: ['lb', ['_90', 'comp'], 'rb'] },
      //       tanComp: ['tan', ' ', 'compAngle'],
      //       secComp: ['sec', ' ', 'compAngle'],
      //       sinComp: ['sin', ' ', 'compAngle'],
      //     },
      //     forms: {
      //       tanComp: {
      //         content: 'tanComp',
      //         alignment: { xAlign: '-0.5o' },
      //       },
      //       complementaryTangent: ['tanComp', 'eq', ln(
      //         ['c_1', 'o_1', 'mplementary_1'],
      //         ['t_1', 'an_1', 'gent_1', '_ of _1', 'theta1'],
      //       )],
      //       cotangent: ['tanComp',
      //         'eq', 'c_1', 'o_1', 't_1', 'an_1', 'gent_1', ' ', 'theta1'],
      //       cotan: ['tanComp',
      //         'eq', 'c_1', 'o_1', 't_1', 'an_1', ' ', 'theta1'],
      //       cotTheta: ['tanComp', 'eq', 'c_1', 'o_1', 't_1', ' ', 'theta1'],
      //       //
      //       secComp: {
      //         content: 'secComp',
      //         alignment: { xAlign: '-0.5o' },
      //       },
      //       complementarySecant: ['secComp', 'eq', ln(
      //         ['c_2', 'o_2', 'mplementary_2'],
      //         ['s_2', 'e_2', 'c_21', 'ant_2', '_ of _2', 'theta1'],
      //       )],
      //       cosecant: ['secComp', 'eq', 'c_2', 'o_2', 's_2', 'e_2', 'c_21', 'ant_2', ' ', 'theta1'],
      //       cosec: ['secComp', 'eq', 'c_2', 'o_2', 's_2', 'e_2', 'c_21', ' ', 'theta1'],
      //       csc: ['secComp', 'eq', 'c_2', 's_2', 'c_21', ' ', 'theta1'],
      //       //
      //       sin: {
      //         content: 'sin',
      //         alignment: { xAlign: '-0.4o' },
      //       },
      //       sinComp: {
      //         content: 'sinComp',
      //         alignment: { xAlign: '-0.4o' },
      //       },
      //       complementarySine: ['sinComp', 'eq', ln(
      //         ['c_3', 'o_3', 'mplementary_3'],
      //         ['s_3', 'ine_3', '_ of _3', 'theta1'],
      //       )],
      //       cosine: ['sinComp', 'eq', 'c_3', 'o_3', 's_3', 'ine_3', ' ', 'theta1'],
      //       cos: ['sinComp', 'eq', 'c_3', 'o_3', 's_3', ' ', 'theta1'],
      //     },
      //     position: [-2.7, 1],
      //     scale: 1,
      //   },
      // },
      { name: 'point', method: 'polygon', options: { sides: 30, radius: 0.02, fill: colText, position: [defaultCos, defaultSin ] } },
      // {
      //   name: 'rotatorQ2',
      //   method: 'collections.line',
      //   options: {
      //     length: radius,
      //     width: 0.1,
      //     color: [0, 0, 0, 0],
      //   },
      //   mods: {
      //     move: { type: 'rotation', bounds: { rotation: { min: Math.PI / 2 * 1.00001, max: Math.PI * 0.99999 } } },
      //     dimColor: [0, 0, 0, 0],
      //     isMovable: true,
      //     touchBorder: [0, 0.5, 1.5, 0.5],
      //   },
      // },
      // {
      //   name: 'rotatorQ3',
      //   method: 'collections.line',
      //   options: {
      //     length: radius,
      //     width: 0.1,
      //     color: [0, 0, 0, 0],
      //   },
      //   mods: {
      //     move: { type: 'rotation', bounds: { rotation: { min: Math.PI * 1.00001, max: Math.PI * 3 / 2 * 0.99999 } } },
      //     dimColor: [0, 0, 0, 0],
      //     isMovable: true,
      //     touchBorder: [0, 0.5, 1.5, 0.5],
      //   },
      // },
      // {
      //   name: 'rotatorQ4',
      //   method: 'collections.line',
      //   options: {
      //     length: radius,
      //     width: 0.1,
      //     color: [0, 0, 0, 0],
      //   },
      //   mods: {
      //     move: { type: 'rotation', bounds: { rotation: { min: Math.PI * 3 / 2 * 1.00001, max: Math.PI * 2 * 0.99999 } } },
      //     dimColor: [0, 0, 0, 0],
      //     isMovable: true,
      //     touchBorder: [0, 0.5, 1.5, 0.5],
      //   },
      // },
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
      // {
      //   name: 'rotatorFull',
      //   method: 'collections.line',
      //   options: {
      //     length: radius,
      //     width: 0.1,
      //     color: [0, 0, 0, 0],
      //   },
      //   mods: {
      //     dimColor: [0, 0, 0, 0],
      //     move: { type: 'rotation' },
      //     isMovable: true,
      //     touchBorder: [0, 0.5, 1.5, 0.5],
      //   },
      // },
    ],
    // options: {
    //   dimColor: colDarkGrey,
    // },
    mods: {
      scenarios: {
        center: { scale: 1, position: [0, -1.2] },
        // circQ1: { scale: 1, position: [-0.4, -1] },
        // circQ1Values: { scale: 1, position: [-0.2, -1] },
        // split: { scale: 1, position: [1.1, -1] },
        // centerSplit: { scale: 1, position: [0.4, -1] },
        // centerRightSplit: { scale: 1, position: [0.7, -1] },
        // tanSecTri: { scale: 1, position: [0.5, -1] },
        // circFull: { scale: 0.7, position: [0.7, 0] },
        // nameDefs: { scale: 1, position: [0.4, -1] },
        // fromCirc: { scale: 1.04 / 1.5, position: [-1.5, 0] },
      },
    },
  });
  t.push(performance.now() / 1000);
  // console.log(t.slice(-1)[0] - t.slice(-2, -1)[0])
  const get = list => circle.getElements(list);
  const [rotator] = get(['rotator']);
  const [theta, thetaCompSin, thetaCompCot] = get(['theta', 'thetaCompSin', 'thetaCompCot']);
  const [cos, sin, tan] = get(['cos', 'sin', 'tan']);
  const [cot, csc, sec] = get(['cot', 'csc', 'sec']);
  const [p] = get(['point']);
  const [unitHyp, unitAdj, unitOpp] = get(['unitHyp', 'unitAdj', 'unitOpp']);
  const [rightSin, rightUnit, rightTan] = get(['rightSin', 'rightUnit', 'rightTan']);
  // const clip = (p1, p2In) => {
  //   const p2 = Fig.getPoint(p2In);
  //   if (p2.x === Infinity || isNaN(p2.x)) { p2.x = 10000; }
  //   if (p2.y === Infinity || isNaN(p2.y)) { p2.y = 10000; }
  //   if (bounds.isPointInside(p2)) {
  //     return [new Fig.Line(p1, p2), false];
  //   }
  //   const p1P2Line = new Fig.Line(p1, p2);
  //   const intersects = bounds.intersectsWithLine(p1P2Line);
  //   return [new Fig.Line(p1, intersects[0]), true];
  // };

  // const arrow = (isClipped, scale = 0.8) => {
  //   if (!isClipped) {
  //     return null;
  //   }
  //   return { end: { head: 'barb', scale} };
  // };
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
        thetaCompSin.setAngle({ position: [x, y], startAngle: r + Math.PI, angle: Math.PI / 2 - r });
        thetaCompSin.setOpacity(1);
      } else {
        thetaCompSin.setOpacity(0);
      }
    }
    if (thetaCompCot.isShown) {
      if (Math.abs(y) > 0.6 && Math.abs(x) > 0.4) {
        thetaCompCot.setAngle({ position: [cotVal, radius], startAngle: r + Math.PI, angle: Math.PI / 2 - r });
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

    /*
    ..######..####.##....##
    .##....##..##..###...##
    .##........##..####..##
    ..######...##..##.##.##
    .......##..##..##..####
    .##....##..##..##...###
    ..######..####.##....##
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

    /*
    ..######...#######...######.
    .##....##.##.....##.##....##
    .##.......##.....##.##......
    .##.......##.....##..######.
    .##.......##.....##.......##
    .##....##.##.....##.##....##
    ..######...#######...######.
    */
    if (cos.isShown) {
      // if (cos._label.isShown) {
      //   cos.label.location = ySign > 0 ? 'bottom' : 'top';
      // }
      cos.setEndPoints([0, 0], [x + thick / 2, 0]);
    }

    /*
    .########....###....##....##
    ....##......##.##...###...##
    ....##.....##...##..####..##
    ....##....##.....##.##.##.##
    ....##....#########.##..####
    ....##....##.....##.##...###
    ....##....##.....##.##....##
    */
    if (tan.isShown) {
      // const [tanLine] = clip([xSign * radius, 0], [xSign * radius, ySign * tanVal]);
      // if (tan._label.isShown) {
      //   tan.label.location = xSign > 0 ? 'right' : 'left';
      // }
      tan.setEndPoints(
        [radius, 0],
        [radius, tanVal],
      );
      if (tan._label.transform.t().x > radius * 1.2) {
        tan._label.transform.updateTranslation(radius * 1.2, tan._label.transform.t().y);
      }
    }
    // if (tanTheta.isShown) {
    //   const [tanLine] = clip([xSign * radius, 0], [xSign * radius, ySign * tanVal]);
    //   if (tanTheta._label.isShown) {
    //     tanTheta.label.location = xSign > 0 ? 'right' : 'left';
    //   }
    //   tanTheta.setEndPoints(
    //     tanLine.p1, tanLine.p2,
    //     // arrow: arrow(isClipped),
    //   );
    // }
    // if (tanLight.isShown) {
    //   if (sec.isShown || (secLight.isShown && !radiusLine.isShown) || radiusLight.isShown) {
    //     tanLight.setOpacity(1);
    //     const [tanLine] = clip([xSign * radius, 0], [xSign * radius, ySign * tanVal]);
    //     tanLight.custom.updatePoints({ p1: tanLine.p1, p2: tanLine.p2 });
    //   } else {
    //     tanLight.setOpacity(0);
    //   }
    // }

    /*
    ..######..########..######.
    .##....##.##.......##....##
    .##.......##.......##......
    ..######..######...##......
    .......##.##.......##......
    .##....##.##.......##....##
    ..######..########..######.
    */
    if (sec.isShown) {
      // const [secLine] = clip([0, 0], [xSign * radius, ySign * tanVal]);
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
    // if (secLight.isShown) {
    //   if (tan.isShown || (tanLight.isShown && !radiusLine.isShown) || radiusLight.isShown) {
    //     secLight.setOpacity(1);
    //     const [secLine] = clip([0, 0], [xSign * radius, ySign * tanVal]);
    //     secLight.custom.updatePoints({ p1: secLine.p1, p2: secLine.p2 });
    //   } else {
    //     secLight.setOpacity(0);
    //   }
    // }

    /*
    ..######...#######..########
    .##....##.##.....##....##...
    .##.......##.....##....##...
    .##.......##.....##....##...
    .##.......##.....##....##...
    .##....##.##.....##....##...
    ..######...#######.....##...
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
    // if (cotLight.isShown) {
    //   let offsetX = 0;
    //   let offsetY = 0;
    //   if (csc.isShown && sec._line.isShown) {
    //     offsetX = thick * Math.cos(r + xSign * ySign * Math.PI / 2);
    //     offsetY = thick * Math.sin(r + xSign * ySign * Math.PI / 2);
    //   }
    //   if (
    //     (
    //       (csc.isShown || (cscLight.isShown && !radiusLine.isShown))
    //       && !cot.isShown
    //     ) || radiusLight.isShown
    //   ) {
    //     cotLight.setOpacity(1);
    //     const [cotLine] = clip([0, ySign * radius], [xSign * cotVal, ySign * radius]);
    //     cotLight.custom.updatePoints({ p1: cotLine.p1, p2: cotLine.p2.add(offsetX, offsetY) });
    //   } else {
    //     cotLight.setOpacity(0);
    //   }
    // }

    /*
    ..######...######...######.
    .##....##.##....##.##....##
    .##.......##.......##......
    .##........######..##......
    .##.............##.##......
    .##....##.##....##.##....##
    ..######...######...######.
    */
    if (csc.isShown) {
      // const [cscLine] = clip([0, 0], [xSign * cotVal, ySign * radius]);
      let offsetX = 0;
      let offsetY = 0;
      let thickOffset = 0;
      if (sec.isShown) {
        offsetX = thick * Math.cos(r + Math.PI / 2);
        offsetY = thick * Math.sin(r + Math.PI / 2);
        thickOffset = thick * Math.cos(r);
      }
      // if (sec._line.isShown && csc.getScale().x > 0) {
      //   offsetX = thick * Math.cos(r + xSign * ySign * Math.PI / 2);
      //   offsetY = thick * Math.sin(r + xSign * ySign * Math.PI / 2);
      // }
      // if (csc._label.isShown) {
      //   if (Math.abs(triCotCsc.getRotation()) < 0.001) {
      //     csc.label.location = ySign > 0 ? 'top' : 'bottom';
      //   } else {
      //     csc.label.location = 'positive';
      //   }
      // }
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
        [0 + offsetX, 0 + offsetY], [cotVal + thickOffset + offsetX, radius + offsetY + thickOffset],
        // cscLine.p1.add(offsetX, offsetY),
        // cscLine.p2.add(offsetX, offsetY),
        // // arrow: arrow(isCl//ipped),
      );
    }
    // if (cscLight.isShown) {
    //   if (
    //     (
    //       (
    //         cot.isShown || radiusLight.isShown || (cotLight.isShown && !radiusLine.isShown)
    //       )
    //       && !csc.isShown
    //     ) || radiusLight.isShown
    //   ) {
    //     cscLight.setOpacity(1);
    //     const [cscLine] = clip([0, 0], [xSign * cotVal, ySign * radius]);
    //     cscLight.custom.updatePoints({ p1: cscLine.p1, p2: cscLine.p2 });
    //   } else {
    //     cscLight.setOpacity(0);
    //   }
    // }

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
  const rotatorUpdateCircle = () => {
    if (rotator.isShown) {
      updateCircle(Fig.tools.g2.clipAngle(rotator.transform.r(), '0to360'));
    }
  };

  rotator.fnMap.add('updateCircle', () => rotatorUpdateCircle());
  figure.fnMap.global.add('circSetup', (payload) => {
    const [ang] = payload;
    rotator.setRotation(ang);
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
}
