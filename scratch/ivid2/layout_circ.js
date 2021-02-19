/* eslint-disable camelcase */
/* globals figure, colTheta, colCot, colTan, colSin, colCos, colSec, colCsc, colRad, colGrey, colDim, colAdj, colOpp, colHyp, Fig, colDarkGrey */

function layoutCirc() {
  const radius = 1.5;
  const defaultAngle = 0.45;
  const altOffset = 0.02;

  const thick = 0.013;
  const thin = 0.006;

  const line = (name, color, width = thick, p1 = [0, 0], length = 1, angle = 0, dash = []) => ({
    name,
    method: 'primitives.line',
    options: {
      p1, length, angle, width, color, dash,
    },
    // mods: { dimColor: colText },
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
  const lineLabelEqn = (name, text, color, position = [0, 0], yAlign = 'middle', xAlign = 'center') => ({
    name,
    method: 'equation',
    options: {
      // text: {
      elements: {
        t: { text, color, style: 'normal' },
        theta: { text: '\u03b8', color: colTheta },
      },
      forms: {
        0: ['t', ' ', 'theta'],
      },
      formDefaults: { alignment: { yAlign, xAlign } },
      // },
      scale: 0.7,
      // font: { family: 'Times New Roman', size: 0.14 },
      // color,
      // xAlign,
      // yAlign,
      position,
    },
    mods: {
      dimColor: colDim,
    },
  });

  const lineLabel = (name, text, color, position = [0, 0], yAlign = 'middle', xAlign = 'center') => ({
    name,
    method: 'text',
    options: {
      text,
      font: { family: 'Times New Roman', size: 0.14 },
      color,
      xAlign,
      yAlign,
      position,
    },
    mods: {
      dimColor: colDim,
    },
  });

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

  const angle = (name, text, rad = 0.2, curvePosition = 0.5) => ({
    name,
    method: 'collections.angle',
    options: {
      color: colTheta,
      curve: {
        width: 0.01,
        radius: rad,
        sides: 400,
      },
      label: {
        text,
        offset: 0.01,
        curvePosition,
      },
    },
  });

  const fill = (name, color) => ({
    name,
    method: 'generic',
    options: {
      points: [[0, 0], [1, 0], [0, 1]],
      color,
    },
  });

  const [circle] = figure.add({
    name: 'circ',
    method: 'collection',
    elements: [
      fill('tanTri', [1, 0, 0, 0.3]),
      fill('cotTri', [1, 0, 0, 0.3]),
      line('xLight', colGrey, thin, [0, 0], radius, 0),
      line('yLight', colGrey, thin, [0, 0], radius, Math.PI / 2),
      line('x', colDarkGrey, thin, [0, 0], radius, 0),
      line('y', colDarkGrey, thin, [0, 0], radius, Math.PI / 2),
      line('xFull', colGrey, thin, [-radius, 0], radius * 2, 0),
      line('yFull', colGrey, thin, [0, -radius], radius * 2, Math.PI / 2),
      line('xSec', colGrey, thin, [0, 0], radius, 0, [0.01, 0.005]),
      arc('circleLight', colGrey),
      arc('circle', colDarkGrey, thick),
      arc('arcLight', colGrey, thin, 300, Math.PI / 2, 0),
      arc('arc', colDarkGrey, thick, 300, Math.PI / 2, 0),
      {
        name: 'tangent',
        method: 'collections.line',
        options: {
          p1: [-radius * 1.3, -radius * 0.6],
          p2: [radius * 0.7, -radius * 1.32],
          width: 0.015,
          color: colTan,
          label: {
            text: 'tangent',
            orientation: 'baseAway',
            location: 'bottom',
            scale: 1.1,
          },
        },
      },
      {
        name: 'secant',
        method: 'collections.line',
        options: {
          p1: [radius * 0.6, radius * 1.1],
          p2: [-radius * 1.2, radius * 0],
          width: 0.015,
          color: colSec,
          label: {
            text: 'secant',
            orientation: 'baseToLine',
            location: 'top',
            scale: 1.1,
          },
        },
      },
      {
        name: 'chord',
        method: 'collections.line',
        options: {
          p1: [radius * Math.cos(1), radius * Math.sin(1)],
          p2: [radius * Math.cos(1), -radius * Math.sin(1)],
          width: 0.015,
          color: colSin,
          label: {
            text: 'chord',
            orientation: 'horizontal',
            location: 'right',
            scale: 1.1,
          },
        },
      },
      arc('bow', colSin, thick, 300, 2, -1),
      line('radius', colRad, thin, [0, 0], radius, 4.37),
      rightAngle('rightAngle', [radius * Math.cos(4.37), radius * Math.sin(4.37)], 4.37 - Math.PI, 0.3, colDarkGrey),
      arc('arc', colGrey, thin, 100, Math.PI / 2),
      rightAngle('rightOrigin', [0, 0], 0, 0.2, colDarkGrey),
      rightAngle('rightSin', [0, 0], Math.PI / 2),
      rightAngle('rightTan', [radius, 0], Math.PI / 2),
      rightAngle('rightCot', [0, radius], Math.PI / 2),
      rightAngle('rightTanAlt', [0, radius], Math.PI / 2),
      rightAngle('rightCotAlt', [0, radius], Math.PI / 2),
      rightAngle('rightCosAlt', [0, radius], Math.PI / 2),
      angle('theta', '\u03b8'),
      angle('thetaVal', null),
      angle('thetaQ1', '\u03b8'),
      angle('thetaCos', '\u03b8'),
      angle('thetaCot', '\u03b8'),
      angle('thetaComp', '90\u00b0\u2212\u03b8', 0.35, 0.7),
      line('tanLight', colDarkGrey, thin),
      line('cotLight', colDarkGrey, thin),
      line('secLight', colDarkGrey, thin),
      line('cscLight', colDarkGrey, thin),
      {
        name: 'center',
        method: 'primitives.polygon',
        options: {
          radius: 0.015,
          sides: 12,
        },
      },
      // {
      //   name: 'angle',
      //   method: 'collections.angle',
      //   options: {
      //     color: colTheta,
      //     curve: {
      //       width: 0.01,
      //       radius: 0.2,
      //       step: 0.8,
      //       sides: 400,
      //     },
      //     label: {
      //       text: '\u03b8',
      //       offset: 0.01,
      //     },
      //   },
      // },
      // {
      //   name: 'angle2',
      //   method: 'collections.angle',
      //   options: {
      //     color: colTheta,
      //     curve: {
      //       width: 0.01,
      //       radius: 0.2,
      //       step: 0.8,
      //       sides: 400,
      //     },
      //     label: {
      //       text: '\u03b8',
      //       offset: 0.01,
      //     },
      //   },
      // },
      // {
      //   name: 'angle3',
      //   method: 'collections.angle',
      //   options: {
      //     color: colTheta,
      //     curve: {
      //       width: 0.01,
      //       radius: 0.3,
      //       step: 0.8,
      //       sides: 400,
      //     },
      //     label: {
      //       text: '\u03b8',
      //       offset: 0.03,
      //     },
      //   },
      // },
      // {
      //   name: 'compAngle',
      //   method: 'collections.angle',
      //   options: {
      //     color: colTheta,
      //     curve: {
      //       width: 0.01,
      //       radius: 0.3,
      //       step: 0.8,
      //       sides: 400,
      //     },
      //     label: {
      //       text: '90\u00b0\u2212\u03b8',
      //       curvePosition: 0.65,
      //       offset: 0.01,
      //       scale: 0.6,
      //     },
      //   },
      // },
      // {
      //   name: 'compAngle2',
      //   method: 'collections.angle',
      //   options: {
      //     color: colTheta,
      //     curve: {
      //       width: 0.01,
      //       radius: 0.3,
      //       step: 0.8,
      //       sides: 400,
      //     },
      //     label: {
      //       text: '90\u00b0\u2212\u03b8',
      //       curvePosition: 0.65,
      //       offset: 0.01,
      //       scale: 0.6,
      //     },
      //   },
      // },
      // line('sec', colSec),
      // lineLabel('secLabel', 'sec', colSec),
      // line('sec1', colSec),
      // lineLabel('secLabel1', 'sec', colSec),
      // line('bowString', colSin),
      // line('sin', colSin),
      // lineLabel('cosLabel', 'cos', colSin, [0, 0], 'baseline'),
      // // lineLabel('f1Label', { forms: { 0: { sub: ['f', '_1'] } } }, colSin),
      // { name: 'f1Label', method: 'equation', options: { forms: { 0: { sub: ['f', '_1'] } }, color: colSin } },
      line('cos', colCos),
      line('sin', colSin),
      line('csc', colCsc),
      line('cot', colCot),
      line('sec', colSec),
      line('tan', colTan),
      line('hyp', colHyp, thick, [0, 0], radius),
      lineLabel('hypLabel', '1', colDarkGrey),
      lineLabel('sinLabel', 'sin', colSin, [0, 0], 'middle', 'center'),
      lineLabel('cosLabel', 'cos', colCos, [0, 0], 'middle', 'center'),
      lineLabel('tanLabel', 'tan', colTan),
      lineLabel('secLabel', 'sec', colSec),
      lineLabel('cscLabel', 'csc', colCsc),
      lineLabel('cotLabel', 'cot', colCot),
      lineLabel('cosLabelAlt', 'cos', colCos, [0, 0], 'middle', 'center'),
      lineLabel('tanLabelAlt', 'tan', colTan),
      lineLabel('secLabelAlt', 'sec', colSec),
      lineLabel('cscLabelAlt', 'csc', colCsc),
      lineLabel('cotLabelAlt', 'cot', colCot),
      lineLabel('unitCsc', '1', colText, [-0.1, radius / 2]),
      line('cosAlt', colCos),
      line('cscAlt', colCsc),
      line('cotAlt', colCot),
      line('secAlt', colSec),
      line('tanAlt', colTan),
      line('hypAlt', colDarkGrey, thick, [0, 0], radius),
      
      // line('cot', colCot),
      // line('tanAlt', colOpp),
      // lineLabel('tanLabelAlt', 'tan', colOpp),
      // line('cotAlt', colAdj),
      // lineLabel('cotLabelAlt', 'cot', colAdj),
      // lineLabel('adjacentOneLabel', '1', colAdj, [radius / 2, -0.1]),
      // lineLabel('oppositeOneLabel', '1', colOpp, [-0.1, radius / 2]),
      // {
      //   name: 'adjacentOne',
      //   method: 'primitives.line',
      //   options: {
      //     p1: [0, 0],
      //     p2: [radius + 0, 0],
      //     width: 0.013,
      //     color: colAdj,
      //     // arrow: 'bar',
      //   },
      // },
      // {
      //   name: 'oppositeOne',
      //   method: 'primitives.line',
      //   options: {
      //     p1: [0, altOffset],
      //     p2: [0, radius + altOffset],
      //     width: 0.013,
      //     color: colOpp,
      //     // arrow: 'bar',
      //   },
      // },
      // {
      //   name: 'bowStringLabel',
      //   method: 'equation',
      //   options: {
      //     elements: {
      //       sin: { style: 'normal' },
      //       comma: ', ',
      //       // rightArrow: ' \u2192 ',
      //     },
      //     forms: {
      //       // bowstring: 'bowstring',
      //       half: ['half chord'],
      //       // sinus: 'sinus',
      //       // sine: ['sinus', 'rightArrow', 'sine'],
      //       sinesin: ['sine', 'comma', 'sin'],
      //       sin: 'sin',
      //     },
      //     formDefaults: { alignment: { yAlign: 'baseline' } },
      //     color: colOpp,
      //   },
      // },
      // {
      //   name: 'cosLabelEqn',
      //   method: 'equation',
      //   options: {
      //     elements: {
      //       co: { style: 'normal' },
      //       s: { style: 'normal' },
      //       sin: { style: 'normal' },
      //       comma: ', ',
      //       // rightArrow: ' \u2192 ',
      //       comp: { text: '90\u00b0 \u2212 \u03b8', color: colTheta },
      //       lb: { symbol: 'bracket', side: 'left' },
      //       rb: { symbol: 'bracket', side: 'right' },
      //       brace: { symbol: 'brace', side: 'bottom' },
      //       theta: { text: '\u03b8', color: colTheta },
      //     },
      //     forms: {
      //       sine: {
      //         content: ['sin', { brac: ['lb', 'comp', 'rb'] }],
      //         alignment: { xAlign: '0.25o' },
      //       },
      //       compSine: {
      //         content: ['sin', { brac: ['lb', 'comp', 'rb'] }, '_ = ', 'co', 'mplementary', ' ', 's', 'ine', ' ', 'theta'],
      //         alignment: { xAlign: '0.25o' },
      //       },
      //       cosine: {
      //         content: ['sin', { brac: ['lb', 'comp', 'rb'] }, '_ = ', 'co', 's', 'ine', ' ', 'theta'],
      //         alignment: { xAlign: '0.25o' },
      //       },
      //       cos: ['co', 's'],
      //     },
      //     formDefaults: { alignment: { yAlign: 'top', xAlign: 'left' } },
      //     color: colAdj,
      //   },
      // },
      // {
      //   name: 'tanAltEqn',
      //   method: 'equation',
      //   options: {
      //     elements: {
      //       tan: { style: 'normal' },
      //       comma: ', ',
      //     },
      //     forms: {
      //       tangent: 'tangent',
      //       tangentTan: ['tangent', 'comma', 'tan'],
      //       tan: ['tan'],
      //     },
      //     formDefaults: { alignment: { yAlign: 'baseline' } },
      //     color: colTan,
      //   },
      // },
      // {
      //   name: 'secAltEqn',
      //   method: 'equation',
      //   options: {
      //     elements: {
      //       sec: { style: 'normal' },
      //       comma: ', ',
      //     },
      //     forms: {
      //       secant: 'secant',
      //       secantSec: ['secant', 'comma', 'sec'],
      //       sec: ['sec'],
      //     },
      //     formDefaults: { alignment: { yAlign: 'baseline', xAlign: 'right' } },
      //     color: colSec,
      //   },
      // },
      // {
      //   name: 'cotAltEqn',
      //   method: 'equation',
      //   options: {
      //     elements: {
      //       co: { style: 'normal' },
      //       t: { style: 'normal' },
      //     },
      //     formDefaults: {
      //       alignment: { yAlign: 'baseline', xAlign: 'center' },
      //     },
      //     forms: {
      //       complementaryTangent: ['co', 'mplementary', ' ', 't', 'angent'],
      //       cotangent: ['co', 't', 'angent'],
      //       cot: ['co', 't'],
      //     },
      //     color: colAdj,
      //   },
      // },
      // {
      //   name: 'cscAltEqn',
      //   method: 'equation',
      //   options: {
      //     elements: {
      //       c: { style: 'normal' },
      //       s: { style: 'normal' },
      //       c_1: { style: 'normal' },
      //     },
      //     formDefaults: {
      //       alignment: { yAlign: 'baseline', xAlign: 'left' },
      //     },
      //     forms: {
      //       complementarySecant: ['c', 'o', 'mplementary', ' ', 's', 'e', 'c_1', 'ant'],
      //       cosec: ['c', 'o', 's', 'e', 'c_1'],
      //       csc: ['c', 's', 'c_1'],
      //     },
      //     color: colHyp,
      //   },
      // },
      // {
      //   name: 'line',
      //   method: 'collections.line',
      //   options: {
      //     length: radius,
      //     width: 0.013,
      //     color: colOne,
      //   },
      //   // mods: {
      //   //   move: { type: 'rotation', bounds: { rotation: { min: 0, max: Math.PI / 2 } } },
      //   //   isMovable: true,
      //   //   touchBorder: 0.3,
      //   // },
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
          move: { type: 'rotation', bounds: { rotation: { min: 0, max: Math.PI / 2 } } },
          dimColor: [0, 0, 0, 0],
          // move: { type: 'rotation' },
          isMovable: true,
          touchBorder: [0, 0.5, 0.5, 0.5],
        },
      },
      {
        name: 'rotatorFull',
        method: 'collections.line',
        options: {
          length: radius,
          width: 0.1,
          color: [0, 0, 0, 0],
        },
        mods: {
          // move: { type: 'rotation', bounds: { rotation: { min: 0, max: Math.PI / 2 } } },
          dimColor: [0, 0, 0, 0],
          move: { type: 'rotation' },
          isMovable: true,
          touchBorder: [0, 0.5, 0.5, 0.5],
        },
      },
      // {
      //   name: 'lineLabel',
      //   method: 'text',
      //   options: {
      //     text: '1',
      //     font: { family: 'Times New Roman', size: 0.14 },
      //     color: colOne,
      //     xAlign: 'right',
      //     yAlign: 'bottom',
      //   },
      // },
      // line('secAlt', colHyp),
      // lineLabel('secLabelAlt', 'sec', colHyp),
      // line('cscAlt', colHyp),
      // lineLabel('cscLabelAlt', 'csc', colHyp),
    ],
    mods: {
      scenarios: {
        circQuarter: { scale: 1, position: [-0.5, -1] },
        circFull: { scale: 0.7, position: [0, 0] },
        circValues: { scale: 0.7, position: [0.6, 0] },
        circLines: { scale: 0.7, position: [-1.3, 0] },
        // title: { scale: 1 },
        // default: { scale: 1, position: [-radius / 2 + 0.4, -1.1] },
        // right: { scale: 1, position: [0.5, -1.2] },
        // small: { scale: 0.7, position: [0, 0] },
        // center: { scale: 1, position: [0, -0.5] },
        // right1: { scale: 1, position: [0, -0.5] },
        // circleSmall: { scale: 0.8, position: [0, 0] },
        // circleLines: { scale: 0.7, position: [-1.3, 0] },
        // circleQuart: { scale: 1, position: [-radius / 2 + 0.8, -1] },
        // circleQuartMid: { scale: 1, position: [-radius / 2 + 0.3, -1] },
      },
    },
  });
  const get = list => circle.getElements(list);
  const [rotator, rotatorFull] = get(['rotator', 'rotatorFull']);
  const [theta, thetaQ1, thetaComp] = get(['theta', 'thetaQ1', 'thetaComp']);
  const [thetaCos, thetaCot] = get(['thetaCos', 'thetaCot']);
  const [thetaVal] = get(['thetaVal']);
  const [cos, sin] = get(['cos', 'sin', 'tan']);
  const [tan, cot, sec, csc] = get(['tan', 'cot', 'sec', 'csc']);
  const [cotAlt, secAlt, cscAlt] = get(['cotAlt', 'secAlt', 'cscAlt']);
  const [tanAlt, cosAlt] = get(['tanAlt', 'cosAlt']);
  const [hyp, hypLabel, hypAlt] = get(['hyp', 'hypLabel', 'hypAlt']);
  const [cosLabel, sinLabel] = get(['cosLabel', 'sinLabel']);
  const [secLabel, cscLabel] = get(['secLabel', 'cscLabel']);
  const [cotLabel, tanLabel] = get(['cotLabel', 'tanLabel']);
  const [rightSin, rightTan, rightCot] = get(['rightSin', 'rightTan', 'rightCot']);
  const [cotLabelAlt, secLabelAlt, cscLabelAlt] = get(['cotLabelAlt', 'secLabelAlt', 'cscLabelAlt']);
  const [cosLabelAlt, tanLabelAlt] = get(['cosLabelAlt', 'tanLabelAlt']);
  const [rightCosAlt, rightTanAlt, rightCotAlt] = get(['rightCosAlt', 'rightTanAlt', 'rightCotAlt']);
  const [tanLight, cotLight, secLight, cscLight] = get(['tanLight', 'cotLight', 'secLight', 'cscLight']);
  const [tanTri, cotTri] = get(['tanTri', 'cotTri']);

  // const xBounds = 1.3;
  // const yBounds = 0.9;
  const bounds = new Fig.Rect(
    -radius - 0.6,
    -radius - 1,
    radius * 2 + 0.6 + 2,
    radius * 2 + 1 + 1,
  );
  const clip = (p1, p2In) => {
    const p2 = Fig.getPoint(p2In);
    if (p2.x === Infinity) { p2.x = 10000; }
    if (p2.y === Infinity) { p2.y = 10000; }
    if (bounds.isPointInside(p2)) {
      return [new Fig.Line(p1, p2), false];
    }
    const p1P2Line = new Fig.Line(p1, p2);
    const intersects = bounds.intersectsWithLine(p1P2Line);
    return [new Fig.Line(p1, intersects[0]), true];
  };
  // const rightBounds = new Fig.Line([radius + xBounds, 0], radius + xBounds, Math.PI / 2);
  // const topBounds = new Fig.Line([0, radius + yBounds], radius + xBounds, 0);

  // const updateAlt = (r, tangent, secant, cotangent, cosecant, offset = 0) => {
  //   const x = radius * Math.cos(r);
  //   const y = radius * Math.sin(r);
  //   if (tangent.isShown) {
  //     const tanLine = new Fig.Line(
  //       [radius, 0], [radius, Math.min(radius * Math.tan(r), topBounds.p1.y)],
  //     );
  //     tangent.custom.updatePoints({
  //       p1: tanLine.p1._dup().add(0.007, 0),
  //       p2: tanLine.p2._dup().add(0.007, 0),
  //       arrow: tanLine.p2.y > topBounds.p1.y - 0.01 ? { end: { head: 'barb', scale: 0.8 } } : null,
  //     });
  //     if (tanLabelAlt.isShown) {
  //       tanLabelAlt.setPosition(radius + 0.12, tanLine.p2.y / 2);
  //     }
  //     if (tanAltEqn.isShown) {
  //       tanAltEqn.setPosition(radius + 0.036, tanLine.p2.y / 2 - 0.046);
  //     }
  //     const secLength = y > 0.001 ? tanLine.p2.y / Math.sin(r) : radius;
  //     const secLine = new Fig.Line([0, 0], secLength, r);
  //     secant.custom.updatePoints({
  //       p1: [0, 0],
  //       length: secLength,
  //       angle: r,
  //       arrow: tanLine.p2.y > topBounds.p1.y - 0.01 ? { end: { head: 'barb', scale: 0.8 } } : null,
  //     });
  //     if (cosecant.isShown) {
  //       const secLabelAltPos = secLine.offset('negative', 0.12).pointAtPercent(0.45 + r / (Math.PI / 2) * 0.4);
  //       if (r < 0.7) {
  //         secLabelAlt.setPosition(
  //           Math.max(secLabelAltPos.x, radius * 0.65), Math.max(secLabelAltPos.y, -0.07),
  //         );
  //       } else {
  //         secLabelAlt.setPosition(secLabelAltPos);
  //       }
  //     } else {
  //       secLabelAlt.setPosition(secLine.offset('positive', 0.12).pointAtPercent(0.5));
  //     }
  //     if (rightAngle4.isShown) {
  //       if (x > radius - 0.15) {
  //         rightAngle4.setOpacity(0);
  //       } else {
  //         rightAngle4.setOpacity(1);
  //         rightAngle4.setAngle({
  //           position: [radius, 0], startAngle: Math.PI / 2, angle: Math.PI / 2,
  //         });
  //       }
  //     }
  //     if (secAltEqn.isShown) {
  //       secAltEqn.setPosition(secLine.offset('positive', 0.05).pointAtPercent(0.5).add(0.043, 0.023));
  //     }
  //   }
  //   if (cotangent.isShown) {
  //     const cotLine = new Fig.Line(
  //       [0, radius], [Math.min(radius / Math.tan(r), rightBounds.p1.x), radius],
  //     );
  //     cotangent.custom.updatePoints({
  //       p1: cotLine.p1._dup().add(0, 0.007),
  //       p2: cotLine.p2._dup().add(0, 0.007),
  //       arrow: cotLine.p2.x > rightBounds.p1.x - 0.01 ? { end: { head: 'barb', scale: 0.8 } } : null,
  //     });
  //     cotLabelAlt.setPosition(Math.max(cotLine.p2.x / 2, 0.1), radius + 0.1);
  //     if (cosecant.isShown) {
  //       const cscLength = cotLine.p2.x / Math.cos(r);
  //       const cscLine = new Fig.Line([0, 0], cscLength, r);
  //       cosecant.custom.updatePoints({
  //         p1: [0, offset],
  //         length: cscLength,
  //         angle: r,
  //         arrow: cotLine.p2.x > rightBounds.p1.x - 0.01 ? { end: { head: 'barb', scale: 0.8 } } : null,
  //       });
  //       if (secLabelAlt.isShown) {
  //         cscLabelAlt.setPosition(cscLine.offset('positive', 0.12).pointAtPercent(0.7));
  //       } else {
  //         cscLabelAlt.setPosition(cscLine.offset('negative', 0.12).pointAtPercent(0.7));
  //       }
  //     }
  //     if (cscAltEqn.isShown) {
  //       const cscLength = cotLine.p2.x / Math.cos(r);
  //       const cscLine = new Fig.Line([0, 0], cscLength, r);
  //       cscAltEqn.setPosition(cscLine.offset('negative', 0.084).pointAtPercent(0.663));
  //     }
  //     if (cotAltEqn.isShown) {
  //       cotAltEqn.setPosition(cotLine.p2.x / 2, radius + 0.052);
  //     }
  //     if (rightAngle5.isShown) {
  //       if (x < radius * 0.2) {
  //         rightAngle5.setOpacity(0);
  //       } else {
  //         rightAngle5.setOpacity(1);
  //         rightAngle5.setAngle({
  //           position: [0, radius], startAngle: 3 * Math.PI / 2, angle: Math.PI / 2,
  //         });
  //       }
  //     }
  //     if (angle3.isShown && cotLine.p2.x > 0.4 && cotLine.p2.x < rightBounds.p1.x) {
  //       angle3.setOpacity(1);
  //       angle3.setAngle({ startAngle: Math.PI, angle: r, position: cotLine.p2.add(-0.01, 0.01) });
  //     } else {
  //       angle3.setOpacity(0);
  //     }
  //   }
  // };

  const arrow = (isClipped, scale = 0.8) => {
    if (!isClipped) {
      return null;
    }
    return { end: { head: 'barb', scale} };
  };
  const setRightAng = (element, test, position, startAngle) => {
    if (element.isShown) {
      if (test) {
        element.setAngle({ position, startAngle, angle: Math.PI / 2 });
        element.setOpacity(1);
      } else {
        element.setOpacity(0);
      }
    }
  }
  function updateCircle(r) {
    const cosR = Math.cos(r);
    const sinR = Math.sin(r);
    const x = radius * cosR;
    const y = radius * sinR;
    const xSign = x / Math.abs(x);
    const ySign = y / Math.abs(y);
    const tanVal = Math.abs(radius * sinR / cosR);
    const secVal = Math.abs(radius / cosR);
    const cotVal = Math.abs(radius * cosR / sinR);
    const cscVal = Math.abs(radius / sinR);
    let quad = 1;
    if (xSign < 0 && ySign > 0) {
      quad = 2;
    } else if (xSign < 0) {
      quad = 3;
    } else if (ySign < 0) {
      quad = 4;
    }

    if (hyp.isShown || hypAlt.isShown) {
      if (hyp.isShown) {
        hyp.setRotation(r);
      }
      if (hypAlt.isShown) {
        hypAlt.setRotation(r);
      }
      if (hypLabel.isShown) {
        const hypLine = new Fig.Line([0, 0], [x, y]);
        const direction = quad === 1 || quad === 3 ? 'positive' : 'negative';
        hypLabel.setPosition(hypLine.offset(direction, 0.1).midPoint());
        if (Math.abs(x) < 0.3 || Math.abs(y) < 0.3) {
          hypLabel.setOpacity(0);
        } else {
          hypLabel.setOpacity(1);
        }
      }
    }

    // Theta angle
    if (thetaQ1.isShown) {
      if (
        r > 0.3
        && (
          (cos.isShown && r < Math.PI / 2 - 0.15)
          || !cos.isShown
        )
      ) {
        thetaQ1.setAngle({ angle: r });
        thetaQ1.setOpacity(1);
      } else {
        thetaQ1.setOpacity(0);
      }
    }
    if (theta.isShown) {
      theta.setAngle({ angle: r });
    }
    if (thetaVal.isShown) {
      thetaVal.setAngle({ angle: r });
    }
    if (thetaComp.isShown) {
      if (Math.abs(y) > 0.6 && Math.abs(x) > 0.4) {
        thetaComp.setAngle({ position: [0, 0], startAngle: r, angle: Math.PI / 2 - r });
        thetaComp.setOpacity(1);
      } else {
        thetaComp.setOpacity(0);
      }
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
      sin.custom.updatePoints({ p1: [x, 0], p2: [x, y] });
      if (sinLabel.isShown) {
        if ((tan.isShown || tanAlt.isShown) && Math.abs(x) > radius * 0.8) {
          sinLabel.setPosition(x - xSign * 0.1, y / 2);
        } else {
          sinLabel.setPosition(x + xSign * 0.1, y / 2);
        }
      }
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
      cos.custom.updatePoints({ p1: [0, 0], p2: [x + xSign * thick / 2, 0] });
      if (cosLabel.isShown) {
        if (ySign > 0) {
          cosLabel.setPosition(x / 2 - 0.1, -0.05);
        } else {
          cosLabel.setPosition(x / 2 - 0.1, 0.05);
        }
      }
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
      const [tanLine, isClipped] = clip([xSign * radius, 0], [xSign * radius, ySign * tanVal]);
      tan.custom.updatePoints({
        p1: tanLine.p1, p2: tanLine.p2, arrow: arrow(isClipped),
      });
      if (tanLabel.isShown) {
        tanLabel.setPosition(xSign * (radius + 0.1), tanLine.p2.y / 2);
      }
    }

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
      const [secLine, isClipped] = clip([0, 0], [xSign * radius, ySign * tanVal]);
      sec.custom.updatePoints({
        p1: secLine.p1, p2: secLine.p2, arrow: arrow(isClipped),
      });
      if (csc.isShown) {
        const direction = xSign * ySign > 0 ? 'negative' : 'positive';
        const secLabelPos = secLine
          .offset(direction, 0.12)
          .pointAtPercent(0.45 + Math.abs(y) / radius * 0.5);
        if (Math.abs(x) > radius * 0.764) { //r < 0.7) {
          if (ySign > 0) {
            secLabel.setPosition(
              xSign * Math.max(Math.abs(secLabelPos.x), radius * 0.65),
              ySign * Math.max(secLabelPos.y, ySign * -0.05),
            );
          } else {
            secLabel.setPosition(
              xSign * Math.max(Math.abs(secLabelPos.x), radius * 0.65),
              Math.min(secLabelPos.y, 0.05),
            );
          }
        } else {
          secLabel.setPosition(secLabelPos);
        }
      } else {
        const direction = xSign * ySign < 0 ? 'negative' : 'positive';
        secLabel.setPosition(secLine.offset(direction, 0.12).pointAtPercent(0.5));
      }
    }

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
      const [cotLine, isClipped] = clip([0, ySign * radius], [xSign * cotVal, ySign * radius]);
      cot.custom.updatePoints({
        p1: cotLine.p1, p2: cotLine.p2, arrow: arrow(isClipped),
      });
      if (cotLabel.isShown) {
        cotLabel.setPosition(cotLine.p2.x / 2, ySign * (radius + 0.08));
      }
    }

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
      const [cscLine, isClipped] = clip([0, 0], [xSign * cotVal, ySign * radius]);
      csc.custom.updatePoints({
        p1: cscLine.p1, p2: cscLine.p2, arrow: arrow(isClipped),
      });
      if (cscLabel.isShown) {
        if (xSign * ySign > 0) {
          cscLabel.setPosition(cscLine.offset('positive', 0.1).midPoint());
        } else {
          cscLabel.setPosition(cscLine.offset('negative', 0.1).midPoint());
        }
      }
    }

    /*
    ....###....##.......########
    ...##.##...##..........##...
    ..##...##..##..........##...
    .##.....##.##..........##...
    .#########.##..........##...
    .##.....##.##..........##...
    .##.....##.########....##...
    */
    if (tanAlt.isShown) {
      const [tanLine, isClipped] = clip([x, y], [xSign * secVal, 0]);
      tanAlt.custom.updatePoints({
        p1: tanLine.p1, p2: tanLine.p2, arrow: arrow(isClipped),
      });
      if (tanLabelAlt.isShown) {
        const direction = quad === 1 || quad === 3 ? 'positive' : 'negative';
        tanLabelAlt.setPosition(tanLine.offset(direction, 0.12).midPoint());
      }
    }
    if (cotAlt.isShown || cotLight.isShown) {
      const [cotLine, isClipped] = clip([x, y], [0, ySign * cscVal]);
      if (cotAlt.isShown) {
        cotAlt.custom.updatePoints({
          p1: cotLine.p1, p2: cotLine.p2, arrow: arrow(isClipped),
        });
      }
      if (cotLight.isShown) {
        cotLight.custom.updatePoints({
          p1: cotLine.p1, p2: cotLine.p2, arrow: arrow(isClipped, thick / thin * 0.8),
        });
      }
      if (cotLabelAlt.isShown) {
        const direction = quad === 1 || quad === 3 ? 'negative' : 'positive';
        cotLabelAlt.setPosition(cotLine.offset(direction, 0.12).midPoint());
      }
      if (thetaCot.isShown) {
        if (!isClipped && Math.abs(x) > 0.4 * radius) {
          thetaCot.setAngle({ position: cotLine.p2, startAngle: 3 * Math.PI / 2, angle: r });
          thetaCot.setOpacity(1);
        } else {
          thetaCot.setOpacity(0);
        }
      }
    }
    if (secAlt.isShown) {
      const [secLine, isClipped] = clip([-thick / 2, 0], [xSign * secVal, 0]);
      secAlt.custom.updatePoints({
        p1: secLine.p1, p2: secLine.p2, arrow: arrow(isClipped),
      });
      if (secLabelAlt.isShown) {
        secLabelAlt.setPosition([secLine.p2.x / 2, ySign * -0.1]);
      }
    }
    if (cscAlt.isShown) {
      const [cscLine, isClipped] = clip([0, 0], [0, ySign * cscVal]);
      cscAlt.custom.updatePoints({
        p1: cscLine.p1, p2: cscLine.p2, arrow: arrow(isClipped),
      });
      if (cscLabelAlt.isShown) {
        cscLabelAlt.setPosition([xSign * -0.1, cscLine.p2.y / 2]);
      }
    }
    if (cosAlt.isShown) {
      cosAlt.custom.updatePoints({ p1: [0, y], p2: [x, y] });
      if (cosLabelAlt.isShown) {
        if ((tan.isShown || cotAlt.isShown) && Math.abs(y) > radius * 0.8) {
          cosLabelAlt.setPosition(x / 2, y - ySign * 0.1);
        } else {
          cosLabelAlt.setPosition(x / 2, y + ySign * 0.1);
        }
      }
      if (thetaCos.isShown) {
        if (Math.abs(y) > 0.2 && Math.abs(x) > 0.4 * radius) {
          thetaCos.setAngle({ position: [x, y], startAngle: Math.PI, angle: r });
          thetaCos.setOpacity(1);
        } else {
          thetaCos.setOpacity(0);
        }
      }
    }
    /*
    .########..####..######...##.....##.########
    .##.....##..##..##....##..##.....##....##...
    .##.....##..##..##........##.....##....##...
    .########...##..##...####.#########....##...
    .##...##....##..##....##..##.....##....##...
    .##....##...##..##....##..##.....##....##...
    .##.....##.####..######...##.....##....##...
    */
    setRightAng(
      rightSin,
      (Math.abs(y) > 0.4 || !tan.isShown) && Math.abs(x) > 0.2,
      [x, 0],
      Math.PI / 2 - (quad - 1) * Math.PI / 2,
    );

    setRightAng(
      rightTan,
      Math.abs(x) < radius - 0.2,
      [xSign * radius, 0],
      Math.PI / 2 - (quad - 1) * Math.PI / 2,
    );

    setRightAng(
      rightCot,
      Math.abs(x) > 0.2,
      [0, ySign * radius],
      Math.PI / 2 * 3 - (quad - 1) * Math.PI / 2,
    );

    setRightAng(
      rightCosAlt,
      r < Math.PI / 2 && Math.abs(y) > 0.2 && Math.abs(x) > 0.45,
      [0, y],
      Math.PI / 2 * 3,
    );

    setRightAng(
      rightTanAlt,
      r < Math.PI / 2 && Math.abs(y) > 0.4 && Math.abs(x) > 0.45,
      [x, y],
      r + Math.PI,
    );

    setRightAng(
      rightCotAlt,
      (y > 0.2 && x > 0.55)
      || (y > 0.4 && x < 0)
      || (y < -0.2 && x < -0.4)
      || (y < 0 && x > 0 && x < radius - 0.1),
      [x, y],
      r + Math.PI / 2,
    );

    /*
    .##..........########.########..####
    .##.............##....##.....##..##.
    .##.............##....##.....##..##.
    .##.............##....########...##.
    .##.............##....##...##....##.
    .##.............##....##....##...##.
    .########.......##....##.....##.####
    */
    if (tanLight.isShown) {
      const [tanLine, isClipped] = clip([x, y], [xSign * secVal, 0]);
      tanLight.custom.updatePoints({
        p1: tanLine.p1, p2: tanLine.p2, arrow: arrow(isClipped, thick / thin * 0.8),
      });
    }
    // if (cotLight.isShown) {
    //   const [cotLine, isClipped] = clip([x, y], [0, ySign * cscVal]);
    //   cotLight.custom.updatePoints({
    //     p1: cotLine.p1, p2: cotLine.p2, arrow: arrow(isClipped, thick / thin * 0.8),
    //   });
    // }
    if (secLight.isShown) {
      const [secLine, isClipped] = clip([-thin / 2, 0], [xSign * secVal, 0]);
      secLight.custom.updatePoints({
        p1: secLine.p1, p2: secLine.p2, arrow: arrow(isClipped, thick / thin * 0.8),
      });
    }
    if (cscLight.isShown) {
      const [cscLine, isClipped] = clip([0, 0], [0, ySign * cscVal]);
      cscLight.custom.updatePoints({
        p1: cscLine.p1, p2: cscLine.p2, arrow: arrow(isClipped, thick / thin * 0.8),
      });
    }

    if (tanTri.isShown) {
      const [tanLine] = clip([x, y], [xSign * secVal, 0]);
      tanTri.custom.updateGeneric({
        points: [
          [0, 0], [tanLine.p2.x, 0], tanLine.p1,
          tanLine.p1, [tanLine.p2.x, 0], tanLine.p2,
        ],
      });
    }
    if (cotTri.isShown) {
      const [cotLine] = clip([x, y], [0, ySign * cscVal]);
      cotTri.custom.updateGeneric({
        points: [
          [0, 0], [0, cotLine.p2.y], cotLine.p1,
          cotLine.p1, [0, cotLine.p2.y], cotLine.p2,
        ],
      });
    }
    // if (rightCotAlt.isShown) {
    //   if (r < Math.PI / 2 && Math.abs(y) > 0.2 && Math.abs(x) > 0.55) {
    //     rightCotAlt.setAngle({
    //       position: [x, y], startAngle: r + Math.PI / 2, angle: Math.PI / 2,
    //     });
    //     rightCotAlt.setOpacity(1);
    //   } else {
    //     rightCotAlt.setOpacity(0);
    //   }
    // }
    // if (radLine.isShown) {
    //   radLine.setRotation(r);
    // }

    // // if (bow.isShown) {
    // //   bow.setAngle({ angle: r * 2, startAngle: -r });
    // // }

    // // Theta Complement
    // if (compAngle.isShown) {
    //   let curvePosition = 0.65;
    //   if (r > Math.PI / 2 - 0.8) {
    //     curvePosition = (r - (Math.PI / 2 - 0.8)) + 0.65;
    //   }
    //   compAngle.setAngle({ startAngle: r, angle: Math.PI / 2 - r });
    //   if (r > Math.PI / 2 - 0.3) {
    //     compAngle._label.hide();
    //   } else {
    //     compAngle.label.curvePosition = curvePosition;
    //     compAngle._label.showAll();
    //   }
    // }

    // // Theta Complement 2
    // if (compAngle2.isShown) {
    //   let curvePosition = 0.65;
    //   if (r > Math.PI / 2 - 0.8) {
    //     curvePosition = (r - (Math.PI / 2 - 0.8)) + 0.65;
    //   }
    //   compAngle2.setAngle({ position: [x, y], startAngle: r + Math.PI, angle: Math.PI / 2 - r });
    //   if (r > Math.PI / 2 - 0.3 || r < 0.25) {
    //     compAngle2._label.hide();
    //   } else {
    //     compAngle2.label.curvePosition = curvePosition;
    //     compAngle2._label.showAll();
    //   }
    //   if (r < 0.25) {
    //     compAngle2._curve.hide();
    //   } else {
    //     compAngle2._curve.showAll();
    //   }
    // }

    // if (tan.isShown) {
    //   const idealTanLine = new Fig.Line([x, y], [radius / Math.cos(r), 0]);
    //   let tanLineIntersect;
    //   if (r <= 0.001) {
    //     tanLineIntersect = new Fig.Point(radius, -0.0001);
    //   } else if (r >= Math.PI / 2 * 0.999) {
    //     tanLineIntersect = new Fig.Point(xBounds + radius, radius);
    //   } else {
    //     tanLineIntersect = rightBounds.intersectsWith(idealTanLine).intersect;
    //   }
    //   const tanLine = new Fig.Line(
    //     [x, y],
    //     [
    //       Math.min(tanLineIntersect.x || radius, idealTanLine.p2.x),
    //       Math.max(-0.0001, tanLineIntersect.y),
    //     ],
    //   );
    //   tan.custom.updatePoints({
    //     p1: tanLine.p1._dup(),
    //     p2: tanLine.p2._dup(),
    //     arrow: tanLine.p2.y > 0.01 ? { end: { head: 'barb', scale: 0.8 } } : null,
    //   });
    //   if (sec1.isShown) {
    //     sec1.custom.updatePoints({
    //       p1: [0, 0.0],
    //       p2: [tanLine.p2.x, 0.0],
    //       arrow: tanLine.p2.y > 0.01 ? { end: { head: 'barb', scale: 0.8 } } : null,
    //     });
    //   }
    //   tanLabel.setPosition(tanLine.offset('positive', 0.12).midPoint());
    //   if (sec.isShown) {
    //     sec.custom.updatePoints({
    //       p1: [0, -0.25],
    //       p2: [tanLine.p2.x, -0.25],
    //       arrow: {
    //         scale: 0.8,
    //         start: { head: 'bar' },
    //         end: { head: tanLine.p2.y > 0.01 ? 'barb' : 'bar' },
    //       },
    //     });
    //   }
    //   if (xSec.isShown) {
    //     xSec.custom.updatePoints({
    //       p1: [0, 0],
    //       p2: [tanLine.p2.x, 0],
    //       arrow: tanLine.p2.y > 0.01 ? { end: { head: 'barb', scale: 1.5 } } : null,
    //     });
    //   }
    //   if (secLabel.isShown) {
    //     secLabel.setPosition(tanLine.p2.x / 2, -0.2);
    //   }
    //   if (rightAngle2.isShown && r > 0.2) {
    //     rightAngle2.setOpacity(1);
    //     rightAngle2.setAngle({ p1: [0, 0], p2: [x, y], p3: tanLine.p2._dup() });
    //   } else {
    //     rightAngle2.setOpacity(0);
    //   }
    //   if (secLabel1.isShown) {
    //     secLabel1.setPosition(tanLine.p2.x / 2, -0.07);
    //   }
    // }
    // updateAlt(r, tanAlt, secAlt, cotAlt, cscAlt, altOffset);
    // if (cot.isShown) {
    //   const idealCotLine = new Fig.Line([x, y], [0, radius / Math.sin(r)]);
    //   let cotLineIntersect;
    //   if (r >= Math.PI / 2 * 0.999) {
    //     cotLineIntersect = new Fig.Point(-0.0001, radius);
    //   } else if (r <= 0.001) {
    //     cotLineIntersect = new Fig.Point(radius, yBounds + radius);
    //   } else {
    //     cotLineIntersect = topBounds.intersectsWith(idealCotLine).intersect;
    //   }
    //   const cotLine = new Fig.Line(
    //     [x, y],
    //     [
    //       Math.max(-0.0001, cotLineIntersect.x),
    //       Math.min(cotLineIntersect.y || radius, idealCotLine.p2.y),
    //     ],
    //   );
    //   // console.log(cotLine)
    //   cot.custom.updatePoints({
    //     p1: cotLine.p1._dup(),
    //     p2: cotLine.p2._dup(),
    //     arrow: cotLine.p2.x > 0.01 ? { end: { head: 'barb', scale: 0.8 } } : null,
    //   });
    //   cotLabel.setPosition(cotLine.offset('negative', 0.12).midPoint());
    //   csc.custom.updatePoints({
    //     p1: [0, 0],
    //     p2: [0, cotLine.p2.y],
    //     arrow: cotLine.p2.x > 0.01 ? { end: { head: 'barb', scale: 0.8 } } : null,
    //   });
    //   cscLabel.setPosition(-0.14, cotLine.p2.y / 2 * 1.2);
    //   if (angle2.isShown && cotLine.p2.x < 0.01 && r < Math.PI / 2 - 0.2) {
    //     angle2.setOpacity(1);
    //     angle2.setAngle({ startAngle: Math.PI / 2 * 3, angle: r, position: cotLine.p2 });
    //   } else {
    //     angle2.setOpacity(0);
    //   }
    //   if (rightAngle3.isShown && r < Math.PI / 2 - 0.1) {
    //     rightAngle3.setOpacity(1);
    //     rightAngle3.setAngle({ p1: cotLine.p2, p2: [x, y], p3: [0, 0] });
    //   } else {
    //     rightAngle3.setOpacity(0);
    //   }
    // }

    // if (bowString.isShown) {
    //   bowString.custom.updatePoints({ p1: [x, -y], p2: [x, y] });
    // }
    // if (sinLabel.isShown) {
    //   sinLabel.setPosition([
    //     x < radius * 0.8 || (!tan.isShown && !tanAlt.isShown) ? x + 0.12 : x - 0.12,
    //     Math.max(0.08, y / 2) - 0.06,
    //   ]);
    // }
    // if (f1Label.isShown) {
    //   f1Label.setPosition([
    //     x < radius * 0.3 || (!tan.isShown && !tanAlt.isShown) ? x + 0.12 : x - 0.12,
    //     Math.max(0.06, y / 2) - 0.06,
    //   ]);
    // }
    // if (bowStringLabel.isShown) {
    //   bowStringLabel.setPosition(x + 0.04, Math.max(0.06, y / 2) - 0.06);
    // }
    // if (cosLabel.isShown) {
    //   cosLabel.setPosition([x / 2 - 0.1, -0.05]);
    // }
    // if (cosLabelEqn.isShown) {
    //   cosLabelEqn.setPosition([x / 2 - 0.1, -0.05]);
    // }
    // radLineLabel.setPosition([x / 2.2 - 0.02, y / 2.2 + 0.02]);
    // if (rightAngle1.isShown && r < Math.PI / 2 - 0.3 && r > 0.2) {
    //   rightAngle1.setOpacity(1);
    //   rightAngle1.setAngle({ p1: [x, y], p2: [x, 0], p3: [0, 0] });
    // } else {
    //   rightAngle1.setOpacity(0);
    // }

    const a = Fig.tools.math.round(r * 180 / Math.PI, 0) * Math.PI / 180;
    const sinA = Math.sin(a);
    const cosA = Math.cos(a);
    // const eqn = figure.getElement('eqn');
    // if (eqn.getElement('value1').isShown) {
    //   eqn.updateElementText({
    //     value1: sinA.toFixed(4),
    //     value2: cosA.toFixed(4),
    //     value3: sinA / cosA > 100 ? '\u221e' : (sinA / cosA).toFixed(4),
    //     value4: 1 / cosA > 100 ? '\u221e' : (1 / cosA).toFixed(4),
    //     value5: cosA / sinA > 100 ? '\u221e' : (cosA / sinA).toFixed(4),
    //     value6: 1 / sinA > 100 ? '\u221e' : (1 / sinA).toFixed(4),
    //   });
    // }
    const eqn3 = figure.getElement('eqn3');
    if (eqn3.getElement('val1').isShown) {
      const deg = Math.round(a / Math.PI * 180);
      eqn3.updateElementText({
        val1: sinA.toFixed(4),
        val2: cosA.toFixed(4),
        val3: Math.abs(sinA / cosA) > 100 ? `${xSign * ySign < 0 ? '-' : ''}\u221e` : (sinA / cosA).toFixed(4),
        val4: Math.abs(1 / sinA) > 100 ? `${ySign < 0 ? '-' : ''}\u221e` : (1 / sinA).toFixed(4),
        val5: Math.abs(1 / cosA) > 100 ? `${xSign < 0 ? '-' : ''}\u221e` : (1 / cosA).toFixed(4),
        val6: Math.abs(cosA / sinA) > 100 ? `${xSign * ySign < 0 ? '-' : ''}\u221e` : (cosA / sinA).toFixed(4),
      });
    }
  }
  const rotatorUpdateCircle = () => {
    updateCircle(Fig.tools.g2.clipAngle(rotator.transform.r(), '0to360'));
  };
  const rotatorFullUpdateCircle = () => {
    updateCircle(Fig.tools.g2.clipAngle(rotatorFull.transform.r(), '0to360'));
  };
  rotator.fnMap.add('updateCircle', () => rotatorUpdateCircle());
  rotatorFull.fnMap.add('updateCircle', () => rotatorFullUpdateCircle());
  figure.fnMap.global.add('cSetAngle', (r) => {
    if (rotator.isShown) {
      rotator.setRotation(r);
    }
    if (rotatorFull.isShown) {
      rotatorFull.setRotation(r);
    }
    // updateCircle();
  });
  // figure.fnMap.global.add('circGoToAngle', () => {
  //   rotator.animations.new()
  //     .rotation({ target: defaultAngle, velocity: 1 })
  //     .start();
  // });
  // figure.fnMap.global.add('circGrowRadius', () => {
  //   rotator.showAll();
  //   rotator.setRotation(Math.PI / 6)
  //   rotator.animations.new()
  //     .length({ start: 0, target: radius, duration: 1.5 })
  //     .then(circle.getElement('rightAngle2').animations.dissolveIn(0.5))
  //     .start();
  // });

  const addPulseFn = (name, element, xAlign, yAlign) => {
    figure.fnMap.global.add(name, () => element.pulse({ xAlign, yAlign }));
  };
  addPulseFn('circPulseTan', tanLabel, 'left', 'bottom');
  addPulseFn('circPulseCot', cotLabel, 'left', 'bottom');
  addPulseFn('circPulseRad', hypLabel, 'right', 'bottom');
  addPulseFn('circPulseSec1', secLabel, 'center', 'top');
  addPulseFn('circPulseSec', secLabel, 'center', 'bottom');
  addPulseFn('circPulseCsc', cscLabel, 'right', 'middle');
  addPulseFn('circPulseSin1', sinLabel, 'left', 'middle');
  addPulseFn('circPulseSin', sinLabel, 'right', 'middle');
  addPulseFn('circPulseCos', cosLabel, 'center', 'top');

  // figure.fnMap.global.add('circAltColorsToSides', () => {
  //   tanAlt.setColor(colOpp);
  //   tanLabelAlt.setColor(colOpp);
  //   secAlt.setColor(colHyp);
  //   secLabelAlt.setColor(colHyp);
  //   cotAlt.setColor(colAdj);
  //   cotLabelAlt.setColor(colAdj);
  //   cscLabelAlt.setColor(colHyp);
  //   cscAlt.setColor(colHyp);
  // });

  // figure.fnMap.global.add('circAltColorsReset', () => {
  //   tanAlt.setColor(colTan);
  //   tanLabelAlt.setColor(colTan);
  //   secAlt.setColor(colSec);
  //   secLabelAlt.setColor(colSec);
  //   cotAlt.setColor(colCot);
  //   cotLabelAlt.setColor(colCot);
  //   cscAlt.setColor(colCsc);
  //   cscLabelAlt.setColor(colCsc);
  // });

  // const addPulseAngleFn = (name, element) => {
  //   figure.fnMap.global.add(name, () => element.pulseAngle({
  //     duration: 1, curve: { scale: 2 }, label: { scale: 2 },
  //   }));
  // };
  // addPulseAngleFn('circPulseTheta', angle);
  // addPulseAngleFn('circPulseComp', compAngle);
  // addPulseAngleFn('circPulseTheta2', angle2);
  // figure.fnMap.global.add('circPulseTheta', () => angle.pulseAngle({ duration: 1, curve: { scale: 2 }, label: { scale: 2 } }));

  // figure.fnMap.global.add('circTangentMove', () => {
  //   tan.animations.new()
  //     .position({
  //       start: [0.5, 0.5],
  //       target: [0, 0],
  //       duration: 2,
  //     })
  //     .start();
  //   cot.animations.new()
  //     .position({
  //       start: [0.5, 0.5],
  //       target: [0, 0],
  //       duration: 2,
  //     })
  //     .start();
  // })
  rotator.subscriptions.add('setTransform', 'updateCircle');
  rotatorFull.subscriptions.add('setTransform', 'updateCircle');
}
