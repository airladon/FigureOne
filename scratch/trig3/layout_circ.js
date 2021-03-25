/* eslint-disable camelcase, no-restricted-globals, no-param-reassign */
/* globals figure, colTheta, colCot, colTan, colSin, colCos, colSec, colCsc,
   colGrey, Fig, thin, thick, colText */

// eslint-disable-next-line
function layoutCirc() {
  const radius = 1.1;
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
        lock: 'theta', lockHyp: false, center, x, y, unit: true,
      },
    },
  });

  const button = (name, position, text) => ({
    name,
    method: 'collections.rectangle',
    options: {
      label: { text, font: { size: 0.1 } },
      position,
      width: 0.7,
      height: 0.3,
      line: { width: thin },
      corner: { radius: 0.02, sides: 3 },
      color: colText,
    },
    mods: { isTouchable: true },
  });


  const [circ] = figure.add({
    name: 'circ',
    method: 'collection',
    elements: [
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
      button('flip', [-2.6, 1.2], 'Flip'),
      button('lock', [-2.6, 0.8], 'Lock: Theta'),
      button('lockHyp', [-2.6, 0.4], 'Lock Hyp: No'),
      button('unitButton', [-2.6, 0], 'Unit: Yes'),
      button('circleButton', [1.8, -1.2], 'Circle: No'),
      button('reset', [2.6, -1.2], 'Reset'),
      {
        name: 'arcButton',
        method: 'collection',
        elements: [
          arc('arc', colText, thin, 100, Math.PI / 2, 0, 0.2),
          line('x', colText, thin, [0, 0], 0.2, 0),
          line('y', colText, thin, [0, 0], 0.2, Math.PI / 2),
        ],
        options: {
          position: [2.6, 1.2],
        },
        mods: {
          isTouchable: true,
          touchBorder: 0.1,
        },
      },
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
  const [flip, lock, lockHyp, reset, arcButton, unitButton] = get(['flip', 'lock', 'lockHyp', 'reset', 'arcButton', 'unitButton']);
  const [circle] = get(['circle']);

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
    triElement.customState.angle = triElement._theta.angle;
    let pos = rightPos;
    if (triElement.customState.lock === 'theta') {
      pos = thetaPos;
    } else if (triElement.customState.lock === 'comp') {
      pos = compPos;
    }
    triElement.customState.lockPosition
      = triElement.pointFromSpaceToSpace(pos, 'draw', 'local');
  };
  const offsetForLock = (triElement, rightPos, compPos, thetaPos) => {
    if (triElement.customState.lockHyp) {
      const s = triElement.transform.s().x;
      const r = triElement.transform.r();
      const delta = triElement._theta.angle - triElement.customState.angle;
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

    offsetForLock(triSinCos, cos.getP2(), unitSinCos.getP2(), cos.getP1());
    offsetForLock(triTanSec, unitTanSec.getP2(), sec.getP2(), sec.getP1());
    offsetForLock(triCotCsc, cot.getP2(), csc.getP2(), cot.getP1());
  }
  const rotatorUpdateCircle = () => {
    if (rotator.isShown) {
      updateCircle(Fig.tools.g2.clipAngle(rotator.transform.r(), '0to360'));
    }
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
    lock.setLabel(`Lock: ${triElement.customState.lock}`);
    lockHyp.setLabel(`Lock Hyp: ${triElement.customState.lockHyp ? 'Yes' : 'No'}`);
    if (triElement.customState.unit) {
      unitButton.setLabel('Unit: Yes');
      triElement._unit._label.show();
    } else {
      unitButton.setLabel('Unit: No');
      triElement._unit._label.hide();
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
  circle.subscriptions.add('visibility', 'processButton');

  reset.onClick = () => { figure.fnMap.exec('reset'); };

  const selectTriangle = (triangle) => {
    moveSinCos.setOpacity(0);
    moveTanSec.setOpacity(0);
    moveCotCsc.setOpacity(0);
    if (triangle === '') {
      lock.hide();
      flip.hide();
      lockHyp.hide();
      unitButton.hide();
      circ.customState.selected = '';
      return;
    }
    triangle._movePad.setOpacity(1);
    circ.customState.selected = triangle.name;
    updateLockText(triangle);
    lock.showAll();
    flip.showAll();
    lockHyp.showAll();
    unitButton.showAll();
  };

  const showAll = () => {
    triSinCos.showAll();
    triTanSec.showAll();
    triCotCsc.showAll();
  };

  const setLock = (triangle, angleName, side, unit) => {
    if (angleName != null) {
      triangle.customState.lock = angleName;
    }
    if (side != null) {
      triangle.customState.lockHyp = side;
    }
    if (unit != null) {
      triangle.customState.unit = unit;
    }
  };
  const setLocks = (ang1, side1, unit1, ang2, side2, unit2, ang3, side3, unit3) => {
    setLock(triSinCos, ang1, side1, unit1);
    setLock(triTanSec, ang2, side2, unit2);
    setLock(triCotCsc, ang3, side3, unit3);
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
  createScenario('preset2', triSinCos, origin, 'theta', 0, false);
  createScenario('preset2', triTanSec, origin, 'theta', defaultAngle - Math.PI, true);
  createScenario('preset2', triCotCsc, origin, 'comp', Math.PI / 2 + defaultAngle, true);
  createScenario('preset3', triSinCos, origin, 'theta', 0, false);
  createScenario('preset3', triTanSec, origin, 'theta', 0, false);
  createScenario('preset3', triCotCsc, [origin[0] - thick / 2, origin[1] + thick / 2], 'comp', Math.PI, false);
  createScenario('reset', triSinCos, [-2.2, -0.5], 'theta', 0, false);
  createScenario('reset', triTanSec, [-0.8, -0.5], 'theta', 0, false);
  createScenario('reset', triCotCsc, [0.8, -0.5], 'theta', 0, false);

  const animateScenario = (scenario, dissolveOut, locks, duration = 3) => {
    figure.stop('freeze');
    showAll();
    circ.hide(dissolveOut);
    rotator.animations.new().rotation({ target: defaultAngle, duration }).start();
    circ.animations.new()
      .inParallel([
        circ.animations.scenarios({ target: scenario, duration }),
      ])
      .start();
    selectTriangle('');
    setLocks(...locks);
  };

  figure.fnMap.global.add('preset1', () => {
    animateScenario(
      'preset1',
      ['triSinCos.unit.label', 'triTanSec.unit.label', 'triCotCsc.theta'],
      ['theta', false, false, 'theta', false, false, 'theta', false, true],
    );
    if (!circle.isShown) {
      circle.animations.new().dissolveIn().start();
    }
  });
  figure.fnMap.global.add('preset2', () => {
    animateScenario(
      'preset2',
      ['triCotCsc.unit.label', 'triTanSec.unit.label'],
      ['theta', false, true, 'theta', true, false, 'comp', true, false],
    );
    if (!circle.isShown) {
      circle.animations.new().dissolveIn().start();
    }
  });
  figure.fnMap.global.add('preset3', () => {
    animateScenario(
      'preset3',
      ['triCotCsc.unit.label', 'triTanSec.unit.label', 'triSinCos.unit.label'],
      ['theta', false, false, 'theta', false, false, 'comp', false, false],
    );
    if (!circle.isShown) {
      circle.animations.new().dissolveIn().start();
    }
  });

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
    setLocks('theta', false, true, 'theta', false, true, 'theta', false, true);
    selectTriangle('');
  });
}
