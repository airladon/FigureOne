/* eslint-disable camelcase */
/* globals figure, color1, color2, color3, color4, colGrey */


function layoutTable() {

  const step = 0.13;
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
        },
        {
          text: sin,
          location: [0.5, yStart - index * step],
          xAlign: 'right',
        },
      ],
    },
  });
  const elements = [];
  let i = 0;
  for (let k = 0; k < 11; k += 1) {
    elements.push(text(k.toFixed(0), `${Fig.tools.math.round(Math.sin(k / 180 * Math.PI), 4).toFixed(4)}`, i));
    i += 1;
  }
  elements.push(text('\u22ee ', '\u22ee   ', i));
  i += 1;
  for (let k = 87; k < 91; k += 1) {
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
        0: ['theta1', '          ', 'fTheta'],
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
        default: { position: [2, -0.1] },
      },
    },
  });
}
