/* eslint-disable camelcase */
/* globals figure, color1, color2, color3, color4, colGrey */

function layoutCircle() {
  const radius = 1.5;
  const [circle] = figure.add({
    name: 'circle',
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
      {
        name: 'sec',
        method: 'primitives.line',
        options: {
          length: 1,
          width: 0.006,
          color: colGrey,
        },
      },
      {
        name: 'tan',
        method: 'primitives.line',
        options: {
          length: 1,
          width: 0.013,
          color: color4,
        },
      },
      {
        name: 'tanLabel',
        method: 'text',
        options: {
          text: 'tan',
          font: { family: 'Times New Roman', size: 0.14 },
          color: color4,
          xAlign: 'left',
          yAlign: 'middle',
        },
      },

      {
        name: 'sin',
        method: 'primitives.line',
        options: {
          length: 1,
          width: 0.013,
          color: color3,
          label: { text: 'sin', offset: 0.01 },
          // xAlign: 'center',
        },
      },
      {
        name: 'sinLabel',
        method: 'text',
        options: {
          text: 'sin',
          font: { family: 'Times New Roman', size: 0.14 },
          color: color3,
          xAlign: 'center',
          yAlign: 'middle',
        },
      },
      {
        name: 'cos',
        method: 'primitives.line',
        options: {
          length: 1,
          width: 0.013,
          color: color1,
        },
      },
      {
        name: 'cosLabel',
        method: 'text',
        options: {
          text: 'cos',
          font: { family: 'Times New Roman', size: 0.14 },
          color: color1,
          xAlign: 'center',
          yAlign: 'top',
        },
      },
      {
        name: 'line',
        method: 'line',
        options: {
          length: radius,
          width: 0.013,
          color: color2,
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
          color: color2,
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
  // figure.getElement('circle.angle').setMovable({ endArm: 'angle' });
  const [line, angle, sec, tan, sin, cos, tanLabel, sinLabel, cosLabel, lineLabel] = circle.getElements(['line', 'angle', 'sec', 'tan', 'sin', 'cos', 'tanLabel', 'sinLabel', 'cosLabel', 'lineLabel']);
  const bounds = new Fig.Rect(-radius, -radius - 0.4, radius * 2, radius * 2 + 0.4 * 2);
  line.fnMap.add('updateCircle', () => {
    const r = line.transform.r();
    angle.setAngle({ angle: r });
    const x = radius * Math.cos(r);
    const y = radius * Math.sin(r);
    const i = bounds.intersectsWith([x, y]);
    tan.custom.updatePoints({
      p1: [radius, 0],
      p2: [radius, i.y],
      arrow: i.x < radius - 0.01 ? { end: { head: 'barb', scale: 0.8 } } : null,
    });
    sec.custom.updatePoints({
      p1: [0, 0],
      p2: i,
      arrow: i.x < radius - 0.01 ? { end: { head: 'barb', scale: 1.7 } } : null,
    });
    sin.custom.updatePoints({ p1: [x, 0], p2: [x, y] });
    cos.custom.updatePoints({ p1: [0, 0], p2: [x, 0] });
    tanLabel.setPosition([radius + 0.05, i.y / 2]);
    sinLabel.setPosition([x < radius * 0.3 ? x + 0.12 : x - 0.12, Math.max(0.06, y / 2)]);
    cosLabel.setPosition([x / 2, -0.03]);
    lineLabel.setPosition([x / 2 - 0.02, y / 2 + 0.02]);
  });
  line.notifications.add('setTransform', 'updateCircle');
}
