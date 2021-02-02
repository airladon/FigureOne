/* eslint-disable camelcase */
/* globals figure, color1, color2, color3, color4, colGrey */

function layoutRight() {
  const [rightTri] = figure.add({
    name: 'rightTri',
    method: 'collection',
    elements: [
      {
        name: 'tri',
        method: 'collections.polyline',
        options: {
          points: [[-1, -1], [1, 0], [1, -1]],
          width: 0.01,
          close: true,
          pad: {
            radius: 0.05,
            show: '1',
            color: [1, 0.7, 0.2, 1],
          },
          angle: [
            {
              curve: null,
              label: { text: '', scale: 0.6 },
              color: [0, 0, 0, 0],
            },
            { curve: { radius: 0.2, width: 0.006, autoRightAngle: true }, label: '' },
            {
              curve: {
                radius: 0.2, width: 0.006,
              },
              label: { text: null, scale: 0.6, offset: 0.02 },
              color: color1,
            },
          ],
          side: [
            { label: { text: null, precision: 2 } },
            { label: { text: null, precision: 2 } },
            { label: '' },
          ],
          makeValid: {
            shape: 'triangle',
          },
        },
      },
      {
        name: 'movePad',
        method: 'primitives.polygon',
        options: {
          radius: 0.4,
          sides: 8,
          width: 0.013,
          color: [0, 0, 0, 0],
        },
        mods: {
          move: {
            bounds: {
              translation: {
                left: -0.2, right: 1.5, top: 0.5, bottom: -0.8,
              },
            },
          },
          isMovable: true,
          touchBorder: 0.3,
        },
      },
    ],
    options: {
      position: [0, 0],
    },
  });
  const [tri, movePad] = rightTri.getElements(['tri', 'movePad']);
  movePad.subscriptions.add('setTransform', () => {
    const p = movePad.transform.t();
    tri.updatePoints(
      [[-1, -1], [p.x, p.y], [p.x, -1]],
    );
    const a0 = tri._angle2.angle;
    if (a0 < 0.3) {
      tri._angle2.label.location = 'end';
    } else {
      tri._angle2.label.location = 'outside';
    }
    tri._side20.hide();
  });
  movePad.setPosition(1, 1);
}
