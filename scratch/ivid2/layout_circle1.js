/* eslint-disable camelcase */
/* globals figure, colTheta, colCot, colTan, colSin, colCos, colSec, colCsc, colRad, colGrey, colDim, colAdj, colOpp, colHyp, Fig */

function layoutCircle1() {
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
  });
  const arc = (name, color, width = thin, sides = 100, angleToDraw = Math.PI * 2, rotation = 0) => ({
    name,
    method: 'primitives.polygon',
    options: {
      radius, line: { width }, sides, angleToDraw: angleToDraw + 0.001, rotation, color,
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

  const rightAngle = (name, position, startAngle) => ({
    name: 'rightAngle',
    method: 'collections.angle',
    options: {
      position,
      startAngle,
      angle: Math.PI / 2,
      curve: { autoRightAngle: true, width: 0.008, radius: 0.2 },
    },
  });

  const [circle] = figure.add({
    name: 'circle1',
    method: 'collection',
    elements: [
      line('x', colGrey, thin, [0, 0], radius, 0, [0.01, 0.005]),
      line('y', colGrey, thin, [0, 0], radius, Math.PI / 2, [0.01, 0.005]),
      line('xSec', colGrey, thin, [0, 0], radius, 0, [0.01, 0.005]),
      // {
      //   name: 'x',
      //   method: 'primitives.line',
      //   options: {
      //     p1: [0, 0],
      //     p2: [radius, 0],
      //     dash: [0.01, 0.005],
      //     width: 0.006,
      //     color: colGrey,
      //   },
      // },
      // {
      //   name: 'xSec',
      //   method: 'primitives.line',
      //   options: {
      //     p1: [0, 0],
      //     p2: [radius, 0],
      //     // dash: [0.01, 0.005],
      //     width: 0.006,
      //     color: colGrey,
      //   },
      // },
      // {
      //   name: 'y',
      //   method: 'primitives.line',
      //   options: {
      //     p1: [0, 0],
      //     p2: [0, radius],
      //     dash: [0.01, 0.005],
      //     width: 0.006,
      //     color: colGrey,
      //   },
      // },
      arc('circle', colGrey),
      // {
      //   name: 'circle',
      //   method: 'primitives.polygon',
      //   options: {
      //     radius,
      //     line: { width: 0.006 },
      //     sides: 100,
      //     sidesToDraw: 100,
      //     rotation: -0.25,
      //     color: colGrey,
      //   },
      // },
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
      // {
      //   name: 'bow',
      //   method: 'polygon',
      //   options: {
      //     radius,
      //     line: { width: 0.015 },
      //     color: colSin,
      //     rotation: -1,
      //     sides: 300,
      //     angleToDraw: 2,
      //   },
      // },
      line('radius', colRad, thin, [0, 0], radius, 4.37),
      // {
      //   name: 'radius',
      //   method: 'primitives.line',
      //   options: {
      //     p1: [0, 0],
      //     p2: [radius * Math.cos(4.37), radius * Math.sin(4.37)],
      //     width: 0.008,
      //     color: colRad,
      //   },
      // },
      rightAngle('rightAngle', [radius * Math.cos(4.37), radius * Math.sin(4.37)], 4.37 - Math.PI),
      // {
      //   name: 'rightAngle',
      //   method: 'collections.angle',
      //   options: {
      //     p1: [0, 0],
      //     p2: [radius * Math.cos(4.37), radius * Math.sin(4.37)],
      //     p3: [-radius * 1.3, -radius * 0.6],
      //     curve: { autoRightAngle: true, width: 0.008, radius: 0.2 },
      //   },
      // },
      arc('arc', colGrey, thin, 100, Math.PI / 2),
      // {
      //   name: 'arc',
      //   method: 'primitives.polygon',
      //   options: {
      //     radius,
      //     line: { width: 0.006 },
      //     sides: 100,
      //     sidesToDraw: 25,
      //     color: colGrey,
      //   },
      // },
      // {
      //   name: 'bow',
      //   method: 'collections.angle',
      //   options: {
      //     curve: { radius, width: 0.013, sides: 200 },
      //     // radius,
      //     // line: { width: 0.006 },
      //     // sides: 200,
      //     // sidesToDraw: 100,
      //     color: colSin,
      //   },
      // },
      {
        name: 'center',
        method: 'primitives.polygon',
        options: {
          radius: 0.015,
          sides: 12,
        },
      },
      {
        name: 'rightAngle1',
        method: 'collections.angle',
        options: {
          curve: {
            autoRightAngle: true,
            radius: 0.15,
            width: 0.006,
          },
          color: colGrey,
        },
      },
      {
        name: 'rightAngle2',
        method: 'collections.angle',
        options: {
          curve: {
            autoRightAngle: true,
            radius: 0.15,
            width: 0.006,
          },
          color: colGrey,
        },
      },
      {
        name: 'rightAngle3',
        method: 'collections.angle',
        options: {
          curve: {
            autoRightAngle: true,
            radius: 0.15,
            width: 0.006,
          },
          color: colGrey,
        },
      },
      {
        name: 'rightAngle4',
        method: 'collections.angle',
        options: {
          curve: {
            autoRightAngle: true,
            radius: 0.15,
            width: 0.006,
          },
          color: colGrey,
        },
      },
      {
        name: 'rightAngle5',
        method: 'collections.angle',
        options: {
          curve: {
            autoRightAngle: true,
            radius: 0.15,
            width: 0.006,
          },
          color: colGrey,
        },
      },
      {
        name: 'angle',
        method: 'collections.angle',
        options: {
          color: colTheta,
          curve: {
            width: 0.01,
            radius: 0.2,
            step: 0.8,
            sides: 400,
          },
          label: {
            text: '\u03b8',
            offset: 0.01,
          },
        },
      },
      {
        name: 'angle2',
        method: 'collections.angle',
        options: {
          color: colTheta,
          curve: {
            width: 0.01,
            radius: 0.2,
            step: 0.8,
            sides: 400,
          },
          label: {
            text: '\u03b8',
            offset: 0.01,
          },
        },
      },
      {
        name: 'angle3',
        method: 'collections.angle',
        options: {
          color: colTheta,
          curve: {
            width: 0.01,
            radius: 0.3,
            step: 0.8,
            sides: 400,
          },
          label: {
            text: '\u03b8',
            offset: 0.03,
          },
        },
      },
      {
        name: 'compAngle',
        method: 'collections.angle',
        options: {
          color: colTheta,
          curve: {
            width: 0.01,
            radius: 0.3,
            step: 0.8,
            sides: 400,
          },
          label: {
            text: '90\u00b0\u2212\u03b8',
            curvePosition: 0.65,
            offset: 0.01,
            scale: 0.6,
          },
        },
      },
      {
        name: 'compAngle2',
        method: 'collections.angle',
        options: {
          color: colTheta,
          curve: {
            width: 0.01,
            radius: 0.3,
            step: 0.8,
            sides: 400,
          },
          label: {
            text: '90\u00b0\u2212\u03b8',
            curvePosition: 0.65,
            offset: 0.01,
            scale: 0.6,
          },
        },
      },
      line('sec', colSec),
      lineLabel('secLabel', 'sec', colSec),
      line('sec1', colSec),
      lineLabel('secLabel1', 'sec', colSec),
      line('bowString', colSin),
      line('sin', colSin),
      lineLabel('sinLabel', 'sin', colSin, [0, 0], 'baseline'),
      // lineLabel('f1Label', { forms: { 0: { sub: ['f', '_1'] } } }, colSin),
      { name: 'f1Label', method: 'equation', options: { forms: { 0: { sub: ['f', '_1'] } }, color: colSin } },
      line('cos', colCos),
      lineLabel('cosLabel', 'cos', colCos, [0, 0], 'top', 'left'),
      line('csc', colCsc),
      lineLabel('cscLabel', 'csc', colCsc),
      line('tan', colTan),
      lineLabel('tanLabel', 'tan', colTan),
      line('cot', colCot),
      lineLabel('cotLabel', 'cot', colCot),
      line('tanAlt', colOpp),
      lineLabel('tanLabelAlt', 'tan', colOpp),
      line('cotAlt', colAdj),
      lineLabel('cotLabelAlt', 'cot', colAdj),
      lineLabel('adjacentOneLabel', '1', colAdj, [radius / 2, -0.1]),
      lineLabel('oppositeOneLabel', '1', colOpp, [-0.1, radius / 2]),
      {
        name: 'adjacentOne',
        method: 'primitives.line',
        options: {
          p1: [0, 0],
          p2: [radius + 0, 0],
          width: 0.013,
          color: colAdj,
          // arrow: 'bar',
        },
      },
      {
        name: 'oppositeOne',
        method: 'primitives.line',
        options: {
          p1: [0, altOffset],
          p2: [0, radius + altOffset],
          width: 0.013,
          color: colOpp,
          // arrow: 'bar',
        },
      },
      {
        name: 'bowStringLabel',
        method: 'equation',
        options: {
          elements: {
            sin: { style: 'normal' },
            comma: ', ',
            // rightArrow: ' \u2192 ',
          },
          forms: {
            // bowstring: 'bowstring',
            half: ['half chord'],
            // sinus: 'sinus',
            // sine: ['sinus', 'rightArrow', 'sine'],
            sinesin: ['sine', 'comma', 'sin'],
            sin: 'sin',
          },
          formDefaults: { alignment: { yAlign: 'baseline' } },
          color: colOpp,
        },
      },
      {
        name: 'cosLabelEqn',
        method: 'equation',
        options: {
          elements: {
            co: { style: 'normal' },
            s: { style: 'normal' },
            sin: { style: 'normal' },
            comma: ', ',
            // rightArrow: ' \u2192 ',
            comp: { text: '90\u00b0 \u2212 \u03b8', color: colTheta },
            lb: { symbol: 'bracket', side: 'left' },
            rb: { symbol: 'bracket', side: 'right' },
            brace: { symbol: 'brace', side: 'bottom' },
            theta: { text: '\u03b8', color: colTheta },
          },
          forms: {
            sine: {
              content: ['sin', { brac: ['lb', 'comp', 'rb'] }],
              alignment: { xAlign: '0.25o' },
            },
            compSine: {
              content: ['sin', { brac: ['lb', 'comp', 'rb'] }, '_ = ', 'co', 'mplementary', ' ', 's', 'ine', ' ', 'theta'],
              alignment: { xAlign: '0.25o' },
            },
            cosine: {
              content: ['sin', { brac: ['lb', 'comp', 'rb'] }, '_ = ', 'co', 's', 'ine', ' ', 'theta'],
              alignment: { xAlign: '0.25o' },
            },
            cos: ['co', 's'],
          },
          formDefaults: { alignment: { yAlign: 'top', xAlign: 'left' } },
          color: colAdj,
        },
      },
      {
        name: 'tanAltEqn',
        method: 'equation',
        options: {
          elements: {
            tan: { style: 'normal' },
            comma: ', ',
          },
          forms: {
            tangent: 'tangent',
            tangentTan: ['tangent', 'comma', 'tan'],
            tan: ['tan'],
          },
          formDefaults: { alignment: { yAlign: 'baseline' } },
          color: colTan,
        },
      },
      {
        name: 'secAltEqn',
        method: 'equation',
        options: {
          elements: {
            sec: { style: 'normal' },
            comma: ', ',
          },
          forms: {
            secant: 'secant',
            secantSec: ['secant', 'comma', 'sec'],
            sec: ['sec'],
          },
          formDefaults: { alignment: { yAlign: 'baseline', xAlign: 'right' } },
          color: colSec,
        },
      },
      {
        name: 'cotAltEqn',
        method: 'equation',
        options: {
          elements: {
            co: { style: 'normal' },
            t: { style: 'normal' },
          },
          formDefaults: {
            alignment: { yAlign: 'baseline', xAlign: 'center' },
          },
          forms: {
            complementaryTangent: ['co', 'mplementary', ' ', 't', 'angent'],
            cotangent: ['co', 't', 'angent'],
            cot: ['co', 't'],
          },
          color: colAdj,
        },
      },
      {
        name: 'cscAltEqn',
        method: 'equation',
        options: {
          elements: {
            c: { style: 'normal' },
            s: { style: 'normal' },
            c_1: { style: 'normal' },
          },
          formDefaults: {
            alignment: { yAlign: 'baseline', xAlign: 'left' },
          },
          forms: {
            complementarySecant: ['c', 'o', 'mplementary', ' ', 's', 'e', 'c_1', 'ant'],
            cosec: ['c', 'o', 's', 'e', 'c_1'],
            csc: ['c', 's', 'c_1'],
          },
          color: colHyp,
        },
      },
      {
        name: 'line',
        method: 'collections.line',
        options: {
          length: radius,
          width: 0.013,
          color: colOne,
        },
        // mods: {
        //   move: { type: 'rotation', bounds: { rotation: { min: 0, max: Math.PI / 2 } } },
        //   isMovable: true,
        //   touchBorder: 0.3,
        // },
      },
      {
        name: 'rotator',
        method: 'collections.line',
        options: {
          length: radius,
          width: 0.01,
          color: [0, 0, 0, 0.5],
        },
        mods: {
          move: { type: 'rotation', bounds: { rotation: { min: 0, max: Math.PI / 2 } } },
          isMovable: true,
          touchBorder: 0.3,
        },
      },
      {
        name: 'lineLabel',
        method: 'text',
        options: {
          text: '1',
          font: { family: 'Times New Roman', size: 0.14 },
          color: colOne,
          xAlign: 'right',
          yAlign: 'bottom',
        },
      },
      line('secAlt', colHyp),
      lineLabel('secLabelAlt', 'sec', colHyp),
      line('cscAlt', colHyp),
      lineLabel('cscLabelAlt', 'csc', colHyp),
    ],
    mods: {
      scenarios: {
        title: { scale: 1 },
        default: { scale: 1, position: [-radius / 2 + 0.4, -1.1] },
        right: { scale: 1, position: [0.5, -1.2] },
        small: { scale: 0.7, position: [0, -0.3] },
        center: { scale: 1, position: [0, -0.5] },
        right1: { scale: 1, position: [0, -0.5] },
        circleSmall: { scale: 0.8, position: [0, 0] },
        circleLines: { scale: 0.7, position: [-1.3, 0] },
        circleQuart: { scale: 1, position: [-radius / 2 + 0.8, -1] },
        circleQuartMid: { scale: 1, position: [-radius / 2 + 0.3, -1] },
      },
    },
  });
  const [rotator, radLine, angle, sec, tan, sin, cos, tanLabel, sinLabel, cosLabel, radLineLabel, sec1, angle2, xSec, f1Label, bowString, bowStringLabel, cosLabelEqn] = circle.getElements(['rotator', 'line', 'angle', 'sec', 'tan', 'sin', 'cos', 'tanLabel', 'sinLabel', 'cosLabel', 'lineLabel', 'sec1', 'angle2', 'xSec', 'f1Label', 'bowString', 'bowStringLabel', 'cosLabelEqn']);
  const [cot, cotLabel, csc, secLabel, secLabel1, cscLabel, rightAngle1, rightAngle2, compAngle, compAngle2, rightAngle3, rightAngle4, tanAltEqn, secAltEqn, rightAngle5, cotAltEqn, angle3, cscAltEqn] = circle.getElements(['cot', 'cotLabel', 'csc', 'secLabel', 'secLabel1', 'cscLabel', 'rightAngle1', 'rightAngle2', 'compAngle', 'compAngle2', 'rightAngle3', 'rightAngle4', 'tanAltEqn', 'secAltEqn', 'rightAngle5', 'cotAltEqn', 'angle3', 'cscAltEqn']);
  const [tanAlt, tanLabelAlt] = circle.getElements(['tanAlt', 'tanLabelAlt']);
  const [secAlt, secLabelAlt] = circle.getElements(['secAlt', 'secLabelAlt']);
  const [cotAlt, cotLabelAlt] = circle.getElements(['cotAlt', 'cotLabelAlt']);
  const [cscAlt, cscLabelAlt] = circle.getElements(['cscAlt', 'cscLabelAlt']);
  const xBounds = 1.3;
  const yBounds = 0.9;
  const rightBounds = new Fig.Line([radius + xBounds, 0], radius + xBounds, Math.PI / 2);
  const topBounds = new Fig.Line([0, radius + yBounds], radius + xBounds, 0);

  const updateAlt = (r, tangent, secant, cotangent, cosecant, offset = 0) => {
    const x = radius * Math.cos(r);
    const y = radius * Math.sin(r);
    if (tangent.isShown) {
      const tanLine = new Fig.Line(
        [radius, 0], [radius, Math.min(radius * Math.tan(r), topBounds.p1.y)],
      );
      tangent.custom.updatePoints({
        p1: tanLine.p1._dup().add(0.007, 0),
        p2: tanLine.p2._dup().add(0.007, 0),
        arrow: tanLine.p2.y > topBounds.p1.y - 0.01 ? { end: { head: 'barb', scale: 0.8 } } : null,
      });
      if (tanLabelAlt.isShown) {
        tanLabelAlt.setPosition(radius + 0.12, tanLine.p2.y / 2);
      }
      if (tanAltEqn.isShown) {
        tanAltEqn.setPosition(radius + 0.036, tanLine.p2.y / 2 - 0.046);
      }
      const secLength = y > 0.001 ? tanLine.p2.y / Math.sin(r) : radius;
      const secLine = new Fig.Line([0, 0], secLength, r);
      secant.custom.updatePoints({
        p1: [0, 0],
        length: secLength,
        angle: r,
        arrow: tanLine.p2.y > topBounds.p1.y - 0.01 ? { end: { head: 'barb', scale: 0.8 } } : null,
      });
      if (cosecant.isShown) {
        const secLabelAltPos = secLine.offset('negative', 0.12).pointAtPercent(0.45 + r / (Math.PI / 2) * 0.4);
        if (r < 0.7) {
          secLabelAlt.setPosition(
            Math.max(secLabelAltPos.x, radius * 0.65), Math.max(secLabelAltPos.y, -0.07),
          );
        } else {
          secLabelAlt.setPosition(secLabelAltPos);
        }
      } else {
        secLabelAlt.setPosition(secLine.offset('positive', 0.12).pointAtPercent(0.5));
      }
      if (rightAngle4.isShown) {
        if (x > radius - 0.15) {
          rightAngle4.setOpacity(0);
        } else {
          rightAngle4.setOpacity(1);
          rightAngle4.setAngle({
            position: [radius, 0], startAngle: Math.PI / 2, angle: Math.PI / 2,
          });
        }
      }
      if (secAltEqn.isShown) {
        secAltEqn.setPosition(secLine.offset('positive', 0.05).pointAtPercent(0.5).add(0.043, 0.023));
      }
    }
    if (cotangent.isShown) {
      const cotLine = new Fig.Line(
        [0, radius], [Math.min(radius / Math.tan(r), rightBounds.p1.x), radius],
      );
      cotangent.custom.updatePoints({
        p1: cotLine.p1._dup().add(0, 0.007),
        p2: cotLine.p2._dup().add(0, 0.007),
        arrow: cotLine.p2.x > rightBounds.p1.x - 0.01 ? { end: { head: 'barb', scale: 0.8 } } : null,
      });
      cotLabelAlt.setPosition(Math.max(cotLine.p2.x / 2, 0.1), radius + 0.1);
      if (cosecant.isShown) {
        const cscLength = cotLine.p2.x / Math.cos(r);
        const cscLine = new Fig.Line([0, 0], cscLength, r);
        cosecant.custom.updatePoints({
          p1: [0, offset],
          length: cscLength,
          angle: r,
          arrow: cotLine.p2.x > rightBounds.p1.x - 0.01 ? { end: { head: 'barb', scale: 0.8 } } : null,
        });
        if (secLabelAlt.isShown) {
          cscLabelAlt.setPosition(cscLine.offset('positive', 0.12).pointAtPercent(0.7));
        } else {
          cscLabelAlt.setPosition(cscLine.offset('negative', 0.12).pointAtPercent(0.7));
        }
      }
      if (cscAltEqn.isShown) {
        const cscLength = cotLine.p2.x / Math.cos(r);
        const cscLine = new Fig.Line([0, 0], cscLength, r);
        cscAltEqn.setPosition(cscLine.offset('negative', 0.084).pointAtPercent(0.663));
      }
      if (cotAltEqn.isShown) {
        cotAltEqn.setPosition(cotLine.p2.x / 2, radius + 0.052);
      }
      if (rightAngle5.isShown) {
        if (x < radius * 0.2) {
          rightAngle5.setOpacity(0);
        } else {
          rightAngle5.setOpacity(1);
          rightAngle5.setAngle({
            position: [0, radius], startAngle: 3 * Math.PI / 2, angle: Math.PI / 2,
          });
        }
      }
      if (angle3.isShown && cotLine.p2.x > 0.4 && cotLine.p2.x < rightBounds.p1.x) {
        angle3.setOpacity(1);
        angle3.setAngle({ startAngle: Math.PI, angle: r, position: cotLine.p2.add(-0.01, 0.01) });
      } else {
        angle3.setOpacity(0);
      }
    }
  };

  function updateCircle() {
    const r = rotator.transform.r();
    const x = radius * Math.cos(r);
    const y = radius * Math.sin(r);

    // Theta angle
    if (angle.isShown) {
      if (
        (cos.isShown && r < Math.PI / 2 - 0.15)
        || !cos.isShown
      ) {
        angle.setAngle({ angle: r });
        angle.setOpacity(1);
      } else {
        angle.setOpacity(0);
      }
      if (r > 0.3) {
        angle._label.setOpacity(1);
      } else {
        angle._label.setOpacity(0);
      }
    }
    if (radLine.isShown) {
      radLine.setRotation(r);
    }

    // if (bow.isShown) {
    //   bow.setAngle({ angle: r * 2, startAngle: -r });
    // }

    // Theta Complement
    if (compAngle.isShown) {
      let curvePosition = 0.65;
      if (r > Math.PI / 2 - 0.8) {
        curvePosition = (r - (Math.PI / 2 - 0.8)) + 0.65;
      }
      compAngle.setAngle({ startAngle: r, angle: Math.PI / 2 - r });
      if (r > Math.PI / 2 - 0.3) {
        compAngle._label.hide();
      } else {
        compAngle.label.curvePosition = curvePosition;
        compAngle._label.showAll();
      }
    }

    // Theta Complement 2
    if (compAngle2.isShown) {
      let curvePosition = 0.65;
      if (r > Math.PI / 2 - 0.8) {
        curvePosition = (r - (Math.PI / 2 - 0.8)) + 0.65;
      }
      compAngle2.setAngle({ position: [x, y], startAngle: r + Math.PI, angle: Math.PI / 2 - r });
      if (r > Math.PI / 2 - 0.3 || r < 0.25) {
        compAngle2._label.hide();
      } else {
        compAngle2.label.curvePosition = curvePosition;
        compAngle2._label.showAll();
      }
      if (r < 0.25) {
        compAngle2._curve.hide();
      } else {
        compAngle2._curve.showAll();
      }
    }

    if (tan.isShown) {
      const idealTanLine = new Fig.Line([x, y], [radius / Math.cos(r), 0]);
      let tanLineIntersect;
      if (r <= 0.001) {
        tanLineIntersect = new Fig.Point(radius, -0.0001);
      } else if (r >= Math.PI / 2 * 0.999) {
        tanLineIntersect = new Fig.Point(xBounds + radius, radius);
      } else {
        tanLineIntersect = rightBounds.intersectsWith(idealTanLine).intersect;
      }
      const tanLine = new Fig.Line(
        [x, y],
        [
          Math.min(tanLineIntersect.x || radius, idealTanLine.p2.x),
          Math.max(-0.0001, tanLineIntersect.y),
        ],
      );
      tan.custom.updatePoints({
        p1: tanLine.p1._dup(),
        p2: tanLine.p2._dup(),
        arrow: tanLine.p2.y > 0.01 ? { end: { head: 'barb', scale: 0.8 } } : null,
      });
      if (sec1.isShown) {
        sec1.custom.updatePoints({
          p1: [0, 0.0],
          p2: [tanLine.p2.x, 0.0],
          arrow: tanLine.p2.y > 0.01 ? { end: { head: 'barb', scale: 0.8 } } : null,
        });
      }
      tanLabel.setPosition(tanLine.offset('positive', 0.12).midPoint());
      if (sec.isShown) {
        sec.custom.updatePoints({
          p1: [0, -0.25],
          p2: [tanLine.p2.x, -0.25],
          arrow: {
            scale: 0.8,
            start: { head: 'bar' },
            end: { head: tanLine.p2.y > 0.01 ? 'barb' : 'bar' },
          },
        });
      }
      if (xSec.isShown) {
        xSec.custom.updatePoints({
          p1: [0, 0],
          p2: [tanLine.p2.x, 0],
          arrow: tanLine.p2.y > 0.01 ? { end: { head: 'barb', scale: 1.5 } } : null,
        });
      }
      if (secLabel.isShown) {
        secLabel.setPosition(tanLine.p2.x / 2, -0.2);
      }
      if (rightAngle2.isShown && r > 0.2) {
        rightAngle2.setOpacity(1);
        rightAngle2.setAngle({ p1: [0, 0], p2: [x, y], p3: tanLine.p2._dup() });
      } else {
        rightAngle2.setOpacity(0);
      }
      if (secLabel1.isShown) {
        secLabel1.setPosition(tanLine.p2.x / 2, -0.07);
      }
    }
    updateAlt(r, tanAlt, secAlt, cotAlt, cscAlt, altOffset);
    if (cot.isShown) {
      const idealCotLine = new Fig.Line([x, y], [0, radius / Math.sin(r)]);
      let cotLineIntersect;
      if (r >= Math.PI / 2 * 0.999) {
        cotLineIntersect = new Fig.Point(-0.0001, radius);
      } else if (r <= 0.001) {
        cotLineIntersect = new Fig.Point(radius, yBounds + radius);
      } else {
        cotLineIntersect = topBounds.intersectsWith(idealCotLine).intersect;
      }
      const cotLine = new Fig.Line(
        [x, y],
        [
          Math.max(-0.0001, cotLineIntersect.x),
          Math.min(cotLineIntersect.y || radius, idealCotLine.p2.y),
        ],
      );
      // console.log(cotLine)
      cot.custom.updatePoints({
        p1: cotLine.p1._dup(),
        p2: cotLine.p2._dup(),
        arrow: cotLine.p2.x > 0.01 ? { end: { head: 'barb', scale: 0.8 } } : null,
      });
      cotLabel.setPosition(cotLine.offset('negative', 0.12).midPoint());
      csc.custom.updatePoints({
        p1: [0, 0],
        p2: [0, cotLine.p2.y],
        arrow: cotLine.p2.x > 0.01 ? { end: { head: 'barb', scale: 0.8 } } : null,
      });
      cscLabel.setPosition(-0.14, cotLine.p2.y / 2 * 1.2);
      if (angle2.isShown && cotLine.p2.x < 0.01 && r < Math.PI / 2 - 0.2) {
        angle2.setOpacity(1);
        angle2.setAngle({ startAngle: Math.PI / 2 * 3, angle: r, position: cotLine.p2 });
      } else {
        angle2.setOpacity(0);
      }
      if (rightAngle3.isShown && r < Math.PI / 2 - 0.1) {
        rightAngle3.setOpacity(1);
        rightAngle3.setAngle({ p1: cotLine.p2, p2: [x, y], p3: [0, 0] });
      } else {
        rightAngle3.setOpacity(0);
      }
    }

    if (sin.isShown) {
      sin.custom.updatePoints({ p1: [x, 0], p2: [x, y] });
    }
    if (cos.isShown) {
      cos.custom.updatePoints({ p1: [0, 0], p2: [x + 0.013 / 2, 0] });
    }
    if (bowString.isShown) {
      bowString.custom.updatePoints({ p1: [x, -y], p2: [x, y] });
    }
    if (sinLabel.isShown) {
      sinLabel.setPosition([
        x < radius * 0.8 || (!tan.isShown && !tanAlt.isShown) ? x + 0.12 : x - 0.12,
        Math.max(0.08, y / 2) - 0.06,
      ]);
    }
    if (f1Label.isShown) {
      f1Label.setPosition([
        x < radius * 0.3 || (!tan.isShown && !tanAlt.isShown) ? x + 0.12 : x - 0.12,
        Math.max(0.06, y / 2) - 0.06,
      ]);
    }
    if (bowStringLabel.isShown) {
      bowStringLabel.setPosition(x + 0.04, Math.max(0.06, y / 2) - 0.06);
    }
    if (cosLabel.isShown) {
      cosLabel.setPosition([x / 2 - 0.1, -0.05]);
    }
    if (cosLabelEqn.isShown) {
      cosLabelEqn.setPosition([x / 2 - 0.1, -0.05]);
    }
    radLineLabel.setPosition([x / 2.2 - 0.02, y / 2.2 + 0.02]);
    if (rightAngle1.isShown && r < Math.PI / 2 - 0.3 && r > 0.2) {
      rightAngle1.setOpacity(1);
      rightAngle1.setAngle({ p1: [x, y], p2: [x, 0], p3: [0, 0] });
    } else {
      rightAngle1.setOpacity(0);
    }

    const a = Fig.tools.math.round(r * 180 / Math.PI, 0) * Math.PI / 180;
    const sinA = Math.sin(a);
    const cosA = Math.cos(a);
    const eqn = figure.getElement('eqn');
    if (eqn.getElement('value1').isShown) {
      eqn.updateElementText({
        value1: sinA.toFixed(4),
        value2: cosA.toFixed(4),
        value3: sinA / cosA > 100 ? '\u221e' : (sinA / cosA).toFixed(4),
        value4: 1 / cosA > 100 ? '\u221e' : (1 / cosA).toFixed(4),
        value5: cosA / sinA > 100 ? '\u221e' : (cosA / sinA).toFixed(4),
        value6: 1 / sinA > 100 ? '\u221e' : (1 / sinA).toFixed(4),
      });
    }
    const eqn2 = figure.getElement('eqn2');
    if (eqn2.getElement('val1').isShown) {
      eqn2.updateElementText({
        val1: sinA.toFixed(4),
        val2: cosA.toFixed(4),
        val3: sinA / cosA > 100 ? '\u221e' : (sinA / cosA).toFixed(4),
        val4: 1 / cosA > 100 ? '\u221e' : (1 / cosA).toFixed(4),
        val5: cosA / sinA > 100 ? '\u221e' : (cosA / sinA).toFixed(4),
        val6: 1 / sinA > 100 ? '\u221e' : (1 / sinA).toFixed(4),
      });
    }
  }
  rotator.fnMap.add('updateCircle', () => updateCircle());
  figure.fnMap.global.add('circSetAngle', (r) => {
    rotator.setRotation(r);
    updateCircle();
  });
  figure.fnMap.global.add('circGoToAngle', () => {
    rotator.animations.new()
      .rotation({ target: defaultAngle, velocity: 1 })
      .start();
  });
  figure.fnMap.global.add('circGrowRadius', () => {
    rotator.showAll();
    rotator.setRotation(Math.PI / 6)
    rotator.animations.new()
      .length({ start: 0, target: radius, duration: 1.5 })
      .then(circle.getElement('rightAngle2').animations.dissolveIn(0.5))
      .start();
  });

  const addPulseFn = (name, element, xAlign, yAlign) => {
    figure.fnMap.global.add(name, () => element.pulse({ xAlign, yAlign }));
  };
  addPulseFn('circPulseTan', tanLabel, 'left', 'bottom');
  addPulseFn('circPulseCot', cotLabel, 'left', 'bottom');
  addPulseFn('circPulseRad', radLineLabel, 'right', 'bottom');
  addPulseFn('circPulseSec1', secLabel1, 'center', 'top');
  addPulseFn('circPulseSec', secLabel, 'center', 'bottom');
  addPulseFn('circPulseCsc', cscLabel, 'right', 'middle');
  addPulseFn('circPulseSin1', sinLabel, 'left', 'middle');
  addPulseFn('circPulseSin', sinLabel, 'right', 'middle');
  addPulseFn('circPulseCos', cosLabel, 'center', 'top');

  figure.fnMap.global.add('circAltColorsToSides', () => {
    tanAlt.setColor(colOpp);
    tanLabelAlt.setColor(colOpp);
    secAlt.setColor(colHyp);
    secLabelAlt.setColor(colHyp);
    cotAlt.setColor(colAdj);
    cotLabelAlt.setColor(colAdj);
    cscLabelAlt.setColor(colHyp);
    cscAlt.setColor(colHyp);
  });

  figure.fnMap.global.add('circAltColorsReset', () => {
    tanAlt.setColor(colTan);
    tanLabelAlt.setColor(colTan);
    secAlt.setColor(colSec);
    secLabelAlt.setColor(colSec);
    cotAlt.setColor(colCot);
    cotLabelAlt.setColor(colCot);
    cscAlt.setColor(colCsc);
    cscLabelAlt.setColor(colCsc);
  });

  const addPulseAngleFn = (name, element) => {
    figure.fnMap.global.add(name, () => element.pulseAngle({
      duration: 1, curve: { scale: 2 }, label: { scale: 2 },
    }));
  };
  addPulseAngleFn('circPulseTheta', angle);
  addPulseAngleFn('circPulseComp', compAngle);
  addPulseAngleFn('circPulseTheta2', angle2);
  figure.fnMap.global.add('circPulseTheta', () => angle.pulseAngle({ duration: 1, curve: { scale: 2 }, label: { scale: 2 } }));

  figure.fnMap.global.add('circTangentMove', () => {
    tan.animations.new()
      .position({
        start: [0.5, 0.5],
        target: [0, 0],
        duration: 2,
      })
      .start();
    cot.animations.new()
      .position({
        start: [0.5, 0.5],
        target: [0, 0],
        duration: 2,
      })
      .start();
  })
  rotator.notifications.add('setTransform', 'updateCircle');
}
