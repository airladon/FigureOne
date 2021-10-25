/* globals Fig */

const figure = new Fig.Figure({
  scene: [-1.05, -0.525, 1.05, 0.525],
  backgroundColor: [0, 0, 0, 1],
  color: [1, 1, 1, 1],
  font: { size: 0.02 },
});

let scalePlanets = false;

// Mask
figure.add({
  make: 'rectangle',
  line: { width: 0.3 },
  width: 2.4,
  height: 0.9 + 0.2,
  position: [-0.05, 0.15],
  color: [0, 0, 0, 1],
});

const plot = figure.add({
  make: 'collections.plot',
  width: 2,
  height: 0.9,
  font: { size: 0.02 },
  position: [-1, -0.25],
  grid: false,
  x: { start: 0, stop: 200, step: 20, color: [1, 1, 1, 1], min: 0, max: 5000 },
  y: { show: false },
  zoom: { axis: 'x', max: 100 },
  pan: { axis: 'x', wheel: true },
  gestureArea: { left: -0.05 },
});



const axis = figure.add({
  make: 'collections.axis',
  position: [-1, -0.43],
  length: 2,
  start: 0,
  stop: 3000,
  step: 500,
  color: [1, 1, 1, 1],
  font: { size: 0.02 },
  labels: false,
  ticks: false,
});

const marker = figure.add({
  make: 'rectangle',
  width: 2,
  height: 0.005,
  color: [1, 0, 0, 1],
});

plot.notifications.add('update', () => {
  const w = plot._x.stopValue - plot._x.startValue;
  const v = plot._x.startValue + w / 2;
  marker.setPosition(v / 5000 * 2 - 1, -0.43);
  marker.setScale(Math.max(0.01, w / 5000), 1);
});


const planetY = 0.125;
function createMass(name, distance, radius, color, labelY = 0.02, xAlign = 'center') {
  const mass = figure.add({
    name,
    make: 'polygon',
    sides: 100,
    color,
    position: [distance / 100, planetY],
    radius: radius / 100000000,
  });
  plot.notifications.add('update', () => {
    const mag = plot._x.currentZoom;
    mass.setPosition(plot.pointToDraw([distance, 0]).x - 1, planetY);
    if (scalePlanets) {
      mass.setScale(Math.max(mag, 2000 / radius * 200));
    } else {
      mass.setScale(100);
    }
  });
  figure.elements.toBack(mass);

  const label = figure.add({
    make: 'collection',
    name: `label${name}`,
    elements: [
      {
        make: 'text',
        text: name,
        name: 'label',
        position: [0, labelY + labelY / Math.abs(labelY) * 0.01],
        yAlign: labelY < 0 ? 'top' : 'bottom',
        xAlign,
        touchBorder: 0.01,
        touch: true,
      },
      {
        make: 'line',
        length: labelY,
        angle: Math.PI / 2,
      },
    ],
    position: [distance / 2500 - 1, -0.43],
  });
  label._label.notifications.add('onClick', () => {
    plot.panToValue([distance, 0], [distance / 2500, 1]);
    figure.animateNextFrame();
  });
  label._label.setTouchable();
}

createMass('Neptune', 2780 * 1.609, 15229 * 1.609, [0.5, 0.5, 1, 1]);
createMass('Uranus', 1834 * 1.609, 15759 * 1.609, [0.5, 0.5, 1, 1]);
createMass('Saturn', 921 * 1.609, 36184 * 1.609, [0.5, 0.5, 1, 1]);
createMass('Jupiter', 465 * 1.609, 43441 * 1.609, [0.5, 0.5, 1, 1]);
createMass('Mars', 151 * 1.609, 2106 * 1.609, [1, 0, 0, 1], 0.01);
createMass('Earth', 93 * 1.609, 3958 * 1.609, [0.5, 0.5, 1, 1], -0.02);
createMass('Venus', 67.2 * 1.609, 3760 * 1.609, [0.5, 0.5, 0, 1], 0.05);
createMass('Mercury', 36 * 1.609, 1516 * 1.609, [1, 0.5, 0, 1], -0.05);
createMass('Sun', 0, 696000, [1, 1, 0, 1], 0.09);

const zoomToggle = figure.add({
  make: 'collections.toggle',
  label: { text: 'Scale Planets', font: { size: 0.05 } },
  position: [0.9, 0.45],
  theme: 'light',
  height: 0.04,
});

zoomToggle.notifications.add('on', () => { scalePlanets = true; });
zoomToggle.notifications.add('off', () => { scalePlanets = false; });
