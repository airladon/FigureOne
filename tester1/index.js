const figure = new Fig.Figure({
  limits: [-2, -1.5, 4, 3], color: [0.5, 0.5, 0.5, 1], font: { size: 0.1 },
});

figure.add({
  name: 'eqn',
  method: 'equation',
  options: {
    elements: {
      line: {
        symbol: 'line',
        width: 0.005,
        dash: [0.01, 0.01],
        // draw: 'static',
        // staticHeight: 'first',
        // staticWidth: 'first',
      },
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
              annotationIndex: 0,
              symbol: 'line',
              content: {
                xAlign: 'right',
                yAlign: 'top',
                space: 0.02,
              },
              annotation: {
                xAlign: 'left',
                yAlign: 'bottom',
                space: 0.02,
              },
            },
          },
        },
      },
      1: {
        annotate: {
          content: 'abc',
          annotation: {
            content: 'def',
            xPosition: 'right',
            yPosition: 'top',
            xAlign: 'left',
            yAlign: 'bottom',
            scale: 0.6,
            offset: [-0.6, 0.6],
          },
          glyphs: {
            line: {
              annotationIndex: 0,
              symbol: 'line',
              content: {
                xAlign: 'right',
                yAlign: 'top',
                space: 0.02,
              },
              annotation: {
                xAlign: 'right',
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
figure.getElement('eqn').showForm('0');
figure.getElement('eqn').goToForm({
  form: '1', duration: 1, delay: 1, animate: 'move',
});

