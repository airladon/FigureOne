/* eslint-disable camelcase */
/* globals figure, color1, color2, color3, color4, colGrey */

function layoutCircle1() {

  const line = (name, color) => ({
    name,
    method: 'primitives.line',
    options: { length: 1, width: 0.013, color },
  });
  const lineLabel = (name, text, color) => ({
    name,
    method: 'text',
    options: {
      text,
      font: { family: 'Times New Roman', size: 0.14 },
      color,
      xAlign: 'center',
      yAlign: 'middle',
    },
  });

  const radius = 1.5;
  const colCos = [0, 0, 0.9, 1];
  const colSec = [0, 0.7, 1, 1];
  const colTan = [0, 0.4, 0, 1];
  const colCot = [0, 0.9, 0, 1];
  const colSin = [0.9, 0, 0, 1];
  const colCsc = [1, 0.4, 0, 1];
  const colRad = [1, 0, 1, 1];
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
    ],
    options: {
      position: [-radius / 2, -1.2],
    },
    mods: {
      scenarios: {
        title: { scale: 1 },
        default: { scale: 1 },
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
