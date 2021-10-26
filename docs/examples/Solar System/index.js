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
  // line: { width: 0.3 },
  width: 2.5,
  height: 0.4,
  position: [0, -0.45],
  color: [0, 0, 0, 0.85],
});

// Main plot - zoom and pan enabled in x
// Gesture area extends to left and right boundaries of figure
const plot = figure.add({
  make: 'collections.plot',
  width: 2,
  height: 0.9,
  font: { size: 0.02 },
  position: [-1, -0.25],
  grid: false,
  x: {
    start: 0, stop: 200, step: 20, color: [1, 1, 1, 1], min: 0, max: 5000,
    title: { text: 'km (millions)', location: 'right', offset: [-0.15, 0.02] },
  },
  y: { show: false },
  zoom: { axis: 'x', max: 500 },
  pan: { axis: 'x', wheel: true },
  gestureArea: { left: -0.05, right: 0.05 },
});

// Reference Axis
figure.add({
  make: 'collections.axis',
  position: [-1, -0.43],
  length: 2,
  start: 0,
  stop: 3000,
  step: 500,
  color: [0.3, 0.3, 0.3, 1],
  font: { size: 0.02 },
  labels: false,
  ticks: false,
});

// Marker on reference axis
const marker = figure.add({
  make: 'rectangle',
  width: 2,
  height: 0.005,
  color: [1, 1, 1, 1],
});

// Update marker show the visible area on the reference axis
plot.notifications.add('update', () => {
  const w = plot._x.stopValue - plot._x.startValue;
  const v = plot._x.startValue + w / 2;
  marker.setPosition(v / 5000 * 2 - 1, -0.43);
  marker.setScale(Math.max(0.003, w / 5000), 1);
});

// Add sun and planets
const planetY = 0.125;
function createMass(name, distance, radius, color, labelY = 0.025, isMoon = false) {
  const s = labelY / Math.abs(labelY);
  const mass = figure.add({
    name,
    make: 'collection',
    elements: [
      {
        name: 'line',
        make: 'line',
        width: 0.001,
        p1: [0, s * 0.01],
        p2: [0, labelY * 4],
      },
      {
        name: 'orb',
        make: 'polygon',
        sides: 100,
        color: name !== 'Sun' ? [1, 1, 1, 1] : color,
        radius: radius / 100000000,
      },
      {
        name: 'label',
        make: 'text',
        text: name,
        xAlign: 'center',
        yAlign: labelY < 0 ? 'top' : 'bottom',
        position: [0, labelY * 4 + s * 0.01],
      },
    ],
    position: [distance / 100, planetY],
  });
  plot.notifications.add('update', () => {
    const mag = plot._x.currentZoom;
    mass.setPosition(plot.pointToDraw([distance, 0]).x - 1, planetY);
    if (scalePlanets) {
      mass._orb.setScale(Math.max(mag, 2000 / radius * 100));
    } else {
      mass._orb.setScale(100);
    }

    const r = mass._orb.getScale().x * radius / 100000000;
    if (r < 0.17) {
      mass._line.show();
      mass._line.custom.updatePoints({
        p1: [0, s * (r + 0.005)],
        p2: [0, s * (r + Math.abs(labelY) * 2)],
      });
      mass._label.setPosition(0, s * (r + Math.abs(labelY) * 2.2));
      mass._label.setColor([1, 1, 1, 1]);
    } else {
      if (name !== 'Sun') {
        mass._label.setColor([0, 0, 0, 1]);
      }
      mass._label.setPosition(0, Math.min(r * 0.8, 0.3));
      mass._line.hide();
    }
  });
  figure.elements.toBack(mass);

  if (!isMoon) {
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
          xAlign: 'center',
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
}

createMass('Neptune', 2780 * 1.609, 15229 * 1.609, [0.5, 0.5, 1, 1]);
createMass('Uranus', 1834 * 1.609, 15759 * 1.609, [0.5, 0.5, 1, 1]);
createMass('Saturn', 921 * 1.609, 36184 * 1.609, [0.5, 0.5, 1, 1]);
createMass('Jupiter', 465 * 1.609, 43441 * 1.609, [0.5, 0.5, 1, 1]);
createMass('Mars', 151 * 1.609, 2106 * 1.609, [1, 0, 0, 1], 0.01);
createMass('Earth', 93 * 1.609, 3958 * 1.609, [0.5, 0.5, 1, 1], -0.02);
createMass('Moon', 92.76 * 1.609, 1079 * 1.609, [0.5, 0.5, 1, 1], 0.02, true);
createMass('Venus', 67.2 * 1.609, 3760 * 1.609, [0.5, 0.5, 0, 1], 0.05);
createMass('Mercury', 36 * 1.609, 1516 * 1.609, [1, 0.5, 0, 1], -0.05);
createMass('Sun', 0, 696000, [1, 0.5, 0, 1], 0.09);

const zoomToggle = figure.add({
  make: 'collections.toggle',
  label: { text: 'Scale Planets', font: { size: 0.03 } },
  position: [0.9, 0.45],
  theme: 'light',
  height: 0.04,
  touchBorder: 0.02,
});

const update = () => plot.zoomDelta(plot.drawToPoint([0, 0]), 1);
zoomToggle.notifications.add('on', () => { scalePlanets = true; update(); });
zoomToggle.notifications.add('off', () => { scalePlanets = false; update(); });

figure.elements.toFront(marker);
plot.zoomValue([0, 0], 0.0001);
