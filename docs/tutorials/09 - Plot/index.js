// Create figure
const figure = new Fig.Figure({ color: [1, 0, 0, 1] });

const pow = () => {
  const xValues = Fig.range(0, 10, 0.05);
  return xValues.map(x => [x, x ** 2]);
};

// Plot of single trace with auto axis generation
figure.add({
  make: 'collections.plot',
  trace: pow(),
});
