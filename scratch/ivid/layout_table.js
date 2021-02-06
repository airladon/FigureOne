/* eslint-disable camelcase */
/* globals figure, color1, color2, color3, color4, colGrey */


function layoutTable() {
  const step = 0.12;
  const yStart = 1;

  const theta = x => ({
    text: '\u03b8',
    font: {
      color: color1, family: 'Times New Roman', style: 'italic', size: 0.15,
    },
    location: [x, yStart + step * 1.2],
  });
  const sin = x => ({
    text: 'sin',
    font: { family: 'Times New Roman', size: 0.15 },
    location: [x, yStart + step * 1.2],
  });
  const getRow = (angle, x, index) => ([
    {
      text: `${angle}\u00b0`,
      location: [x, yStart - index * step],
      xAlign: 'right',
      font: { size: 0.1, color: color1 },
    },
    {
      text: Fig.tools.math.round(Math.sin(angle / 180 * Math.PI), 4).toFixed(4),
      location: [x + 0.2, yStart - index * step],
      xAlign: 'left',
      font: { size: 0.1 },
    },
  ]);

  const getTable = (name, x, startAngle) => {
    let index = 0;
    const text = [theta(x - 0.1), sin(x + 0.25)];
    for (let angle = startAngle; angle < Math.min(startAngle + 20, 91); angle += 1) {
      text.push(...getRow(angle, x, index));
      index += 1;
    }
    return {
      name,
      method: 'primitives.text',
      options: {
        text,
      },
    };
  };

  const elements = [];
  elements.push(getTable('tab1', -2.4, 0));
  elements.push(getTable('tab2', -1.3, 20));
  elements.push(getTable('tab3', -0.2, 40));
  elements.push(getTable('tab4', 0.9, 60));
  elements.push(getTable('tab5', 2, 80));
  // index = 0;
  // x = -1;
  // text.push(theta(x - 0.1), sin(x + 0.25));
  // for (let angle = 20; angle < 40; angle += 1) {
  //   text.push(...getRow(angle, x, index));
  //   index += 1;
  // }

  // index = 0;
  // x = 0;
  // text.push(theta(x - 0.1), sin(x + 0.25));
  // for (let angle = 40; angle < 60; angle += 1) {
  //   text.push(...getRow(angle, x, index));
  //   index += 1;
  // }
  // const text = (angle, sin, index) => ({
  //   name: `angle${index}`,
  //   method: 'text',
  //   options: {
  //     text: [
  //       {
  //         text: angle,
  //         location: [0, yStart - index * step],
  //         xAlign: 'right',
  //         font: { size: 0.1 },
  //       },
  //       {
  //         text: sin,
  //         location: [0.75, yStart - index * step],
  //         xAlign: 'right',
  //         font: { size: 0.1 },
  //       },
  //     ],
  //   },
  // });
  // const elements = [];
  // let i = 0;
  // for (let k = 0; k < 6; k += 1) {
  //   elements.push(text(k.toFixed(0), `${Fig.tools.math.round(Math.sin(k / 180 * Math.PI), 4).toFixed(4)}`, i));
  //   i += 1;
  // }
  // elements.push(text('\u22ee ', '\u22ee   ', i));
  // i += 1;
  // for (let k = 43; k < 48; k += 1) {
  //   elements.push(text(k.toFixed(0), `${Fig.tools.math.round(Math.sin(k / 180 * Math.PI), 4).toFixed(4)}`, i));
  //   i += 1;
  // }
  // elements.push(text('\u22ee ', '\u22ee   ', i));
  // i += 1;
  // for (let k = 85; k < 91; k += 1) {
  //   elements.push(text(k.toFixed(0), `${Fig.tools.math.round(Math.sin(k / 180 * Math.PI), 4).toFixed(4)}`, i));
  //   i += 1;
  // }
  // console.log(text)
  // const elements = [
  //   {
  //     name: 'table',
  //     method: 'primitives.text',
  //     options: {
  //       text,
  //     },
  //   },
  // ];

  // elements.push({
  //   name: 'eqn',
  //   method: 'collections.equation',
  //   options: {
  //     elements: {
  //       lb: { symbol: 'bracket', side: 'left' },
  //       rb: { symbol: 'bracket', side: 'right' },
  //       theta1: { text: '\u03b8', color: color1 },
  //       theta2: { text: '\u03b8', color: color1 },
  //     },
  //     phrases: {
  //       fTheta: ['f', { container: ['', 0.02] }, { brac: ['lb', 'theta2', 'rb'] }],
  //     },
  //     forms: {
  //       // 0: ['theta1', '          ', 'fTheta'],
  //       0: 'theta1',
  //     },
  //     position: [-0.05, 1.2],
  //   },
  // });

  figure.add({
    name: 'table',
    method: 'collection',
    elements,
    // mods: {
    //   scenarios: {
    //     default: { position: [-1.7, -0.1] },
    //   },
    // },
  });
}
