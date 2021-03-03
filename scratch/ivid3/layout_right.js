/* eslint-disable camelcase */
/* globals figure, color2, colGrey, leftText, colOpp, colAdj, colHyp, colTheta, Fig */


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
    { label: { text: text1, offset: 0.03, scale: 1.2 }, color: colAdj },
    { label: { text: text2, offset: 0.03, scale: 1.2 }, color: colOpp },
    { label: { text: text3, offset: 0.03, scale: 1.2 }, color: colHyp },
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
      points: [[0, 0], [scale * 2, scale * 1.5], [scale * 2, 0]],
      close: true,
      position,
      width: 0.008,
      side,
      angle: {
        // curve: null,
        // label: '',
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
        // 2: {
        //   curve: {
        //     radius: 0.3, width: 0.006,
        //   },
        //   label: {
        //     text: '\u03b8',
        //     scale: 0.8,
        //     offset: 0.02,
        //   },
        //   color: colTheta,
        // },
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
      similarTri('tri1', 0.6, [-4, 0], theta(), sides('B', 'A', '')),
      similarTri('tri2', 0.8, [-2.2, 0], theta(), sides('E', 'D', '')),
      similarTri('tri3', 1, [0, 0], theta(), sides('H', 'G', '')),
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
                left: 0, right: 3, bottom: 0, top: 2,
              },
            },
          },
          isMovable: true,
          touchBorder: 0.2,
        },
      },
      {
        name: 'eqn',
        method: 'equation',
        options: {
          elements: {
            eq1: '  =  ',
            eq2: '  =  ',
            // eq3: '  =  ',
            // eq4: '  =  ',
            // comma1: ', ',
            // comma2: ', ',
            // dots: '...',
            A: { color: colOpp },
            // A_1: { color: colOpp },
            B: { color: colAdj },
            // C: { color: colHyp },
            D: { color: colOpp },
            // D_1: { color: colOpp },
            E: { color: colAdj },
            // F: { color: colHyp },
            G: { color: colOpp },
            // G_1: { color: colOpp },
            H: { color: colAdj },
            // I: { color: colHyp },
          },
          forms: {
            0: [
              { frac: ['A', 'v1_vinculum', 'B'] },
              'eq1',
              { frac: ['D', 'v2_vinculum', 'E'] },
              'eq2',
              { frac: ['G', 'v3_vinculum', 'H'] },
              // 'comma1', '                ',
              // { frac: ['A_1', 'v4_vinculum', 'C'] },
              // 'eq3',
              // { frac: ['D_1', 'v5_vinculum', 'F'] },
              // 'eq4',
              // { frac: ['G_1', 'v6_vinculum', 'I'] },
              // 'comma2', '                ', 'dots',
            ],
          },
          scale: 1.4,
          position: [-0.5, -1],
          formDefaults: { alignment: { xAlign: 'center' } },
        },
      },
    ],
    mods: {
      scenarios: {
        center: { position: [-0.8, -0.9], scale: 1 },
        similar: { position: [0.5, -0.3], scale: 0.7 },
        ratioValues: { position: [-0.3, -0.9], scale: 1 },
      },
    },
  });
  // const [tri, rotLine, xLine] = rightTri.getElements(['tri', 'rotLine', 'x']);
  const [tri, xLine] = rightTri.getElements(['tri', 'x']);
  const [movePad] = rightTri.getElements(['movePad']);
  const [rotLine] = rightTri.getElements(['rotLine']);

  // const [sizeLine] = rightTri.getElements(['sizeLine']);
  // let hypotenuse = 2;
  // const maxY = 2;
  // const minY = 0.2;
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
      // tri._angle2.label.location = 'outside';
      xLine.hide();
    }
    if (x < 0.45 || y < 0.15) {
      tri._angle1.SetOpacity(0);
    } else {
      tri._angle1.setOpacity(1);
    }

    const eqn = figure.getElement('eqn');
    if (eqn.getElement('val1').isShown) {
      eqn.updateElementText({
        val1: sin.toFixed(4),
        val2: cos.toFixed(4),
        val3: sin / cos > 100 ? '\u221e' : (sin / cos).toFixed(4),
        val4: 1 / cos > 100 ? '\u221e' : (1 / cos).toFixed(4),
        val5: cos / sin > 100 ? '\u221e' : (cos / sin).toFixed(4),
        val6: 1 / sin > 100 ? '\u221e' : (1 / sin).toFixed(4),
      });
    }

    // figure.fnMap.global.add('rotateTri', () => {
    //   rotLine.animations.new()
    //     .rotation({ target: Math.PI / 4, duration: 1 })
    //     .start();
    // });
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
  movePad.subscriptions.add('setTransform', 'updateMovePad');
  movePad.subscriptions.add('setState', 'updateMovePad');

  rotLine.fnMap.add('updateRotLine', () => {
    const { x, y } = movePad.transform.t();
    const hyp = Math.sqrt(x ** 2 + y ** 2);
    const r = rotLine.getRotation();
    movePad.setPosition(hyp * Math.cos(r), hyp * Math.sin(r));
  });
  rotLine.subscriptions.add('setTransform', 'updateRotLine');
  rotLine.subscriptions.add('setState', 'updateRotLine');
  // sizeLine.subscriptions.add('setTransform', () => {
  //   const r = rotLine.getRotation();
  //   hypotenuse = sizeLine.getPosition().x / Math.cos(r);
  //   // console.log(hypotenuse)
  //   // console.log(r, newLength)
  //   // rotLine.setLength(newLength);
  //   // console.log(rotLine, rotLine.getLength(), sizeLine.transform.t())
  //   // rotLine.custom.updatePoints({ p1: [0, 0], p2: [hypotenuse, 0] });
  //   update();
  // });
  figure.fnMap.global.add('rotateTri', () => {
    rotLine.animations.new()
      .rotation({ target: Math.PI / 4, duration: 1 })
      .start();
  });

  const [side01, side12, side20, angle2, angle0] = tri.getElements(['side01', 'side12', 'side20', 'angle2', 'angle0']);

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
  const animateToValues = () => {
    tri.animations.new()
      .inParallel([
        side01.animations.dissolveOut(0.4),
        side12.animations.dissolveOut(0.4),
        side20.animations.dissolveOut(0.4),
        angle2._label.animations.dissolveOut(0.4),
      ])
      .trigger(() => {
        sidesShowForm('value', true);
        angleShowForm('value', true);
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
    curve: { scale }, label: { scale }, duration: 1,
  });
  const pulseRight = () => tri.getElement('angle1').pulse({ xAlign: 'right', yAlign: 'bottom', scale: 2 });
  const pulseOpp = () => tri.getElement('side12.label').pulse({ xAlign: 'left', scale: 1.5 });
  const pulseHyp = () => tri.getElement('side01.label').pulse({ xAlign: 'right', yAlign: 'bottom', scale: 1.5 });
  const pulseAdj = () => tri.getElement('side20.label').pulse({ yAlign: 'top', scale: 1.5 });

  // const animateToRot = (target) => radLine.animations.new().rotation({ target, duration: 1 });

  // figure.fnMap.global.add('triToSin', () => {
  //   rightTri._tri._side12._label.showForm('name2');
  //   rotLine.setPosition(rotLine.getPosition());
  // });
  figure.fnMap.global.add('triAnimateToNames', animateToNames.bind(this));
  figure.fnMap.global.add('triAnimateToValues', animateToValues.bind(this));
  figure.fnMap.global.add('triToNames', toNames.bind(this));
  figure.fnMap.global.add('triToValues', toValues.bind(this));
  figure.fnMap.global.add('triPulseTheta', () => pulseAngle(angle2));
  figure.fnMap.global.add('triPulseComp', () => pulseAngle(angle0, 1.4));
  figure.fnMap.global.add('triPulseRight', () => pulseRight());
  figure.fnMap.global.add('triPulseOpp', () => pulseOpp());
  figure.fnMap.global.add('triPulseHyp', () => pulseHyp());
  figure.fnMap.global.add('triPulseAdj', () => pulseAdj());
  figure.fnMap.global.add('triToRot', (rot) => {
    rotLine.setRotation(rot);
  });
  figure.fnMap.global.add('triPadToPoint', (p) => {
    movePad.setPosition(p);
  });
  figure.fnMap.global.add('triSetup', (p, namesOrValues, touchable = false) => {
    movePad.setPosition(p);
    if (namesOrValues === 'names') {
      toNames();
    } else if (namesOrValues === 'values') {
      toValues();
    }
    if (touchable) {
      // rightTri.hasTouchableElements = true;
      rotLine.setMovable();
      movePad.setMovable();
    } else {
      rightTri.hasTouchableElements = false;
    }
  });
  figure.fnMap.global.add('triAnimatePadTo', () => {
    movePad.animations.new()
      .position({ target: [2, 1.5], duration: 1 })
      .start();
  });

  figure.fnMap.global.add('triPulseAngles', () => {
    pulseAngle(angle2);
    pulseRight();
    pulseAngle(tri.getElement('angle0'));
  });
  // rotLine.setRotation(1);

  rightTri.add([
    leftText('allTriangles', 'All right triangles with |theta|:', {
      theta: { text: '\u03b8', font: { family: 'Times New Roman', style: 'italic', color: colTheta } },
    }, [-2 - 1.3, 2], 0.18 / 0.7),
    leftText('haveSameAngles', ' have the same angles', {}, [0.1 - 0.7, 2], 0.18 / 0.7),
    leftText('areSimilar', ' are similar', {}, [0.1 - 0.7, 2], 0.18 / 0.7),
  ]);
}
