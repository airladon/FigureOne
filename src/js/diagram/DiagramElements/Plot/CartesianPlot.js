// @flow

import {
  DiagramElementCollection, DiagramElementPrimitive,
} from '../../Element';
import {
  Rect, Transform, Point,
} from '../../../tools/g2';
import WebGLInstance from '../../webgl/webgl';

// import AxisProperties from './AxisProperties';
import { CartesianPlotProperties } from './CartesianPlotProperties';
import DrawContext2D from '../../DrawContext2D';
import Axis from './Axis';
import VertexPolyLine from '../../DrawingObjects/VertexObject/VertexPolyLine';

class CartesianPlot extends DiagramElementCollection {
  props: CartesianPlotProperties;
  glBoundingRect: Rect;

  constructor(
    webgl: Array<WebGLInstance>,
    drawContext2D: Array<DrawContext2D>,
    plotProperties: CartesianPlotProperties = new CartesianPlotProperties(),
    transform: Transform = new Transform().scale(1, 1).rotate(0).translate(0, 0),
    diagramLimits: Rect = new Rect(-1, 1, 2, 2),
  ) {
    super(transform, diagramLimits);
    this.props = plotProperties;
    for (let i = 0; i < plotProperties.axes.length; i += 1) {
      const axisProps = plotProperties.axes[i];
      const axis = new Axis(
        webgl, drawContext2D, axisProps,
        new Transform().scale(1, 1).rotate(0).translate(0, 0), diagramLimits,
      );
      this.add(axisProps.name, axis);
    }

    for (let i = 0; i < this.props.traces.length; i += 1) {
      const trace = this.props.traces[i];
      const line = [];
      for (let j = 0; j < trace.points.length; j += 1) {
        line.push(new Point(
          this.props.axes[0].valueToClip(trace.points[j].x),
          this.props.axes[1].valueToClip(trace.points[j].y),
        ));
      }
      const polyline = new VertexPolyLine(webgl, line, false, 0.01);
      this.add(trace.name, new DiagramElementPrimitive(
        polyline,
        new Transform().scale(1, 1).rotate(0).translate(0, 0),
        trace.color,
        diagramLimits,
      ));
    }
    this.touchInBoundingRect = true;
  }

  // isBeingTouched(glLocation: Point) {
  //   if (!this.isTouchable) {
  //     return false;
  //   }
  //   // let { min, max } = this.glBoundingRect;
  //   // const t = this.transform.t();

  //   // if (t instanceof Point) {
  //   //   min = min.add(t);
  //   //   max = max.add(t);
  //   // }
  //   console.log(this.glBoundingRect)
  //   if (glLocation.x <= this.glBoundingRect.right
  //     && glLocation.x >= this.glBoundingRect.left
  //     && glLocation.y <= this.glBoundingRect.top
  //     && glLocation.y >= this.glBoundingRect.bottom) {
  //     return true;
  //   }
  //   return false;
  // }

  // getTouched(glLocation: Point): Array<DiagramElementPrimitive | DiagramElementCollection> {
  //   if (!this.isTouchable) {
  //     return [];
  //   }
  //   let touched = [];
  //   if (this.isBeingTouched(glLocation)) {
  //     touched.push(this);
  //     const additionalTouched = super.getTouched(glLocation);
  //     touched = touched.concat(additionalTouched);
  //     return touched;
  //   }
  //   // for (let i = 0; i < this.order.length; i += 1) {
  //   //   const element = this.elements[this.order[i]];
  //   //   if (element.show === true) {
  //   //     touched = touched.concat(element.getTouched(clipLocation));
  //   //   }
  //   // }
  //   // // If there is an element that is touched, then this collection should
  //   // // also be touched.
  //   // if (touched.length > 0) {
  //   //   touched = [this].concat(touched);
  //   // }
  //   return touched;
  // }
}

export default CartesianPlot;

