/* eslint-disable camelcase */
/* globals Fig, figure, colTan, colSec, colSin, colGrey, thin, thick,
   colDarkGrey, colRad, leftText */

/**
 * Geometry that shows the different names of lines related to circles (the
 * tangent, secant and chord lines) and where their names come from
 */
// eslint-disable-next-line
function layoutLines() {
  const radius = 0.8;
  const length = 1.4;
  const rightScale = 1.3;
  const angle = 1;
  const chordAngle = Math.asin(length / 2 / radius) * 2;

  const [lines] = figure.add({
    name: 'lines',
    method: 'collection',
    options: {
      position: [-1.5, 0.1],
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
        name: 'tangentLine',
        method: 'collections.line',
        options: {
          p1: [radius * rightScale, 0.8 * 1.3 / 2 * 1.453],
          p2: [radius * rightScale, 0],
          label: {
            text: 'tangent',
            location: 'right',
            offset: 0.02,
          },
          width: thin,
          color: colDarkGrey,
        },
      },
      {
        name: 'radiusLine',
        method: 'collections.line',
        options: {
          p1: [0, 0],
          p2: [radius * rightScale, 0],
          label: {
            text: '1',
            location: 'bottom',
            offset: 0.02,
          },
          width: thin,
          color: colDarkGrey,
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
      leftText('tangentDef', '|tangent|: from Latin |tangere| - "to touch"', {
        tangent: { font: { style: 'italic', family: 'Times New Roman', color: colTan } },
        tangere: { font: { style: 'italic', family: 'Times New Roman' } },
      }, [-1.2, -1.1], 0.15),
      leftText('tangent', '|tangent|', {
        tangent: { font: { style: 'italic', family: 'Times New Roman', color: colTan } },
        tangere: { font: { style: 'italic', family: 'Times New Roman' } },
      }, [0, -1.1], 0.15, {
        linesDefault: { position: [-1.2, -1.1] },
        linesCenter: { position: [-0.3, -1.1] },
      }),
      leftText('chordDef', '|chord|: from Latin |chorda| - "bowstring"', {
        chord: { font: { style: 'italic', family: 'Times New Roman', color: colSin } },
        chorda: { font: { style: 'italic', family: 'Times New Roman' } },
      }, [-1.2, -1.1], 0.15),
      leftText('chord', '|chord|', { chord: { font: { style: 'italic', family: 'Times New Roman', color: colSin } } }, [0, -1.1], 0.15, {
        linesDefault: { position: [-1.2, -1.1] },
        linesCenter: { position: [-0.15, -1.1] },
      }),
      leftText('secant', '|secant|', {
        secant: { font: { style: 'italic', family: 'Times New Roman', color: colSec } },
      }, [-1.2, -1.1], 0.15, {
        linesDefault: { position: [-1.2, -1.1] },
        linesCenter: { position: [-0.2, -1.1] },
      }),
      leftText('secantDef', '|secant|: from Latin |secare| - "to cut"', {
        secant: { font: { style: 'italic', family: 'Times New Roman', color: colSec } },
        secare: { font: { style: 'italic', family: 'Times New Roman' } },
      }, [-1.2, -1.1], 0.15),

      leftText('jya', 'Sanskrit |jya-ardha| - "half-bowstring"', {
        'jya-ardha': { font: { style: 'italic', family: 'Times New Roman' } },
      }, [-1.2, -1.1], 0.15),
      leftText('latin', '\u2192 Latin |sinus| - "bay"', {
        sinus: { font: { style: 'italic', family: 'Times New Roman' } },
      }, [-1.2, -1.3], 0.15),
      leftText('sine', '\u2192 Latin |sinus| - "bay"  \u2192  |sine|', {
        sine: { font: { style: 'italic', family: 'Times New Roman', color: colSin } },
        sinus: { font: { style: 'italic', family: 'Times New Roman' } },
      }, [-1.2, -1.3], 0.15),
      leftText('halfChordLabel', '|halfchord|', { halfchord: { text: 'half-chord', font: { style: 'italic', family: 'Times New Roman', color: colSin } } }, [-0.3, 0.2], 0.15),

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
      radius * 0.8 * Math.cos(angle), radius * 0.75 * Math.sin(angle),
    ],
    chordPosition: [
      cordRad * Math.cos(angle), cordRad * Math.sin(angle),
    ],
    outsidePosition: [
      radius * 1.2 * Math.cos(angle), radius * 1.2 * Math.sin(angle),
    ],
  };

  // Helper function to add functions to the global function map
  const add = (name, func) => figure.fnMap.global.add(name, func);

  // Animate line to tagent position
  add('linesToTan', () => {
    line.animations.new()
      .position({ target: lines.custom.tanPosition, duration: 1.5 })
      .trigger(() => line.setColor(colTan))
      .start();
  });

  // Animate line to secant position
  add('linesToSec', () => {
    line.animations.new()
      .inParallel([
        line.animations.color({ target: colSec, duration: 0.5 }),
        line.animations.position({ target: lines.custom.secPosition, duration: 2 }),
      ])
      .start();
  });

  // Animate line to chord position
  add('linesToChord', () => {
    line.animations.new()
      .position({ target: lines.custom.chordPosition, duration: 3 })
      .trigger(() => line.setColor(colSin))
      .start();
  });

  // Set line to tagent position
  add('linesSetTan', () => {
    line.setPosition(lines.custom.tanPosition);
    line.setColor(colTan);
    line.setRotation(0);
  });

  // Set line to secant position
  add('linesSetSec', () => {
    line.setPosition(lines.custom.secPosition);
    line.setColor(colSec);
    line.setRotation(0);
  });

  // Set line to chord position
  add('linesSetChord', () => {
    line.setPosition(lines.custom.chordPosition);
    line.setColor(colSin);
    line.setRotation(-angle);
  });

  // Set line outside the circle
  add('linesSetOutside', () => {
    line.setColor(colGrey);
    line.setPosition(lines.custom.outsidePosition);
    line.setRotation(0);
  });

  // Briefly show the arc between the chord line that forms a bow
  add('showBow', () => {
    line.animations.new()
      .dissolveIn({ element: bow, duration: 0.5 })
      .dissolveOut({ element: bow, duration: 0.5, delay: 1 })
      .start();
  });

  // Animate a full chord line to half chord line
  add('showHalfChord', () => {
    lines._halfChord.showAll();
    lines._dullChord.showAll();
    lines._line.hide();
    lines._halfChord.setLength(length);
    lines._halfChord.animations.new()
      .length({ target: length / 2, duration: 0.8 })
      .start();
  });

  // Set half chord length
  add('setHalfChordLength', () => {
    lines._halfChord.setLength(length / 2);
  });
}
