// @flow

import { Point } from '../../../tools/g2';
import { AxisProperties } from './AxisProperties';

class TraceProperties {
  points: Array<Point>;
  name: string;
  color: TypeColor;

  constructor(
    name: string = '',
    color: TypeColor = [1, 0, 0, 1],
    points: Array<Point> = [],
  ) {
    this.points = points;
    this.name = name;
    this.color = color;
  }
}

class CartesianPlotProperties {
  // Clip Space
  start: Point;
  length: number;
  width: number;

  // // Plot Space
  // limits: {min: Point, max: Point};

  axes: Array<AxisProperties>;

  traces: Array<TraceProperties>;

  constructor() {
    this.start = new Point(0, 0);
    this.length = 1;
    this.width = 1;

    this.axes = [
      new AxisProperties('x', 0),
      new AxisProperties('y', Math.PI / 2),
    ];
    this.traces = [];
  }
}

export { CartesianPlotProperties, TraceProperties };

