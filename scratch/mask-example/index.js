/* eslint-disable */
// Render harness for the gl mask-recolor (textureMap) feature.
// Open index.html after building the package bundle (`npm run webpack`).

const figure = new Fig.Figure({ scene: [-1.5, -1.5, 1.5, 1.5], color: [0, 0, 0, 1] });

const p = figure.add({
  name: 'masked',
  make: 'gl',
  // Two triangles covering a square, with matching texture coordinates.
  vertices: [-1, -1, 1, -1, -1, 1, 1, -1, 1, 1, -1, 1],
  numVertices: 6,
  texture: {
    src: './base.png',
    coords: [0, 0, 1, 0, 0, 1, 1, 0, 1, 1, 0, 1],
    loadColor: [0, 0, 0, 0],
  },
  mask: { src: './mask.png' },
  // tint0 -> mask red region (left circle), tint1 -> green (middle circle),
  // tint2 -> blue (right circle). Omitted/null tints leave the base color.
  tints: [[0.9, 0.1, 0.1, 1], [0.1, 0.3, 0.9, 1]],
});

// Expose tint presets for the buttons in index.html.
window.setTints = (which) => {
  if (which === 'default') p.custom.setTints([[0.9, 0.1, 0.1, 1], [0.1, 0.3, 0.9, 1], null]);
  else if (which === 'warm') p.custom.setTints([[0.95, 0.55, 0.1, 1], [0.85, 0.2, 0.3, 1], null]);
  else if (which === 'all') p.custom.setTints([[0.9, 0.1, 0.1, 1], [0.1, 0.7, 0.2, 1], [0.2, 0.4, 0.95, 1]]);
  else if (which === 'none') p.custom.setTints([null, null, null]);
  figure.animateNextFrame();
};
