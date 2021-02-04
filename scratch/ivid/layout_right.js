/* eslint-disable camelcase */
/* globals figure, color1, color2, color3, color4, colGrey */

// function layoutRightLegacy() {
//   const [rightTri] = figure.add({
//     name: 'rightTri',
//     method: 'collection',
//     elements: [
//       {
//         name: 'tri',
//         method: 'collections.polyline',
//         options: {
//           points: [[-1, -1], [1, 0], [1, -1]],
//           width: 0.01,
//           close: true,
//           pad: {
//             radius: 0.05,
//             show: '1',
//             color: [1, 0.7, 0.2, 1],
//           },
//           angle: [
//             {
//               curve: null,
//               label: { text: '', scale: 0.6 },
//               color: [0, 0, 0, 0],
//             },
//             { curve: { radius: 0.2, width: 0.006, autoRightAngle: true }, label: '' },
//             {
//               curve: {
//                 radius: 0.2, width: 0.006,
//               },
//               label: { text: null, scale: 0.6, offset: 0.02 },
//               color: color1,
//             },
//           ],
//           side: [
//             { label: { text: null, precision: 3 } },
//             { label: { text: null, precision: 3 } },
//             { label: '' },
//           ],
//           makeValid: {
//             shape: 'triangle',
//           },
//         },
//       },
//       {
//         name: 'movePad',
//         method: 'primitives.polygon',
//         options: {
//           radius: 0.4,
//           sides: 8,
//           width: 0.013,
//           color: [0, 0, 0, 0],
//         },
//         mods: {
//           move: {
//             bounds: {
//               translation: {
//                 left: -0.2, right: 1.5, top: 0.5, bottom: -0.8,
//               },
//             },
//           },
//           isMovable: true,
//           touchBorder: 0.3,
//         },
//       },
//     ],
//     options: {
//       position: [0, 0],
//     },
//   });
//   const [tri, movePad] = rightTri.getElements(['tri', 'movePad']);
//   movePad.subscriptions.add('setTransform', () => {
//     const p = movePad.transform.t();
//     tri.updatePoints(
//       [[-1, -1], [p.x, p.y], [p.x, -1]],
//     );
//     const a0 = tri._angle2.angle;
//     if (a0 < 0.3) {
//       tri._angle2.label.location = 'end';
//     } else {
//       tri._angle2.label.location = 'outside';
//     }
//     tri._side20.hide();
//     // const [oppValue, hypValue, ratioValue] = figure.getElements(
//     //   ['eqn.oppValue', 'eqn.hypValue', 'eqn.ratioValue'],
//     // );
//     const eqn = figure.getElement('eqn');

//     const opp = parseFloat(tri._side12.getLabel());
//     const hyp = parseFloat(tri._side01.getLabel());
//     eqn.updateElementText({
//       oppValue: tri._side12.getLabel(),
//       hypValue: tri._side01.getLabel(),
//       ratioValue: Fig.tools.math.round(opp / hyp, 3).toFixed(3),
//     });
//     // oppValue.custom.updateText(tri._side01.getLabel());
//     // console.log(oppValue, figure.elements._eqn)
//   });
//   movePad.setPosition(1, 1);
// }

function layoutRight() {
  const [rightTri] = figure.add({
    name: 'rightTri',
    method: 'collection',
    elements: [
      {
        name: 'x',
        method: 'primitives.line',
        options: {
          length: 0.3,
          width: 0.006,
          dash: [0.01, 0.006],
          color: colGrey,
        },
      },
      {
        name: 'tri',
        method: 'collections.polyline',
        options: {
          points: [[0, 0], [1, 1], [1, 0]],
          width: 0.008,
          close: true,
          // pad: {
          //   radius: 0.05,
          //   show: '1',
          //   color: [1, 0.7, 0.2, 1],
          // },
          angle: [
            {
              curve: null,
              label: { text: '', scale: 0.6 },
              color: [0, 0, 0, 0],
            },
            {
              curve: {
                radius: 0.18,
                width: 0.006,
                autoRightAngle: true,
                // autoHide: 0.2,
                // autoHideMax: 1.4,
              },
              label: '',
            },
            {
              curve: {
                radius: 0.2, width: 0.006,
              },
              label: { text: null, scale: 0.6, offset: 0.02 },
              color: color1,
            },
          ],
          side: [
            { label: { text: '1' } },
            { label: { text: '0.0000', precision: 3 } },
            { label: '' },
          ],
          // makeValid: {
          //   shape: 'triangle',
          // },
        },
      },
      {
        name: 'rotLine',
        method: 'primitives.line',
        options: {
          length: 2.3,
          width: 0.5,
          color: [1, 0, 0, 0],
        },
        mods: {
          move: {
            type: 'rotation',
            bounds: {
              rotation: {
                min: 0.0001, max: Math.PI / 2,
              },
            },
          },
          isMovable: true,
          touchBorder: 0.3,
        },
      },
    ],
    mods: {
      scenarios: {
        default: { position: [-0.2, -0.5] },
        bottom: { position: [-0.5, -0.8] },
      },
    },
  });
  const [tri, rotLine, xLine] = rightTri.getElements(['tri', 'rotLine', 'x']);
  const radius = Math.sqrt(1.8 ** 2 + 0.9 ** 2);
  rotLine.subscriptions.add('setTransform', () => {
    const r = rotLine.getRotation();
    const x = radius * Math.cos(r);
    const y = radius * Math.sin(r);
    tri.updatePoints([
      [0, 0], [x, y], [x, 0],
    ]);
    const a = Fig.tools.math.round(r * 180 / Math.PI, 0) * Math.PI / 180;
    const sin = Math.sin(a)
    tri._side12.setLabel(sin.toFixed(4));
    if (r < 0.3 || r > 1.4) {
      tri._angle2.label.location = 'start';
      xLine.show();
    } else {
      tri._angle2.label.location = 'outside';
      xLine.hide();
    }
    if (r < 0.1 || r > 1.35) {
      tri._angle1.hide();
    } else {
      tri._angle1.show();
    }
    const eqn = figure.getElement('eqn');

    eqn.updateElementText({
      ratioValue: sin.toFixed(4),
    });

    figure.fnMap.global.add('rotateTri', () => {
      rotLine.animations.new()
        .rotation({ target: Math.PI / 4, duration: 1 })
        .start();
    });
  });
  rotLine.setRotation(1);
  // const [tri, movePad] = rightTri.getElements(['tri', 'movePad']);
  // movePad.subscriptions.add('setTransform', () => {
  //   const p = movePad.transform.t();
  //   tri.updatePoints(
  //     [[-1, -1], [p.x, p.y], [p.x, -1]],
  //   );
  //   const a0 = tri._angle2.angle;
  //   if (a0 < 0.3) {
  //     tri._angle2.label.location = 'end';
  //   } else {
  //     tri._angle2.label.location = 'outside';
  //   }
  //   tri._side20.hide();
  //   // const [oppValue, hypValue, ratioValue] = figure.getElements(
  //   //   ['eqn.oppValue', 'eqn.hypValue', 'eqn.ratioValue'],
  //   // );
  //   const eqn = figure.getElement('eqn');

  //   const opp = parseFloat(tri._side12.getLabel());
  //   const hyp = parseFloat(tri._side01.getLabel());
  //   eqn.updateElementText({
  //     oppValue: tri._side12.getLabel(),
  //     hypValue: tri._side01.getLabel(),
  //     ratioValue: Fig.tools.math.round(opp / hyp, 3).toFixed(3),
  //   });
  //   // oppValue.custom.updateText(tri._side01.getLabel());
  //   // console.log(oppValue, figure.elements._eqn)
  // });
  // movePad.setPosition(1, 1);
}
