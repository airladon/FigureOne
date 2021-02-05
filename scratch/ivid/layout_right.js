/* eslint-disable camelcase */
/* globals figure, color1, color2, color3, color4, colGrey */


function layoutRight() {
  const sideLabel = (value, name) => ({
    label: {
      text: {
        color: color2,
        elements: {
          v: value,
          n: name,
        },
        forms: {
          value: 'v',
          name: 'n',
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
                radius: 0.25, width: 0.006,
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
              color: color1,
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
                radius: 0.2, width: 0.006,
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
                scale: 0.6,
                offset: 0.02,
              },
              color: color1,
            },
          ],
          side: [
            sideLabel('1', 'hypotenuse'),
            sideLabel('0.0000', 'opposite'),
            sideLabel('', 'adjacent'),
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
        default: { position: [0, -0.8] },
        bottom: { position: [0, -0.8] },
        left: { position: [-0.7, -0.8] },
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

    if (tri._side12.label.eqn.getCurrentForm().name === 'value') {
      tri._side12.label.eqn.updateElementText({ v: sin.toFixed(4) }, 'none');
    }
    if (tri._angle2.label.eqn.getCurrentForm().name === 'value') {
      tri._angle2.label.eqn.updateElementText({ v: `${Fig.tools.math.round(r * 180 / Math.PI, 0)}\u00b0` });
    }
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

  const [side01, side12, side20, angle2] = tri.getElements(['side01', 'side12', 'side20', 'angle2']);

  const sidesDissolveOut = () => {
    tri.animations.new()
      .inParallel([
        side01.animations.dissolveOut(0.8),
        side12.animations.dissolveOut(0.8),
        side20.animations.dissolveOut(0.8),
      ])
      .start();
  };
  const angleDissolveOut = () => {
    angle2._label.animations.new()
      .dissolveOut(0.8)
      .start();
  };
  const sidesDissolveIn = () => {
    tri.animations.new()
      .inParallel([
        side01.animations.dissolveIn(0.8),
        side12.animations.dissolveIn(0.8),
        side20.animations.dissolveIn(0.8),
      ])
      .start();
  };
  const angleDissolveIn = () => {
    angle2._label.animations.new()
      .dissolveIn(0.8)
      .start();
  };
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
      .trigger({
        callback: () => {
          sidesDissolveOut();
          angleDissolveOut();
        },
        duration: 0.8,
      })
      .trigger(() => {
        sidesShowForm('name');
        angleShowForm('name');
        rotLine.setPosition(rotLine.getPosition());
      })
      .trigger({
        callback: () => {
          sidesDissolveIn();
          angleDissolveIn();
        },
        duration: 0.8,
      })
      .start();
  };
  const animateToValues = () => {
    tri.animations.new()
      .trigger({
        callback: () => {
          sidesDissolveOut();
          angleDissolveOut();
        },
        duration: 0.8,
      })
      .trigger(() => {
        sidesShowForm('value');
        angleShowForm('value');
        rotLine.setPosition(rotLine.getPosition());
      })
      .trigger({
        callback: () => {
          sidesDissolveIn();
          angleDissolveIn();
        },
        duration: 0.8,
      })
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
  const pulseAngle = (element) => element.pulseAngle({
    curve: { scale: 1.7 }, label: { scale: 1.7 }, duration: 1,
  });
  const pulseRight = () => tri.getElement('angle1').pulse({ xAlign: 'right', yAlign: 'bottom', scale: 1.7 });
  figure.fnMap.global.add('triAnimateToNames', animateToNames.bind(this));
  figure.fnMap.global.add('triAnimateToValues', animateToValues.bind(this));
  figure.fnMap.global.add('triToNames', toNames.bind(this));
  figure.fnMap.global.add('triToValues', toValues.bind(this));
  figure.fnMap.global.add('triSidesDissolveIn', sidesDissolveIn.bind(this));
  figure.fnMap.global.add('triAngleDissolveIn', angleDissolveIn.bind(this));
  figure.fnMap.global.add('triPulseTheta', () => pulseAngle(angle2));
  figure.fnMap.global.add('triPulseRight', () => pulseRight());
  figure.fnMap.global.add('triToRot', (rot) => {
    rotLine.setRotation(rot);
  });
  figure.fnMap.global.add('triPulseAngles', () => {
    pulseAngle(angle2);
    // pulseAngle(tri.getElement('angle0'));
    pulseRight();
    pulseAngle(tri.getElement('angle0'));
  });
  rotLine.setRotation(1);
}
