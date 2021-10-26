/* globals Fig */

// In this figure, each unit is 1000 million km.
// So the main plot will be 5 units in length representing 5000 million km

const figure = new Fig.Figure({
  scene: [-2.6, -1.3, 2.6, 1.3],
  backgroundColor: [0, 0, 0, 1],
  color: [1, 1, 1, 1],
  font: { size: 0.07 },
});

let scalePlanets = false;

// Mask
figure.add({
  make: 'rectangle',
  // line: { width: 0.3 },
  width: 6,
  height: 0.8,
  position: [0, -0.9],
  color: [0, 0, 0, 0.85],
});

// Main plot - zoom and pan enabled in x
// Gesture area extends to left and right boundaries of figure
const plot = figure.add({
  make: 'collections.plot',
  width: 5,
  height: 1.8,
  font: { size: 0.07 },
  position: [-2.5, -0.5],
  grid: false,
  x: {
    start: 0, stop: 5000, step: 500, color: [1, 1, 1, 1], min: 0, max: 5000,
    title: { text: 'km (millions)', location: 'right', offset: [-0.6, 0.05] },
    labels: { precision: 2 },
  },
  y: { show: false },
  zoom: { axis: 'x', max: 10000, pinchSensitivity: 10, wheelSensitivity: 2 },
  pan: { axis: 'x', maxVelocity: 50, wheelSensitivity: 2 },
  gestureArea: { left: -0.1, right: 0.05 },
});

// Reference axis showing relative positions of all planets and how much
// of space is currently visible
figure.add({
  make: 'line',
  p1: [-2.5, -1], p2: [2.5, -1],
  width: 0.005,
  color: [0.5, 0.5, 0.5, 1],
});

// Marker on reference axis
const marker = figure.add({
  make: 'rectangle',
  width: 5,
  height: 0.01,
  color: [1, 1, 1, 1],
});

// Update marker show the visible area on the reference axis
plot.notifications.add('update', () => {
  const w = plot._x.stopValue - plot._x.startValue;
  const v = plot._x.startValue + w / 2;
  marker.setPosition(v / 1000 - 2.5, -1);
  marker.setScale(Math.max(0.003, w / 5000), 1);
});

// Add sun and planets
const planetY = 0.4;
function createMass(name, distance, radius, color, labelY = 0.05, isMoon = false) {
  const s = labelY / Math.abs(labelY);
  const mass = figure.add({
    name,
    make: 'collection',
    elements: [
      {
        name: 'line',
        make: 'line',
        width: 0.002,
        p1: [0, s * 0.01],
        p2: [0, labelY * 4],
      },
      {
        name: 'orb',
        make: 'polygon',
        sides: 100,
        color: name !== 'Sun' ? [1, 1, 1, 1] : color,
        radius: radius / 1e9,
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
    position: [distance / 1e6 - 2.5, planetY],
  });

  plot.notifications.add('update', () => {
    const mag = plot._x.currentZoom;
    const span = 5000 / mag;
    mass.setPosition(plot.pointToDraw([distance / 1e6, 0]).x - 2.5, planetY);
    if (scalePlanets) {
      mass._orb.setScale(Math.max(mag, 8e6 / radius));
    } else {
      mass._orb.setScale(2000);
    }

    const r = mass._orb.getScale().x * radius / 1e9;
    if (r < 0.3) {
      mass._line.show();
      mass._line.custom.updatePoints({
        p1: [0, s * (r + 0.01)],
        p2: [0, s * (r + Math.abs(labelY) * 2)],
      });
      mass._label.setPosition(0, s * (r + Math.abs(labelY) * 2.2));
      mass._label.setColor([1, 1, 1, 1]);
    } else {
      if (name !== 'Sun') {
        mass._label.setColor([0, 0, 0, 1]);
      }
      mass._label.setPosition(0, Math.min(r * 0.7, 0.6));
      mass._line.hide();
    }
    if (isMoon) {
      if (span < 200) { mass.show(); } else { mass.hide(); }
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
          yAlign: labelY < 0 ? 'top' : 'baseline',
          xAlign: 'center',
          touchBorder: 0.03,
          touch: true,
          color: [0.6, 0.6, 0.6, 1],
        },
        {
          make: 'line',
          length: labelY,
          angle: Math.PI / 2,
          color: [0.5, 0.5, 0.5, 1],
        },
      ],
      position: [distance / 1e9 - 2.5, -1],
    });
    label._label.notifications.add('onClick', () => {
      // console.log(distance / 1e6, distance / 1e9 - 2.5)
      plot.panToValue([distance / 1e6, 0], [2.5, 1]);
      figure.animateNextFrame();
    });
    label._label.setTouchable();
  }
}

createMass('Neptune', 4475e6, 24622, [0.5, 0.5, 1, 1]);
createMass('Uranus', 2951e6, 25263, [0.5, 0.5, 1, 1]);
createMass('Saturn', 1483e6, 58232, [0.5, 0.5, 1, 1]);
createMass('Jupiter', 750e6, 69911, [0.5, 0.5, 1, 1]);
createMass('Mars', 243e6, 3389, [1, 0, 0, 1], 0.06);
createMass('Earth', 150e6, 6371, [0.5, 0.5, 1, 1], -0.05);
createMass('Moon', 150e6 - 384400, 1737, [0.5, 0.5, 1, 1], 0.03, true);
createMass('Venus', 109e6, 6051, [0.5, 0.5, 0, 1], 0.15);
createMass('Mercury', 58e6, 2440, [1, 0.5, 0, 1], -0.15);
createMass('Sun', 0, 696000, [1, 0.5, 0, 1], 0.25);

const zoomToggle = figure.add({
  make: 'collections.toggle',
  label: { text: 'Scale Planets', font: { size: 0.07 }, location: 'top' },
  position: [2.3, 1.1],
  theme: 'light',
  height: 0.1,
  touchBorder: 0.04,
});

const update = () => plot.zoomDelta(plot.drawToPoint([0, 0]), 1);
zoomToggle.notifications.add('on', () => { scalePlanets = true; update(); });
zoomToggle.notifications.add('off', () => { scalePlanets = false; update(); });

figure.elements.toFront(marker);
plot.zoomValue([0, 0], 0.0001);
