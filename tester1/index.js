const figure = new Fig.Figure({
  limits: [-2, -1.5, 4, 3], color: [0.5, 0.5, 0.5, 1], font: { size: 0.1 },
});

figure.add({
  name: 'eqn',
  method: 'equation',
  options: {
    elements: {
      line: { symbol: 'line', width: 0.005, dash: [0.01, 0.01] },
    },
    forms: {
      0: {
        annotate: {
          content: 'abc',
          annotation: {
            content: 'def',
            xPosition: 'right',
            yPosition: 'top',
            xAlign: 'left',
            yAlign: 'bottom',
            scale: 0.6,
            offset: [0.2, 0.2],
          },
          glyphs: {
            line: {
              annotation: 0,
              symbol: 'line',
              content: {
                xAlign: 'right',
                yAlign: 'top',
                space: 0.02,
              },
              comment: {
                xAlign: 'left',
                yAlign: 'bottom',
                space: 0.02,
              },
            },
          },
        },
      },
    },
  },
});
