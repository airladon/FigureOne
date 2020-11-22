const diagram = new Fig.Diagram({ limits: [-3, -3, 6, 6], color: [1, 0, 0, 1], lineWidth: 0.01, font: { size: 0.1 } });

diagram.addElements([
  {
    name: 'origin',
    method: 'polygon',
    options: {
      radius: 0.01,
      line: { width: 0.01 },
      sides: 10,
      color: [0.7, 0.7, 0.7, 1]
    },
  },
  {
    name: 'grid',
    method: 'grid',
    options: {
      bounds: [-3, -3, 6, 6],
      yStep: 0.1,
      xStep: 0.1,
      color: [0.7, 0.7, 0.7, 1],
      line: { width: 0.001 },
    },
  },
  {
    name: 'gridMajor',
    method: 'grid',
    options: {
      bounds: [-3, -3, 6, 6],
      yStep: 0.5,
      xStep: 0.5,
      color: [0.8, 0.8, 0.8, 1],
      line: { width: 0.004 }
    },
  },
]);

const e = document.createElement('div')
e.innerHTML = 'Hello There';

"Example showing many features of textLines"
diagram.addElement(
  {
    name: 'h',
    method: 'shapes.html',
    options: {
      element: e,
      position: [0, 0],
      xAlign: 'right',
      yAlign: 'top',
      transform: new Fig.Transform().scale(1, 1).rotate(0).translate(0, 0),
    },
  },
);

// diagram.elments._h.setRotation(1);
console.log(diagram.elements._h.getBorder('diagram'));
console.log(diagram.elements._h.getBoundingRect('diagram'));
// diagram.elements._h.animations.new()
//   .position({ target: [1, 1], duration: 1 })
//   .start(); 