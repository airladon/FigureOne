/* globals Fig */
const figure = new Fig.Figure();
figure.add(
  {
    name: 'c',
    method: 'collection',
    elements: [
      {
        name: 'tri',
        method: 'triangle',
        height: 0.4,
        width: 0.4,
      },
      {
        name: 'text',
        method: 'text',
        text: 'triangle',
        position: [0, -0.4],
        xAlign: 'center',
      },
    ],
  },
);

const c = figure.get('c');
const tri = figure.get('c.tri');
const text = c.get('text');

