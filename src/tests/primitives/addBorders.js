/* eslint-disable no-undef */
const len = figure.elements.drawOrder.length;
for (let i = 3; i < len; i += 1) {
  const name = figure.elements.drawOrder[i];
  const element = figure.elements.elements[name];
  const border = element.getBorder('figure', 'border');
  if (border[0].length > 0) {
    for (let j = 0; j < border.length; j += 1) {
      figure.add({
        name: `border${i}${j}`,
        method: 'polyline',
        options: {
          points: border[j],
          width: 0.01,
          color: [0, 0.7, 0, 1],
          close: true,
        },
      });
    }
  }
  const touchBorder = element.getBorder('figure', 'touchBorder');
  if (touchBorder[0].length > 0) {
    for (let j = 0; j < touchBorder.length; j += 1) {
      figure.add({
        name: `buffer${i}${j}`,
        method: 'polyline',
        options: {
          points: touchBorder[j],
          width: 0.01,
          dash: [0.05, 0.03],
          color: [0, 0, 1, 1],
          close: true,
        },
      });
    }
  }
}

