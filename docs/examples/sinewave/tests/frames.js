/* global __duration __frames __timeStep __title*/

__title = 'Example - Sine Wave';
__duration = 10;
__timeStep = 0.2;
__frames = [
  [0,
    `
    figure.stop();
    signal.data = [0];
    signal.lastTime = figure.globalAnimation.now();
    rotator.setRotation(0);
    rotator.animations.new()
      .rotation({ target: Math.PI / 4, duration: 1 })
      .start();
    `
  ],
  [1.5, 'touchDown', [-0.7, 0.3], 'touch arm'],
  [2, 'touchMove', [-0.8, 0.4], 'move arm'],
  [2.5, 'touchMove', [-0.9, 0.4], 'mave arm 2'],
  [2.6, 'touchMove', [-0.9, 0.4], 'stop arm move'],
  [2.6, 'touchUp'],
  [3, 'touchDown', [-1, -1.2], 'touch slow'],
  [6, 'touchDown', [0, -1.2], 'touch fast'],
  [9, 'touchDown', [1, -1.2], 'touch stop'],
];
