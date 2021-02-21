/* eslint-disable camelcase */
/* globals figure, color1, color2, color3, color4, colGrey */


function layoutRight() {
  const sideLabel = (value, name, name2, color = color2) => ({
    label: {
      text: {
        color,
        elements: {
          v: value,
          n: name,
          n2: { text: name2, font: { style: 'normal' } },
        },
        forms: {
          value: 'v',
          name: 'n',
          name2: 'n2',
        },
      },
    },
  });
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
          angle: [
            // {
            //   curve: null,
            //   label: { text: '', scale: 0.6 },
            //   color: [0, 0, 0, 0],
            // },
            {
              curve: {
                radius: 0.3, width: 0.006,
              },
              label: {
                text: {
                  elements: {
                    deg: '\u00b0',
                    min: '\u2212',
                    theta: '\u03b8',
                  },
                  forms: {
                    name: ['90', 'deg', 'min', 'theta'],
                  },
                },
                scale: 0.6,
                offset: 0.02,
                curvePosition: 0.65,
              },
              color: colTheta,
            },
            {
              curve: {
                radius: 0.18,
                width: 0.006,
                autoRightAngle: true,
              },
              label: '',
            },
            {
              curve: {
                radius: 0.3, width: 0.006,
              },
              label: {
                text: {
                  elements: {
                    v: '0\u00b0',
                    n: '\u03b8',
                  },
                  forms: {
                    value: 'v',
                    name: 'n',
                  },
                },
                scale: 0.8,
                offset: 0.02,
              },
              color: colTheta,
            },
          ],
          side: [
            sideLabel('1', 'hypotenuse', 'hypotenuse', colRad),
            sideLabel('0.0000', 'opposite', 'sin', colSin),
            sideLabel('0.0000', 'adjacent', 'cos', colCos),
          ],
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
        default: { position: [-0.8, -0.9] },
        bottom: { position: [0, -0.8] },
        eqnTri: { position: [0.3, -0.8] },
        eqnTri1: { position: [-2.1, -0.8] },
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
    const sin = Math.sin(a);
    const cos = Math.cos(a);

    if (tri._side12.label.eqn.getCurrentForm().name === 'value') {
      tri._side12.label.eqn.updateElementText({ v: sin.toFixed(4) }, 'none');
    }
    if (tri._side20.label.eqn.getCurrentForm().name === 'value') {
      tri._side20.label.eqn.updateElementText({ v: cos.toFixed(4) }, 'none');
    }
    if (tri._angle2.label.eqn.getCurrentForm().name === 'value') {
      tri._angle2.label.eqn.updateElementText({ v: `${Fig.tools.math.round(r * 180 / Math.PI, 0)}\u00b0` });
    }

    if (r < 0.3 || r > 1.34) {
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

    if (eqn.getElement('value1').isShown) {
      eqn.updateElementText({
        value1: sin.toFixed(4),
        value2: cos.toFixed(4),
        value3: sin / cos > 100 ? '\u221e' : (sin / cos).toFixed(4),
        value4: 1 / cos > 100 ? '\u221e' : (1 / cos).toFixed(4),
        value5: cos / sin > 100 ? '\u221e' : (cos / sin).toFixed(4),
        value6: 1 / sin > 100 ? '\u221e' : (1 / sin).toFixed(4),
      });
    }
    const eqn3 = figure.getElement('eqn3');
    if (eqn3.getElement('val7').isShown) {
      eqn3.updateElementText({
        val7: sin.toFixed(4),
        val8: cos.toFixed(4),
        val9: sin / cos > 100 ? '\u221e' : (sin / cos).toFixed(4),
        val10: 1 / cos > 100 ? '\u221e' : (1 / cos).toFixed(4),
        val11: cos / sin > 100 ? '\u221e' : (cos / sin).toFixed(4),
        val12: 1 / sin > 100 ? '\u221e' : (1 / sin).toFixed(4),
      });
    }

    figure.fnMap.global.add('rotateTri', () => {
      rotLine.animations.new()
        .rotation({ target: Math.PI / 4, duration: 1 })
        .start();
    });
  });

  const [side01, side12, side20, angle2] = tri.getElements(['side01', 'side12', 'side20', 'angle2']);

  const sidesShowForm = (form) => {
    side01.label.eqn.showForm(form);
    side12.label.eqn.showForm(form);
    side20.label.eqn.showForm(form);
  };
  const angleShowForm = (form) => {
    angle2.label.eqn.showForm(form);
  };

  const animateToNames = () => {
    tri.animations.new()
      .inParallel([
        side01.animations.dissolveOut(0.8),
        side12.animations.dissolveOut(0.8),
        side20.animations.dissolveOut(0.8),
        angle2._label.animations.dissolveOut(0.8),
      ])
      .trigger(() => {
        sidesShowForm('name');
        angleShowForm('name');
        rotLine.setPosition(rotLine.getPosition());
      })
      .inParallel([
        side01.animations.dissolveIn(0.8),
        side12.animations.dissolveIn(0.8),
        side20.animations.dissolveIn(0.8),
        angle2._label.animations.dissolveIn(0.8),
      ])
      .start();
  };
  const animateToValues = () => {
    tri.animations.new()
      .inParallel([
        side01.animations.dissolveOut(0.4),
        side12.animations.dissolveOut(0.4),
        side20.animations.dissolveOut(0.4),
        angle2._label.animations.dissolveOut(0.4),
      ])
      .trigger(() => {
        sidesShowForm('value');
        angleShowForm('value');
        rotLine.setPosition(rotLine.getPosition());
      })
      .inParallel([
        side01.animations.dissolveIn(0.4),
        side12.animations.dissolveIn(0.4),
        side20.animations.dissolveIn(0.4),
        angle2._label.animations.dissolveIn(0.4),
      ])
      .start();
  };
  const toNames = () => {
    sidesShowForm('name');
    angleShowForm('name');
    rotLine.setPosition(rotLine.getPosition());
  };
  const toValues = () => {
    sidesShowForm('value');
    angleShowForm('value');
    rotLine.setPosition(rotLine.getPosition());
  };
  const pulseAngle = element => element.pulseAngle({
    curve: { scale: 1.7 }, label: { scale: 1.7 }, duration: 1,
  });
  const pulseRight = () => tri.getElement('angle1').pulse({ xAlign: 'right', yAlign: 'bottom', scale: 1.7 });
  const pulseOpp = () => tri.getElement('side12.label').pulse({ xAlign: 'left', scale: 1.5 });
  const pulseHyp = () => tri.getElement('side01.label').pulse({ xAlign: 'right', yAlign: 'bottom', scale: 1.5 });
  const pulseAdj = () => tri.getElement('side20.label').pulse({ yAlign: 'top', scale: 1.5 });

  // const animateToRot = (target) => radLine.animations.new().rotation({ target, duration: 1 });

  figure.fnMap.global.add('triToSin', () => {
    rightTri._tri._side12._label.showForm('name2');
    rotLine.setPosition(rotLine.getPosition());
  });
  figure.fnMap.global.add('triAnimateToNames', animateToNames.bind(this));
  figure.fnMap.global.add('triAnimateToValues', animateToValues.bind(this));
  figure.fnMap.global.add('triToNames', toNames.bind(this));
  figure.fnMap.global.add('triToValues', toValues.bind(this));
  figure.fnMap.global.add('triPulseTheta', () => pulseAngle(angle2));
  figure.fnMap.global.add('triPulseRight', () => pulseRight());
  figure.fnMap.global.add('triPulseOpp', () => pulseOpp());
  figure.fnMap.global.add('triPulseHyp', () => pulseHyp());
  figure.fnMap.global.add('triPulseAdj', () => pulseAdj());
  figure.fnMap.global.add('triToRot', (rot) => {
    rotLine.setRotation(rot);
  });
  figure.fnMap.global.add('triAnimateToRot', () => {
    rotLine.animations.new()
      .rotation({ target: 0.7, duration: 1 })
      .start();
  });
  figure.fnMap.global.add('triPulseAngles', () => {
    pulseAngle(angle2);
    pulseRight();
    pulseAngle(tri.getElement('angle0'));
  });
  rotLine.setRotation(1);
}
