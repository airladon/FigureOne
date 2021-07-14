3D shapes can be drawn, animated and interacted with in FigureOne.

### <a id="shapes3d-boilerplate"></a> Text Boilerplate
```js
const figure = new Fig.Figure();
figure.scene.setProjection({ style: 'orthographic' });
figure.scene.setCamera({ position: [2, 1, 1], up: [0, 1, 0] });
figure.scene.setLight({ directional: [0.7, 0.5, 1] });
```