// const { polygon } = Fig.tools.g2;

const figure = new Fig.Figure({ font: { size: 0.1 }, scene: {
  // left: -3, right: 3, bottom: -3, top: 3,
} });



const s = new Fig.Scene({
  left: -3, right: 3, bottom: -3, top: 3,
});

// const gesture = figure.add({
//   make: 'gesture',
//   color: [0, 0, 1, 0.2],
//   width: 1,
//   height: 1,
//   // pan: { wheel: true },
//   zoom: true,
//   pan: true,
// });
// figure.addZoomPanControl({ color: [1, 0, 0, 0.4]});

// const axis = figure.add({
//   name: 'axis',
//   make: 'collections.zoomAxis',
//   axis: 'x',
//   length: 1,
//   position: [-0.5, -0.8],
//   ticks: { length: 0.03 },
//   grid: { length: 0.5, color: [0.7, 0.7, 0.7, 1], offset: 0, width: 0.002 },
//   labels: { precision: 2, fix: false },
//   start: 0,
//   stop: 2,
//   step: 0.2,
//   font: { size: 0.05 },
//   // title: 'this is an axis',
// });

// axis.pan(2, 0.5);
// axis.addTicks({ length: 0.05, offset: -0.05, step: 0.05 }, 'ticks');


const pow = (pow = 2, stop = 10, step = 0.05) => {
  const xValues = Fig.range(0, stop, step);
  return xValues.map(x => new Fig.Point(x, x ** pow));
};

// figure.add({
//   name: 'x',
//   make: 'collections.zoomAxis',
//   stop: 2,
//   step: [0.5, 0.1],
//   grid: [
//     { length: 1, color: [0.5, 0.5, 0.5, 1] },
//     { length: 1, dash: [0.01, 0.01], color: [0.7, 0.7, 0.7, 1] },
//   ],
//   title: {
//     font: { color: [0.4, 0.4, 0.4, 1] },
//     text: [
//       'Total Time',
//       {
//         text: 'in seconds',
//         font: { size: 0.05 },
//         lineSpace: 0.1,
//       },
//     ],
//   },
// });


const plot = figure.add({
  name: 'plot',
  make: 'collections.plot',
  width: 1,                                    // Plot width in figure
  height: 1,                                   // Plot height in figure
  yAxis: {
    start: 0,
    stop: 100,
    type: 'zoom',
    step: [20, 4],
    minorStep: 4,
    labels: { location: 'right' },
    ticks: {
      location: 'center',
      // length: 0.2,
    },
    // ticks: [true, true],
    // line: false,
    // ticks: false,
    // ticks: [
    //   true,
    //   { length: 0.02, offset: -0.02 },
    // ],
    // grid: { dash: [] },
    min: 0,
    max: 300,
    autoStep: true,
  },              // Customize y axis limits
  xAxis: {
    start: 0,
    stop: 1,
    type: 'zoom',
    step: 0.25,
    labels: { precision: 3, location: 'top' },
    grid: { dash: [] },
    ticks: {
      location: 'top',
      // length: 0.2,
    },
    // line: false,
    // ticks: false,
    min: 0,
    max: 10,
    autoStep: true,
    // ticks: true,
  },              // Customize y axis limits
  trace: [
    { points: pow(1.5), name: 'Power 1.5' },   // Trace names are for legend
    {                                          // Trace with only markers
      points: pow(2, 10, 0.5),
      name: 'Power 2',
      markers: { sides: 4, radius: 0.03 },
    },
    {                                          // Trace with markers and
      points: pow(3, 10, 0.5),                 // dashed line
      name: 'Power 3',
      markers: { radius: 0.03, sides: 10, line: { width: 0.005 } },
      line: { dash: [0.04, 0.01] },
    },
  ],
  position: [-0.5, -0.5],
  // zoom: 'x',
  pan: 'xy',
  plotArea: { line: { width: 0.001 } },
  // frame: [1, 0, 0, 1],
  cross: [1, 150],
  plotAreaLabels: true,
});

// gesture.setZoomOptions({ scale: 5, max: 100000, min: 0.001 });

// gesture.notifications.add('zoom', () => {
//   const z = gesture.getZoom();
//   // const x = axis.drawToValue(z.current.normPosition.x);
//   // axis.changeZoom(x, z.mag);
//   const p = plot.drawToPoint(z.current.normPosition);
//   plot.zoomDelta(p, z.mag / z.last.mag);
//   gesture.reset();
// });

// gesture.notifications.add('pan', () => {
//   const z = gesture.getZoom();
//   const p = gesture.getPan();
//   // const q = plot.drawToPoint(z.current.normPosition);
//   plot.panDeltaDraw(p.delta.scale(-z.mag));
//   gesture.reset();
//   // axis.panDeltaDraw(-p.delta.x * z.mag);
// });


// const zoomPad = figure.add({
//   make: 'rectangle',
//   color: [1, 0, 0, 0.5],
//   width: 1,
//   height: 1,
// });

// figure.notifications.add('zoom', ([zoom, position]) => {

// });
figure.addFrameRate(10, { color: [1, 0, 0, 1] });

const r = figure.add({
  make: 'collections.rectangle',
  color: [0, 0, 1, 0.5],
});