/* eslint-disable camelcase, no-restricted-globals, no-param-reassign */
/* globals figure, colTheta, colCot, colTan, colSin, colCos, colSec, colCsc,
   colGrey, Fig, thin, thick, colText */

// eslint-disable-next-line
function layoutCirc() {
  const radius = 1.2;
  const defaultAngle = 35 / 180 * Math.PI;
  const dCos = radius * Math.cos(defaultAngle);
  const dSin = radius * Math.sin(defaultAngle);
  const dTan = radius * Math.tan(defaultAngle);
  const dCot = radius / Math.tan(defaultAngle);
  const dC1 = Fig.tools.g2.getTriangleCenter([0, 0], [dCos, 0], [dCos, dSin]);
  const dC2 = Fig.tools.g2.getTriangleCenter([0, 0], [radius, 0], [radius, dTan]);
  const dC3 = Fig.tools.g2.getTriangleCenter([0, 0], [dCot, 0], [dCot, radius]);
  const origin = [-0.8, -0.7];
  const point = (pointX, pointY) => new Fig.Point(pointX, pointY);

  const line = (name, color, width = thick, p1 = [0, 0], length = 1, ang = 0, dash = []) => ({
    name,
    method: 'primitives.line',
    options: {
      p1, length, angle: ang, width, color, dash,
    },
  });

  const lineWithLabel = (name, color, text, width = thick, p1, length, ang, location = 'negative') => ({
    name,
    method: 'collections.line',
    options: {
      width,
      color,
      p1,
      length,
      angle: ang,
      label: {
        text: { textFont: { style: 'normal' }, forms: { 0: text } },
        location,
        orientation: 'horizontal',
        update: true,
      },
    },
  });

  function arc(name, color, width = thin, sides = 100, angleToDraw = Math.PI * 2, rotation = 0, rad = radius) {
    return {
      name,
      method: 'primitives.polygon',
      options: {
        radius: rad, line: { width }, sides, angleToDraw: angleToDraw + 0.001, rotation, color,
      },
    };
  }

  const addEye = (name, position) => ({
    name,
    method: 'collection',
    elements: [
      { name: 'eye1', method: 'polygon', options: { line: { width: medium }, radius: 0.075, angleToDraw: 2, rotation: Math.PI / 2 - 1, sides: 100, position: [0, -0.043] } },
      { name: 'eye2', method: 'polygon', options: { line: { width: medium }, radius: 0.075, angleToDraw: 2, rotation: Math.PI / 2 - 1 + Math.PI, sides: 100, position: [0, 0.043] } },
      { name: 'center', method: 'polygon', options: { radius: 0.012, sides: 6 }},
      { name: 'strike', method: 'line', options: { p1: [-0.05, -0.05], p2: [0.05, 0.05], width: medium } },
    ],
    options: {
      position,
    },
    mods: {
      custom: {
        visible: () => figure.elements._circ.getElement(name)._strike.hide(),
        hidden: () => figure.elements._circ.getElement(name)._strike.show(),
      },
    },
  });

  const addLock = (name, position, unlockOpacity = 1) => ({
    name,
    method: 'collection',
    elements: [
      // { name: 'l', method: 'ellipse', options: { position: [0, 0.035], line: { width: medium }, height: 0.05, width: 0.05, sides: 20 } },
      { name: 'lock', method: 'polygon', options: { position: [0, 0.035], line: { width: medium }, radius: 0.025, sides: 20, angleToDraw: Math.PI } },
      // { name: 'unlock', method: 'line', options: { width: 0.02, p1: [0, 0.03 + 0.01], length: 0.04, color: [1, 1, 1, unlockOpacity] } },
      { name: 'r', method: 'collections.rectangle', options: { width: 0.08, height: 0.07, corner: { radius: 0.005 }, line: { width: medium }, fill: [1, 1, 1, 1] } },
    ],
    options: {
      position,
    },
    mods: {
      custom: {
        // lock: () => figure.elements._circ.getElement(name)._unlock.hide(),
        // unlock: () => figure.elements._circ.getElement(name)._unlock.show(),
        lock: () => figure.elements._circ.getElement(name)._lock.setRotation(0),
        unlock: () => figure.elements._circ.getElement(name)._lock.setRotation(0.7),
      },
    },
  });

  const rightAngle = (name, position, startAngle, r = 0.15, color = colGrey) => ({
    name,
    method: 'collections.angle',
    options: {
      position,
      startAngle,
      angle: Math.PI / 2,
      curve: { autoRightAngle: true, width: thin, radius: r },
      color,
    },
  });

  function angle(
    name, text, rad = 0.2, curvePosition = 0.5,
    position = [0, 0], startAngle = 0, angleSize = 0, sides = null,
  ) {
    return {
      name,
      method: 'collections.angle',
      options: {
        color: colTheta,
        curve: { width: 0.01, radius: rad, sides: 400 },
        startAngle,
        angle: angleSize,
        label: { text, offset: 0.01, curvePosition },
        sides,
        position,
      },
    };
  }
  const rot = name => ({
    name,
    method: 'primitives.generic',
    options: { color: [0, 1, 0, 0] },
    mods: {
      isMovable: true,
      move: { type: 'rotation' },
    },
  });
  const tri = (name, elements, position, rotation, center, x, y) => ({
    name,
    method: 'collection',
    elements: [
      ...elements,
      rightAngle('right', [0, radius], -Math.PI / 2),
      angle('theta', '\u03b8', 0.2, 0.5, [0, 0], 0, defaultAngle),
      {
        name: 'movePad',
        method: 'primitives.generic',
        options: {
          points: [[0, 0], [0, 1], [1, 1]],
          color: [0, 0, 1, 0.3],
          close: true,
        },
        mods: {
          isMovable: true,
          // move: { bounds: 'diagram' },
        },
      },
      rot('rotTheta'),
      rot('rotComp'),
      rot('rotRight'),
    ],
    mods: {
      // scenarios: {
      //   default: { scale: [1, 1], position, rotation: 0 },
      // },
      customState: {
        lock: 'theta', lockHyp: false, center, x, y, unit: true, theta: true,
      },
    },
  });

  const button = (name, position, text, width = 0.7, height = 0.25, size = 0.1, textPosition = [0, 0]) => ({
    name,
    // method: 'collections.rectangle',
    // options: {
    //   label: { text, font: { size }, modifiers: { theta: { text: '\u03b8', font: { style: 'italic', family: 'Time New Roman', size: size * 1.2, color: colTheta } } } },
    //   position,
    //   width,
    //   height,
    //   line: { width: thin },
    //   corner: { radius: 0.02, sides: 3 },
    //   color: colText,
    //   fill: [1, 1, 1, 1],
    // },
    method: 'collection',
    elements: [
      { name: 'rect', method: 'primitives.rectangle', options: { width, height, line: { width: thin }, corner: { radius: 0.02, sides: 3 }, color: colGrey } },
      {
        name: 'label',
        method: 'textLines',
        options: {
          position:
          textPosition,
          text,
          font: { size, color: colText },
          xAlign: 'center',
          yAlign: 'middle',
          modifiers: {
            theta: {
              text: '\u03b8',
              font: {
                style: 'italic', family: 'Time New Roman', size: size * 1.2, color: colTheta,
              },
            },
            _90: {
              text: '90\u00b0',
              font: {
                family: 'Time New Roman', size: size * 1.2, color: colTheta,
              },
            },
            min: {
              text: '\u2212',
              font: {
                family: 'Time New Roman', size: size * 1.2, color: colTheta,
              },
            },
          },
        },
      },
    ],
    options: { position },
    mods: { isTouchable: true, touchBorder: 0 },
  });


  const [circ] = figure.add({
    name: 'circ',
    method: 'collection',
    elements: [
      {
        name: 'background',
        method: 'rectangle',
        options: {
          width: 6,
          height: 3,
          color: [0, 0, 0, 0],
        },
        mods: {
          isTouchable: true,
        },
      },
      {
        name: 'circle',
        method: 'collection',
        elements: [
          arc('circle', colGrey, thin, 100, Math.PI / 2, 0),
          line('x', colGrey, thin, [0, 0], radius, 0),
          line('y', colGrey, thin, [0, 0], radius, Math.PI / 2),
          {
            name: 'movePad',
            method: 'primitives.polygon',
            options: {
              sides: 16,
              radius: radius + 0.03,
              color: [0, 0, 0, 0],
              sidesToDraw: 4,
            },
            mods: {
              isMovable: true,
            },
          },
        ],
        mods: {
          scenarios: {
            reset: { position: origin },
            preset1: { position: origin },
            preset2: { position: origin },
            preset3: { position: origin },
          },
        },
      },
      angle('theta', '0', 0.3, 0.5, [-2.8, -1.3], 0, defaultAngle, { length: 0.33, width: thick }),
      tri(
        'triCotCsc',
        [
          lineWithLabel('unit', colText, '1', thick, [-thick / 2, thick], radius - thick / 2, Math.PI / 2),
          lineWithLabel('csc', colCsc, 'csc'),
          lineWithLabel('cot', colCot, 'cot'),
        ],
        [1.9, -0.22],
        Math.PI,
        dC3, dCot,
        radius,
      ),
      tri(
        'triTanSec',
        [
          lineWithLabel('unit', colText, '1', thick, [radius + thick / 2, 0], radius + thick * 0.7, Math.PI),
          lineWithLabel('tan', colTan, 'tan'),
          lineWithLabel('sec', colSec, 'sec'),
        ],
        [0.1, -0.31],
        0,
        dC2, radius, dTan,
      ),
      tri('triSinCos', [
        lineWithLabel('unit', colText, '1', thick, [0, 0], radius, defaultAngle),
        lineWithLabel('sin', colSin, 'sin'),
        lineWithLabel('cos', colCos, 'cos'),
      ], [-1.5, -0.35], 0, dC1, dCos, dSin),
      button('flip', [0.1, -1.2], 'Flip', 0.3, 0.25, 0.1, [0, -0.01]),
      button('unitButton', [0.5, -1.2], 'Unit', 0.3, 0.25, 0.07, [0, -0.06]),
      button('thetaButton', [0.9, -1.2], '|theta|', 0.3, 0.25, 0.07, [0, -0.06]),
      button('lockHyp', [1.3, -1.2], 'Hyp', 0.3, 0.25, 0.07, [0, -0.06]),
      button('lock', [1.7, -1.2], '|theta|', 0.3, 0.25, 0.07, [0, -0.06]),
      // button('lock', [-2.6, 0.8], 'Lk: Theta'),
      // button('lockHyp', [-2.6, 0.4], 'Lk Hyp: No'),
      button('reset', [2.6, -1.2], 'Reset', 0.4),
      button('preset1', [-2, -1.2], '1', 0.25),
      button('preset2', [-1.6, -1.2], '2', 0.25),
      button('preset3', [-1.2, -1.2], '3', 0.25),
      {
        name: 'arcButton',
        method: 'collection',
        elements: [
          arc('arc', colText, thin, 100, Math.PI / 2, 0, 0.22),
          line('x', colText, thin, [0, 0], 0.22, 0),
          line('y', colText, thin, [0, 0], 0.22, Math.PI / 2),
        ],
        options: {
          position: [-0.9, -1.31],
        },
        mods: {
          isTouchable: true,
          touchBorder: 0.1,
        },
      },
      addLock('hypLock', [1.3, -1.17]),
      addLock('angleLock', [1.7, -1.17], 0),
      addEye('viewUnit', [0.5, -1.16]),
      addEye('viewTheta', [0.9, -1.16]),
      {
        name: 'rotator',
        method: 'collections.line',
        options: {
          length: radius * 0.5,
          width: 0.5,
          color: [0, 0, 0, 0],
          p1: [-2.8, -1.3],
        },
        mods: {
          dimColor: [0, 0, 0, 0],
          isMovable: true,
          move: { type: 'rotation', bounds: { rotation: { min: 0.0001, max: Math.PI / 2 * 0.999 } } },
          scenarios: {
            default: { rotation: defaultAngle },
          },
          // touchBorder: [0, 0, radius , 0],
        },
      },
    ],
    mods: {
      customState: { selected: '' },
    },
  });
  const get = list => circ.getElements(list);
  const [rotator, theta] = get(['rotator', 'theta']);
  const [triCotCsc] = get(['triCotCsc']);
  const [triSinCos] = get(['triSinCos']);
  const [triTanSec] = get(['triTanSec']);
  const [cos, sin] = get({ triSinCos: ['cos', 'sin'] });
  const [cot, csc] = get({ triCotCsc: ['cot', 'csc'] });
  const [tan, sec] = get({ triTanSec: ['tan', 'sec'] });
  const [unitSinCos, thetaSinCos, rightSinCos, moveSinCos, rotThetaSinCos, rotCompSinCos, rotRightSinCos] = get({ triSinCos: ['unit', 'theta', 'right', 'movePad', 'rotTheta', 'rotComp', 'rotRight'] });
  const [unitTanSec, thetaTanSec, rightTanSec, moveTanSec, rotThetaTanSec, rotCompTanSec, rotRightTanSec] = get({ triTanSec: ['unit', 'theta', 'right', 'movePad', 'rotTheta', 'rotComp', 'rotRight'] });
  const [unitCotCsc, thetaCotCsc, rightCotCsc, moveCotCsc, rotThetaCotCsc, rotCompCotCsc, rotRightCotCsc] = get({ triCotCsc: ['unit', 'theta', 'right', 'movePad', 'rotTheta', 'rotComp', 'rotRight'] });
  const [flip, lock, lockHyp, reset, arcButton, unitButton, thetaButton] = get(['flip', 'lock', 'lockHyp', 'reset', 'arcButton', 'unitButton', 'thetaButton']);
  const [circle, background] = get(['circle', 'background']);
  const [preset1, preset2, preset3] = get(['preset1', 'preset2', 'preset3']);
  const [hypLock, angleLock, viewUnit, viewTheta] = get(['hypLock', 'angleLock', 'viewUnit', 'viewTheta']);

  sec.label.location = 'positive';
  csc.label.location = 'positive';
  unitSinCos.label.location = 'positive';

  theta.setLabelToRealAngle();

  const setRightAng = (element, test, position, startAngle) => {
    if (element.isShown) {
      if (test) {
        element.setAngle({ position, startAngle, angle: Math.PI / 2 });
        element.setOpacity(1);
      } else {
        element.setOpacity(0);
      }
    }
  };

  const setCurrentLockPosition = (triElement, rightPos, compPos, thetaPos) => {
    triElement.customState.angle = triSinCos._unit.line.angle();
    let pos = rightPos;
    if (triElement.customState.lock === 'theta') {
      pos = thetaPos;
    } else if (triElement.customState.lock === 'comp') {
      pos = compPos;
    }
    triElement.customState.lockPosition
      = triElement.pointFromSpaceToSpace(pos, 'draw', 'local');
  };
  const offsetForLock = (triElement, newAngle, rightPos, compPos, thetaPos) => {
    if (triElement.customState.lockHyp) {
      const s = triElement.transform.s().x;
      const r = triElement.transform.r();
      const delta = newAngle - triElement.customState.angle;
      triElement.transform.updateRotation(r - s * delta);
    }
    let pos = rightPos;
    if (triElement.customState.lock === 'theta') {
      pos = thetaPos;
    } else if (triElement.customState.lock === 'comp') {
      pos = compPos;
    }
    const newP = triElement.pointFromSpaceToSpace(pos, 'draw', 'local');
    const delta = newP.sub(triElement.customState.lockPosition);
    const p = triElement.getPosition();
    triElement.setPosition(p.sub(delta));
  };
  const setRotPad = (rotPad, vertex, startAngle, ang) => {
    const rotPadRad = 0.3;
    const v = Fig.tools.g2.getPoint(vertex);
    const cosV = rotPadRad * Math.cos(startAngle);
    const sinV = rotPadRad * Math.sin(startAngle);
    const cosVStop = rotPadRad * Math.cos(startAngle + ang);
    const sinVStop = rotPadRad * Math.sin(startAngle + ang);
    rotPad.custom.updatePoints({
      points: [v, v.add(cosV, sinV), v.add(cosVStop, sinVStop)],
    });
  };
  function updateCircle(rIn) {
    const r = rIn > Math.PI / 4 ? rIn - 0.00001 : rIn + 0.00001;
    const cosR = Math.cos(r);
    const sinR = Math.sin(r);
    const cosVal = Math.abs(radius * cosR);
    const sinVal = Math.abs(radius * sinR);
    const tanVal = Math.abs(radius * sinR / cosR);
    const cotVal = Math.abs(radius * cosR / sinR);
    rotator.customState = {
      cosVal, sinVal, tanVal, cotVal,
    };
    const c1 = Fig.tools.g2.getTriangleCenter([0, 0], [cosVal, 0], [cosVal, sinVal]);
    const c2 = Fig.tools.g2.getTriangleCenter([0, 0], [radius, 0], [radius, tanVal]);
    const c3 = Fig.tools.g2.getTriangleCenter([0, 0], [cotVal, 0], [cotVal, radius]);
    if (theta.isShown) {
      theta.setAngle({ angle: Math.acos(Math.abs(cosR)) });
    }

    setCurrentLockPosition(triSinCos, cos.getP2(), unitSinCos.getP2(), cos.getP1());
    setCurrentLockPosition(triTanSec, unitTanSec.getP2(), sec.getP2(), sec.getP1());
    setCurrentLockPosition(triCotCsc, cot.getP2(), csc.getP2(), cot.getP1());

    if (thetaSinCos.isShown) {
      thetaSinCos.setAngle({ angle: Math.acos(Math.abs(cosR)), position: [-c1.x, -c1.y] });
    }
    if (thetaCotCsc.isShown) {
      thetaCotCsc.setAngle({ angle: Math.acos(Math.abs(cosR)), position: [-c3.x, -c3.y] });
    }
    if (thetaTanSec.isShown) {
      thetaTanSec.setAngle({ angle: Math.acos(Math.abs(cosR)), position: [-c2.x, -c2.y] });
    }

    sin.setEndPoints(point(cosVal, 0).sub(c1), point(cosVal, sinVal).sub(c1));
    cos.setEndPoints(point(0, 0).sub(c1), point(cosVal, 0).sub(c1));
    unitSinCos.setEndPoints(point(0, 0).sub(c1), point(cosVal, sinVal).sub(c1));
    setRightAng(
      rightSinCos, r > 0.2 && r < Math.PI / 2 - 0.2, point(cosVal, 0).sub(c1), Math.PI / 2,
    );

    tan.setEndPoints(point(radius, 0).sub(c2), point(radius, tanVal).sub(c2));
    sec.setEndPoints(point(0, 0).sub(c2), point(radius, tanVal).sub(c2));
    unitTanSec.setEndPoints(point(0, 0).sub(c2), point(radius, 0).sub(c2));
    setRightAng(rightTanSec, r > 0.2, point(radius, 0).sub(c2), Math.PI / 2);

    cot.setEndPoints(point(0, 0).sub(c3), point(cotVal, 0).sub(c3));
    csc.setEndPoints(point(0, 0).sub(c3), point(cotVal, radius).sub(c3));
    unitCotCsc.setEndPoints(point(cotVal, 0).sub(c3), point(cotVal, radius).sub(c3));
    setRightAng(rightCotCsc, r < Math.PI / 2 - 0.2, point(cotVal, 0).sub(c3), Math.PI / 2);

    setRotPad(rotThetaSinCos, [-c1.x, -c1.y], 0, r);
    setRotPad(rotThetaTanSec, [-c2.x, -c2.y], 0, r);
    setRotPad(rotThetaCotCsc, [-c3.x, -c3.y], 0, r);

    setRotPad(rotRightSinCos, [cosVal - c1.x, -c1.y], Math.PI / 2, Math.PI / 2);
    setRotPad(rotRightTanSec, [radius - c2.x, -c2.y], Math.PI / 2, Math.PI / 2);
    setRotPad(rotRightCotCsc, [cotVal - c3.x, -c3.y], Math.PI / 2, Math.PI / 2);

    setRotPad(rotCompSinCos, [cosVal - c1.x, sinVal - c1.y], Math.PI + r, Math.PI / 2 - r);
    setRotPad(rotCompTanSec, [radius - c2.x, tanVal - c2.y], Math.PI + r, Math.PI / 2 - r);
    setRotPad(rotCompCotCsc, [cotVal - c3.x, radius - c3.y], Math.PI + r, Math.PI / 2 - r);

    moveSinCos.custom.updatePoints({
      points: [[0, 0], [cosVal, 0], [cosVal, sinVal]],
    });
    moveSinCos.setPosition(-c1.x, -c1.y);
    moveTanSec.custom.updatePoints({
      points: [[0, 0], [radius, 0], [radius, tanVal]],
    });
    moveTanSec.setPosition(-c2.x, -c2.y);
    moveCotCsc.custom.updatePoints({
      points: [[0, 0], [cotVal, 0], [cotVal, radius]],
    });
    moveCotCsc.setPosition(-c3.x, -c3.y);

    offsetForLock(triSinCos, r, cos.getP2(), unitSinCos.getP2(), cos.getP1());
    offsetForLock(triTanSec, r, unitTanSec.getP2(), sec.getP2(), sec.getP1());
    offsetForLock(triCotCsc, r, cot.getP2(), csc.getP2(), cot.getP1());
  }
  const rotatorUpdateCircle = () => {
    updateCircle(Fig.tools.g2.clipAngle(rotator.transform.r(), '0to360'));
  };
  rotator.fnMap.add('updateCircle', () => rotatorUpdateCircle());
  figure.fnMap.global.add('circSetup', (payload) => {
    const [ang] = payload;
    rotator.setRotation(ang);
  });
  rotator.subscriptions.add('setState', 'updateCircle');

  const add = (name, fn) => figure.fnMap.global.add(name, fn);

  add('circToRot', () => {
    if (rotator.isShown) {
      rotator.animations.new()
        .rotation({ target: 0.9, duration: 1 })
        .start();
    }
  });
  rotator.subscriptions.add('setTransform', 'updateCircle');
  rotator.onClick = () => figure.stop('complete');

  const updateLabels = (triElement, el1, el2, el3, el4) => {
    const s = triElement.getScale();
    const r = s.x * s.y * triElement.getRotation();
    const labelSx = s.x < 0 ? -1 : 1;
    const labelSy = s.y < 0 ? -1 : 1;
    el1._label.setScale(labelSx, labelSy);
    el1.updateLabel(r);
    el2._label.setScale(labelSx, labelSy);
    el2.updateLabel(r);
    if (el3.isShown) {
      el3._label.setScale(labelSx, labelSy);
      el3.updateLabel(r);
    }
    if (el4.isShown) {
      el4._label.setScale(labelSx, labelSy);
      el4.updateLabel(r);
    }
  };
  triSinCos.subscriptions.add('setTransform', () => {
    updateLabels(triSinCos, sin, cos, unitSinCos, thetaSinCos);
  });
  triTanSec.subscriptions.add('setTransform', () => {
    updateLabels(triTanSec, tan, sec, unitTanSec, thetaTanSec);
  });
  triCotCsc.subscriptions.add('setTransform', () => {
    updateLabels(triCotCsc, cot, csc, unitCotCsc, thetaCotCsc);
  });

  triCotCsc.subscriptions.add('setTransform', 'updateRotation');
  triCotCsc.subscriptions.add('setState', 'updateRotation');

  rotator.setRotation(0.5);

  flip.onClick = () => {
    const triElement = circ.getElement(circ.customState.selected);
    const target = [triElement.getScale().x < 0 ? 1 : -1, 1];
    triElement.stop('freeze');
    triElement.animations.new().scale({ target, duration: 2 }).start();
  };

  const updateLockText = (triElement) => {
    // lock.setLabel(`\u{1F512}: ${triElement.customState.lock}`);
    
    // lock.setLabel(`${triElement.customState.lock}`);
    if (triElement.customState.lock === 'theta') {
      lock._label.custom.updateText({ text: '|theta|' });
    } else if (triElement.customState.lock === 'comp') {
      lock._label.custom.updateText({ text: '|_90||min||theta|' });
    } else {
      lock._label.custom.updateText({ text: '|_90|' });
    }

    // lock._label.custom.updateText({ text: `${triElement.customState.lock}`});
    
    // lock.setLabel('Hyp');
    if (triElement.customState.lockHyp) {
      hypLock.custom.lock();
    } else {
      hypLock.custom.unlock();
    }
    // lockHyp.setLabel(`Hyp: ${triElement.customState.lockHyp ? '\u{1F512}' : '\u{1F513}'}`);
    if (triElement.customState.unit) {
      // unitButton.setLabel('Unit: Yes');
      triElement._unit._label.show();
      viewUnit.custom.visible();
    } else {
      // unitButton.setLabel('Unit: No');
      triElement._unit._label.hide();
      viewUnit.custom.hidden();
    }
    if (triElement.customState.theta) {
      // thetaButton.setLabel('Theta: Yes');
      triElement._theta.show();
      viewTheta.custom.visible();
    } else {
      // thetaButton.setLabel('Theta: No');
      triElement._theta.hide();
      viewTheta.custom.hidden();
    }
  };

  lock.onClick = () => {
    if (circ.customState.selected === '') {
      return;
    }
    const triElement = circ.getElement(circ.customState.selected);
    if (triElement.customState.lock === 'theta') {
      triElement.customState.lock = 'right';
    } else if (triElement.customState.lock === 'right') {
      triElement.customState.lock = 'comp';
    } else {
      triElement.customState.lock = 'theta';
    }
    updateLockText(triElement);
  };

  const toggleButton = (customStatePropertyName) => {
    if (circ.customState.selected === '') {
      return;
    }
    const triElement = circ.getElement(circ.customState.selected);
    if (triElement.customState[customStatePropertyName]) {
      triElement.customState[customStatePropertyName] = false;
    } else {
      triElement.customState[customStatePropertyName] = true;
    }
    updateLockText(triElement);
  };
  lockHyp.onClick = () => toggleButton('lockHyp');
  unitButton.onClick = () => toggleButton('unit');
  thetaButton.onClick = () => toggleButton('theta');

  arcButton.onClick = () => {
    if (circle.isShown) {
      circle.hide();
    } else {
      circle.show();
    }
  };
  circle.fnMap.add('processButton', () => {
    if (circle.isShown) {
      arcButton.setColor(colText);
    } else {
      arcButton.setColor(colGrey);
    }
  });
  reset.onClick = () => { figure.fnMap.exec('reset'); };

  const selectTriangle = (triangle) => {
    moveSinCos.setOpacity(0);
    moveTanSec.setOpacity(0);
    moveCotCsc.setOpacity(0);
    if (triangle === '') {
      circ.hide(['lock', 'flip', 'lockHyp', 'unitButton', 'thetaButton', 'viewTheta', 'viewUnit', 'angleLock', 'hypLock']);
      circ.customState.selected = '';
      return;
    }
    triangle._movePad.setOpacity(1);
    circ.customState.selected = triangle.name;
    circ.show(['lock', 'flip', 'lockHyp', 'unitButton', 'thetaButton', 'viewTheta', 'viewUnit', 'angleLock', 'hypLock']);
    updateLockText(triangle);
  };

  circle.subscriptions.add('visibility', 'processButton');
  background.onClick = () => { selectTriangle(''); };


  const showAll = () => {
    triSinCos.showAll();
    triTanSec.showAll();
    triCotCsc.showAll();
  };

  const setLock = (triangle, angleName, side, unit, thetaFlag) => {
    triangle.customState.lock = angleName;
    triangle.customState.lockHyp = side;
    triangle.customState.unit = unit;
    triangle.customState.theta = thetaFlag;
  };
  const setLocks = (
    ang1, side1, unit1, theta1,
    ang2, side2, unit2, theta2,
    ang3, side3, unit3, theta3,
  ) => {
    setLock(triSinCos, ang1, side1, unit1, theta1);
    setLock(triTanSec, ang2, side2, unit2, theta2);
    setLock(triCotCsc, ang3, side3, unit3, theta3);
  };
  const bindMoveElements = (triangle) => {
    triangle._rotTheta.move.element = triangle;
    triangle._rotRight.move.element = triangle;
    triangle._rotComp.move.element = triangle;
    triangle._movePad.move.element = triangle;
    triangle._movePad.onClick = () => selectTriangle(triangle);
    triangle._rotComp.onClick = () => selectTriangle(triangle);
    triangle._rotRight.onClick = () => selectTriangle(triangle);
    triangle._rotTheta.onClick = () => selectTriangle(triangle);
  };
  bindMoveElements(triSinCos);
  bindMoveElements(triTanSec);
  bindMoveElements(triCotCsc);

  circle._movePad.move.element = circle;

  /*
  .########..########..########..######..########.########..######.
  .##.....##.##.....##.##.......##....##.##..........##....##....##
  .##.....##.##.....##.##.......##.......##..........##....##......
  .########..########..######....######..######......##.....######.
  .##........##...##...##.............##.##..........##..........##
  .##........##....##..##.......##....##.##..........##....##....##
  .##........##.....##.########..######..########....##.....######.
  */
  const getPosition = (triangle, p, vertex, rotation, flipFlag) => {
    const matrix = new Fig.Transform().scale(flipFlag ? -1 : 1, 1).rotate(rotation).matrix();
    const { center, x, y } = triangle.customState;
    const thetaVertex = point(-center.x, -center.y);
    const rightVertex = (thetaVertex.add(x, 0));
    const compVertex = thetaVertex.add(x, y);
    if (vertex === 'theta') {
      return Fig.tools.g2.getPoint(p).sub(thetaVertex.transformBy(matrix));
    }
    if (vertex === 'comp') {
      return Fig.tools.g2.getPoint(p).sub(compVertex.transformBy(matrix));
    }
    return Fig.tools.g2.getPoint(p).sub(rightVertex.transformBy(matrix));
  };

  const createScenario = (scenario, triangle, p, vertex, rotation, flipFlag) => {
    triangle.scenarios[scenario] = {
      position: getPosition(triangle, p, vertex, rotation, flipFlag),
      scale: [flipFlag ? -1 : 1, 1],
      rotation,
    };
  };

  createScenario('preset1', triSinCos, origin, 'theta', 0, false);
  createScenario('preset1', triTanSec, origin, 'theta', 0, false);
  createScenario('preset1', triCotCsc, [origin[0] - thick / 2, origin[1] + thick / 2], 'theta', 0, false);
  createScenario('preset3', triSinCos, origin, 'theta', 0, false);
  createScenario('preset3', triTanSec, origin, 'theta', defaultAngle - Math.PI, true);
  createScenario('preset3', triCotCsc, origin, 'comp', Math.PI / 2 + defaultAngle, true);
  createScenario('preset2', triSinCos, origin, 'theta', 0, false);
  createScenario('preset2', triTanSec, origin, 'theta', 0, false);
  createScenario('preset2', triCotCsc, [origin[0] - thick / 2, origin[1] + thick / 2], 'comp', Math.PI, false);
  createScenario('reset', triSinCos, [-2.2, -0.5], 'theta', 0, false);
  createScenario('reset', triTanSec, [-0.8, -0.5], 'theta', 0, false);
  createScenario('reset', triCotCsc, [0.8, -0.5], 'theta', 0, false);

  const animateScenario = (scenario, dissolveOut, locks) => {
    figure.stop('freeze');
    showAll();
    circ.hide(dissolveOut);
    const velocity = new Fig.Transform().scale(0.5, 0.5).rotate(0.5).translate(0.5, 0.5);
    const duration1 = Fig.tools.g2.getMaxTimeFromVelocity(
      triSinCos.transform._dup(), triSinCos.getScenarioTarget(scenario).transform, velocity, 0,
    );
    const duration2 = Fig.tools.g2.getMaxTimeFromVelocity(
      triTanSec.transform._dup(), triTanSec.getScenarioTarget(scenario).transform, velocity, 0,
    );
    const duration3 = Fig.tools.g2.getMaxTimeFromVelocity(
      triCotCsc.transform._dup(), triCotCsc.getScenarioTarget(scenario).transform, velocity, 0,
    );
    const duration4 = Fig.tools.g2.getMaxTimeFromVelocity(
      circle.transform._dup(), circle.getScenarioTarget(scenario).transform, velocity, 0,
    );
    const duration = Math.min(3, Math.max(duration1, duration2, duration3, duration4));
    rotator.animations.new().rotation({ target: defaultAngle, duration }).start();
    figure.fnMap.exec('lockInput');
    circ.animations.new()
      .inParallel([
        triSinCos.animations.scenario({ target: scenario, duration }),
        triTanSec.animations.scenario({ target: scenario, duration }),
        triCotCsc.animations.scenario({ target: scenario, duration }),
        circle.animations.scenario({ target: scenario, duration }),
      ])
      .trigger('unlockInput')
      .start();
    selectTriangle('');
    setLocks(...locks);
  };

  figure.fnMap.global.add('lockInput', () => { rotator.isTouchable = false; });
  figure.fnMap.global.add('unlockInput', () => { rotator.isTouchable = true; });

  figure.fnMap.global.add('preset1', () => {
    animateScenario(
      'preset1',
      ['triSinCos.unit.label', 'triTanSec.unit.label', 'triCotCsc.theta'],
      [
        'theta', false, false, true,
        'theta', false, false, true,
        'theta', false, true, false,
      ],
    );
    if (!circle.isShown) {
      circle.animations.new().dissolveIn().start();
    }
  });
  figure.fnMap.global.add('preset2', () => {
    animateScenario(
      'preset2',
      ['triCotCsc.unit.label', 'triTanSec.unit.label', 'triSinCos.unit.label'],
      [
        'theta', false, false, true,
        'theta', false, false, true,
        'comp', false, false, true,
      ],
    );
    if (!circle.isShown) {
      circle.animations.new().dissolveIn().start();
    }
  });
  figure.fnMap.global.add('preset3', () => {
    animateScenario(
      'preset3',
      ['triCotCsc.unit.label', 'triTanSec.unit.label'],
      [
        'theta', false, true, true,
        'theta', true, false, true,
        'comp', true, false, true],
    );
    if (!circle.isShown) {
      circle.animations.new().dissolveIn().start();
    }
  });

  preset1.onClick = 'preset1';
  preset2.onClick = 'preset2';
  preset3.onClick = 'preset3';

  /*
  .########..########..######..########.########
  .##.....##.##.......##....##.##..........##...
  .##.....##.##.......##.......##..........##...
  .########..######....######..######......##...
  .##...##...##.............##.##..........##...
  .##....##..##.......##....##.##..........##...
  .##.....##.########..######..########....##...
  */
  figure.fnMap.global.add('reset', () => {
    showAll();
    rotator.setRotation(defaultAngle);
    circ.setScenarios('reset');
    circle.hide();
    setLock(triSinCos, 'theta', false, true, true);
    setLock(triTanSec, 'theta', false, true, true);
    setLock(triCotCsc, 'theta', false, true, true);
    selectTriangle('');
  });
}
