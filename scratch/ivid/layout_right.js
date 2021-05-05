/* eslint-disable camelcase */
/* globals figure, color2, colGrey, colOpp, colAdj, colHyp, colTheta, Fig */

// eslint-disable-next-line
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
  const sides = (text1, text2, text3) => [
    { label: { text: text1, offset: 0.05, scale: 1.1 }, color: colHyp },
    { label: { text: text2, offset: 0.05, scale: 1.1 }, color: colOpp },
    { label: { text: text3, offset: 0.05, scale: 1.1 }, color: colAdj },
  ];
  const theta = () => ({
    curve: {
      radius: 0.3, width: 0.006,
    },
    label: {
      text: '\u03b8',
      scale: 0.8,
      offset: 0.02,
    },
    color: colTheta,
  });
  const thetaValue = () => ({
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
  });
  const similarTri = (name, scale, position, thetaDef, side) => ({
    name,
    method: 'collections.polyline',
    options: {
      points: [[0, 0], [scale * 2, scale * 1.453], [scale * 2, 0]],
      close: true,
      position,
      width: 0.008,
      side,
      angle: {
        0: {
          curve: {
            radius: 0.4, width: 0.006,
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
            scale: 0.8,
            offset: 0.02,
            curvePosition: 0.65,
          },
          color: colTheta,
        },
        2: thetaDef,
        1: {
          curve: {
            radius: 0.18, width: 0.006, autoRightAngle: true, color: colGrey,
          },
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
      similarTri('tri1', 0.7, [-2, 0], theta(), sides('A\'', 'B\'', 'C\'')),
      similarTri('tri2', 1, [0, 0], theta(), sides('A', 'B', 'C')),
      similarTri('tri', 1, [0, 0], thetaValue(), [
        sideLabel('1.0000', 'hypotenuse', 'hypotenuse', colHyp),
        sideLabel('0.0000', 'opposite', 'sin', colOpp),
        sideLabel('0.0000', 'adjacent', 'cos', colAdj),
      ]),
      {
        name: 'rotLine',
        method: 'primitives.line',
        options: {
          length: 1,
          width: 0.1,
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
          touchBorder: 0.1,
        },
      },
      {
        name: 'movePad',
        method: 'primitives.polygon',
        options: {
          radius: 0.1,
          color: [0, 0, 1, 0],
          sides: 20,
          position: [1, 1],
        },
        mods: {
          move: {
            bounds: {
              translation: {
                left: 0.001, right: 3, bottom: 0.001, top: 2,
              },
            },
          },
          isMovable: true,
          touchBorder: 0.2,
        },
      },
    ],
    mods: {
      scenarios: {
        oneTri: { position: [-0.8, -0.9], scale: 1 },
        twoTri: { position: [0, -0.9], scale: 1 },
      },
    },
  });
  const [tri, xLine] = rightTri.getElements(['tri', 'x']);
  const [tri1] = rightTri.getElements(['tri1', 'tri2']);
  const [movePad] = rightTri.getElements(['movePad']);
  const [rotLine] = rightTri.getElements(['rotLine']);

  const update = () => {
    const { x, y } = movePad.getPosition();
    const radius = Math.sqrt(x ** 2 + y ** 2);
    const r = Math.atan2(y, x + 0.00001);
    tri.updatePoints([
      [0, 0], [x, y], [x, 0],
    ]);
    const a = Fig.tools.math.round(r * 180 / Math.PI, 0) * Math.PI / 180;
    const rad = Fig.tools.math.round(radius / 1.8508, 4);
    const sin = Math.sin(a);
    const cos = Math.cos(a);
    const rSin = rad * Math.sin(a);
    const rCos = rad * Math.cos(a);

    if (tri._side01.label.eqn.getCurrentForm().name === 'value') {
      tri._side01.label.eqn.updateElementText({ v: rad.toFixed(4) }, 'none');
    }
    if (tri._side12.label.eqn.getCurrentForm().name === 'value') {
      tri._side12.label.eqn.updateElementText({ v: rSin.toFixed(4) }, 'none');
    }
    if (tri._side20.label.eqn.getCurrentForm().name === 'value') {
      tri._side20.label.eqn.updateElementText({ v: rCos.toFixed(4) }, 'none');
    }
    if (tri._angle2.label.eqn.getCurrentForm().name === 'value') {
      tri._angle2.label.eqn.updateElementText({ v: `${Fig.tools.math.round(r * 180 / Math.PI, 0)}\u00b0` });
    }

    tri._angle2.label.location = 'outside';
    if (r < 0.3 || r > 1.34) {
      if (r < 0.3) {
        tri._angle2.label.location = 'end';
      }
      xLine.show();
    } else {
      xLine.hide();
    }
    if (x < 0.45 || y < 0.15) {
      tri._angle1.setOpacity(0);
    } else if (tri._angle1.opacity === 0) {
      tri._angle1.setOpacity(1);
    }

    const compTheta = Math.PI / 2 - r;
    if (compTheta < 0.74 || y < 0.55) {
      tri._angle0.setOpacity(0);
    } else if (tri._angle0.opacity === 0) {
      tri._angle0.setOpacity(1);
    }

    const eqn = figure.getElement('eqn');
    if (eqn.getElement('val1').isShown) {
      eqn.updateElementText({
        val1: sin.toFixed(4),
        val2: cos.toFixed(4),
        val3: sin / cos > 100 ? '\u221e' : (sin / cos).toFixed(4),
        val4: cos / sin > 100 ? '\u221e' : (cos / sin).toFixed(4),
        val5: 1 / cos > 100 ? '\u221e' : (1 / cos).toFixed(4),
        val6: 1 / sin > 100 ? '\u221e' : (1 / sin).toFixed(4),
      });
    }
  };
  movePad.fnMap.add('updateMovePad', () => {
    if (!rightTri.isShown) {
      return;
    }
    const { x, y } = movePad.transform.t();
    const angle = Math.atan2(y, x);
    const hyp = Math.sqrt(x ** 2 + y ** 2);
    const minHypotenuse = 1.3;
    if (hyp < minHypotenuse) {
      movePad.transform.updateTranslation(
        minHypotenuse * Math.cos(angle),
        minHypotenuse * Math.sin(angle),
      );
    }
    rotLine.transform.updateRotation(angle);
    rotLine.custom.updatePoints({ length: Math.max(hyp, minHypotenuse) });
    update();
  });
  movePad.notifications.add('setTransform', 'updateMovePad');
  movePad.notifications.add('setState', 'updateMovePad');

  rotLine.fnMap.add('updateRotLine', () => {
    const { x, y } = movePad.transform.t();
    const hyp = Math.sqrt(x ** 2 + y ** 2);
    const r = rotLine.getRotation();
    movePad.setPosition(hyp * Math.cos(r), hyp * Math.sin(r));
  });
  rotLine.notifications.add('setTransform', 'updateRotLine');
  rotLine.notifications.add('setState', 'updateRotLine');
  figure.fnMap.global.add('rotateTri', () => {
    rotLine.animations.new()
      .rotation({ target: Math.PI / 4, duration: 1 })
      .start();
  });

  const [side01, side12, side20, angle2] = tri.getElements(['side01', 'side12', 'side20', 'angle2', 'angle0']);

  const setEqn = (element, form, forceShow) => {
    if ((element._label.isShown && element.isShown) || forceShow) {
      element.label.eqn.showForm(form);
    } else {
      element.label.eqn.setCurrentForm(form);
    }
  };
  const sidesShowForm = (form, forceShow = false) => {
    setEqn(side01, form, forceShow);
    setEqn(side12, form, forceShow);
    setEqn(side20, form, forceShow);
  };
  const angleShowForm = (form, forceShow = false) => {
    setEqn(angle2, form, forceShow);
  };

  const animateToNames = () => {
    tri.animations.new()
      .inParallel([
        side01.animations.dissolveOut(0.4),
        side12.animations.dissolveOut(0.4),
        side20.animations.dissolveOut(0.4),
        angle2._label.animations.dissolveOut(0.4),
      ])
      .trigger(() => {
        sidesShowForm('name');
        angleShowForm('name');
        update();
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
    update();
  };
  const toValues = () => {
    sidesShowForm('value');
    angleShowForm('value');
    update();
  };
  const pulseAngle = (element, scale = 1.7) => element.pulseAngle({
    curve: { scale }, label: { scale }, duration: 1.5,
  });
  const pulseRight = () => tri.getElement('angle1').pulse({
    xAlign: 'right', yAlign: 'bottom', scale: 2, duration: 1.5,
  });

  figure.fnMap.global.add('triAnimateToNames', animateToNames.bind(this));
  figure.fnMap.global.add('triToNames', toNames.bind(this));
  figure.fnMap.global.add('triPulseTheta', () => pulseAngle(angle2));
  figure.fnMap.global.add('triPulseRight', () => pulseRight());
  figure.fnMap.global.add('triPulseAllAngles', () => {
    tri1._angle1.pulse({
      xAlign: 'right', yAlign: 'bottom', scale: 2, duration: 1.5,
    });
    tri._angle1.pulse({
      xAlign: 'right', yAlign: 'bottom', scale: 2, duration: 1.5,
    });
    tri1._angle2.pulseAngle({ curve: 1.3, label: { scale: 1.3 }, duration: 1.5 });
    tri._angle2.pulseAngle({ curve: 1.3, label: { scale: 1.3 }, duration: 1.5 });
    tri1._angle0.pulseAngle({ curve: 1.2, label: { scale: 1.2 }, duration: 1.5 });
    tri._angle0.pulseAngle({ curve: 1.2, label: { scale: 1.2 }, duration: 1.5 });
  });
  figure.fnMap.global.add('triPulseThetas', () => {
    tri1._angle2.pulseAngle({ curve: 1.5, label: { scale: 1.5 }, duration: 1.5 });
    tri._angle2.pulseAngle({ curve: 1.5, label: { scale: 1.5 }, duration: 1.5 });
  });
  figure.fnMap.global.add('triSetup', (p, namesOrValues, touchable = false) => {
    movePad.setPosition(p);
    if (namesOrValues === 'names') {
      toNames();
    } else if (namesOrValues === 'values') {
      toValues();
    }
    if (touchable) {
      rotLine.setMovable();
      movePad.setMovable();
    } else {
      rightTri.hasTouchableElements = false;
    }
  });
  figure.fnMap.global.add('triResetPad', () => {
    movePad.animations.new()
      .position({ target: [2, 1.453], duration: 1 })
      .start();
  });
}
