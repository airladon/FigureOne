/* globals Fig, figure */

figure.add({
  make: 'polygon',
  radius: 0.6,
  sides: 4,
  rotation: Math.PI / 4,
  color: [0, 0, 0, 1],
  xAlign: 'center',
});
// figure.scene.setCamera({ position: [1, 1, 1] });
figure.animations.new()
  .camera({ start: { position: [0, 0, 3] }, target: { position: [2, 2, 2] } })
  .start();
