/* eslint-disable camelcase */
/* globals figure, color1, color2, color3, color4, colGrey */


function layoutTable() {

  const step = 0.11;
  const yStart = 1;
  const text = (angle, sin, index) => ({
    name: `angle${index}`,
    method: 'text',
    options: {
      text: [
        {
          text: angle,
          location: [0, yStart - index * step],
          xAlign: 'right',
          font: { size: 0.1 },
        },
        {
          text: sin,
          location: [0.75, yStart - index * step],
          xAlign: 'right',
          font: { size: 0.1 },
        },
      ],
    },
  });
  const elements = [];
  let i = 0;
  for (let k = 0; k < 6; k += 1) {
    elements.push(text(k.toFixed(0), `${Fig.tools.math.round(Math.sin(k / 180 * Math.PI), 4).toFixed(4)}`, i));
    i += 1;
  }
  elements.push(text('\u22ee ', '\u22ee   ', i));
  i += 1;
  for (let k = 43; k < 48; k += 1) {
    elements.push(text(k.toFixed(0), `${Fig.tools.math.round(Math.sin(k / 180 * Math.PI), 4).toFixed(4)}`, i));
    i += 1;
  }
  elements.push(text('\u22ee ', '\u22ee   ', i));
  i += 1;
  for (let k = 85; k < 91; k += 1) {
    elements.push(text(k.toFixed(0), `${Fig.tools.math.round(Math.sin(k / 180 * Math.PI), 4).toFixed(4)}`, i));
    i += 1;
  }

  elements.push({
    name: 'eqn',
    method: 'collections.equation',
    options: {
      elements: {
        lb: { symbol: 'bracket', side: 'left' },
        rb: { symbol: 'bracket', side: 'right' },
        theta1: { text: '\u03b8', color: color1 },
        theta2: { text: '\u03b8', color: color1 },
      },
      phrases: {
        fTheta: ['f', { container: ['', 0.02] }, { brac: ['lb', 'theta2', 'rb'] }],
      },
      forms: {
        // 0: ['theta1', '          ', 'fTheta'],
        0: 'theta1',
      },
      position: [-0.05, 1.2],
    },
  });

  figure.add({
    name: 'table',
    method: 'collection',
    elements,
    mods: {
      scenarios: {
        default: { position: [-1.7, -0.1] },
      },
    },
  });
}
