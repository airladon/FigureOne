/* eslint-disable camelcase */
/* globals figure, colTheta, colCot, colTan, colSin, colCos, colSec, colCsc, colRad, colGrey, colDim, colAdj, colOpp, colHyp, Fig, colDarkGrey */

function layoutCirc() {
  const radius = 1.5;
  const defaultAngle = 0.9;

  const line = (name, color, width = thick, p1 = [0, 0], length = 1, angle = 0, dash = []) => ({
    name,
    method: 'primitives.line',
    options: {
      p1, length, angle, width, color, dash,
    },
    // mods: { dimColor: colText },
  });

  const lineWithLabel = (name, color, text, width = thick, p1, length, angle) => ({
    name,
    method: 'collections.line',
    options: {
      width,
      color,
      p1,
      length,
      angle,
      label: {
        text: {
          textFont: { style: 'normal' },
          forms: { 0: text },
        },
        orientation: 'horizontal',
        update: true,
      },
    },
    // mods: {
    //   dimColor: colSin,
    //   _line: { dimColor: colSin },
    //   _label: { dimColor: colSin },
    // },
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
    // mods: {
    //   dimColor: colDim,
    // },
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

  const angle = (name, text, rad = 0.2, curvePosition = 0.5, position = [0, 0], startAngle = 0, angleSize = 0) => ({
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
  });
  const tri = (name, elements, position, rotation) => ({
    name,
    method: 'collection',
    elements,
    mods: {
      scenarios: {
        noSplit: { position: [0, 0], rotation: 0 },
        split: { position, rotation },
      },
    },
  });

  const ln = (...content) => ({
    lines: {
      content: [...content],
      justify: 'left',
      xAlign: 'left',
      yAlign: 'baseline',
      baselineSpace: 0.3,
    },
  });

  const [circle] = figure.add({
    name: 'circ',
    method: 'collection',
    elements: [
      // Light Lines
      arc('circle', colGrey, thin),
      arc('arc', colGrey, thin, 300, Math.PI / 2, 0),
      line('xQ1', colGrey, thin, [0, 0], radius, 0),
      line('yQ1', colGrey, thin, [0, 0], radius, Math.PI / 2),
      line('x', colGrey, thin, [-radius, 0], radius * 2, 0),
      line('y', colGrey, thin, [0, -radius], radius * 2, Math.PI / 2),
      line('tanLight', colGrey, thin),
      line('secLight', colGrey, thin),
      line('cotLight', colGrey, thin),
      line('cscLight', colGrey, thin),
      line('sinLight', colGrey, thin),
      // line('radius', colGrey, thin, [0, 0], radius, 4.37),
      lineWithLabel('radius', colGrey, '1', thin),
      lineWithLabel('xRadius', colGrey, '1', thin, [0, 0], radius, 0),
      angle('theta', '\u03b8'),
      angle('thetaVal', null),
      angle('thetaCot', '\u03b8'),
      angle('thetaComp', {
        forms: { 0: ['_90', '_\u00b0\u2212\u03b8'] },
      }, 0.45, 0.7),
      angle('thetaCompCos', {
        forms: { 0: ['_90', '_\u00b0\u2212\u03b8'] },
      }, 0.35, 0.7),

      tri('triSinCos', [
        angle('theta', '\u03b8', 0.2, 0.5, [0, 0], 0, defaultAngle),
        lineWithLabel('unit', colText, '1', thick, [0, 0], radius, defaultAngle),
        lineWithLabel('sin', colSin, 'sin'),
        lineWithLabel('cos', colCos, 'cos'),
        rightAngle('rightSin', [0, 0], Math.PI / 2),
      ], [-0.3 - 1.6, 0.8 + 0.2], 0),
      tri('triTanSec', [
        angle('theta', '\u03b8', 0.2, 0.5, [0, 0], 0, defaultAngle),
        lineWithLabel('unit', colText, '1', thick, [radius + thick / 2, 0], radius + thick * 0.7, Math.PI),
        lineWithLabel('tan', colTan, 'tan'),
        lineWithLabel('sec', colSec, 'sec'),
        rightAngle('rightTan', [radius, 0], Math.PI / 2),
      ], [0, 0], 0),
      tri('triCotCsc', [
        angle('theta', '\u03b8', 0.2, 0.5, [radius / Math.sin(defaultAngle) * Math.cos(defaultAngle), radius / Math.sin(defaultAngle) * Math.sin(defaultAngle)], Math.PI, defaultAngle - 0.05),
        lineWithLabel('unit', colText, '1', thick, [-thick / 2, thick], radius - thick / 2, Math.PI / 2),
        lineWithLabel('csc', colCsc, 'csc'),
        lineWithLabel('cot', colCot, 'cot'),
        rightAngle('rightCot', [0, radius], -Math.PI / 2),
      ], [0.1, radius - 0.2 + 0.5 + 0.2], Math.PI),

      // lineLabel('cosLabelAlt', 'cos', colCos, [0, 0]),
      // lineLabel('tanLabelAlt', 'tan', colTan),
      // lineLabel('secLabelAlt', 'sec', colSec),
      // lineLabel('cscLabelAlt', 'csc', colCsc),
      // lineLabel('cotLabelAlt', 'cot', colCot),
      // lineLabel('unitCsc', '1', colText, [-0.1, radius / 2]),
      // line('cosAlt', colCos),
      // line('cscAlt', colCsc),
      // line('cotAlt', colCot),
      // line('secAlt', colSec),
      // line('tanAlt', colTan),
      // line('hypAlt', colDarkGrey, thick, [0, 0], radius),

      // line('sin1', colSin),
      // line('cos1', colCos),
      // line('csc1', colCsc),
      // line('cot1', colCot),
      // line('sec1', colSec),
      // line('tan1', colTan),
      // line('hyp1', colRad),
      // {
      //   name: 'tanAltEqn',
      //   method: 'equation',
      //   options: {
      //     textFont: { style: 'normal' },
      //     elements: {
      //       theta: { text: '\u03b8', color: colTheta, style: 'italic' },
      //       lb: { symbol: 'bracket', side: 'left' },
      //       rb: { symbol: 'bracket', side: 'right' },
      //     },
      //     formDefaults: {
      //       alignment: { yAlign: 'middle', xAlign: 'center', fixTo: 'tan' },
      //     },
      //     forms: {
      //       tangent: ['tan', 'gent', ' ', { brac: ['lb', 'theta', 'rb'] }],
      //       tanTheta: ['tan', ' ', 'theta'],
      //       tan: ['tan'],
      //     },
      //     color: colTan,
      //   },
      // },
      // {
      //   name: 'cotAltEqn',
      //   method: 'equation',
      //   options: {
      //     textFont: { style: 'normal' },
      //     elements: {
      //       // o: { style: 'normal' },
      //       // c: { style: 'normal' },
      //       // t: { style: 'normal' },
      //       // tan: { style: 'normal' },
      //       equals: { text: ' = ', color: colText },
      //       theta: { text: '\u03b8', color: colTheta, style: 'italic' },
      //       theta1: { text: '\u03b8', color: colTheta, style: 'italic' },
      //       comp: { text: '\u00b0\u2212\u03b8', color: colTheta, style: 'italic' },
      //       _90: { color: colTheta },
      //       lb: { symbol: 'bracket', side: 'left' },
      //       rb: { symbol: 'bracket', side: 'right' },
      //       lb1: { symbol: 'bracket', side: 'left' },
      //       rb1: { symbol: 'bracket', side: 'right' },
      //     },
      //     formDefaults: {
      //       alignment: { yAlign: 0.7, xAlign: 0.33, fixTo: 'o' },
      //     },
      //     phrases: {
      //       compAngle: { brac: ['lb', ['_90', 'comp'], 'rb'] },
      //     },
      //     forms: {
      //       tanComp: {
      //         content: ['tan', ' ', 'compAngle'],
      //         alignment: { fixTo: 'tan' },
      //       },
      //       complementaryTangent: {
      //         content: ['tan', ' ', 'compAngle', 'equals', 'c', 'o', 'mplementary', ' ', 't', 'angent', '_ of ', 'theta1'],
      //         alignment: { fixTo: 'tan' },
      //       },
      //       // cotangent: ['c', 'o', 't', 'angent', ' ', { brac: ['lb1', 'theta1', 'rb1'] }],
      //       cotangent: ['c', 'o', 't', 'angent', ' ', 'theta1'],
      //       cotTheta: ['c', 'o', 't', ' ', 'theta1'],
      //       cot: ['c', 'o', 't'],
      //     },
      //     color: colCot,
      //   },
      // },
      // {
      //   name: 'cscAltEqn',
      //   method: 'equation',
      //   options: {
      //     textFont: { style: 'normal' },
      //     elements: {
      //       // c_1: { style: 'normal' },
      //       // s: { style: 'normal' },
      //       // c_2: { style: 'normal' },
      //       theta: { text: '\u03b8', color: colTheta },
      //       comp: { text: '\u00b0\u2212\u03b8', color: colTheta, style: 'italic' },
      //       _90: { color: colTheta },
      //       lb: { symbol: 'bracket', side: 'left' },
      //       rb: { symbol: 'bracket', side: 'right' },
      //     },
      //     formDefaults: {
      //       alignment: { yAlign: 'middle', xAlign: 'center', style: 'italic' },
      //     },
      //     phrases: {
      //       compAngle: { brac: ['lb', ['_90', 'comp'], 'rb'] },
      //     },
      //     forms: {
      //       secComp: {
      //         content: ['sec', ' ', 'compAngle'],
      //         alignment: { xAlign: 'right', yAlign: 'middle' },
      //       },
      //       cosecant: {
      //         content: ['c_1', 'o', 's', 'e', 'c_2', 'ant ', 'theta'],
      //         alignment: { fixTo: 'theta', xAlign: 'left' },
      //       },
      //       cosec: {
      //         content: ['c_1', 'o', 's', 'e', 'c_2', ' ', 'theta'],
      //         alignment: { fixTo: 'theta', xAlign: 'left' },
      //       },
      //       csc: {
      //         content: ['c_1', 's', 'c_2'],
      //         alignment: { fixTo: 's' },
      //       },
      //     },
      //     color: colCsc,
      //   },
      // },
      // {
      //   name: 'cosAltEqn',
      //   method: 'equation',
      //   options: {
      //     textFont: { style: 'normal' },
      //     elements: {
      //       theta: { text: '\u03b8', color: colTheta, style: 'italic' },
      //       comp: { text: '\u00b0\u2212\u03b8', color: colTheta, style: 'italic' },
      //       _90: { color: colTheta },
      //       lb: { symbol: 'bracket', side: 'left' },
      //       rb: { symbol: 'bracket', side: 'right' },
      //     },
      //     formDefaults: {
      //       alignment: { yAlign: 'middle', xAlign: 'center', fixTo: 'cos' },
      //     },
      //     phrases: {
      //       compAngle: { brac: ['lb', ['_90', 'comp'], 'rb'] },
      //     },
      //     forms: {
      //       sinComp: {
      //         content: ['sin', ' ', 'compAngle'],
      //         alignment: { xAlign: 'center', yAlign: 'middle' },
      //       },
      //       cosine: {
      //         content: ['cos', 'i', 'ne', ' ', 'theta'],
      //         alignment: { xAlign: 'right' },
      //       },
      //       cos: ['cos'],
      //     },
      //     color: colCos,
      //   },
      // },
      // {
      //   name: 'sinEqn',
      //   method: 'equation',
      //   options: {
      //     elements: {
      //       sin: { style: 'normal' },
      //       theta: { text: '\u03b8', color: colTheta },
      //       e: { style: 'normal' },
      //     },
      //     formDefaults: {
      //       alignment: { yAlign: 'middle', xAlign: 'center', fixTo: 'sin' },
      //     },
      //     forms: {
      //       halfChord: {
      //         content: ['h', 'alf-chord'],
      //         alignment: { fixTo: 'h' },
      //       },
      //       sinus: {
      //         content: ['s', 'i', 'nus'],
      //         alignment: { fixTo: 'i' },
      //       },
      //       sine: {
      //         content: ['s', 'i', 'nus', '_ \u2192 ', 'sin', 'e', ' ', 'theta'],
      //         alignment: { fixTo: 'i' },
      //       },
      //       sin: ['sin'],
      //     },
      //     color: colSin,
      //   },
      // },
      {
        name: 'eqn',
        method: 'equation',
        options: {
          textFont: { style: 'normal' },
          elements: {
            eq: { text: ' = ', color: colText },
            theta: { text: '\u03b8', color: colTheta, style: 'italic' },
            theta1: { text: '\u03b8', color: colTheta, style: 'italic' },
            comp: { text: '\u00b0\u2212\u03b8', color: colTheta, style: 'italic' },
            _90: { color: colTheta },
            lb: { symbol: 'bracket', side: 'left' },
            rb: { symbol: 'bracket', side: 'right' },
            lb1: { symbol: 'bracket', side: 'left' },
            rb1: { symbol: 'bracket', side: 'right' },
            tan: { color: colCot },
            c_1: { color: colCot },
            o_1: { color: colCot },
            t_1: { color: colCot },
            gent_1: { color: colCot },
            an_1: { color: colCot },
            mplementary_1: { color: colCot },
            '_ of _1': { color: colCot },
            '_ of _2': { color: colCsc },
            '_ of _3': { color: colCos },
            sec: { color: colCsc },
            c_2: { color: colCsc },
            c_21: { color: colCsc },
            o_2: { color: colCsc },
            s_2: { color: colCsc },
            e_2: { color: colCsc },
            angent_2: { color: colCsc },
            mplementary_2: { color: colCsc },
            ant_2: { color: colCsc },
            //
            sin: { color: colCos },
            mplementary_3: { color: colCos },
            c_3: { color: colCos },
            o_3: { color: colCos },
            s_3: { color: colCos },
            ine_3: { color: colCos },
          },
          formDefaults: {
            alignment: { yAlign: 'baseline', xAlign: 'left' },
          },
          phrases: {
            compAngle: { brac: ['lb', ['_90', 'comp'], 'rb'] },
            tanComp: ['tan', ' ', 'compAngle'],
            secComp: ['sec', ' ', 'compAngle'],
            sinComp: ['sin', ' ', 'compAngle'],
          },
          forms: {
            tanComp: 'tanComp',
            complementaryTangent: ['tanComp', 'eq', ln(
              ['c_1', 'o_1', 'mplementary_1'],
              ['t_1', 'an_1', 'gent_1', '_ of _1', 'theta1'],
            )],
            cotangent: ['tanComp',
              'eq', 'c_1', 'o_1', 't_1', 'an_1', 'gent_1', ' ', 'theta1'],
            cotan: ['tanComp',
              'eq', 'c_1', 'o_1', 't_1', 'an_1', ' ', 'theta1'],
            cotTheta: ['tanComp', 'eq', 'c_1', 'o_1', 't_1', ' ', 'theta1'],
            //
            secComp: 'secComp',
            complementarySecant: ['secComp', 'eq', ln(
              ['c_2', 'o_2', 'mplementary_2'],
              ['s_2', 'e_2', 'c_21', 'ant_2', '_ of _2', 'theta1'],
            )],
            cosecant: ['secComp', 'eq', 'c_2', 'o_2', 's_2', 'e_2', 'c_21', 'ant_2', ' ', 'theta1'],
            cosec: ['secComp', 'eq', 'c_2', 'o_2', 's_2', 'e_2', 'c_21', ' ', 'theta1'],
            csc: ['secComp', 'eq', 'c_2', 's_2', 'c_21', ' ', 'theta1'],
            //
            sinComp: 'sinComp',
            complementarySine: ['sinComp', 'eq', ln(
              ['c_3', 'o_3', 'mplementary_3'],
              ['s_3', 'ine_3', '_ of _3', 'theta1'],
            )],
            cosine: ['sinComp', 'eq', 'c_3', 'o_3', 's_3', 'ine_3', ' ', 'theta1'],
            cos: ['sinComp', 'eq', 'c_3', 'o_3', 's_3', ' ', 'theta1'],
          },
          position: [-2.7, radius / 2],
          scale: 1,
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
          move: { type: 'rotation', bounds: { rotation: { min: 0, max: Math.PI / 2 } } },
          dimColor: [0, 0, 0, 0],
          isMovable: true,
          touchBorder: [0, 0.5, 1.5, 0.5],
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
          dimColor: [0, 0, 0, 0],
          move: { type: 'rotation' },
          isMovable: true,
          touchBorder: [0, 0.5, 1.5, 0.5],
        },
      },
    ],
    // options: {
    //   dimColor: colDarkGrey,
    // },
    mods: {
      scenarios: {
        title: { scale: 0.9, position: [-radius / 2, -1.2] },
        circQ1: { scale: 1, position: [-0.4, -1] },
        split: { scale: 1, position: [1.1, -1.2] },
        tanSecTri: { scale: 1, position: [0.5, -1] },
        circFull: { scale: 0.7, position: [0.7, 0] },
        nameDefs: { scale: 1, position: [0.4, -1] },
      },
    },
  });
  const get = list => circle.getElements(list);
  const [rotator, rotatorFull] = get(['rotator', 'rotatorFull']);
  const [theta, thetaComp, thetaVal] = get(['theta', 'thetaComp', 'thetaVal']);
  const [triCotCsc] = get(['triCotCsc']);
  const [triSinCos] = get(['triSinCos']);
  const [triTanSec] = get(['triTanSec']);
  const [sinLight] = get(['sinLight']);
  const [tanLight, cotLight] = get(['tanLight', 'cotLight']);
  const [cscLight, secLight] = get(['cscLight', 'secLight']);
  const [rightSin, rightCot, rightTan] = get(['triSinCos.rightSin', 'triCotCsc.rightCot', 'triTanSec.rightTan']);
  const [radiusLine, xRadius] = get(['radius', 'xRadius']);
  // const [cos, sin, cosLabel, sinLabel] = get({
  //   triSinCos: ['cos', 'sin', 'cosLabel', 'sinLabel'],
  // });
  // const [cot, csc, cotLabel, cscLabel] = get({
  //   triCotCsc: ['cot', 'csc', 'cotLabel', 'cscLabel'],
  // });
  // const [tan, sec, tanLabel, secLabel] = get({
  //   triTanSec: ['tan', 'sec', 'tanLabel', 'secLabel'],
  // });
  const [cos, sin] = get({
    triSinCos: ['cos', 'sin'],
  });
  const [cot, csc] = get({
    triCotCsc: ['cot', 'csc'],
  });
  const [tan, sec] = get({
    triTanSec: ['tan', 'sec'],
  });
  // const [cos, sin, tan] = get(['cos', 'sin', 'tan']);
  // const [cot, sec, csc] = get(['cot', 'sec', 'csc']);
  // const [cosLabel, sinLabel, tanLabel] = get(['cosLabel', 'sinLabel', 'tanLabel']);
  // const [cotLabel, secLabel, cscLabel] = get(['cotLabel', 'secLabel', 'cscLabel']);
  // const [cotAlt, secAlt, cscAlt] = get(['cotAlt', 'secAlt', 'cscAlt']);
  // const [tanAlt, cosAlt] = get(['tanAlt', 'cosAlt']);
  // const [hyp, hypLabel, hypAlt, hypLight] = get(['hyp', 'hypLabel', 'hypAlt', 'hypLight']);
  // const [cosLabel, sinLabel] = get(['cosLabel', 'sinLabel']);
  // const [secLabel, cscLabel] = get(['secLabel', 'cscLabel']);
  // const [cotLabel, tanLabel] = get(['cotLabel', 'tanLabel']);
  // const [rightSin, rightTan, rightCot] = get(['rightSin', 'rightTan', 'rightCot']);
  // const [cotLabelAlt, secLabelAlt, cscLabelAlt] = get(['cotLabelAlt', 'secLabelAlt', 'cscLabelAlt']);
  // const [cosLabelAlt, tanLabelAlt] = get(['cosLabelAlt', 'tanLabelAlt']);
  // const [rightCosAlt, rightTanAlt, rightCotAlt] = get(['rightCosAlt', 'rightTanAlt', 'rightCotAlt']);
  // const [tanLight, cotLight, secLight, cscLight] = get(['tanLight', 'cotLight', 'secLight', 'cscLight']);
  // const [sinLight, cosLight] = get(['sinLight', 'cosLight']);
  // const [tanTri, cotTri, cosTri, sinTri] = get(['tanTri', 'cotTri', 'cosTri', 'sinTri']);
  // const [tanAltEqn, cotAltEqn, cscAltEqn, sinEqn, cosAltEqn] = get(['tanAltEqn', 'cotAltEqn', 'cscAltEqn', 'sinEqn', 'cosAltEqn']);

  // const [sin1, cos1, tan1, sec1, csc1, cot1, hyp1] = get(['sin1', 'cos1', 'tan1', 'sec1', 'csc1', 'cot1', 'hyp1']);
  // const xBounds = 1.3;
  // const yBounds = 0.9;
  const boundsRects = {
    title: new Fig.Rect(-0.1, -0.1, radius + 2.5, radius + 0.7),
    quarter: new Fig.Rect(-0.1, -0.1, radius + 3, radius + 2),
    circle: new Fig.Rect(-radius - 0.6, -radius - 1, radius * 2 + 0.6 + 2.5, radius * 2 + 1 + 1.5),
  };
  let bounds = new Fig.Rect(
    -radius - 0.6,
    -radius - 1,
    radius * 2 + 0.6 + 2.5,
    radius * 2 + 1 + 1.5,
  );
  figure.fnMap.global.add('circSetBounds', (name) => {
    bounds = boundsRects[name];
  });
  const clip = (p1, p2In) => {
    const p2 = Fig.getPoint(p2In);
    if (p2.x === Infinity || isNaN(p2.x)) { p2.x = 10000; }
    if (p2.y === Infinity || isNaN(p2.y)) { p2.y = 10000; }
    if (bounds.isPointInside(p2)) {
      return [new Fig.Line(p1, p2), false];
    }
    const p1P2Line = new Fig.Line(p1, p2);
    const intersects = bounds.intersectsWithLine(p1P2Line);
    return [new Fig.Line(p1, intersects[0]), true];
  };

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
  };

  function updateCircle(rIn) {
    const r = rIn > Math.PI / 4 ? rIn - 0.00001 : rIn + 0.00001;
    const cosR = Math.cos(r);
    const sinR = Math.sin(r);
    const x = radius * cosR;
    const y = radius * sinR;
    const xSign = x === 0 ? 1 : x / Math.abs(x);
    const ySign = y === 0 ? 1 : y / Math.abs(y);
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

    // if (hyp.isShown || hypAlt.isShown || hypLight.isShown) {
    //   if (hyp.isShown) {
    //     hyp.setRotation(r);
    //   }
    //   if (hypAlt.isShown) {
    //     hypAlt.setRotation(r);
    //   }
    //   if (hypLight.isShown) {
    //     hypLight.setRotation(r);
    //   }
    //   if (hypLabel.isShown) {
    //     const hypLine = new Fig.Line([0, 0], [x, y]);
    //     const direction = quad === 1 || quad === 3 ? 'positive' : 'negative';
    //     hypLabel.setPosition(hypLine.offset(direction, 0.1).midPoint());
    //     if (Math.abs(x) < 0.3 || Math.abs(y) < 0.3) {
    //       hypLabel.setOpacity(0);
    //     } else {
    //       hypLabel.setOpacity(1);
    //     }
    //   }
    // }

    // // Theta angle
    // if (thetaQ1.isShown) {
    //   if (
    //     r > 0.3
    //     && (
    //       (cos.isShown && r < Math.PI / 2 - 0.15)
    //       || !cos.isShown
    //     )
    //   ) {
    //     thetaQ1.setAngle({ angle: r });
    //     thetaQ1.setOpacity(1);
    //   } else {
    //     thetaQ1.setOpacity(0);
    //   }
    // }
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
      if (sin._label.isShown) {
        if ((tan._label.isShown) && Math.abs(x) > radius * 0.8) {
          sin.label.location = xSign > 0 ? 'left' : 'right';
        } else {
          sin.label.location = xSign > 0 ? 'right' : 'left';
        }
      }
      sin.setEndPoints([x, 0], [x, y]);
    }
    if (sinLight.isShown) {
      if (!sin.isShown && (cos.isShown || !radiusLine.isShown)) {
        sinLight.setOpacity(1);
        sinLight.custom.updatePoints({ p1: [x, 0], p2: [x, y]});
      } else {
        sinLight.setOpacity(0);
      }
    }
    // if (sinLight.isShown) {
    //   sinLight.custom.updatePoints({ p1: [x, 0], p2: [x, y] });
    // }

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
      if (cos._label.isShown) {
        cos.label.location = ySign > 0 ? 'bottom' : 'top';
        // if (ySign > 0) {
        //   cos.label.location = 'bottom';
        // } else {
        //   cos.label.location = 'top';
        // }
      }
      cos.setEndPoints([0, 0], [x + xSign * thick / 2, 0]);
    }
    // if (cosLight.isShown) {
    //   cosLight.custom.updatePoints({ p1: [0, 0], [x + xSign * thick / 2, 0]);
    // }
    if (radiusLine.isShown) {
      if (!sec.isShown && !csc.isShown) {
        radiusLine.setOpacity(1);
        if (radiusLine._label.isShown) {
          radiusLine.label.location = ySign > 0 ? 'top' : 'bottom';
        }
        radiusLine.setEndPoints([0, 0], [x, y]);
      } else {
        radiusLine.setOpacity(0);
      }
    }

    if (xRadius.isShown) {
      if (tan.isShown && sec.isShown && !cos.isShown) {
        xRadius.setOpacity(1);
        if (xRadius._label.isShown) {
          xRadius.label.location = ySign > 0 ? 'bottom' : 'top';
        }
        xRadius.setEndPoints([0, 0], [xSign * radius, 0]);
      } else {
        xRadius.setOpacity(0);
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
      if (tan._label.isShown) {
        tan.label.location = xSign > 0 ? 'right' : 'left';
      }
      tan.setEndPoints(
        tanLine.p1, tanLine.p2,
        // arrow: arrow(isClipped),
      );
    }
    if (tanLight.isShown) {
      if (sec.isShown || (secLight.isShown && !radiusLine.isShown)) {
        tanLight.setOpacity(1);
        const [tanLine, isClipped] = clip([xSign * radius, 0], [xSign * radius, ySign * tanVal]);
        tanLight.custom.updatePoints({ p1: tanLine.p1, p2: tanLine.p2 });
      } else {
        tanLight.setOpacity(0);
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
      if (sec._label.isShown) {
        sec.label.location = ySign > 0 ? 'bottom' : 'top';
        sec.label.linePosition = 0.65;
      }
      sec.setEndPoints(
        secLine.p1, secLine.p2,
        // arrow: arrow(isClipped)
      );
      // if (csc.isShown) {
      //   const direction = xSign * ySign > 0 ? 'negative' : 'positive';
      //   const secLabelPos = secLine
      //     .offset(direction, 0.12)
      //     .pointAtLength(radius * (0.45 + Math.abs(y) / radius * 0.5));
      //   if (Math.abs(x) > radius * 0.764) {
      //     if (ySign > 0) {
      //       secLabel.setPosition(
      //         xSign * Math.max(Math.abs(secLabelPos.x), radius * 0.65),
      //         ySign * Math.max(secLabelPos.y, ySign * -0.05),
      //       );
      //     } else {
      //       secLabel.setPosition(
      //         xSign * Math.max(Math.abs(secLabelPos.x), radius * 0.65),
      //         Math.min(secLabelPos.y, 0.05),
      //       );
      //     }
      //   } else {
      //     secLabel.setPosition(secLabelPos);
      //   }
      // } else {
      //   const direction = xSign * ySign < 0 ? 'negative' : 'positive';
      //   secLabel.setPosition(secLine.offset(direction, 0.12).pointAtPercent(0.5));
      // }
    }
    if (secLight.isShown) {
      if (tan.isShown || (tanLight.isShown && !radiusLine.isShown)) {
        secLight.setOpacity(1);
        const [secLine] = clip([0, 0], [xSign * radius, ySign * tanVal]);
        secLight.custom.updatePoints({ p1: secLine.p1, p2: secLine.p2 });
      } else {
        secLight.setOpacity(0);
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
      let offsetX = 0;
      let offsetY = 0;
      if (csc.isShown && sec.isShown) {
        offsetX = thick * Math.cos(r + xSign * ySign * Math.PI / 2);
        offsetY = thick * Math.sin(r + xSign * ySign * Math.PI / 2);
      }
      if (cot._label.isShown) {
        // console.log(cot._label.getPosition('figure').y)
        cot.label.location = ySign > 0 ? 'top' : 'bottom';
      }
      cot.setEndPoints(
        cotLine.p1, cotLine.p2.add(offsetX, offsetY), // arrow: arrow(isClipped),
      );
    }
    if (cotLight.isShown) {
      let offsetX = 0;
      let offsetY = 0;
      if (csc.isShown && sec.isShown) {
        offsetX = thick * Math.cos(r + xSign * ySign * Math.PI / 2);
        offsetY = thick * Math.sin(r + xSign * ySign * Math.PI / 2);
      }
      if (
        (csc.isShown || (cscLight.isShown && !radiusLine.isShown))
        && !cot.isShown
      ) {
        cotLight.setOpacity(1);
        const [cotLine] = clip([0, ySign * radius], [xSign * cotVal, ySign * radius]);
        cotLight.custom.updatePoints({ p1: cotLine.p1, p2: cotLine.p2.add(offsetX, offsetY) });
      } else {
        cotLight.setOpacity(0);
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
      let offsetX = 0;
      let offsetY = 0;
      if (sec.isShown) {
        offsetX = thick * Math.cos(r + xSign * ySign * Math.PI / 2);
        offsetY = thick * Math.sin(r + xSign * ySign * Math.PI / 2);
      }
      if (csc._label.isShown) {
        csc.label.location = ySign > 0 ? 'top' : 'bottom';
      }
      csc.setEndPoints(
        cscLine.p1.add(offsetX, offsetY),
        cscLine.p2.add(offsetX, offsetY),
        // arrow: arrow(isCl//ipped),
      );
      // if (cscLabel.isShown) {
      //   if (xSign * ySign > 0) {
      //     cscLabel.setPosition(cscLine.offset('positive', 0.1).midPoint());
      //   } else {
      //     cscLabel.setPosition(cscLine.offset('negative', 0.1).midPoint());
      //   }
      // }
    }
    if (cscLight.isShown) {
      if (
        (cot.isShown || (cotLight.isShown && !radiusLine.isShown))
        && !csc.isShown
      ) {
        cscLight.setOpacity(1);
        const [cscLine] = clip([0, 0], [xSign * cotVal, ySign * radius]);
        cscLight.custom.updatePoints({ p1: cscLine.p1, p2: cscLine.p2 });
      } else {
        cscLight.setOpacity(0);
      }
    }

    // /*
    // ....###....##.......########
    // ...##.##...##..........##...
    // ..##...##..##..........##...
    // .##.....##.##..........##...
    // .#########.##..........##...
    // .##.....##.##..........##...
    // .##.....##.########....##...
    // */
    // if (tanAlt.isShown || tanLight.isShown) {
    //   const [tanLine, isClipped] = clip([x, y + 0.0001], [xSign * secVal, 0]);
    //   tanAlt.custom.updatePoints({
    //     p1: tanLine.p1, p2: tanLine.p2, arrow: arrow(isClipped),
    //   });
    //   if (tanLabelAlt.isShown) {
    //     const direction = quad === 1 || quad === 3 ? 'positive' : 'negative';
    //     tanLabelAlt.setPosition(tanLine.offset(direction, 0.12).midPoint());
    //     if (sinEqn.isShown) {
    //       tanLabelAlt.setOpacity(0);
    //     } else {
    //       tanLabelAlt.setOpacity(1);
    //     }
    //   }
    //   if (tanAltEqn.isShown) {
    //     tanAltEqn.setPosition(tanLine.offset('positive', 0.12).midPoint());
    //   }
    // }
    // if (cotAlt.isShown || cotLight.isShown) {
    //   const [cotLine, isClipped] = clip([x, y], [0, ySign * cscVal]);
    //   if (cotAlt.isShown) {
    //     cotAlt.custom.updatePoints({
    //       p1: cotLine.p1, p2: cotLine.p2, arrow: arrow(isClipped),
    //     });
    //   }
    //   if (cotLight.isShown) {
    //     cotLight.custom.updatePoints({
    //       p1: cotLine.p1, p2: cotLine.p2, arrow: arrow(isClipped, thick / thin * 0.8),
    //     });
    //   }
    //   if (cotLabelAlt.isShown) {
    //     const direction = quad === 1 || quad === 3 ? 'negative' : 'positive';
    //     cotLabelAlt.setPosition(cotLine.offset(direction, 0.12).midPoint());
    //   }
    //   if (thetaCot.isShown) {
    //     if (!isClipped && Math.abs(x) > 0.4 * radius) {
    //       thetaCot.setAngle({ position: cotLine.p2, startAngle: 3 * Math.PI / 2, angle: r });
    //       thetaCot.setOpacity(1);
    //     } else {
    //       thetaCot.setOpacity(0);
    //     }
    //   }
    //   if (cotAltEqn.isShown) {
    //     cotAltEqn.setPosition(cotLine.offset('negative', 0.12).midPoint());
    //   }
    // }
    // if (secAlt.isShown || secLight.isShown) {
    //   const [secLine, isClipped] = clip([-thick / 2, 0], [xSign * secVal, 0]);
    //   secAlt.custom.updatePoints({
    //     p1: secLine.p1, p2: secLine.p2, arrow: arrow(isClipped),
    //   });
    //   if (secLabelAlt.isShown) {
    //     secLabelAlt.setPosition([secLine.p2.x / 2, ySign * -0.1]);
    //   }
    // }
    // if (cscAlt.isShown || cscLight.isShown) {
    //   const [cscLine, isClipped] = clip([0, 0], [0, ySign * cscVal]);
    //   cscAlt.custom.updatePoints({
    //     p1: cscLine.p1, p2: cscLine.p2, arrow: arrow(isClipped),
    //   });
    //   if (cscLabelAlt.isShown) {
    //     cscLabelAlt.setPosition([xSign * -0.12, cscLine.p2.y / 2]);
    //   }
    //   if (cscAltEqn.isShown) {
    //     cscAltEqn.setPosition([xSign * -0.12, cscLine.p2.y / 2]);
    //   }
    // }
    // if (cosAlt.isShown || cosLight.isShown) {
    //   cosAlt.custom.updatePoints({ p1: [0, y], p2: [x, y] });
    //   if (cosLabelAlt.isShown) {
    //     if ((tanAlt.isShown || cotAlt.isShown) && Math.abs(y) > radius * 0.8) {
    //       cosLabelAlt.setPosition(x / 2, y - ySign * 0.08);
    //     } else {
    //       cosLabelAlt.setPosition(x / 2, y + ySign * 0.08);
    //     }
    //   }
    //   if (cosAltEqn.isShown) {
    //     if ((tanAlt.isShown || cotAlt.isShown) && Math.abs(y) > radius * 0.8) {
    //       cosAltEqn.setPosition(x / 2, y - ySign * 0.08);
    //     } else {
    //       cosAltEqn.setPosition(x / 2, y + ySign * 0.08);
    //     }
    //   }
    //   if (thetaCos.isShown) {
    //     if (Math.abs(y) > 0.2 && Math.abs(x) > 0.4 * radius) {
    //       thetaCos.setAngle({ position: [x, y], startAngle: Math.PI, angle: r });
    //       thetaCos.setOpacity(1);
    //     } else {
    //       thetaCos.setOpacity(0);
    //     }
    //   }
    // }
    // if (cosLight.isShown) {
    //   cosLight.custom.updatePoints({ p1: [0, y], p2: [x, y] });
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
      (Math.abs(y) > 0.4 || !tan.isShown)
      && Math.abs(x) > 0.3
      && (
        sin.isShown
        || (sinLight.isShown && sinLight.opacity > 0)
      ),
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

    // setRightAng(
    //   rightCosAlt,
    //   r < Math.PI / 2 && Math.abs(y) > 0.2 && Math.abs(x) > 0.45,
    //   [0, y],
    //   Math.PI / 2 * 3,
    // );

    // setRightAng(
    //   rightTanAlt,
    //   r < Math.PI / 2 && Math.abs(y) > 0.4 && Math.abs(x) > 0.45,
    //   [x, y],
    //   r + Math.PI,
    // );

    // setRightAng(
    //   rightCotAlt,
    //   (y > 0.2 && x > 0.55)
    //   || (y > 0.4 && x < 0)
    //   || (y < -0.2 && x < -0.4)
    //   || (y < 0 && x > 0 && x < radius - 0.1),
    //   [x, y],
    //   r + Math.PI / 2,
    // );

    // /*
    // .##..........########.########..####
    // .##.............##....##.....##..##.
    // .##.............##....##.....##..##.
    // .##.............##....########...##.
    // .##.............##....##...##....##.
    // .##.............##....##....##...##.
    // .########.......##....##.....##.####
    // */
    // if (tanLight.isShown) {
    //   const [tanLine, isClipped] = clip([x, y], [xSign * secVal, 0]);
    //   tanLight.custom.updatePoints({
    //     p1: tanLine.p1, p2: tanLine.p2, arrow: arrow(isClipped, thick / thin * 0.8),
    //   });
    // }
    // // if (cotLight.isShown) {
    // //   const [cotLine, isClipped] = clip([x, y], [0, ySign * cscVal]);
    // //   cotLight.custom.updatePoints({
    // //     p1: cotLine.p1, p2: cotLine.p2, arrow: arrow(isClipped, thick / thin * 0.8),
    // //   });
    // // }
    // if (secLight.isShown) {
    //   const [secLine, isClipped] = clip([-thin / 2, 0], [xSign * secVal, 0]);
    //   secLight.custom.updatePoints({
    //     p1: secLine.p1, p2: secLine.p2, arrow: arrow(isClipped, thick / thin * 0.8),
    //   });
    // }
    // if (cscLight.isShown) {
    //   const [cscLine, isClipped] = clip([0, 0], [0, ySign * cscVal]);
    //   cscLight.custom.updatePoints({
    //     p1: cscLine.p1, p2: cscLine.p2, arrow: arrow(isClipped, thick / thin * 0.8),
    //   });
    // }

    // if (tanTri.isShown) {
    //   const [tanLine] = clip([x, y], [xSign * secVal, 0]);
    //   tanTri.custom.updateGeneric({
    //     points: [
    //       [0, 0], [tanLine.p2.x, 0], tanLine.p1,
    //       tanLine.p1, [tanLine.p2.x, 0], tanLine.p2,
    //     ],
    //     // touchBorder: [[0, 0], [tanLine.p2.x, 0], tanLine.p2, tanLine.p1],
    //   });
    // }
    // if (cotTri.isShown) {
    //   const [cotLine] = clip([x, y], [0, ySign * cscVal]);
    //   cotTri.custom.updateGeneric({
    //     points: [
    //       [0, 0], [0, cotLine.p2.y], cotLine.p1,
    //       cotLine.p1, [0, cotLine.p2.y], cotLine.p2,
    //     ],
    //     // touchBorder: [[0, 0], [0, cotLine.p2.y], cotLine.p2, cotLine.p1],
    //   });
    // }
    // if (cosTri.isShown) {
    //   cosTri.custom.updateGeneric({
    //     points: [[0, 0], [x, y], [0, y]],
    //   });
    // }
    // if (sinTri.isShown) {
    //   sinTri.custom.updateGeneric({
    //     points: [[0, 0], [x, y], [x, 0]],
    //   });
    // }
    
    // /*
    // .########.##.....##.########..########.########.
    // .##........##...##..##.....##.##.......##.....##
    // .##.........##.##...##.....##.##.......##.....##
    // .######......###....########..######...########.
    // .##.........##.##...##........##.......##...##..
    // .##........##...##..##........##.......##....##.
    // .########.##.....##.##........########.##.....##
    // */
    // if (sin1.isShown) {
    //   sin1.custom.updatePoints({
    //     p1: [xSign * radius, 0],
    //     p2: [radius * Math.abs(cosR) * Math.cos(r), radius * Math.abs(cosR) * Math.sin(r)],
    //   });
    // }
    // if (cos1.isShown) {
    //   cos1.custom.updatePoints({
    //     p1: [0, 0],
    //     p2: [radius * Math.abs(cosR) * Math.cos(r), radius * Math.abs(cosR) * Math.sin(r)],
    //   });
    // }
    // if (csc1.isShown) {
    //   const [cscLine, isClipped] = clip([0, 0], [0, ySign * cscVal]);
    //   csc1.custom.updatePoints({
    //     p1: cscLine.p1,
    //     p2: [xSign * Math.abs(cscLine.p2.y), 0],
    //     arrow: arrow(isClipped, thick / thin * 0.8),
    //   });
    // }
    // if (cot1.isShown) {
    //   const cotValue = radius / Math.tan(r);
    //   cot1.custom.updatePoints({
    //     p1: [0, 0],
    //     length: cotValue,
    //     angle: r,
    //   });
    // }
    // if (hyp1.isShown) {
    //   const cscValue = radius / Math.sin(r);
    //   const cotValue = radius / Math.tan(r);
    //   // console.log()
    //   hyp1.custom.updatePoints({
    //     p1: [xSign * Math.abs(cscValue), 0],
    //     length: radius,
    //     angle: Math.PI / 2 + r
    //   });
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
    const eqn3 = figure.getElement('eqn');
    if (eqn3.getElement('val1').isShown) {
      // const deg = Math.round(a / Math.PI * 180);
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
  // cosTri.onClick = () => {
  //   if (cosTri.opacity === 0) {
  //     cosTri.setOpacity(1);
  //     sinTri.setOpacity(0);
  //     cotTri.setOpacity(0);
  //     tanTri.setOpacity(0);
  //   } else {
  //     cosTri.setOpacity(0);
  //   }
  // };
  // sinTri.onClick = () => {
  //   if (sinTri.opacity === 0) {
  //     cosTri.setOpacity(0);
  //     sinTri.setOpacity(1);
  //     cotTri.setOpacity(0);
  //     tanTri.setOpacity(0);
  //   } else {
  //     sinTri.setOpacity(0);
  //   }
  // };
  // cotTri.onClick = () => {
  //   if (cotTri.opacity === 0) {
  //     cosTri.setOpacity(0);
  //     sinTri.setOpacity(0);
  //     cotTri.setOpacity(1);
  //     tanTri.setOpacity(0);
  //   } else {
  //     cotTri.setOpacity(0);
  //   }
  // };
  // tanTri.onClick = () => {
  //   if (tanTri.opacity === 0) {
  //     cosTri.setOpacity(0);
  //     sinTri.setOpacity(0);
  //     cotTri.setOpacity(0);
  //     tanTri.setOpacity(1);
  //   } else {
  //     tanTri.setOpacity(0);
  //   }
  // };
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
  figure.fnMap.global.add('circSetup', (angle, boundsName) => {
    bounds = boundsRects[boundsName];
    if (rotator.isShown) {
      rotator.setRotation(angle);
    }
    if (rotatorFull.isShown) {
      rotatorFull.setRotation(angle);
    }
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
    figure.fnMap.global.add(name, () => {
      element.pulse({ xAlign, yAlign, duration: 1.5 });
      // console.log(name, element)
    });
  };
  const add = (name, fn) => figure.fnMap.global.add(name, fn);
  const pAngle = (name, element, s = 2) => figure.fnMap.global.add(name, () => element.pulseAngle({ label: s, curve: s, duration: 1.5 }));

  add('circToRot', () => {
    if (rotator.isShown) {
      rotator.animations.new()
        .rotation({ target: 0.9, duration: 1 })
        .start();
      return;
    }
    if (rotatorFull.isShown) {
      rotatorFull.animations.new()
        .rotation({ target: 0.9, duration: 1 })
        .start();
    }
  });
  add('circToCosUp', () => {
    triSinCos._cos.animations.new()
      .position({ target: [0, radius * Math.sin(0.9)], duration: 1.5 })
      .start();
  });
  add('circSetCosUp', () => {
    triSinCos._cos.setPosition([0, radius * Math.sin(0.9)]);
  });
  add('circSetCosDown', () => {
    triSinCos._cos.setPosition([0, 0]);
  });
  add('circToCosDown', () => {
    triSinCos._cos.animations.new()
      .position({ target: [0, 0], duration: 1.5 })
      .start();
  });
  add('circToSplit', () => {
    // circle.animations.new()
    //   // .scenarios({ target: 'split', duration: 3 })
    //   .then(triTanSec.animations.scenario({ target: 'split', duration: 2.5 }))
    //   .inParallel([
    //     triTanSec._unit.animations.dissolveIn(0.5),
    //     triTanSec._theta.animations.dissolveIn(0.5),
    //   ])
    //   .then(triSinCos.animations.scenario({ target: 'split', duration: 2 }))
    //   .inParallel([
    //     triSinCos._unit.animations.dissolveIn(0.5),
    //     triSinCos._theta.animations.dissolveIn(0.5),
    //   ])
    //   .inParallel([
    //     triCotCsc.animations.scenario({ target: 'split', duration: 2 }),
    //     circle._arc.animations.dissolveOut(0.5),
    //     circle._xQ1.animations.dissolveOut(0.5),
    //     circle._yQ1.animations.dissolveOut(0.5),
    //     circle._rotator.animations.dissolveOut(0.5),
    //     circle._theta.animations.dissolveOut(0.5),
    //   ])
    //   .inParallel([
    //     triCotCsc._unit.animations.dissolveIn(0.5),
    //     triCotCsc._theta.animations.dissolveIn(0.5),
    //   ])
    //   .start();
    circle.animations.new()
      // .scenarios({ target: 'split', duration: 3 })
      .inParallel([
        triTanSec.animations.scenario({ target: 'split', duration: 5.5 }),
        triSinCos.animations.scenario({ target: 'split', duration: 5.5 }),
        triCotCsc.animations.scenario({ target: 'split', duration: 5.5 }),
        circle._arc.animations.dissolveOut(0.5),
        circle._xQ1.animations.dissolveOut(0.5),
        circle._yQ1.animations.dissolveOut(0.5),
        circle._rotator.animations.dissolveOut(0.5),
        circle._theta.animations.dissolveOut(0.5),
      ])
      .inParallel([
        triTanSec._unit.animations.dissolveIn(0.5),
        triTanSec._theta.animations.dissolveIn(0.5),
        triSinCos._unit.animations.dissolveIn(0.5),
        triSinCos._theta.animations.dissolveIn(0.5),
        triCotCsc._unit.animations.dissolveIn(0.5),
        triCotCsc._theta.animations.dissolveIn(0.5),
      ])
      .start();
  });
  addPulseFn('circPulseTan', triTanSec._tan._label, 'left', 'middle');
  addPulseFn('circPulseCot', triCotCsc._cot._label, 'center', 'bottom');
  addPulseFn('circPulseCsc', triCotCsc._csc._label, 'right', 'bottom');
  addPulseFn('circPulseCos', triSinCos._cos._label, 'center', 'top');
  // addPulseFn('circPulseRad', hypLabel, 'right', 'bottom');
  // addPulseFn('circPulseSec1', secLabel, 'center', 'top');
  addPulseFn('circPulseSec', triTanSec._sec._label, 'left', 'top');
  // addPulseFn('circPulseCsc', cscLabel, 'right', 'middle');
  // addPulseFn('circPulseSin1', sinLabel, 'left', 'middle');
  addPulseFn('circPulseSin', triSinCos._sin._label, 'left', 'middle');
  // addPulseFn('circPulseCos', cosLabel, 'center', 'top');

  // addPulseFn('circPulseTanAlt', tanLabelAlt, 'left', 'bottom');
  // addPulseFn('circPulseCotAlt', cotLabelAlt, 'left', 'bottom');
  // addPulseFn('circPulseSecAlt', secLabelAlt, 'center', 'top');
  // addPulseFn('circPulseCscAlt', cscLabelAlt, 'right', 'middle');
  // addPulseFn('circPulseSin', sinLabel, 'left', 'middle');
  // addPulseFn('circPulseCosAlt', cosLabelAlt, 'center', 'bottom');
  // addPulseFn('circPulseRad', hypLabel, 'right', 'bottom');
  // pAngle('circPulseTheta', theta);
  // pAngle('circPulseThetaComp', thetaComp, 1.3);
  // pAngle('circPulseThetaCos', thetaCos, 1.5);
  // pAngle('circPulseThetaCot', thetaCos, 1.5);
  // pAngle('circPulseThetaCot', thetaCos, 1.5);
  // add('circPulseSinEqn', () => sinEqn.pulse({ xAlign: 'left' }));

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
  triCotCsc.subscriptions.add('setTransform', () => {
    const r = triCotCsc.getRotation();
    triCotCsc._cot.updateLabel(r);
    triCotCsc._csc.updateLabel(r);
    triCotCsc._unit.updateLabel(r);
  });
}
