/* eslint-disable camelcase, no-restricted-globals */
/* globals figure, colTheta, colCot, colTan, colSin, colCos, colSec, colCsc,
   colGrey, Fig, thin, thick, colText */

function layoutCirc() {
  const radius = 1.5;
  const defaultAngle = 0.9;
  const defaultSin = radius * Math.sin(defaultAngle);
  const defaultCos = radius * Math.cos(defaultAngle);
  const point = (pointX, pointY) => new Fig.Point(pointX, pointY);

  const line = (name, color, width = thick, p1 = [0, 0], length = 1, ang = 0, dash = []) => ({
    name,
    method: 'primitives.line',
    options: {
      p1, length, angle: ang, width, color, dash,
    },
    // mods: { dimColor: colText },
  });

  const lineWithLabel = (name, color, text, width = thick, p1, length, ang) => ({
    name,
    method: 'collections.line',
    options: {
      width,
      color,
      p1,
      length,
      angle: ang,
      label: {
        text: {
          textFont: { style: 'normal' },
          forms: { 0: text },
        },
        orientation: 'horizontal',
        update: true,
      },
    },
  });

  function arc(name, color, width = thin, sides = 100, angleToDraw = Math.PI * 2, rotation = 0) {
    return {
      name,
      method: 'primitives.polygon',
      options: {
        radius, line: { width }, sides, angleToDraw: angleToDraw + 0.001, rotation, color,
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
    name, text, rad = 0.2, curvePosition = 0.5, position = [0, 0], startAngle = 0, angleSize = 0,
  ) {
    return {
      name,
      method: 'collections.angle',
      options: {
        color: colTheta,
        curve: {
          width: 0.01,
          radius: rad,
          sides: 400,
        },
        startAngle,
        angle: angleSize,
        label: {
          text,
          offset: 0.01,
          curvePosition,
        },
        position,
      },
    };
  }
  const tri = (name, elements, position, rotation, trans1 = {}, trans2 = {}) => ({
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
          color: [1, 0.5, 1, 0.3],
          close: true,
        },
        mods: {
          isMovable: true,
        },
      },
      // {
      //   name: 'lock',
      //   method: 'primitives.polygon',
      //   options: {
      //     radius: 0.1,
      //     color: [0, 0, 1, 0.5],
      //   },
      //   mods: {
      //     isMovable: true,
      //   },
      // },
    ],
    // options: {
    //   transform: new Fig.Transform().scale(1, 1).translate(1, 0).rotate(0).translate(-1, 0).translate(0, 0),
    // },
    mods: {
      scenarios: {
        default: { scale: [1, 1], position: [0, 0], rotation: 0 },
        split: { scale: [1, 1], position, rotation },
        trans1,
        trans2,
      },
      customState: { lock: 'theta' },
      // isMovable: true,
    },
  });


  const [circle] = figure.add({
    name: 'circ',
    method: 'collection',
    elements: [
      // Light Lines
      {
        name: 'flip',
        method: 'text',
        options: {
          text: 'Flip',
          position: [-2.9, 0],
          font: { size: 0.2 },
        },
        mods: {
          isTouchable: true,
        },
      },
      {
        name: 'rotate',
        method: 'text',
        options: {
          text: 'Rotate',
          position: [-2.9, -0.4],
          font: { size: 0.2 },
        },
        mods: {
          isTouchable: true,
        },
      },
      {
        name: 'lock',
        method: 'text',
        options: {
          text: 'Lock',
          position: [-2.9, 0.4],
          font: { size: 0.2 },
        },
        mods: {
          isTouchable: true,
        },
      },
      {
        name: 'lockHyp',
        method: 'text',
        options: {
          text: 'Hyp Free',
          position: [-2.9, 0.8],
          font: { size: 0.2 },
        },
        mods: {
          isTouchable: true,
        },
      },
      arc('circle', colGrey, thin),
      // arc('arc', colGrey, thin, 300, Math.PI / 2, 0),
      // line('xQ1', colGrey, thin, [0, 0], radius, 0),
      // line('yQ1', colGrey, thin, [0, 0], radius, Math.PI / 2),
      line('x', colGrey, thin, [-radius, 0], radius * 2, 0),
      line('y', colGrey, thin, [0, -radius], radius * 2, Math.PI / 2),
      // line('tanLight', colGrey, thin),
      // line('secLight', colGrey, thin),
      // line('cotLight', colGrey, thin),
      // line('cscLight', colGrey, thin),
      // line('sinLight', colGrey, thin),
      // line('tanLightAlt', colGrey, thin),
      // line('secLightAlt', colGrey, thin),
      // line('cotLightAlt', colGrey, thin),
      // line('cscLightAlt', colGrey, thin),
      // line('radiusLight', colGrey, thin),

      lineWithLabel('radius', colGrey, '1', thin),
      lineWithLabel('radiusAlt', colGrey, '1', thin),
      lineWithLabel('xRadius', colGrey, '1', thin, [0, 0], radius, 0),
      tri(
        'triTanSec',
        [
          // angle('theta', '\u03b8', 0.2, 0.5, [0, 0], 0, defaultAngle),
          lineWithLabel('unit', colText, '1', thick, [radius + thick / 2, 0], radius + thick * 0.7, Math.PI),
          lineWithLabel('tan', colTan, 'tan'),
          lineWithLabel('sec', colSec, 'sec'),
          // rightAngle('right', [radius, 0], Math.PI / 2),
        ],
        [0, 0],
        0,
        { scale: [1, -1], rotation: 0, position: [0, 0] },
        { scale: [1, -1], rotation: defaultAngle, position: [0, 0] },
      ),
      tri(
        'triCotCsc',
        [
          // angle('theta', '\u03b8', 0.2, 0.5, [0, 0], 0, defaultAngle),
          lineWithLabel('unit', colText, '1', thick, [-thick / 2, thick], radius - thick / 2, Math.PI / 2),
          lineWithLabel('csc', colCsc, 'csc'),
          lineWithLabel('cot', colCot, 'cot'),
          // rightAngle('right', [0, radius], -Math.PI / 2),
        ],
        [0.1, radius - 0.2 + 0.5 + 0.2],
        Math.PI,
        { scale: [-1, 1], rotation: 0, position: [0, 0] },
        { scale: [-1, 1], rotation: -(Math.PI / 2 - defaultAngle), position: [0, 0] },
      ),
      tri('triSinCos', [
        // angle('theta', '\u03b8', 0.2, 0.5, [0, 0], 0, defaultAngle),
        lineWithLabel('unit', colText, '1', thick, [0, 0], radius, defaultAngle),
        lineWithLabel('sin', colSin, 'sin'),
        lineWithLabel('cos', colCos, 'cos'),
        // rightAngle('right', [0, 0], Math.PI / 2),
      ], [-0.3 - 1.6, 0.8 + 0.2], 0),
      {
        name: 'rotator',
        method: 'collections.line',
        options: {
          length: radius,
          width: 0.1,
          color: [0, 0, 0, 0.5],
        },
        mods: {
          dimColor: [0, 0, 0, 0],
          move: { type: 'rotation' },
          isMovable: true,
          touchBorder: [0, 0.1, 1.5, 0.1],
        },
      },
    ],
    // options: {
    //   dimColor: colDarkGrey,
    // },
    mods: {
      scenarios: {
        title: { scale: 0.9, position: [-radius / 2, -1.2] },
        circQ1: { scale: 1, position: [-0.4, -1] },
        circQ1Values: { scale: 1, position: [-0.2, -1] },
        split: { scale: 1, position: [1.1, -1] },
        centerSplit: { scale: 1, position: [0.4, -1] },
        centerRightSplit: { scale: 1, position: [0.7, -1] },
        tanSecTri: { scale: 1, position: [0.5, -1] },
        circFull: { scale: 0.7, position: [0.7, 0] },
        nameDefs: { scale: 1, position: [0.4, -1] },
        fromCirc: { scale: 1.04 / 1.5, position: [-1.5, 0] },
      },
    },
  });
  const get = list => circle.getElements(list);
  const [rotator] = get(['rotator']);
  const [triCotCsc] = get(['triCotCsc']);
  const [triSinCos] = get(['triSinCos']);
  const [triTanSec] = get(['triTanSec']);
  const [cos, sin] = get({ triSinCos: ['cos', 'sin'] });
  const [cot, csc] = get({ triCotCsc: ['cot', 'csc'] });
  const [tan, sec] = get({ triTanSec: ['tan', 'sec'] });
  const [unitSinCos, thetaSinCos, rightSinCos, moveSinCos] = get({ triSinCos: ['unit', 'theta', 'right', 'movePad'] });
  const [unitTanSec, thetaTanSec, rightTanSec, moveTanSec] = get({ triTanSec: ['unit', 'theta', 'right', 'movePad'] });
  const [unitCotCsc, thetaCotCsc, rightCotCsc, moveCotCsc] = get({ triCotCsc: ['unit', 'theta', 'right', 'movePad'] });
  const [flip, rotate, lock, lockHyp] = get(['flip', 'rotate', 'lock', 'lockHyp']);
 
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
    // let element = rightElement;
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
    if (triElement.customState.lockSide === 'hyp') {
      const r = triElement.transform.r();
      const delta = triElement._theta.angle - triElement.customState.angle;
      triElement.transform.updateRotation(r + delta);
    }
    let pos = rightPos;
    if (triElement.customState.lock === 'theta') {
      pos = thetaPos
    } else if (triElement.customState.lock === 'comp') {
      pos = compPos;
    }
    const newP = triElement.pointFromSpaceToSpace(pos, 'draw', 'local');
    const delta = newP.sub(triElement.customState.lockPosition);
    const p = triElement.getPosition();
    triElement.setPosition(p.sub(delta));
    // if (triSinCos.customState.lock === 'right') {
    //   const newP = triSinCos.pointFromSpaceToSpace([cosVal, 0], 'draw', 'local')
    //   const delta = newP.sub(triSinCos.customState.lockPosition)
    //   const p = triSinCos.getPosition();
    //   triSinCos.setPosition(p.sub(delta));
    // }
    // if (triSinCos.customState.lock === 'comp') {
    //   const newP = triSinCos.pointFromSpaceToSpace([cosVal, sinVal], 'draw', 'local');
    //   const delta = newP.sub(triSinCos.customState.lockPosition);
    //   const p = triSinCos.getPosition();
    //   triSinCos.setPosition(p.sub(delta));
    // }
  };
  function updateCircle(rIn) {
    const r = rIn > Math.PI / 4 ? rIn - 0.00001 : rIn + 0.00001;
    const cosR = Math.cos(r);
    const sinR = Math.sin(r);
    const x = radius * cosR;
    const y = radius * sinR;
    const xSign = x === 0 ? 1 : x / Math.abs(x);
    const ySign = y === 0 ? 1 : y / Math.abs(y);
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
    // let quad = 1;
    // if (xSign < 0 && ySign > 0) {
    //   quad = 2;
    // } else if (xSign < 0) {
    //   quad = 3;
    // } else if (ySign < 0) {
    //   quad = 4;
    // }
    setCurrentLockPosition(triSinCos, cos.getP2(), unitSinCos.getP2(), cos.getP1());
    setCurrentLockPosition(triTanSec, unitTanSec.getP2(), sec.getP2(), sec.getP1());
    setCurrentLockPosition(triCotCsc, cot.getP2(), csc.getP2(), cot.getP1());

    // const sinCosCenter = Fig.tools.g2.getTriangleCenter([0, 0], [cosVal, 0], [cosVal, sinVal]);
    // const tanSecCenter = Fig.tools.g2.getTriangleCenter([[0, 0], [radius, 0], [radius, tanVal]]);
    // const cotCscCenter = Fig.tools.g2.getTriangleCenter([[0, 0], [cotVal, 0], [cotVal, radius]]);
    if (thetaSinCos.isShown) {
      thetaSinCos.setAngle({ angle: Math.acos(Math.abs(cosR)), position: [-c1.x, -c1.y] });
    }
    if (thetaCotCsc.isShown) {
      thetaCotCsc.setAngle({ angle: Math.acos(Math.abs(cosR)), position: [-c3.x, -c3.y] });
    }
    if (thetaTanSec.isShown) {
      thetaTanSec.setAngle({ angle: Math.acos(Math.abs(cosR)), position: [-c2.x, -c2.y] });
    }
    if (sin.isShown) {
      sin.setEndPoints(point(cosVal, 0).sub(c1), point(cosVal, sinVal).sub(c1));
    }
    if (cos.isShown) {
      cos.setEndPoints(point(0, 0).sub(c1), point(cosVal, 0).sub(c1));
    }
    if (unitSinCos.isShown) {
      unitSinCos.setEndPoints(
        point(0, 0).sub(c1), point(cosVal, sinVal).sub(c1),
      );
    }
    setRightAng(rightSinCos, true, point(cosVal, 0).sub(c1), Math.PI / 2);

    if (tan.isShown) {
      tan.setEndPoints(point(radius, 0).sub(c2), point(radius, tanVal).sub(c2));
    }
    if (sec.isShown) {
      sec.setEndPoints(point(0, 0).sub(c2), point(radius, tanVal).sub(c2));
    }
    if (unitTanSec.isShown) {
      unitTanSec.setEndPoints(point(0, 0).sub(c2), point(radius, 0).sub(c2));
    }
    setRightAng(rightTanSec, true, point(radius, 0).sub(c2), Math.PI / 2);

    if (cot.isShown) {
      cot.setEndPoints(point(0, 0).sub(c3), point(cotVal, 0).sub(c3));
    }
    if (csc.isShown) {
      csc.setEndPoints(point(0, 0).sub(c3), point(cotVal, radius).sub(c3));
    }
    if (unitCotCsc.isShown) {
      unitCotCsc.setEndPoints(point(cotVal, 0).sub(c3), point(cotVal, radius).sub(c3));
    }
    setRightAng(rightCotCsc, true, point(cotVal, 0).sub(c3), Math.PI / 2);

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

    // offsetForLock(triSinCos, cos, unitSinCos);
    // offsetForLock(triTanSec, unitTanSec, sec);
    // offsetForLock(triCotCsc, cot, csc);
    offsetForLock(triSinCos, cos.getP2(), unitSinCos.getP2(), cos.getP1());
    offsetForLock(triTanSec, unitTanSec.getP2(), sec.getP2(), sec.getP1());
    offsetForLock(triCotCsc, cot.getP2(), csc.getP2(), cot.getP1());

    
    // sin.setPosition(-sinCosCenter.x, -sinCosCenter.y);
    // cos.setPosition(-sinCosCenter.x, -sinCosCenter.y);
    // rightSinCos.setPosition(-sinCosCenter.x, -sinCosCenter.y);
    // thetaSinCos.setPosition(-sinCosCenter.x, -sinCosCenter.y);
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

  const addPulseFn = (name, element, xAlign, yAlign) => {
    figure.fnMap.global.add(name, () => {
      element.pulse({ xAlign, yAlign, duration: 1.5 });
      // console.log(name, element)
    });
  };
  const addPulseWidthFn = (name, element) => {
    figure.fnMap.global.add(name, () => {
      element.pulseWidth({ line: 8, duration: 1.5, label: 1 });
      // console.log(name, element)
    });
  };
  const add = (name, fn) => figure.fnMap.global.add(name, fn);

  add('circToRot', () => {
    if (rotator.isShown) {
      rotator.animations.new()
        .rotation({ target: 0.9, duration: 1 })
        .start();
      return;
    }
    // if (rotatorFull.isShown) {
    //   rotatorFull.animations.new()
    //     .rotation({ target: 0.9, duration: 1 })
    //     .start();
    // }
  });
  rotator.subscriptions.add('setTransform', 'updateCircle');
  // rotatorFull.subscriptions.add('setTransform', 'updateCircle');
  // symRot.subscriptions.add('setTransform', 'updateCircle');
  // const updateRotation = () => {
  //   if (!triCotCsc.isShown) {
  //     return;
  //   }
  //   const r = triCotCsc.getRotation();
  //   // console.log(triCotCsc.getRotation());
  //   if (Math.abs(triCotCsc.getRotation()) < 0.001) {
  //   //   cot.label.location = ySign > 0 ? 'top' : 'bottom';
  //   // } else {
  //     cot.label.location = 'positive';
  //     csc.label.location = 'positive';
  //   }
  //   triCotCsc._cot.updateLabel(r);
  //   triCotCsc._csc.updateLabel(r);
  //   triCotCsc._unit.updateLabel(r);
  // };
  // const lock = (element, angle) => {
  //   element.customState.lock = angle;
  // };
  triSinCos.setScale([-1, 1]);

  const updateLabels = (triElement, el1, el2, el3, el4) => {
    const s = triElement.getScale();
    const r = s.x * s.y * triElement.getRotation();
    const labelSx = s.x < 0 ? -1 : 1;
    const labelSy = s.y < 0 ? -1 : 1;
    el1._label.setScale(labelSx, labelSy);
    el1.updateLabel(r);
    el2._label.setScale(labelSx, labelSy);
    el2.updateLabel(r);
    el3._label.setScale(labelSx, labelSy);
    el3.updateLabel(r);
    el4._label.setScale(labelSx, labelSy);
    el4.updateLabel(r);
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

  // figure.fnMap.global.add('updateRotation', () => updateRotation());
  // triCotCsc.fnMap.add('updateRotation', () => updateRotation());
  triCotCsc.subscriptions.add('setTransform', 'updateRotation');
  triCotCsc.subscriptions.add('setState', 'updateRotation');

  rotator.setRotation(0.5);

  flip.onClick = () => {
    const triElement = circle.getElement(circle.customState.selected);
    const target = [triElement.getScale().x < 0 ? 1 : -1, 1];
    triElement.stop('freeze');
    triElement.animations.new().scale({ target, duration: 2 }).start();
  };

  rotate.onClick = () => {
    const movePad = circle.getElement(circle.customState.selected).getElement('movePad');
    if (movePad.move.type === 'translation') {
      movePad.move.type = 'rotation';
      rotate.custom.updateText({ text: 'Rotating' });
    } else {
      movePad.move.type = 'translation';
      rotate.custom.updateText({ text: 'Moving' });
    }
  };

  const updateLockText = (triElement) => {
    lock.custom.updateText({ text: `Lock: ${triElement.customState.lock}` });
    lockHyp.custom.updateText({ text: `Lock Side: ${triElement.customState.lockSide}` });
  };

  lock.onClick = () => {
    const triElement = circle.getElement(circle.customState.selected);
    if (triElement.customState.lock === 'theta') {
      triElement.customState.lock = 'right';
    } else if (triElement.customState.lock === 'right') {
      triElement.customState.lock = 'comp';
    } else {
      triElement.customState.lock = 'theta';
    }
    updateLockText(triElement);
  };

  lockHyp.onClick = () => {
    const triElement = circle.getElement(circle.customState.selected);
    if (triElement.customState.lockSide === 'hyp') {
      triElement.customState.lockSide = '';
    } else {
      triElement.customState.lockSide = 'hyp';
    }
    updateLockText(triElement);
  }

  moveSinCos.move.element = triSinCos;
  moveTanSec.move.element = triTanSec;
  moveCotCsc.move.element = triCotCsc;
  moveSinCos.customState.lock = 'theta';
  moveTanSec.customState.lock = 'theta';
  moveCotCsc.customState.lock = 'theta';
  moveSinCos.onClick = () => {
    moveSinCos.setOpacity(1);
    moveTanSec.setOpacity(0);
    moveCotCsc.setOpacity(0);
    circle.customState.selected = 'triSinCos';
    updateLockText(triSinCos);
  };
  moveTanSec.onClick = () => {
    circle.customState.selected = 'triTanSec';
    moveSinCos.setOpacity(0);
    moveTanSec.setOpacity(1);
    moveCotCsc.setOpacity(0);
    updateLockText(triTanSec);
  };
  moveCotCsc.onClick = () => {
    circle.customState.selected = 'triCotCsc';
    moveSinCos.setOpacity(0);
    moveTanSec.setOpacity(0);
    moveCotCsc.setOpacity(1);
    updateLockText(triCotCsc);
  };

  // triSinCos.subscriptions.add('setTransform', () => {
  //   triSinCos
  // })
}
