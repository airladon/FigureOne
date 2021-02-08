/* eslint-disable camelcase */
/* globals figure, color1, color2, color3, color4, colGrey */

function layoutCircle1() {
  const radius = 1.5;
  const colCos = [0, 0, 0.9, 1];
  const colSec = [0, 0.7, 1, 1];
  const colTan = [0, 0.4, 0, 1];
  const colCot = [0, 0.9, 0, 1];
  const colSin = [0.9, 0, 0, 1];
  const colCsc = [1, 0.4, 0, 1];
  const colRad = [1, 0, 1, 1];
  const defaultAngle = 0.45;
  const defaultX = radius * Math.cos(defaultAngle);
  const defaultY = radius * Math.sin(defaultAngle);
  const defaultSec = radius / Math.cos(defaultAngle);

  const line = (name, color, p1 = [0, 0], p2 = [1, 0]) => ({
    name,
    method: 'primitives.line',
    options: {
      p1, p2, width: 0.013, color,
    },
  });
  const lineLabel = (name, text, color, position = [0, 0]) => ({
    name,
    method: 'text',
    options: {
      text,
      font: { family: 'Times New Roman', size: 0.14 },
      color,
      xAlign: 'center',
      yAlign: 'middle',
      position,
    },
  });

  const triangle = (name, p1, p2, p3, col1, col2, col3, start, mid, end, eqn1, eqn2 = {}, eqn3 = {}) => ({
    name,
    method: 'collection',
    elements: [
      line('side1', col1, p1, p2),
      line('side2', col2, p2, p3),
      line('side3', col3, p3, p1),
      {
        name: 'theta',
        method: 'collections.angle',
        options: {
          curve: { radius: 0.2, width: 0.01 },
          label: {
            text: '\u03b8',
            offset: 0.01,
          },
          angle: defaultAngle,
        },
      },
      {
        name: 'rightAngle',
        method: 'collections.angle',
        options: {
          curve: { radius: 0.15, width: 0.006, autoRightAngle: true },
          angle: Math.PI / 2,
          position: p2,
          startAngle: Math.PI / 2,
        },
      },
      {
        name: 'eqn1',
        method: 'equation',
        options: {
          elements: eqn1.elements,
          forms: eqn1.forms,
          position: new Fig.Line(p1, p2).offset('negative', 0.1).midPoint(),
          formDefaults: { alignment: { xAlign: 'center', yAlign: 'middle' } },
        },
      },
      {
        name: 'eqn2',
        method: 'equation',
        options: {
          elements: eqn2.elements,
          forms: eqn2.forms,
          position: new Fig.Line(p2, p3).offset('negative', 0.05).midPoint(),
          formDefaults: { alignment: { xAlign: 'left', yAlign: 'middle' } },
        },
      },
      {
        name: 'eqn3',
        method: 'equation',
        options: {
          elements: eqn3.elements,
          forms: eqn3.forms,
          position: new Fig.Line(p3, p1).offset('negative', 0.05).midPoint(),
          formDefaults: { alignment: { xAlign: 'right', yAlign: 'bottom' } },
        },
      },
    ],
    mods: {
      scenarios: { start, end, mid },
    },
  });

  const bot = (content, comment, symbol = undefined) => ({
    bottomComment: {
      content,
      comment,
      symbol,
      contentSpace: 0.1,
      commentSpace: 0.1,
      inSize: false,
    },
  });

  const top = (content, comment, symbol = undefined) => ({
    topComment: {
      content,
      comment,
      symbol,
      contentSpace: 0.1,
      commentSpace: 0.1,
      inSize: false,
    },
  });

  const frac = (numerator, symbol, denominator, scale = 1) => ({
    frac: { numerator, symbol, denominator, scale },
  });

  const [circle] = figure.add({
    name: 'circle1',
    method: 'collection',
    elements: [
      {
        name: 'x',
        method: 'primitives.line',
        options: {
          p1: [0, 0],
          p2: [radius, 0],
          width: 0.006,
          color: colGrey,
        },
      },
      {
        name: 'y',
        method: 'primitives.line',
        options: {
          p1: [0, 0],
          p2: [0, radius],
          width: 0.006,
          color: colGrey,
        },
      },
      {
        name: 'arc',
        method: 'primitives.polygon',
        options: {
          radius,
          line: { width: 0.006 },
          sides: 100,
          sidesToDraw: 25,
          color: colGrey,
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
        name: 'angle',
        method: 'collections.angle',
        options: {
          curve: {
            width: 0.01,
            color: color1,
            radius: 0.2,
            step: 0.8,
            sides: 400,
            autoHideMax: Math.PI / 2 - 0.15,
          },
          label: {
            text: '\u03b8',
            offset: 0.01,
            autoHideMax: Math.PI / 2 - 0.15,
            autoHide: 0.2,
          },
        },
      },
      line('sec', colSec),
      lineLabel('secLabel', 'sec', colSec),
      line('sin', colSin),
      lineLabel('sinLabel', 'sin', colSin),
      line('cos', colCos),
      lineLabel('cosLabel', 'cos', colCos),
      line('csc', colCsc),
      lineLabel('cscLabel', 'csc', colCsc),
      line('tan', colTan),
      lineLabel('tanLabel', 'tan', colTan),
      line('cot', colCot),
      lineLabel('cotLabel', 'cot', colCot),
      {
        name: 'line',
        method: 'line',
        options: {
          length: radius,
          width: 0.013,
          color: colRad,
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
          color: colRad,
          xAlign: 'right',
          yAlign: 'bottom',
        },
      },
      triangle(
        'sinCos1', [0, 0], [defaultX, 0], [defaultX, defaultY],
        colCos, colSin, colRad,
        { position: [-2.7, 0], scale: 1, rotation: 0 },
        {},
        { position: [0, 0], scale: 1, rotation: 0 },
        {
          elements: { cos: { style: 'normal', color: colCos } },
          forms: { 0: 'cos' },
        },
        {
          elements: { sin: { style: 'normal', color: colSin } },
          forms: { 0: 'sin' },
        },
        {
          elements: { _1: { color: colRad } },
          forms: { 0: '_1' },
        },
      ),
      triangle(
        'tanSec1', [0, 0], [radius, 0], [radius, radius * defaultY / defaultX],
        colRad, colTan, colSec,
        { position: [-2.7, 1.3], scale: [1, 1], rotation: 0 },
        { position: [-0.3, 1.3], scale: [-1, 1], rotation: 0 },
        { position: [0, 0], scale: [-1, 1], rotation: Math.PI + defaultAngle },
        {
          elements: {
            times: { text: ' \u00d7 ' },
            _1: { color: colRad },
            cos: { style: 'normal', color: colCos },
            cos_1: { style: 'normal', color: colCos },
            cos_2: { style: 'normal', color: colCos },
            div1: '\u00f7 ',
            div2: '\u00f7 ',
          },
          forms: {
            scale: {
              content: ['s', 'times', 'cos'],
              alignment: { fixTo: 's', yAlign: 'top', xAlign: 1.5 },
            },
            equals: {
              content: ['s', 'times', 'cos', '_ = ', '_1'],
              alignment: { fixTo: 's', yAlign: 'top', xAlign: 1.5 },
            },
            final: {
              content: {
                lines: {
                  content: [
                    ['s', 'times', 'cos', '_ = ', '_1'],
                    ['_\u2234 ', 's_1', '_ = _1', frac('_1_1', 'vinculum', 'cos_1', 0.8)],
                  ],
                  baselineSpace: 0.25,
                },
              },
              alignment: { fixTo: 's', yAlign: 'top', xAlign: 1.5 },
            },
            // final: {
            //   content: [
            //     's', 'times',
            //     bot('cos', ['div1', 'cos_1']),
            //     '_ = ',
            //     bot('_1', ['div2', 'cos_2']),
            //   ],
            //   alignment: { fixTo: 's', yAlign: 'top', xAlign: 1.5 },
            // },
            // final2: {
            //   content: ['s', '_ = ', { frac: ['_1', 'vinculum', 'cos_2', 0.7] }],
            //   alignment: { fixTo: 's', yAlign: 1.2, xAlign: 1.5 },
            // },
          },
        },
        {
          elements: {
            times: { text: ' \u00d7 ' },
            sin: { style: 'normal', color: colSin },
            cos: { style: 'normal', color: colCos },
            tan: { style: 'normal', color: colTan },
            arrow: { symbol: 'line', arrow: { start: 'triangle' }, width: 0.006 },
          },
          forms: {
            scale: {
              content: ['s', 'times', 'sin'],
              alignment: { fixTo: 's', yAlign: 'middle', xAlign: -0.3 },
            },
            equals: {
              content: ['s', 'times', 'sin', '_ = ', 'tan'],
              alignment: { fixTo: 's', yAlign: 'middle', xAlign: -0.3 },
            },
            final1: {
              content: [bot('s', frac('_1', 'vinculum', 'cos'), 'arrow'), 'times', 'sin', '_ = ', 'tan'],
              alignment: { fixTo: 's', yAlign: 'middle', xAlign: -0.3 },
            },
            final2: {
              content: [frac('_1', 'vinculum', 'cos'), 'times', 'sin', '_ = ', 'tan'],
              alignment: { fixTo: 'vinculum', yAlign: 'middle', xAlign: 'left' },
            },
            final3: {
              content: [frac('sin', 'vinculum', 'cos'), '_ = ', 'tan'],
              alignment: { fixTo: 'vinculum', yAlign: 'middle', xAlign: 'left' },
            },
          },
        },
        {
          elements: {
            _1: { color: colRad },
            cos: { style: 'normal', color: colCos },
            times: { text: ' \u00d7 ' },
            sin: { style: 'normal', color: colSin },
            sec: { style: 'normal', color: colSec },
            arrow: { symbol: 'line', arrow: { start: 'triangle' }, width: 0.006 },
          },
          forms: {
            scale: ['s', 'times', '_1'],
            equals: ['sec', '_ = ', 's', 'times', '_1'],
            final1: ['sec', '_ = ', top('s', frac('_1_1', 'vinculum', 'cos'), 'arrow'), 'times', '_1'],
            final2: ['sec', '_ = ', frac('_1_1', 'vinculum', 'cos'), 'times', '_1'],
            final3: ['sec', '_ = ', frac('_1_1', 'vinculum', 'cos')],
          },
        },
      ),
    ],
    options: {
      position: [-radius / 2, -1.2],
    },
    mods: {
      scenarios: {
        title: { scale: 1 },
        default: { scale: 1 },
        right: { scale: 1, position: [0.5, -1.2] },
      },
    },
  });
  const [radLine, angle, sec, tan, sin, cos, tanLabel, sinLabel, cosLabel, radLineLabel] = circle.getElements(['line', 'angle', 'sec', 'tan', 'sin', 'cos', 'tanLabel', 'sinLabel', 'cosLabel', 'lineLabel']);
  const [cot, cotLabel, csc, xLine, yLine, secLabel, cscLabel, rightAngle1, rightAngle2] = circle.getElements(['cot', 'cotLabel', 'csc', 'x', 'y', 'secLabel', 'cscLabel', 'rightAngle1', 'rightAngle2']);
  const xBounds = 1.5;
  const yBounds = 1;
  const rightBounds = new Fig.Line([radius + xBounds, 0], radius + xBounds, Math.PI / 2);
  const topBounds = new Fig.Line([0, radius + yBounds], radius + xBounds, 0);
  radLine.fnMap.add('updateCircle', () => {
    const r = radLine.transform.r();
    angle.setAngle({ angle: r });
    const x = radius * Math.cos(r);
    const y = radius * Math.sin(r);
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
      xLine.custom.updatePoints({
        p1: [0, 0.0],
        p2: [tanLine.p2.x, 0.0],
        arrow: tanLine.p2.y > 0.01 ? { end: { head: 'barb', scale: 0.013 / 0.006 * 0.8 } } : null,
      });
      tanLabel.setPosition(tanLine.offset('positive', 0.12).midPoint());
      sec.custom.updatePoints({
        p1: [0, -0.25],
        p2: [tanLine.p2.x, -0.25],
        arrow: {
          scale: 0.8,
          start: { head: 'bar' },
          end: { head: tanLine.p2.y > 0.01 ? 'barb' : 'bar' },
        },
      });
      secLabel.setPosition(tanLine.p2.x / 2, -0.2);
      if (r > 0.2) {
        rightAngle2.showAll();
        rightAngle2.setAngle({ p1: [0, 0], p2: [x, y], p3: tanLine.p2._dup() });
      } else {
        rightAngle2.hide();
      }
    }
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
      yLine.custom.updatePoints({
        p1: [0, 0.0],
        p2: [0, cotLine.p2.y],
        arrow: cotLine.p2.x > 0.01 ? { end: { head: 'barb', scale: 0.8 } } : null,
      });
      cotLabel.setPosition(cotLine.offset('negative', 0.12).midPoint());
      csc.custom.updatePoints({
        p1: [-0.1, 0],
        p2: [-0.1, cotLine.p2.y],
        arrow: {
          scale: 0.8,
          start: { head: 'bar' },
          end: { head: cotLine.p2.x > 0.01 ? 'barb' : 'bar' },
        },
      });
      cscLabel.setPosition(-0.25, cotLine.p2.y / 2);
      // if (r < Math.PI / 2 - 0.1 && r > 0.1) {
      //   rightAngle2.showAll();
      //   rightAngle2.setAngle({ p3: [0, 0], p2: [x, y], p1: cotLine.p2._dup() });
      // } else {
      //   rightAngle2.hide();
      // }
    }
    sin.custom.updatePoints({ p1: [x, 0], p2: [x, y] });
    cos.custom.updatePoints({ p1: [0, 0], p2: [x, 0] });
    sinLabel.setPosition([x < radius * 0.3 ? x + 0.12 : x - 0.12, Math.max(0.06, y / 2)]);
    cosLabel.setPosition([x / 2, -0.07]);
    radLineLabel.setPosition([x / 2 - 0.02, y / 2 + 0.02]);
    if (r < Math.PI / 2 - 0.3 && r > 0.2) {
      rightAngle1.showAll();
      rightAngle1.setAngle({ p1: [x, y], p2: [x, 0], p3: [0, 0] });
    } else {
      rightAngle1.hide();
    }
  });
  radLine.subscriptions.add('setTransform', 'updateCircle');
}
