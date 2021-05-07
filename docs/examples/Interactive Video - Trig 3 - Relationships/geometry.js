/* eslint-disable camelcase, no-restricted-globals, no-param-reassign */
/* globals figure, colTheta, colCot, colTan, colSin, colCos, colSec, colCsc,
   colGrey, Fig, thin, thick, colText, medium */

/* eslint no-unused-vars: ["error", { "vars": "local" }] */

// eslint-disable-next-line
function layoutCirc() {
  // Default dimensions of triangles
  const radius = 1.2;
  const defaultAngle = 35 / 180 * Math.PI;
  const dCos = radius * Math.cos(defaultAngle);
  const dSin = radius * Math.sin(defaultAngle);
  const dTan = radius * Math.tan(defaultAngle);
  const dCot = radius / Math.tan(defaultAngle);
  const dC1 = Fig.tools.g2.getTriangleCenter([0, 0], [dCos, 0], [dCos, dSin]);
  const dC2 = Fig.tools.g2.getTriangleCenter([0, 0], [radius, 0], [radius, dTan]);
  const dC3 = Fig.tools.g2.getTriangleCenter([0, 0], [dCot, 0], [dCot, radius]);
  const origin = [-0.8, -0.5];
  const point = (pointX, pointY) => new Fig.Point(pointX, pointY);

  // Helper function for a simple line primitive definition object
  const line = (name, color, width = thick, p1 = [0, 0], length = 1, ang = 0, dash = []) => ({
    name,
    method: 'primitives.line',
    options: {
      p1, length, angle: ang, width, color, dash,
    },
  });

  // Helper function for a labeled line definition object
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

  // Helper function that creates an arc definition object
  function arc(
    name, color, width = thin, sides = 100, angleToDraw = Math.PI * 2, rotation = 0, rad = radius,
  ) {
    return {
      name,
      method: 'primitives.polygon',
      options: {
        radius: rad, line: { width }, sides, angleToDraw: angleToDraw + 0.001, rotation, color,
      },
    };
  }

  // Helper function that creates a definition object that draws an eye icon
  const addEye = (name, position) => ({
    name,
    method: 'collection',
    elements: [
      {
        name: 'eye1',
        method: 'polygon',
        options: {
          line: { width: medium },
          radius: 0.075,
          angleToDraw: 2,
          rotation: Math.PI / 2 - 1,
          sides: 100,
          position: [0, -0.043],
        },
      },
      {
        name: 'eye2',
        method: 'polygon',
        options: {
          line: { width: medium },
          radius: 0.075,
          angleToDraw: 2,
          rotation: Math.PI / 2 - 1 + Math.PI,
          sides: 100,
          position: [0, 0.043],
        },
      },
      { name: 'center', method: 'polygon', options: { radius: 0.012, sides: 6 } },
      { name: 'strike', method: 'line', options: { p1: [-0.05, -0.05], p2: [0.05, 0.05], width: medium } },
    ],
    options: {
      position,
    },
    mods: {
      custom: {
        visible: () => figure.elements._geom.getElement(name)._strike.hide(),
        hidden: () => figure.elements._geom.getElement(name)._strike.show(),
      },
    },
  });

  // Helper function that creates a definition object that draws a lock icon
  const addLock = (name, position) => ({
    name,
    method: 'collection',
    elements: [
      {
        name: 'lock',
        method: 'polygon',
        options: {
          position: [0, 0.035],
          line: { width: medium },
          radius: 0.025,
          sides: 20,
          angleToDraw: Math.PI,
        },
      },
      {
        name: 'r',
        method: 'collections.rectangle',
        options: {
          width: 0.08,
          height: 0.07,
          corner: { radius: 0.005 },
          line: { width: medium },
          fill: [1, 1, 1, 1],
        },
      },
    ],
    options: {
      position,
    },
    mods: {
      custom: {
        lock: () => figure.elements._geom.getElement(name)._lock.setRotation(0),
        unlock: () => figure.elements._geom.getElement(name)._lock.setRotation(0.7),
      },
    },
  });

  // Helper function to make a right angle
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

  // Helper function to make a angle
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

  // Helper function to make a rotation pad for a triangle
  const rot = name => ({
    name,
    method: 'primitives.generic',
    options: { color: [0, 1, 1, 0] },
    mods: {
      isMovable: true,
      move: { type: 'rotation' },
    },
  });

  // Helper function to make a background triangle rotator pad
  const rotPad = name => ({
    name,
    method: 'primitives.polygon',
    options: {
      color: [0, 1, 0, 0],
      radius: 0.3,
      sides: 8,
    },
    mods: {
      isMovable: true,
      move: { type: 'rotation' },
    },
  });

  /**
   * Helper function that creates a triangle collection with a right angle
   * annotation ('right'), theta angle annotation ('theta'), rotation pads
   * ('rotTheta', 'rotComp' and 'rotRight'), translation move pad ('movePad'),
   * and three labeled lines (input as the 'elements' param)
   *
   * Each triangle carries state information with it that is saved in a seek
   * state and used to size and position the triangle when a seek state is set:
   *  - `angle` - last theta angle of the triangle
   *  - `center` - center position of triangle with default theta
   *  - `lock` - which vertex is locked in place
   *  - `lockHyp` - whether to lock the hypotenuse rotation in place
   *  - `lockPosition` - position of the locked vertex in local space
   *  - `theta` - whether the theta label is visible
   *  - `unit` - whether the unit label is visible
   *  - `x` - length of adjacent side (side along the x axis when tri rotation
   *     is 0)
   *  - `y` - length of opposite side (side along the y axis when tri rotation
   *     is 0)
   */
  const tri = (name, elements, position, rotation, center, x, y) => ({
    name,
    method: 'collection',
    elements: [
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
      ...elements,
    ],
    mods: {
      customState: {
        lock: 'theta', lockHyp: false, center, x, y, unit: true, theta: true, lockPosition: [0, 0], angle: defaultAngle,
      },
    },
  });

  /**
  * The background triangle is aligned with the visible triangle. It is a
  * collection that has only rotator pads, but unlike the visible triangle
  * these pads extend out beyond the triangle. All background triangles are
  * under the visible triangles in the draw stack. The background triangle
  * makes it possible to touch near a triangle vertex to rotate it, instead of
  * only on the vertex. If however the touch is also on another visible
  * triangle, then that visible triangle will get the touch priority.
  */
  const backgroundTri = name => ({
    name,
    method: 'collection',
    elements: [
      rotPad('rotTheta'),
      rotPad('rotComp'),
      rotPad('rotRight'),
    ],
  });

  // Helper function that creates a definition object for a button collection
  // The button has a label, border and fill
  function button(
    name, position, text, width = 0.7, height = 0.25, size = 0.1, textPosition = [0, 0],
  ) {
    return {
      name,
      method: 'collection',
      elements: [
        {
          name: 'rect',
          method: 'collections.rectangle',
          options: {
            width,
            height,
            line: { width: thin },
            corner: { radius: 0.02, sides: 3 },
            fill: [1, 1, 1, 1],
            color: colGrey,
          },
        },
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
            fixColor: true,
            modifiers: {
              theta: {
                text: '\u03b8',
                font: {
                  style: 'italic', family: 'Time New Roman', size: size * 1.2,
                },
              },
              _90: {
                text: '90\u00b0',
                font: {
                  family: 'Time New Roman', size: size * 1.2,
                },
              },
              min: {
                text: '\u2212',
                font: {
                  family: 'Time New Roman', size: size * 1.2,
                },
              },
            },
          },
        },
      ],
      options: { position },
      mods: { isTouchable: true, touchBorder: 0 },
    };
  }

  // Add all the elements to the figure
  const geom = figure.add({
    name: 'geom',
    method: 'collection',
    elements: [
      // When 'background' is touched, any selected triangle will be
      // deselected
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
      // A quarter circle with axes
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
            preset4: { position: origin },
          },
        },
      },
      // Three background triangles that have corner rotation pads that extend
      // beyond the visible triangles
      backgroundTri('triCotCscRotPads'),
      backgroundTri('triTanSecRotPads'),
      backgroundTri('triSinCosRotPads'),
      // Three main triangles that can be manipulated
      tri(
        'triCotCsc',
        [
          lineWithLabel('csc', colCsc, 'csc'),
          lineWithLabel('unit', colText, '1', thick, [-thick / 2, thick], radius - thick / 2, Math.PI / 2),
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
          lineWithLabel('sec', colSec, 'sec'),
          lineWithLabel('tan', colTan, 'tan'),
          lineWithLabel('unit', colText, '1', thick, [radius + thick / 2, 0], radius + thick * 0.7, Math.PI),
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
      // Theta angle widget UI that is a theta angle with label and a
      // background. The background separates the button from the triangle
      // elements when they are dragged over the same spot
      {
        name: 'angleBackground',
        method: 'primitives.polygon',
        options: {
          sides: 400,
          color: [1, 1, 1, 1],
          radius: 0.3,
          position: [-2.8, -1.3],
        },
      },
      angle('theta', '0', 0.3, 0.5, [-2.8, -1.3], 0, defaultAngle, { length: 0.33, width: thick }),

      // Buttons
      button('flip', [0.1, -1.2], 'Flip', 0.3, 0.25, 0.1, [0, -0.01]),
      button('unitButton', [0.5, -1.2], 'Unit', 0.3, 0.25, 0.07, [0, -0.06]),
      button('thetaButton', [0.9, -1.2], '|theta|', 0.3, 0.25, 0.07, [0, -0.06]),
      button('lockHyp', [1.3, -1.2], 'Hyp', 0.3, 0.25, 0.07, [0, -0.06]),
      button('lockAngle', [1.7, -1.2], '|theta|', 0.3, 0.25, 0.07, [0, -0.06]),
      button('reset', [2.6, -1.2], 'Reset', 0.4),
      button('preset1', [-2, -1.2], '1', 0.25),
      button('preset2', [-1.6, -1.2], '2', 0.25),
      button('preset3', [-1.2, -1.2], '3', 0.25),
      {
        name: 'arcButton',
        method: 'collection',
        elements: [
          {
            name: 'fill',
            method: 'primitives.polygon',
            options: {
              color: [1, 1, 1, 1],
              radius: 0.22,
              sides: 400,
              angleToDraw: Math.PI / 2,
            },
          },
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
      // Lock and Eye icons that will be overlaid on associated buttons
      addLock('hypLock', [1.3, -1.17]),
      addLock('angleLock', [1.7, -1.17], 0),
      addEye('viewUnit', [0.5, -1.16]),
      addEye('viewTheta', [0.9, -1.16]),
      // Invisible rotator element for the theta widget - at the top of the
      // draw stack so it is touched first before anything else
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
        },
      },
    ],
    mods: {
      customState: { selected: '' },
    },
  });

  // Get figure elements to be used in logic
  const get = list => geom.getElements(list);
  const [rotator, theta] = get(['rotator', 'theta']);
  const [triCotCsc] = get(['triCotCsc']);
  const [triSinCos] = get(['triSinCos']);
  const [triTanSec] = get(['triTanSec']);
  const [triCotCscRotPads] = get(['triCotCscRotPads']);
  const [triSinCosRotPads] = get(['triSinCosRotPads']);
  const [triTanSecRotPads] = get(['triTanSecRotPads']);
  const [cos, sin] = get({ triSinCos: ['cos', 'sin'] });
  const [cot, csc] = get({ triCotCsc: ['cot', 'csc'] });
  const [tan, sec] = get({ triTanSec: ['tan', 'sec'] });
  const [unitSinCos, thetaSinCos, rightSinCos, moveSinCos, rotThetaSinCos, rotCompSinCos, rotRightSinCos] = get({ triSinCos: ['unit', 'theta', 'right', 'movePad', 'rotTheta', 'rotComp', 'rotRight'] });
  const [unitTanSec, thetaTanSec, rightTanSec, moveTanSec, rotThetaTanSec, rotCompTanSec, rotRightTanSec] = get({ triTanSec: ['unit', 'theta', 'right', 'movePad', 'rotTheta', 'rotComp', 'rotRight'] });
  const [unitCotCsc, thetaCotCsc, rightCotCsc, moveCotCsc, rotThetaCotCsc, rotCompCotCsc, rotRightCotCsc] = get({ triCotCsc: ['unit', 'theta', 'right', 'movePad', 'rotTheta', 'rotComp', 'rotRight'] });
  const [flipButton, lockAngle, lockHyp, reset, arcButton, unitButton, thetaButton] = get(['flip', 'lockAngle', 'lockHyp', 'reset', 'arcButton', 'unitButton', 'thetaButton']);
  const [circle, background] = get(['circle', 'background']);
  const [preset1, preset2, preset3] = get(['preset1', 'preset2', 'preset3']);
  const [hypLock, viewUnit, viewTheta] = get(['hypLock', 'viewUnit', 'viewTheta']);
  const [angleBackground] = get(['angleBackground']);

  // Default locations for sec, csc and unitSinCos labels
  sec.label.location = 'positive';
  csc.label.location = 'positive';
  unitSinCos.label.location = 'positive';

  // Set the theta widget label to a real angle label in degrees
  theta.setLabelToRealAngle();

  // Helper function that hides or shows a right angle depending on the result
  // of the `test` param
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

  // Helper function that hides or shows a theta angle depending on the result
  // of the `test` param
  const checkThetaAngleVisbility = (element, test) => {
    if (element.isShown) {
      if (test) {
        element.setOpacity(1);
      } else {
        element.setOpacity(0);
      }
    }
  };

  // Store the current theta angle, and position of the locked vertex. These
  // values will be used by `offsetLock` to calculate delta positions and
  // rotations of the triangle to make the locked vertex stay in place, and
  // if necessary, make the hypotenuse rotation stay constant
  const setCurrentLockPosition = (triElement, rightPos, compPos, thetaPos) => {
    // Store the current theta angle
    triElement.customState.oldTheta = triSinCos._unit.line.angle();
    // Store the position of the locked vertex
    let pos = rightPos;
    if (triElement.customState.lock === 'theta') {
      pos = thetaPos;
    } else if (triElement.customState.lock === 'comp') {
      pos = compPos;
    }
    triElement.customState.lockPosition
      = triElement.pointFromSpaceToSpace(pos, 'draw', 'local');
  };

  // Adjust the rotation and translation of the triangle to make it look like
  // the locked vertex stays in position and, if the hypotenuse is locked,
  // the hypotenuse rotation is not changed
  const offsetForLock = (triElement, newTheta, rightPos, compPos, thetaPos) => {
    // If the hypotenuse is locked in place, then rotate the triangle the delta
    // between the old theta and new theta so that it looks like the hypotenuse
    // rotation hasn't changed. NB, scale.x will be -1 when the triangle is
    // flipped.
    if (triElement.customState.lockHyp) {
      const s = triElement.transform.s().x;
      const r = triElement.transform.r();
      const delta = newTheta - triElement.customState.oldTheta;
      triElement.transform.updateRotation(r - s * delta);
    }
    let pos = rightPos;
    if (triElement.customState.lock === 'theta') {
      pos = thetaPos;
    } else if (triElement.customState.lock === 'comp') {
      pos = compPos;
    }
    // Use the delta between the new and old positions of the locked vertex
    // to adjust the triangle translation and make it look like the vertex
    // hasn't moved
    const newP = triElement.pointFromSpaceToSpace(pos, 'draw', 'local');
    const delta = newP.sub(triElement.customState.lockPosition);
    const p = triElement.getPosition();
    triElement.setPosition(p.sub(delta));
  };

  // Update the points of the rotator for some specificed angle at
  // a vertex of a triangle
  const setRotPad = (rotPadEl, vertex, startAngle, ang, rotPadRad = 0.3) => {
    const v = Fig.tools.g2.getPoint(vertex);
    const cosV = rotPadRad * Math.cos(startAngle);
    const sinV = rotPadRad * Math.sin(startAngle);
    const cosVStop = rotPadRad * Math.cos(startAngle + ang);
    const sinVStop = rotPadRad * Math.sin(startAngle + ang);
    rotPadEl.custom.updatePoints({
      points: [v, v.add(cosV, sinV), v.add(cosVStop, sinVStop)],
    });
  };

  // Update the positions of the background rot pads for each triangle
  const setBackgroundRotPads = (backgroundTriangle, vTheta, vComp, vRight) => {
    backgroundTriangle._rotTheta.setPosition(vTheta);
    backgroundTriangle._rotComp.setPosition(vComp);
    backgroundTriangle._rotRight.setPosition(vRight);
  };

  // Update the triangles for a some angle theta
  function updateGeometry(angleTheta) {
    // Calculate the trig values for theta
    const r = angleTheta > Math.PI / 4 ? angleTheta - 0.00001 : angleTheta + 0.00001;
    const cosR = Math.cos(r);
    const sinR = Math.sin(r);
    const cosVal = Math.abs(radius * cosR);
    const sinVal = Math.abs(radius * sinR);
    const tanVal = Math.abs(radius * sinR / cosR);
    const cotVal = Math.abs(radius * cosR / sinR);
    rotator.customState = {
      cosVal, sinVal, tanVal, cotVal,
    };

    // The triangle centers change when theta changes
    const c1 = Fig.tools.g2.getTriangleCenter([0, 0], [cosVal, 0], [cosVal, sinVal]);
    const c2 = Fig.tools.g2.getTriangleCenter([0, 0], [radius, 0], [radius, tanVal]);
    const c3 = Fig.tools.g2.getTriangleCenter([0, 0], [cotVal, 0], [cotVal, radius]);

    // Update the theta widget UI with the new angle
    if (theta.isShown) {
      theta.setAngle({ angle: Math.acos(Math.abs(cosR)) });
    }
    angleBackground.angleToDraw = r;

    // Store current theta value and positions of locked vertex
    setCurrentLockPosition(triSinCos, cos.getP2(), unitSinCos.getP2(), cos.getP1());
    setCurrentLockPosition(triTanSec, unitTanSec.getP2(), sec.getP2(), sec.getP1());
    setCurrentLockPosition(triCotCsc, cot.getP2(), csc.getP2(), cot.getP1());

    // Set the theta angle for each triangle (if the theta angle is shown)
    if (thetaSinCos.isShown) {
      thetaSinCos.setAngle({ angle: Math.acos(Math.abs(cosR)), position: [-c1.x, -c1.y] });
    }
    if (thetaCotCsc.isShown) {
      thetaCotCsc.setAngle({ angle: Math.acos(Math.abs(cosR)), position: [-c3.x, -c3.y] });
    }
    if (thetaTanSec.isShown) {
      thetaTanSec.setAngle({ angle: Math.acos(Math.abs(cosR)), position: [-c2.x, -c2.y] });
    }

    // Update the sides and angles for the sinCos triangle
    sin.setEndPoints(point(cosVal, 0).sub(c1), point(cosVal, sinVal + thick / 3).sub(c1));
    cos.setEndPoints(point(-thick / 2, 0).sub(c1), point(cosVal + thick / 2, 0).sub(c1));
    unitSinCos.setEndPoints(point(0, 0).sub(c1), point(cosVal, sinVal).sub(c1));
    setRightAng(
      rightSinCos, r > 0.2 && r < Math.PI / 2 - 0.2, point(cosVal, 0).sub(c1), Math.PI / 2,
    );
    checkThetaAngleVisbility(thetaSinCos, r < Math.PI / 2 - 0.2);

    // Update the sides and angles for the tanSec triangle
    tan.setEndPoints(point(radius, -thick / 2).sub(c2), point(radius, tanVal + thick / 3).sub(c2));
    sec.setEndPoints(point(0, 0).sub(c2), point(radius, tanVal).sub(c2));
    unitTanSec.setEndPoints(point(-thick / 2, 0).sub(c2), point(radius + thick / 2, 0).sub(c2));
    setRightAng(rightTanSec, r > 0.2, point(radius, 0).sub(c2), Math.PI / 2);

    // Update the sides and angles for the cotCsc triangle
    cot.setEndPoints(point(-thick / 2, 0).sub(c3), point(cotVal + thick / 2, 0).sub(c3));
    csc.setEndPoints(point(0, 0).sub(c3), point(cotVal, radius).sub(c3));
    unitCotCsc.setEndPoints(point(cotVal, 0).sub(c3), point(cotVal, radius + thick / 3).sub(c3));
    setRightAng(rightCotCsc, r < Math.PI / 2 - 0.2, point(cotVal, 0).sub(c3), Math.PI / 2);
    checkThetaAngleVisbility(thetaCotCsc, r < Math.PI / 2 - 0.2);

    // Update the rotator pads for all triangles
    setRotPad(rotThetaSinCos, [-c1.x, -c1.y], 0, r, 0.35);
    setRotPad(rotThetaTanSec, [-c2.x, -c2.y], 0, r, 0.35);
    setRotPad(rotThetaCotCsc, [-c3.x, -c3.y], 0, r, 0.55);

    setRotPad(rotRightSinCos, [cosVal - c1.x, -c1.y], Math.PI / 2, Math.PI / 2);
    setRotPad(rotRightTanSec, [radius - c2.x, -c2.y], Math.PI / 2, Math.PI / 2);
    setRotPad(rotRightCotCsc, [cotVal - c3.x, -c3.y], Math.PI / 2, Math.PI / 2, 0.45);

    setRotPad(rotCompSinCos, [cosVal - c1.x, sinVal - c1.y], Math.PI + r, Math.PI / 2 - r);
    setRotPad(rotCompTanSec, [radius - c2.x, tanVal - c2.y], Math.PI + r, Math.PI / 2 - r);
    setRotPad(rotCompCotCsc, [cotVal - c3.x, radius - c3.y], Math.PI + r, Math.PI / 2 - r, 0.45);

    // Update the rotator pads for the background triangles
    setBackgroundRotPads(
      triSinCosRotPads, [-c1.x, -c1.y], [cosVal - c1.x, -c1.y], [cosVal - c1.x, sinVal - c1.y],
    );
    setBackgroundRotPads(
      triTanSecRotPads, [-c2.x, -c2.y], [radius - c2.x, -c2.y], [radius - c2.x, tanVal - c2.y],
    );
    setBackgroundRotPads(
      triCotCscRotPads, [-c3.x, -c3.y], [cotVal - c3.x, -c3.y], [cotVal - c3.x, radius - c3.y],
    );


    // Update the translation move pads for the three triangles
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

    // Offset the triangles so the locked vertex stays in place, and if
    // necessary, the hypotenuse rotation doesn't change
    offsetForLock(triSinCos, r, cos.getP2(), unitSinCos.getP2(), cos.getP1());
    offsetForLock(triTanSec, r, unitTanSec.getP2(), sec.getP2(), sec.getP1());
    offsetForLock(triCotCsc, r, cot.getP2(), csc.getP2(), cot.getP1());
  }

  // Whenever the theta widget rotator changes, the geometry needs to be updated
  const rotatorUpdateCircle = () => {
    updateGeometry(Fig.tools.g2.clipAngle(rotator.transform.r(), '0to360'));
  };
  rotator.fnMap.add('updateGeometry', () => rotatorUpdateCircle());
  rotator.notifications.add('setState', 'updateGeometry');
  rotator.notifications.add('setTransform', 'updateGeometry');
  rotator.onClick = () => figure.stop('complete');

  // Helper function to add functions to the global function map
  const add = (name, fn) => figure.fnMap.global.add(name, fn);

  // Update the triangle side labels so they are flipped if the triangle
  // is flipped, and always horizontal
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

  // Whenever the triangles move or are rotated, then update the labels
  // and move realign the background rotation pads
  triSinCos.notifications.add('setTransform', () => {
    updateLabels(triSinCos, sin, cos, unitSinCos, thetaSinCos);
    triSinCosRotPads.setTransform(triSinCos.transform._dup());
  });
  triTanSec.notifications.add('setTransform', () => {
    updateLabels(triTanSec, tan, sec, unitTanSec, thetaTanSec);
    triTanSecRotPads.setTransform(triTanSec.transform._dup());
  });
  triCotCsc.notifications.add('setTransform', () => {
    updateLabels(triCotCsc, cot, csc, unitCotCsc, thetaCotCsc);
    triCotCscRotPads.setTransform(triCotCsc.transform._dup());
  });


  // When the flip button is clicked, flip the selected triangle
  flipButton.onClick = () => {
    const triElement = geom.getElement(geom.customState.selected);
    const target = [triElement.getScale().x < 0 ? 1 : -1, 1];
    triElement.stop('freeze');
    triElement.animations.new().scale({ target, duration: 2 }).start();
  };

  // Update the buttons that are dependent on the selected triangle
  const updateButtons = (triElement) => {
    if (triElement.customState.lock === 'theta') {
      lockAngle._label.custom.updateText({ text: '|theta|' });
    } else if (triElement.customState.lock === 'comp') {
      lockAngle._label.custom.updateText({ text: '|_90||min||theta|' });
    } else {
      lockAngle._label.custom.updateText({ text: '|_90|' });
    }

    if (triElement.customState.lockHyp) {
      hypLock.custom.lock();
    } else {
      hypLock.custom.unlock();
    }

    if (triElement.customState.unit) {
      triElement._unit._label.show();
      viewUnit.custom.visible();
    } else {
      triElement._unit._label.hide();
      viewUnit.custom.hidden();
    }
    if (triElement.customState.theta) {
      triElement._theta.show();
      viewTheta.custom.visible();
    } else {
      triElement._theta.hide();
      viewTheta.custom.hidden();
    }
  };

  // When the lock angle button is clicked cycle through the different
  // angles that can be locked
  lockAngle.onClick = () => {
    if (geom.customState.selected === '') {
      return;
    }
    const triElement = geom.getElement(geom.customState.selected);
    if (triElement.customState.lock === 'theta') {
      triElement.customState.lock = 'right';
    } else if (triElement.customState.lock === 'right') {
      triElement.customState.lock = 'comp';
    } else {
      triElement.customState.lock = 'theta';
    }
    updateButtons(triElement);
  };

  // For buttons that have binary states, toggle their state and updated
  // the associated customState property
  const toggleButton = (customStatePropertyName) => {
    if (geom.customState.selected === '' || geom.customState.selected == null) {
      return;
    }
    const triElement = geom.getElement(geom.customState.selected);
    if (triElement.customState[customStatePropertyName]) {
      triElement.customState[customStatePropertyName] = false;
    } else {
      triElement.customState[customStatePropertyName] = true;
    }
    updateButtons(triElement);
  };
  lockHyp.onClick = () => toggleButton('lockHyp');
  unitButton.onClick = () => toggleButton('unit');
  thetaButton.onClick = () => toggleButton('theta');

  // The arc button shows or hides the quarter circle
  arcButton.onClick = () => {
    if (circle.isShown) {
      circle.hide();
    } else {
      circle.show();
    }
  };

  // Whenever the visibility of the quarter circle changes, the color needs
  // to be updated
  circle.fnMap.add('processButton', () => {
    if (circle.isShown) {
      arcButton.setColor(colText);
      arcButton._fill.setColor([1, 1, 1, 1]);
    } else {
      arcButton.setColor(colGrey);
      arcButton._fill.setColor([1, 1, 1, 1]);
    }
  });
  circle.notifications.add('visibility', 'processButton');

  // Reset button resets all triangles to their default positions and rotations
  reset.onClick = () => { figure.fnMap.exec('reset'); };

  // When a triangle selection changes, the selection dependent buttons need to
  // be updated, hidden or shown, and the triangle fill color (movePad) becomes
  // visible (if selected)
  const selectTriangle = (triangle) => {
    moveSinCos.setOpacity(0);
    moveTanSec.setOpacity(0);
    moveCotCsc.setOpacity(0);
    if (triangle === '') {
      geom.hide(['lockAngle', 'flip', 'lockHyp', 'unitButton', 'thetaButton', 'viewTheta', 'viewUnit', 'angleLock', 'hypLock']);
      geom.customState.selected = '';
      return;
    }
    const element = geom.getElement(triangle);
    element._movePad.setOpacity(1);
    geom.customState.selected = triangle.name;
    geom.show(['lockAngle', 'flip', 'lockHyp', 'unitButton', 'thetaButton', 'viewTheta', 'viewUnit', 'angleLock', 'hypLock']);
    updateButtons(element);
  };

  add('selectSinCos', () => selectTriangle(triSinCos));
  add('selectTanSec', () => selectTriangle(triTanSec));
  add('selectCotCsc', () => selectTriangle(triCotCsc));

  // When the state is set but before the states of each figure element is
  // updated the appropriate triangle needs to be selected. This needs to happen
  // before other figure elements update, as when the button elements get
  // updated they will need to know which triangle is selected (if any)
  figure.notifications.add('stateSetInit', () => {
    selectTriangle(geom.customState.selected);
  });

  // If the background element is clicked, then deselect all triangles
  background.onClick = () => { selectTriangle(''); };


  const showAll = () => {
    triSinCos.showAll();
    triTanSec.showAll();
    triCotCsc.showAll();
  };

  // Helper function to conveniently set angle lock, hypotenuse lock, unit label
  // visibility and theta label visibility
  const setLocksAndLabels = (triangle, angleName, side, unit, thetaFlag) => {
    triangle.customState.lock = angleName;
    triangle.customState.lockHyp = side;
    triangle.customState.unit = unit;
    triangle.customState.theta = thetaFlag;
  };

  // Helper function to conveniently set all locks and labels
  const setAllLocksAndLabels = (
    ang1, side1, unit1, theta1,
    ang2, side2, unit2, theta2,
    ang3, side3, unit3, theta3,
  ) => {
    setLocksAndLabels(triSinCos, ang1, side1, unit1, theta1);
    setLocksAndLabels(triTanSec, ang2, side2, unit2, theta2);
    setLocksAndLabels(triCotCsc, ang3, side3, unit3, theta3);
  };

  // Bind rotation and translation move elements to their respective
  // triangle collections. This could also be done in the object definition.
  const bindMoveElements = (triangle, fn, backgroundTriangle) => {
    triangle._rotTheta.move.element = triangle.getPath();
    triangle._rotRight.move.element = triangle.getPath();
    triangle._rotComp.move.element = triangle.getPath();
    triangle._movePad.move.element = triangle.getPath();
    triangle._movePad.onClick = fn;
    triangle._rotComp.onClick = fn;
    triangle._rotRight.onClick = fn;
    triangle._rotTheta.onClick = fn;
    backgroundTriangle._rotTheta.move.element = triangle;
    backgroundTriangle._rotComp.move.element = triangle;
    backgroundTriangle._rotRight.move.element = triangle;
  };
  bindMoveElements(triSinCos, 'selectSinCos', triSinCosRotPads);
  bindMoveElements(triTanSec, 'selectTanSec', triTanSecRotPads);
  bindMoveElements(triCotCsc, 'selectCotCsc', triCotCscRotPads);

  circle._movePad.move.element = circle.getPath();

  /*
  .########..########..########..######..########.########..######.
  .##.....##.##.....##.##.......##....##.##..........##....##....##
  .##.....##.##.....##.##.......##.......##..........##....##......
  .########..########..######....######..######......##.....######.
  .##........##...##...##.............##.##..........##..........##
  .##........##....##..##.......##....##.##..........##....##....##
  .##........##.....##.########..######..########....##.....######.
  */
  // Helper function that calculates the position of a triangle taking into
  // account a desired position (p), which angle is locked (angleLock),
  // the desired rotation of the triangle (rotation) and whether it is
  // flipped or not (flipFlag)
  const getPosition = (triangle, p, angleLock, rotation, flipFlag) => {
    const matrix = new Fig.Transform().scale(flipFlag ? -1 : 1, 1).rotate(rotation).matrix();
    const { center, x, y } = triangle.customState;
    const thetaVertex = point(-center.x, -center.y);
    const rightVertex = (thetaVertex.add(x, 0));
    const compVertex = thetaVertex.add(x, y);
    if (angleLock === 'theta') {
      return Fig.tools.g2.getPoint(p).sub(thetaVertex.transformBy(matrix));
    }
    if (angleLock === 'comp') {
      return Fig.tools.g2.getPoint(p).sub(compVertex.transformBy(matrix));
    }
    return Fig.tools.g2.getPoint(p).sub(rightVertex.transformBy(matrix));
  };

  // Create a scenario for a triangle based on a desired position (p), rotation
  // (rotation), whether it is flipped (flipFlag) and which angle is locked
  // (angleLock)
  const createScenario = (scenario, triangle, p, angleLock, rotation, flipFlag) => {
    triangle.scenarios[scenario] = {
      position: getPosition(triangle, p, angleLock, rotation, flipFlag),
      scale: [flipFlag ? -1 : 1, 1],
      rotation,
    };
  };

  // Create the preset and reset scenarios - preset 4 and 5 are used in the
  // video but do not have associated buttons
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
  createScenario('preset4', triSinCos, [origin[0] + 1, origin[1]], 'right', 0, false);
  createScenario('preset4', triTanSec, [origin[0] + 1, origin[1]], 'right', 0, false);
  createScenario('preset4', triCotCsc, [origin[0] + 1, origin[1]], 'right', 0, false);
  createScenario('preset5', triSinCos, [-2.3, origin[1]], 'theta', 0, false);
  createScenario('preset5', triTanSec, [0, 1.3], 'theta', Math.PI / 2 + defaultAngle, true);
  createScenario('preset5', triCotCsc, [0, 1.3], 'theta', Math.PI + Math.PI / 2 - defaultAngle, false);

  /**
  * When animating to a scenario, each triangle must take the same time to
  * reach their final position. As triangles can be thrown far off the screen,
  * or can be very close to their final position, it is desirable to animate
  * over a duration based on velocity. Therefore this function calculates the
  * duration for each triangle, and the quarter circle, to reach their final
  * positions, and then uses the maximum duration for the animation of all
  * elements.
  *
  * Tricky note - the rotation of theta to the default angle happens in this
  * same duration. It is important that this rotation animation step is BEFORE
  * the triangle animation steps as the theta angle changes the position of the
  * triangles. When a seek state is recorded, if the rotator angle is set after
  * the triangle positions, the triangles will be in a slightly different
  * position comparing the seek state time to the time of the same animation
  * frame but arrived at during playback. For most people this will not matter
  * but for the automated testing of this example, screenshots are captured
  * that compare seek states with the same times during playback and require
  * them to be the same.
  *
  * Also note, the rotator is disabled when animating between scenarios as it
  * results in funky stuff not worth dealing with.
  */
  function animateScenario(
    scenario, dissolveOut, locks, finalAngle = defaultAngle, showCircle = true,
  ) {
    figure.stop('freeze');
    showAll();
    geom.hide(dissolveOut);
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
    let duration4 = 0;
    if (showCircle) {
      duration4 = Fig.tools.g2.getMaxTimeFromVelocity(
        circle.transform._dup(), circle.getScenarioTarget(scenario).transform, velocity, 0,
      );
    }
    const duration = Math.min(3, Math.max(duration1, duration2, duration3, duration4));
    figure.fnMap.exec('lockInput');
    geom.animations.new()
      .inParallel([
        rotator.animations.rotation({ target: defaultAngle, duration }),
        triSinCos.animations.scenario({ target: scenario, duration }),
        triTanSec.animations.scenario({ target: scenario, duration }),
        triCotCsc.animations.scenario({ target: scenario, duration }),
        circle.animations.scenario({ target: scenario, duration }),
      ])
      .then(rotator.animations.rotation({ target: finalAngle, velocity: 0.2 }))
      .delay(0.1)
      .trigger('unlockInput')
      .start();
    selectTriangle('');
    setAllLocksAndLabels(...locks);
  }

  figure.fnMap.global.add('lockInput', () => { rotator.isTouchable = false; });
  figure.fnMap.global.add('unlockInput', () => { rotator.isTouchable = true; });

  // Define the presets as functions in the global function map
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
        'comp', true, false, true,
      ],
      1,
    );
    if (!circle.isShown) {
      circle.animations.new().dissolveIn().start();
    }
  });
  figure.fnMap.global.add('preset4', () => {
    animateScenario(
      'preset4',
      ['triSinCos.unit.label', 'triTanSec.unit.label', 'triCotCsc.unit.label', 'circle'],
      [
        'right', false, false, true,
        'right', false, false, true,
        'right', false, false, true,
      ],
      39 * Math.PI / 180,
      false,
    );
  });
  figure.fnMap.global.add('preset5', () => {
    animateScenario(
      'preset5',
      ['circle'],
      [
        'theta', false, false, true,
        'theta', true, false, true,
        'theta', true, false, true,
      ],
      45 * Math.PI / 180,
      false,
    );
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
    geom.setScenarios('reset');
    circle.hide();
    setLocksAndLabels(triSinCos, 'theta', false, true, true);
    setLocksAndLabels(triTanSec, 'theta', false, true, true);
    setLocksAndLabels(triCotCsc, 'theta', false, true, true);
    figure.fnMap.exec('unlockInput');
    selectTriangle('');
  });

  /*
  .########..##.....##.##........######..########
  .##.....##.##.....##.##.......##....##.##......
  .##.....##.##.....##.##.......##.......##......
  .########..##.....##.##........######..######..
  .##........##.....##.##.............##.##......
  .##........##.....##.##.......##....##.##......
  .##.........#######..########..######..########
  */
  // Add various functions to the global function map that pulse various parts
  // of the geometries for use during video playback
  add('pulseSinTri', () => triSinCos.pulse({ duration: 1.5, scale: 1.2 }));
  add('pulseTanTri', () => triTanSec.pulse({ duration: 1.5, scale: 1.2 }));
  add('pulseCotTri', () => triCotCsc.pulse({ duration: 1.5, scale: 1.2 }));
  add('pulseRightAngles', () => {
    geom.pulse({
      elements: ['triSinCos.right', 'triTanSec.right', 'triCotCsc.right'], duration: 1.5, scale: 2.5, xAlign: 'right', yAlign: 'bottom',
    });
  });

  add('pulseSinTheta', () => triSinCos._theta.pulseAngle({ duration: 1.5 }));
  add('pulseTanTheta', () => triTanSec._theta.pulseAngle({ duration: 1.5 }));
  add('pulseCotTheta', () => triCotCsc._theta.pulseAngle({ duration: 1.5 }));
  function pulseLabel(name, side, xAlign = 'center', yAlign = 'middle') {
    add(name, () => side._label.pulse({
      xAlign, yAlign, scale: 2, duration: 1.5,
    }));
  }
  pulseLabel('pulseSin', sin, 'left');
  pulseLabel('pulseTan', tan, 'left');
  pulseLabel('pulseCotUnit', unitCotCsc, 'left');
  pulseLabel('pulseCos', cos, 'center', 'top');
  pulseLabel('pulseTanUnit', unitTanSec, 'center', 'top');
  pulseLabel('pulseCot', cot, 'center', 'top');
  pulseLabel('pulseSinUnit', unitSinCos, 'right', 'bottom');
  pulseLabel('pulseSec', sec, 'right', 'bottom');
  pulseLabel('pulseCsc', csc, 'right', 'bottom');

  figure.recorder.notifications.add('playbackStopped', 'unlockInput');
  figure.recorder.notifications.add('seek', 'unlockInput');
}
