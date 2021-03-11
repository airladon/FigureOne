/* eslint-disable camelcase, no-restricted-globals */
/* globals figure, colTheta, colCot, colTan, colSin, colCos, colSec, colCsc,
   colGrey, Fig, thin, thick, colText */

function layoutCirc() {
  const radius = 1.5;
  const defaultAngle = 0.9;

  const line = (name, color, width = thick, p1 = [0, 0], length = 1, ang = 0, dash = []) => ({
    name,
    method: 'primitives.line',
    options: {
      p1, length, angle: ang, width, color, dash,
    },
    // mods: { dimColor: colText },
  });

  const lineWithLabel = (name, color, text, width = thick, p1, length, ang) => ({
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
  const tri = (name, elements, position, rotation, trans1 = {}, trans2 = {}) => ({
    name,
    method: 'collection',
    elements,
    mods: {
      scenarios: {
        noSplit: { scale: [1, 1], position: [0, 0], rotation: 0 },
        split: { scale: [1, 1], position, rotation },
        trans1,
        trans2,
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
      line('tanLightAlt', colGrey, thin),
      line('secLightAlt', colGrey, thin),
      line('cotLightAlt', colGrey, thin),
      line('cscLightAlt', colGrey, thin),
      line('radiusLight', colGrey, thin),
      rightAngle('rightCotAlt', [radius, 0], Math.PI / 2),
      rightAngle('rightTanAlt', [radius, 0], Math.PI / 2),
      rightAngle('rightSinAlt', [0, 0], Math.PI / 2),
      lineWithLabel('radius', colGrey, '1', thin),
      lineWithLabel('radiusAlt', colGrey, '1', thin),
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
      tri(
        'triTanSec',
        [
          angle('theta', '\u03b8', 0.2, 0.5, [0, 0], 0, defaultAngle),
          lineWithLabel('unit', colText, '1', thick, [radius + thick / 2, 0], radius + thick * 0.7, Math.PI),
          lineWithLabel('tan', colTan, 'tan'),
          lineWithLabel('sec', colSec, 'sec'),
          rightAngle('rightTan', [radius, 0], Math.PI / 2),
        ],
        [0, 0],
        0,
        { scale: [1, -1], rotation: 0, position: [0, 0] },
        { scale: [1, -1], rotation: defaultAngle, position: [0, 0] },
      ),
      lineWithLabel('tanTheta', colTan, [{ tan: { color: [0, 0, 0, 0] } }, ' ', { theta: { text: '\u03b8', color: colTheta, style: 'italic' } }]),
      tri(
        'triCotCsc',
        [
          angle('theta', '\u03b8', 0.2, 0.5, [radius / Math.sin(defaultAngle) * Math.cos(defaultAngle), radius / Math.sin(defaultAngle) * Math.sin(defaultAngle)], Math.PI, defaultAngle - 0.05),
          lineWithLabel('unit', colText, '1', thick, [-thick / 2, thick], radius - thick / 2, Math.PI / 2),
          lineWithLabel('csc', colCsc, 'csc'),
          lineWithLabel('cot', colCot, 'cot'),
          rightAngle('rightCot', [0, radius], -Math.PI / 2),
        ],
        [0.1, radius - 0.2 + 0.5 + 0.2],
        Math.PI,
        { scale: [-1, 1], rotation: 0, position: [0, 0] },
        { scale: [-1, 1], rotation: -(Math.PI / 2 - defaultAngle), position: [0, 0] },
      ),

      lineWithLabel('sinAlt', colSin, 'sin'),
      lineWithLabel('cosAlt', colCos, 'cos'),
      lineWithLabel('tanAlt', colTan, 'tan'),
      lineWithLabel('secAlt', colSec, 'sec'),
      lineWithLabel('cotAlt', colCot, 'cot'),
      lineWithLabel('cscAlt', colCsc, 'csc'),
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
          position: [-2.7, 1],
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
          move: { type: 'rotation', bounds: { rotation: { min: 0, max: Math.PI / 2 * 0.999 } } },
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
        circQ1Values: { scale: 1, position: [-0.2, -1] },
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
  const [rightSinAlt, rightCotAlt, rightTanAlt] = get(['rightSinAlt', 'rightCotAlt', 'rightTanAlt']);
  const [radiusLine, xRadius, radiusAlt] = get(['radius', 'xRadius', 'radiusAlt']);
  const [radiusLight] = get(['radiusLight']);
  const [cosAlt, sinAlt] = get(['cosAlt', 'sinAlt']);
  const [tanAlt, secAlt] = get(['tanAlt', 'secAlt']);
  const [cotAlt, cscAlt] = get(['cotAlt', 'cscAlt']);
  const [tanLightAlt, secLightAlt] = get(['tanLightAlt', 'secLightAlt']);
  const [cotLightAlt, cscLightAlt] = get(['cotLightAlt', 'cscLightAlt']);
  const [cos, sin] = get({ triSinCos: ['cos', 'sin'] });
  const [cot, csc] = get({ triCotCsc: ['cot', 'csc'] });
  const [tan, sec] = get({ triTanSec: ['tan', 'sec'] });
  const [tanTheta] = get(['tanTheta']);
  const boundsRects = {
    title: new Fig.Rect(-0.1, -0.1, radius + 2.5, radius + 0.6),
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
      if ((!sin.isShown && (cos.isShown || !radiusLine.isShown)) || radiusLight.isShown) {
        sinLight.setOpacity(1);
        sinLight.custom.updatePoints({ p1: [x, 0], p2: [x, y] });
      } else {
        sinLight.setOpacity(0);
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
      if (cos._label.isShown) {
        cos.label.location = ySign > 0 ? 'bottom' : 'top';
      }
      cos.setEndPoints([0, 0], [x + xSign * thick / 2, 0]);
    }
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
    if (radiusLight.isShown) {
      xRadius.setEndPoints([0, 0], [xSign * radius, 0]);
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
      const [tanLine] = clip([xSign * radius, 0], [xSign * radius, ySign * tanVal]);
      if (tan._label.isShown) {
        tan.label.location = xSign > 0 ? 'right' : 'left';
      }
      tan.setEndPoints(
        tanLine.p1, tanLine.p2,
        // arrow: arrow(isClipped),
      );
    }
    if (tanTheta.isShown) {
      const [tanLine] = clip([xSign * radius, 0], [xSign * radius, ySign * tanVal]);
      if (tanTheta._label.isShown) {
        tanTheta.label.location = xSign > 0 ? 'right' : 'left';
      }
      tanTheta.setEndPoints(
        tanLine.p1, tanLine.p2,
        // arrow: arrow(isClipped),
      );
    }
    if (tanLight.isShown) {
      if (sec.isShown || (secLight.isShown && !radiusLine.isShown) || radiusLight.isShown) {
        tanLight.setOpacity(1);
        const [tanLine] = clip([xSign * radius, 0], [xSign * radius, ySign * tanVal]);
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
      const [secLine] = clip([0, 0], [xSign * radius, ySign * tanVal]);
      if (sec._label.isShown) {
        sec.label.location = ySign > 0 ? 'bottom' : 'top';
        sec.label.linePosition = 0.65;
      }
      sec.setEndPoints(
        secLine.p1, secLine.p2,
        // arrow: arrow(isClipped)
      );
    }
    if (secLight.isShown) {
      if (tan.isShown || (tanLight.isShown && !radiusLine.isShown) || radiusLight.isShown) {
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
      const [cotLine] = clip([0, ySign * radius], [xSign * cotVal, ySign * radius]);
      let offsetX = 0;
      let offsetY = 0;
      if (csc.isShown && sec.isShown) {
        offsetX = thick * Math.cos(r + xSign * ySign * Math.PI / 2);
        offsetY = thick * Math.sin(r + xSign * ySign * Math.PI / 2);
      }
      if (cot._label.isShown) {
        // console.log(cot._label.getPosition('figure').y)
        // console.log(triCotCsc.getRotation());
        if (Math.abs(triCotCsc.getRotation()) < 0.001) {
          cot.label.location = ySign > 0 ? 'top' : 'bottom';
        } else {
          cot.label.location = 'positive';
        }
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
        (
          (csc.isShown || (cscLight.isShown && !radiusLine.isShown))
          && !cot.isShown
        ) || radiusLight.isShown
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
      const [cscLine] = clip([0, 0], [xSign * cotVal, ySign * radius]);
      let offsetX = 0;
      let offsetY = 0;
      if (sec.isShown && csc.getScale().x > 0) {
        offsetX = thick * Math.cos(r + xSign * ySign * Math.PI / 2);
        offsetY = thick * Math.sin(r + xSign * ySign * Math.PI / 2);
      }
      if (csc._label.isShown) {
        if (Math.abs(triCotCsc.getRotation()) < 0.001) {
          csc.label.location = ySign > 0 ? 'top' : 'bottom';
        } else {
          csc.label.location = 'positive';
        }
      }
      csc.setEndPoints(
        cscLine.p1.add(offsetX, offsetY),
        cscLine.p2.add(offsetX, offsetY),
        // arrow: arrow(isCl//ipped),
      );
    }
    if (cscLight.isShown) {
      if (
        (
          (
            cot.isShown || radiusLight.isShown || (cotLight.isShown && !radiusLine.isShown)
          )
          && !csc.isShown
        ) || radiusLight.isShown
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
    if (radiusAlt.isShown) {
      if (radiusAlt._label.isShown) {
        radiusAlt.label.location = ySign > 0 ? 'top' : 'bottom';
        radiusAlt.label.linePosition = 0.3;
      }
      radiusAlt.setEndPoints([0, 0], [x, y]);
    }
    /*
    ..######..####.##....##.......###....##.......########
    .##....##..##..###...##......##.##...##..........##...
    .##........##..####..##.....##...##..##..........##...
    ..######...##..##.##.##....##.....##.##..........##...
    .......##..##..##..####....#########.##..........##...
    .##....##..##..##...###....##.....##.##..........##...
    ..######..####.##....##....##.....##.########....##...
    */
    if (sinAlt.isShown) {
      if (sinAlt._label.isShown) {
        if ((tanAlt._label.isShown) && Math.abs(x) > radius * 0.8) {
          sinAlt.label.location = xSign > 0 ? 'left' : 'right';
        } else {
          sinAlt.label.location = xSign > 0 ? 'right' : 'left';
        }
      }
      sinAlt.setEndPoints([x, 0], [x, y]);
    }

    /*
    ..######...#######...######........###....##.......########
    .##....##.##.....##.##....##......##.##...##..........##...
    .##.......##.....##.##...........##...##..##..........##...
    .##.......##.....##..######.....##.....##.##..........##...
    .##.......##.....##.......##....#########.##..........##...
    .##....##.##.....##.##....##....##.....##.##..........##...
    ..######...#######...######.....##.....##.########....##...
    */
    if (cosAlt.isShown) {
      if (cosAlt._label.isShown) {
        let location = 'bottom';
        if (
          (ySign > 0 && Math.abs(y) < radius * 0.8)
          || (ySign < 0 && Math.abs(y) > radius * 0.8)
        ) {
          location = 'top';
        }
        cosAlt.label.location = location;
      }
      cosAlt.setEndPoints([0, y], [x + xSign * thick / 2, y]);
    }

    /*
    .########....###....##....##.......###....##.......########
    ....##......##.##...###...##......##.##...##..........##...
    ....##.....##...##..####..##.....##...##..##..........##...
    ....##....##.....##.##.##.##....##.....##.##..........##...
    ....##....#########.##..####....#########.##..........##...
    ....##....##.....##.##...###....##.....##.##..........##...
    ....##....##.....##.##....##....##.....##.########....##...
    */
    if (tanAlt.isShown) {
      const [tanLine] = clip([x, y + 0.0001], [xSign * secVal, 0]);
      if (tanAlt._label.isShown) {
        tanAlt.label.location = ySign > 0 ? 'top' : 'bottom';
      }
      tanAlt.setEndPoints(tanLine.p1, tanLine.p2);
    }
    if (tanLightAlt.isShown) {
      if (!tanAlt.isShown && secAlt.isShown) {
        const [tanLine] = clip([x, y + 0.0001], [xSign * secVal, 0]);
        tanLightAlt.custom.updatePoints({ p1: tanLine.p1, p2: tanLine.p2 });
        tanLightAlt.setOpacity(1);
      } else {
        tanLightAlt.setOpacity(0);
      }
    }

    /*
    ..######...#######..########....###....##.......########
    .##....##.##.....##....##......##.##...##..........##...
    .##.......##.....##....##.....##...##..##..........##...
    .##.......##.....##....##....##.....##.##..........##...
    .##.......##.....##....##....#########.##..........##...
    .##....##.##.....##....##....##.....##.##..........##...
    ..######...#######.....##....##.....##.########....##...
    */
    if (cotAlt.isShown) {
      const [cotLine] = clip([x, y], [0, ySign * cscVal]);
      if (cotAlt._label.isShown) {
        cotAlt.label.location = ySign > 0 ? 'top' : 'bottom';
      }
      cotAlt.setEndPoints(cotLine.p1, cotLine.p2);
    }
    if (cotLightAlt.isShown) {
      if (!cotAlt.isShown && cscAlt.isShown) {
        const [cotLine] = clip([x, y], [0, ySign * cscVal]);
        cotLightAlt.custom.updatePoints({ p1: cotLine.p1, p2: cotLine.p2 });
        cotLightAlt.setOpacity(1);
      } else {
        cotLightAlt.setOpacity(0);
      }
    }

    /*
    ..######..########..######.....###....##.......########
    .##....##.##.......##....##...##.##...##..........##...
    .##.......##.......##........##...##..##..........##...
    ..######..######...##.......##.....##.##..........##...
    .......##.##.......##.......#########.##..........##...
    .##....##.##.......##....##.##.....##.##..........##...
    ..######..########..######..##.....##.########....##...
    */
    if (secAlt.isShown) {
      const [secLine] = clip([-thick / 2, 0], [xSign * secVal, 0]);
      if (secAlt._label.isShown) {
        secAlt.label.location = ySign > 0 ? 'bottom' : 'top';
      }
      secAlt.setEndPoints(secLine.p1, secLine.p2);
    }
    if (secLightAlt.isShown) {
      if (!secAlt.isShown && tanAlt.isShown) {
        const [secLine] = clip([-thick / 2, 0], [xSign * secVal, 0]);
        secLightAlt.custom.updatePoints({ p1: secLine.p1, p2: secLine.p2 });
        secLightAlt.setOpacity(1);
      } else {
        secLightAlt.setOpacity(0);
      }
    }

    /*
    ..######...######...######........###....##.......########
    .##....##.##....##.##....##......##.##...##..........##...
    .##.......##.......##...........##...##..##..........##...
    .##........######..##..........##.....##.##..........##...
    .##.............##.##..........#########.##..........##...
    .##....##.##....##.##....##....##.....##.##..........##...
    ..######...######...######.....##.....##.########....##...
    */
    if (cscAlt.isShown) {
      const [cscLine] = clip([0, 0], [0, ySign * cscVal]);
      if (cscAlt._label.isShown) {
        cscAlt.label.location = xSign > 0 ? 'left' : 'right';
      }
      cscAlt.setEndPoints(cscLine.p1, cscLine.p2);
    }
    if (cscLightAlt.isShown) {
      if (!cscAlt.isShown && cotAlt.isShown) {
        const [cscLine] = clip([0, 0], [0, ySign * cscVal]);
        cscLightAlt.custom.updatePoints({ p1: cscLine.p1, p2: cscLine.p2 });
        cscLightAlt.setOpacity(1);
      } else {
        cscLightAlt.setOpacity(0);
      }
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

    setRightAng(
      rightSinAlt,
      sinAlt.isShown && Math.abs(x) > 0.3 && Math.abs(x) < radius - 0.2,
      [x, 0],
      Math.PI / 2 - (quad - 1) * Math.PI / 2,
    );

    setRightAng(
      rightCotAlt,
      (cotAlt.isShown || (cotLightAlt.isShown && cotLightAlt.opacity > 0.5))
      && Math.abs(x) > 0.5
      && Math.abs(y) > 0.15,
      [x, y],
      // r + Math.PI / 2 * 3 - (quad - 1) * Math.PI / 2,
      r + Math.PI / 2 + Math.PI / 4 - xSign * ySign * Math.PI / 4,
    );
    setRightAng(
      rightTanAlt,
      (tanAlt.isShown || (tanLightAlt.isShown && tanLightAlt.opacity > 0.5))
      && Math.abs(x) > 0.3
      && Math.abs(y) > 0.35,
      [x, y],
      // Math.PI / 2 * 3 - (quad - 1) * Math.PI / 2,
      r + Math.PI / 2 + Math.PI / 4 + xSign * ySign * Math.PI / 4,
    );



    const a = Fig.tools.math.round(r * 180 / Math.PI, 0) * Math.PI / 180;
    const sinA = Math.sin(a);
    const cosA = Math.cos(a);
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
  const rotatorUpdateCircle = () => {
    // console.log('r', rotator.transform.r())
    if (rotator.isShown) {
      // console.log(rotator.transform.r())
      updateCircle(Fig.tools.g2.clipAngle(rotator.transform.r(), '0to360'));
      // console.log(rotator.transform.r())
    }
  };
  const rotatorFullUpdateCircle = () => {
    // console.log('f', rotator.transform.r())
    if (rotatorFull.isShown) {
      updateCircle(Fig.tools.g2.clipAngle(rotatorFull.transform.r(), '0to360'));
    }
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
  figure.fnMap.global.add('circSetup', (payload) => {
    const [ang, boundsName] = payload;
    bounds = boundsRects[boundsName];
    if (rotator.isShown) {
      rotator.setRotation(ang);
    } if (rotatorFull.isShown) {
      rotatorFull.setRotation(ang);
    } else {
      updateCircle(ang);
    }
  });
  rotator.subscriptions.add('setState', 'updateCircle');
  rotatorFull.subscriptions.add('setState', 'updateCircle');

  const addPulseFn = (name, element, xAlign, yAlign) => {
    figure.fnMap.global.add(name, () => {
      element.pulse({ xAlign, yAlign, duration: 1.5 });
      // console.log(name, element)
    });
  };
  const add = (name, fn) => figure.fnMap.global.add(name, fn);

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
    circle.animations.new()
      .inParallel([
        triTanSec.animations.scenario({ target: 'split', duration: 5.5 }),
        triSinCos.animations.scenario({ target: 'split', duration: 5.5 }),
        triCotCsc.animations.scenario({ target: 'split', duration: 5.5 }),
        circle._arc.animations.dissolveOut(0.5),
        circle._xQ1.animations.dissolveOut(0.5),
        circle._yQ1.animations.dissolveOut(0.5),
        circle._rotator.animations.dissolveOut(0.5),
        circle._theta.animations.dissolveOut(0.5),
        triTanSec._unit._line.animations.dissolveIn(0.5),
        triSinCos._unit._line.animations.dissolveIn(0.5),
        triCotCsc._unit._line.animations.dissolveIn(0.5),
      ])
      .inParallel([
        triTanSec._unit._label.animations.dissolveIn(0.5),
        triSinCos._unit._label.animations.dissolveIn(0.5),
        triCotCsc._unit._label.animations.dissolveIn(0.5),
        triTanSec._theta.animations.dissolveIn(0.5),
        triSinCos._theta.animations.dissolveIn(0.5),
        triCotCsc._theta.animations.dissolveIn(0.5),
      ])
      .start();
  });
  add('circToAlt', () => {
    circle.show(['sinAlt', 'cosAlt', 'tanAlt', 'secAlt', 'cscAlt', 'cotAlt', 'radiusAlt', 'tanLightAlt', 'secLightAlt', 'cscLightAlt', 'cotLightAlt', 'rightSinAlt', 'rightTanAlt', 'rightCotAlt']);
    circle.hide(['triSinCos.sin', 'triSinCos.cos', 'triSinCos.rightSin', 'triTanSec.tan', 'triTanSec.sec', 'triCotCsc.cot', 'triCotCsc.csc', 'triCotCsc.rightCot', 'triTanSec.rightTan', 'radius']);
    circle.setScenarios('noSplit');
  });
  addPulseFn('circPulseTan', triTanSec._tan._label, 'left', 'middle');
  addPulseFn('circPulseTanTheta', circle._tanTheta._label, 'left', 'middle');
  addPulseFn('circPulseCot', triCotCsc._cot._label, 'center', 'bottom');
  addPulseFn('circPulseCsc', triCotCsc._csc._label, 'right', 'bottom');
  addPulseFn('circPulseCos', triSinCos._cos._label, 'center', 'top');
  addPulseFn('circPulseSec', triTanSec._sec._label, 'left', 'top');
  addPulseFn('circPulseSin', triSinCos._sin._label, 'left', 'middle');
  rotator.subscriptions.add('setTransform', 'updateCircle');
  rotatorFull.subscriptions.add('setTransform', 'updateCircle');
  const updateRotation = () => {
    if (!triCotCsc.isShown) {
      return;
    }
    const r = triCotCsc.getRotation();
    // console.log(triCotCsc.getRotation());
    if (Math.abs(triCotCsc.getRotation()) < 0.001) {
    //   cot.label.location = ySign > 0 ? 'top' : 'bottom';
    // } else {
      cot.label.location = 'positive';
      csc.label.location = 'positive';
    }
    triCotCsc._cot.updateLabel(r);
    triCotCsc._csc.updateLabel(r);
    triCotCsc._unit.updateLabel(r);
  };
  figure.fnMap.global.add('updateRotation', () => updateRotation());
  triCotCsc.fnMap.add('updateRotation', () => updateRotation());
  triCotCsc.subscriptions.add('setTransform', 'updateRotation');
  triCotCsc.subscriptions.add('setState', 'updateRotation');
}
