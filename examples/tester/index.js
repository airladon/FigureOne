const diagram = new Fig.Diagram();

const f1 = {
  family: 'Times New Roman',
  color: [1, 0, 0, 1],
  style: 'normal',
  size: 0.2,
};
const f2 = {
  family: 'Times New Roman',
  color: [0, 1, 0, 1],
  style: 'italic',
  size: 0.2,
  weight: 'bold',
}
console.log(new Fig.Transform().scale(2, 2).translate(0.5, 0).matrix())
console.log(new Fig.Transform().translate(0.5, 0).scale(2, 2).matrix())
diagram.addElements([
  {
    name: 'tester',
    method: 'shapes.textNew',
    options: {
      text: ['hello', 'MM', 'M', 'dg'],
      font: [f1, f2, f1, f2],
      offset: [[0, 0], null, null, [-0.1, -0.2]],
      position: [0.5, 0.5],
      xAlign: 'center',
      yAlign: 'middle',
    },
  },
  {
    name: 'a',
    method: 'polygon',
    options: {
      radius: 0.2,
      transform: new Fig.Transform().scale(2, 2).translate(0.5, 0),
    },
  },
  {
    name: 'eqn',
    method: 'equation',
    options: {
      color: [0.95, 0.95, 0.6, 1],
      position: [0, 0],
      elements: {
        v: { symbol: 'vinculum'},
        equals: ' = ',
        times: ' \u00D7 ',
        c: { color: [1, 0, 0, 1] },
      },

      // Align all forms to the 'equals' diagram element
      formDefaults: {
        alignment: { fixTo: 'equals' },
        animation: {
          translation: {
            c: { style: 'curved', direction: 'up', mag: 0.5 },
          },
        },
        elementMods: {
          b: { color: [1, 0, 0, 1] }
        },
      },

      phrases: {
        'abc': ['a', 'b', 'c', '  ', '=', '  ', 'hello'],
      },
      // Define two different forms of the equation
      forms: {
        't': ['abc', 'equals'],
        'a': ['a', 'equals', { frac: ['b', 'v', 'c'] }],
        'b': {
          content: ['b', 'equals', 'a', 'times', 'c'],
          elementMods: {
            b: { color: [0.5, 1, 0.5, 1] },
          },
          // Define how the 'c' element will move to this form
          animation: {
            translation: {
              c: { style: 'curved', direction: 'up', mag: 1 },
            },
            // duration: 0.5,
          },
          scale: 2,
        },
        'c': {
          content: ['c', 'times', 'a', 'equals', 'b'],
          elementMods: {
            b: { color: [0, 1, 1, 1] },
          },
          // Define how the 'c' element will move to this form
          animation: {
            translation: {
              c: { style: 'curved', direction: 'down', mag: 0.5 },
            },
            // duration: 0.5,
          },
          fromForm: {
            a: {
              animation: {
                translation: {
                  c: { style: 'curved', direction: 'down', mag: 5 },
                },
              },
            },
          },
        },
      },
    },
  },
]);
diagram.initialize();

const eqn = diagram.getElement('eqn');

// Show the equation form
eqn.showForm('a');

const a = diagram.getElement('eqn.a');
const b = diagram.getElement('eqn.b');
const c = diagram.getElement('eqn.c');
// Animate to the next form
const goTo = (form) => {
  console.log(form)
  eqn.goToForm({
    form, delay: 0.2, duration: 1.5, animate: 'move',
  });
  diagram.animateNextFrame();
}

a.makeTouchable();
b.makeTouchable();
c.makeTouchable();

a.onClick = goTo.bind(eqn, 'a');
b.onClick = goTo.bind(eqn, 'b');
c.onClick = goTo.bind(eqn, 'c');
// Queue drawing on the next animation frame
diagram.animateNextFrame();

diagram.elements._tester.animations.new()
  .translation({ target: [-0.5, -0.5 ], duration: 2 })
  .start();

// ctx = diagram.draw2DLow.ctx
// // ctx.save()
// // ctx.font = 'italic 80px "Times New Roman"'
// // ctx.textBaseline = 'middle'
// // ctx.fillStyle = "#FF0000FF"
// // ctx.fillText('A',400, 400)
// // ctx.scale(2, 2);
// // ctx.font = 'italic 40px "Times New Roman"'
// // ctx.fillText('y',200, 200)
// // ctx.restore();
// // ctx.save();
// // ctx.fillStyle = "#FFFF00FF"
// // ctx.textBaseline = 'middle'
// // ctx.translate(400, 400)
// // ctx.scale(800 / 100, 800 / 100)
// // ctx.font = 'italic 10px "Times New Roman"'
// // ctx.fillText('y', 10, 0)
// // ctx.restore();

// ctx.save()
// ctx.font = 'italic 100.5px "Times New Roman"'
// ctx.textBaseline = 'middle'
// ctx.fillStyle = "#FF0000FF"
// ctx.translate(400, 400);
// ctx.fillText('A', -300, 0)
// ctx.scale(2, 2);
// ctx.fillStyle = "#FF00FFFF"
// ctx.font = 'italic 50.25px "Times New Roman"'
// ctx.fillText('A', -150, 0)
// // ctx.restore();
// // ctx.save();
// // ctx.fillStyle = "#FFFF00FF"
// // ctx.textBaseline = 'middle'
// // ctx.translate(400, 400)
// // ctx.scale(800 / 100, 800 / 100)
// // ctx.font = 'italic 10px "Times New Roman"'
// // ctx.fillText('y', 10, 0)
// ctx.restore();