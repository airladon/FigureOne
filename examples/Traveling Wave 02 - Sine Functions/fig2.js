
fig2 = new Fig.Figure({ limits: [-2, -1.5, 4, 3], htmlId: 'figureOneContainer2' });

fig2.add({
  name: 'a',
  method: 'primitives.polygon',
  options: {
    radius: 0.2,
    sides: 10,
  },
});