/* eslint-disable camelcase */
/* globals figure, colTan, colSec, colSin, colGrey, thin, thick, centerText, colRad */


function layoutLines() {
  const radius = 0.8;
  const length = 1.4;
  const angle = 1;
  const chordAngle = Math.asin(length / 2 / radius) * 2;

  const [lines] = figure.add({
    name: 'lines',
    method: 'collection',
    options: {
      position: [-1.5, 0],
    },
    elements: [
      {
        name: 'circle',
        method: 'primitives.polygon',
        options: {
          radius,
          line: { width: thin },
          sides: 100,
          color: colGrey,
        },
      },
      {
        name: 'line',
        method: 'primitives.line',
        options: {
          transform: new Fig.Transform().translate(0, 0).rotate(0),
          angle: angle + Math.PI / 2,
          length,
          p1: [
            length / 2 * Math.cos(angle - Math.PI / 2),
            length / 2 * Math.sin(angle - Math.PI / 2),
          ],
          width: thick,
          color: colGrey,
        },
      },
      {
        name: 'dullChord',
        method: 'primitives.line',
        options: {
          p1: [radius * Math.cos(chordAngle / 2), radius * Math.sin(chordAngle / 2)],
          p2: [radius * Math.cos(-chordAngle / 2), radius * Math.sin(-chordAngle / 2)],
          width: thin,
          color: colGrey,
        },
      },
      {
        name: 'halfChord',
        method: 'collections.line',
        options: {
          p1: [radius * Math.cos(chordAngle / 2), radius * Math.sin(chordAngle / 2)],
          p2: [radius * Math.cos(chordAngle / 2), 0],
          width: thick,
          color: colSin,
        },
      },
      {
        name: 'bow',
        method: 'primitives.polygon',
        options: {
          angleToDraw: chordAngle,
          rotation: -chordAngle / 2,
          radius,
          line: { width: thick },
          color: colSin,
          sides: 400,
        },
      },
      centerText('tangent', '|tangent|: from Latin |tangere| - "to touch"', {
        tangent: { font: { style: 'italic', family: 'Times New Roman', color: colTan } },
        tangere: { font: { style: 'italic', family: 'Times New Roman' } },
      }, [0, -1.1], 0.15),
      centerText('chord', '|chord|: from Latin |chorda| - "bowstring"', {
        chord: { font: { style: 'italic', family: 'Times New Roman', color: colSin } },
        chorda: { font: { style: 'italic', family: 'Times New Roman' } },
      }, [0, -1.1], 0.15),
      leftText('sine', '|sine|: from Latin |sinus| - "bay"', {
        sine: { font: { style: 'italic', family: 'Times New Roman', color: colSin } },
        sinus: { font: { style: 'italic', family: 'Times New Roman' } },
      }, [-1.32, -1.1], 0.15),
      leftText('jya', 'from Sanskrit |jya-ardha| - "half-cord"', {
        'jya-ardha': { font: { style: 'italic', family: 'Times New Roman' } },
      }, [-1, -1.3], 0.15),
      centerText('secant', '|secant|: from Latin |secare| - "to cut"', {
        secant: { font: { style: 'italic', family: 'Times New Roman', color: colSec } },
        secare: { font: { style: 'italic', family: 'Times New Roman' } },
      }, [0, -1.1], 0.15),
      {
        name: 'radius',
        method: 'primitives.line',
        options: {
          p1: [0, 0],
          p2: [radius * Math.cos(angle), radius * Math.sin(angle)],
          width: 0.008,
          color: colRad,
        },
      },
      {
        name: 'rightAngle',
        method: 'collections.angle',
        options: {
          p1: [0, 0],
          p2: [radius * Math.cos(angle), radius * Math.sin(angle)],
          p3: [
            radius * Math.cos(angle) - Math.cos(angle + Math.PI / 2),
            radius * Math.sin(angle) - Math.sin(angle + Math.PI / 2),
          ],
          curve: { autoRightAngle: true, width: 0.008, radius: 0.2 },
        },
      },
    ],
  });

  const cordRad = Math.sqrt(radius ** 2 - (length / 2) ** 2);
  const line = lines.getElement('line');
  const bow = lines.getElement('bow');
  lines.custom = {
    tanPosition: [
      radius * Math.cos(angle), radius * Math.sin(angle),
    ],
    secPosition: [
      radius * 0.8 * Math.cos(angle), radius * 0.8 * Math.sin(angle),
    ],
    chordPosition: [
      cordRad * Math.cos(angle), cordRad * Math.sin(angle),
    ],
    outsidePosition: [
      radius * 1.5 * Math.cos(angle), radius * 1.5 * Math.sin(angle),
    ],
  };
  const add = (name, func) => figure.fnMap.global.add(name, func);
  add('linesToTan', () => {
    line.animations.new()
      .position({ target: lines.custom.tanPosition, duration: 1.5 })
      .trigger(() => line.setColor(colTan))
      .start();
  });
  add('linesToSec', () => {
    line.animations.new()
      .inParallel([
        line.animations.color({ target: colSec, duration: 0.5 }),
        line.animations.position({ target: lines.custom.secPosition, duration: 1.5 }),
      ])
      .start();
  });
  add('linesToChord', () => {
    line.animations.new()
      .position({ target: lines.custom.chordPosition, duration: 1.5 })
      .trigger(() => line.setColor(colSin))
      .start();
  });
  add('linesSetTan', () => {
    line.setPosition(lines.custom.tanPosition);
    line.setColor(colTan);
    line.setRotation(0);
  });
  add('linesSetSec', () => {
    line.setPosition(lines.custom.secPosition);
    line.setColor(colSec);
    line.setRotation(0);
  });
  add('linesSetChord', () => {
    line.setPosition(lines.custom.chordPosition);
    line.setColor(colSin);
    line.setRotation(-angle);
  });
  add('linesSetOutside', () => {
    line.setColor(colGrey);
    line.setPosition(lines.custom.outsidePosition);
    line.setRotation(0);
  });
  add('showBow', () => {
    line.animations.new()
      .rotation({ target: -angle, duration: 1 })
      .dissolveIn({ element: bow, duration: 0.5 })
      .dissolveOut({ element: bow, duration: 0.5, delay: 1 })
      .start();
  });
  add('showHalfChord', () => {
    lines._halfChord.showAll();
    lines._dullChord.showAll();
    line.animations.new()
      .dissolveOut(0.5)
      .start();
  });
  // add('setBow', () => {
  //   line.setRotation(-angle);
  // });
  add('resetBow', () => line.setRotation(0));
}
