// Create a diagram
const diagram = new Fig.Diagram();

// Add circle to diagram
diagram.addElement(
  {
    name: 'circle',
    method: 'graph',
    options: {
      axes: [
        {
          type: 'x',
          id: 'a1',
          intersection: 0,
          color: [1, 0, 0, 1],
          width: 0.05,
          dash: [0.1, 0.01],
          label: {
            size: 0.1,
            color: [1, 0.1, 0.1, 1],
            labels: ['a' | equations | DiagrmElement, 'b', 'c'],
            align: 'middle' | 'top' | 'bottom' | number | 'left' | 'right' | 'center',
            offset: number | [-0.1, 0.1],
            font: {},
          },
          minorTicks: {
            start: 0,
            step: 0.1,
            length: [-0.1, 0.1] | 0.1,
            width: 0.01,
            color: [0, 1, 0, 1],
            grid: false,
            dash: [0.1, 0.01],
            label: {
              size: 0.1,
              color: [1, 0.1, 0.1, 1],
              labels: ['a' | equations | DiagrmElement, 'b', 'c'],
              align: 'middle' | 'top' | 'bottom' | number | 'left' | 'right' | 'center',
              offset: number | [-0.1, 0.1],
              font: {},
            },
          },
          majorTicks: {
            start: 0,
            step: 0.1,
            length: [-0.1, 0.1] | 0.1,
            width: 0.01,
            color: [0, 1, 0, 1],
            grid: true,
            dash: [0.1, 0.01],
          },
          label: {

          }
          log: true,
        },
      ],
      traces: [
        {
          type: line,
          axes: graphElement,
          xAxis: id | index,
          yAxis: id | index,
          x: [1, 2, 3],
          y: [1, 2, 3],
          color: [0, 0, 1, 1],
          width: 0.002,
          dash: [0.1, 0.1],
          marker: {
            type: 'circle',
            fillColor: [1, 0, 1, 1],
            border: {
              color: [1, 0, 0, 1],
              width: 0.04,
            },
          },
        },
      ],
      axis: {
        type: 'y',
        intersection: 0,
        line: {
          width: 0.05,
          dash: [0.17, 0.05, 0.05, 0.05],
        },
         
      }
    },
  },
  {
    name: 'circle',
    method: 'graph',
    options: {
      x: [1, 2, 3],
      y: [5, 6, 7],
    },
  },
);

// Initialize diagram
diagram.initialize();
