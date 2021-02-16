/* eslint-disable camelcase */
/* globals figure, color1, color2, color3, color4, colGrey */


function layoutLines() {
  const radius = 1;
  // const tanAngle = Math.PI * 1.3;
  // const tanLength = 0.5;
  // const tanPoint = new Fig.Point(radius * Math.cos(tanAngle), radius * Math.sin(tanAngle));
  // const tanP1
  // const secAngle = Math.PI * 0.7;
  figure.add({
    name: 'circleLines',
    method: 'collection',
    elements: [
      {
        name: 'circle',
        method: 'primitives.polygon',
        options: {
          radius,
          line: { width: 0.013 },
          sides: 100,
          color: colGrey,
        },
      },
      {
        name: 'tangent',
        method: 'collections.line',
        options: {
          p1: [-radius * 1.3, -radius * 0.6],
          p2: [radius * 0.7, -radius * 1.32],
          // p1: 
          width: 0.013,
          color: colTan,
          label: {
            text: 'tangent',
            orientation: 'baseAway',
            location: 'bottom',
          },
        },
      },
      {
        name: 'secant',
        method: 'collections.line',
        options: {
          p1: [radius * 0.6, radius * 1.1],
          p2: [-radius * 1.2, radius * 0],
          width: 0.013,
          color: colSec,
          label: {
            text: 'secant',
            orientation: 'baseToLine',
            location: 'top',
          },
        },
      },
      {
        name: 'chord',
        method: 'collections.line',
        options: {
          p1: [radius * Math.cos(1), radius * Math.sin(1)],
          p2: [radius * Math.cos(1), -radius * Math.sin(1)],
          width: 0.013,
          color: colSin,
          label: {
            text: 'chord',
            orientation: 'horizontal',
            location: 'right',
          },
        },
      },
      {
        name: 'radius',
        method: 'primitives.line',
        options: {
          p1: [radius * Math.cos(1), radius * Math.sin(1)],
          p2: [radius * Math.cos(1), -radius * Math.sin(1)],
          width: 0.013,
          color: colSin,
          label: {
            text: 'chord',
            orientation: 'horizontal',
            location: 'right',
          },
        },
      },
    ],
  });
}
