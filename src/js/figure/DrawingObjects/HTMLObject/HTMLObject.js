// @flow

// import * as m2 from '../tools/m2';
import {
  Point, spaceToSpaceTransform,
} from '../../../tools/g2';
import { round } from '../../../tools/math';
import DrawingObject from '../DrawingObject';
import type { TypeColor } from '../../../tools/types';
import * as m3 from '../../../tools/m3';
import type { Type3DMatrix } from '../../../tools/m3';
import type Scene from '../../../tools/geometry/scene';


class HTMLObject extends DrawingObject {
  border: Array<Array<Point>>;
  id: string;
  location: Point;
  // figureLimits: Rect;
  element: HTMLElement;
  parentDiv: HTMLElement;
  xAlign: 'left' | 'right' | 'center';
  yAlign: 'top' | 'bottom' | 'middle';
  show: boolean;
  lastMatrix: Array<number>;
  lastColor: Array<number>;
  forceDraw: boolean;
  originalElement: HTMLElement;

  copy: () => HTMLObject;
  // +change: (string | HTMLElement, Array<number>) => void;

  constructor(
    parentDiv: HTMLElement,
    id: string,
    location: Point,
    yAlign: 'top' | 'bottom' | 'middle' = 'middle',
    xAlign: 'left' | 'right' | 'center' = 'center',
    originalElement: HTMLElement,
  ) {
    super();
    const element = document.getElementById(id);
    if (element) {
      this.element = element;
    }
    this.id = id;
    this.location = location;
    this.yAlign = yAlign;
    this.xAlign = xAlign;
    this.parentDiv = parentDiv;
    this.show = true;
    this.setBorder();
    this.lastMatrix = [0, 0, 0, 0, 0, 0, 0, 0, 0];
    this.lastColor = [-1, -1, -1, -1];
    this.forceDraw = false;
    this.originalElement = originalElement;
  }

  _dup() {
    const c = new HTMLObject(
      this.parentDiv, this.id,
      this.location._dup(), this.yAlign, this.xAlign,
      this.originalElement,
    );
    c.show = this.show;
    c.border = this.border.map(b => b.map(p => p._dup()));
    return c;
  }

  setBorder() {
    const parentRect = this.parentDiv.getBoundingClientRect();
    const elementRect = this.element.getBoundingClientRect();
    const left = elementRect.left - parentRect.left;
    const right = left + elementRect.width;
    const top = elementRect.top - parentRect.top;
    const bottom = top + elementRect.height;

    const boundary = [];
    boundary.push(new Point(left, top));
    boundary.push(new Point(right, top));
    boundary.push(new Point(right, bottom));
    boundary.push(new Point(left, bottom));
    this.border = [];
    this.border.push(boundary);
  }

  getBoundaries(): Array<Array<Point>> {
    const parentRect = this.parentDiv.getBoundingClientRect();
    const glSpace = {
      x: { min: -1, span: 2 },
      y: { min: -1, span: 2 },
      z: { min: -1, span: 2 },
    };
    const pixelSpace = {
      x: { min: 0, span: parentRect.width },
      y: { min: parentRect.height, span: -parentRect.height },
      z: { min: -1, span: 2 },
    };
    const pixelToGLTransform = spaceToSpaceTransform(pixelSpace, glSpace);

    const elementRect = this.element.getBoundingClientRect();
    const left = elementRect.left - parentRect.left;
    const right = left + elementRect.width;
    const top = elementRect.top - parentRect.top;
    const bottom = top + elementRect.height;

    const boundary = [];
    boundary.push(new Point(left, top));
    boundary.push(new Point(right, top));
    boundary.push(new Point(right, bottom));
    boundary.push(new Point(left, bottom));

    return [boundary.map(p => p.transformBy(pixelToGLTransform.matrix()))];
  }

  glToPixelSpace(p: Point) {
    const x = (p.x - -1) / 2 * this.parentDiv.clientWidth;
    const y = (1 - p.y) / 2 * this.parentDiv.clientHeight;
    return new Point(x, y);
  }

  // $FlowFixMe
  change(newHtml: string | HTMLElement, lastDrawTransformMatrix: Type3DMatrix) {
    let element = newHtml;
    if (typeof newHtml === 'string') {
      element = document.createElement('div');
      element.innerHTML = newHtml;
    }
    if (element instanceof HTMLElement) {
      this.element.innerHTML = '';
      this.element.appendChild(element);
      this.transformHtml(lastDrawTransformMatrix);
    }
  }

  transformHtml(transformMatrix: Type3DMatrix, opacity: number = 1) {
    if (this.show) {
      const glLocation = this.location.transformBy(transformMatrix);
      const pixelLocation = this.glToPixelSpace(glLocation);
      const w = this.originalElement.clientWidth;
      const h = this.originalElement.clientHeight;
      let left = 0;
      let top = 0;
      if (this.xAlign === 'center') {
        left = -w / 2;
      } else if (this.xAlign === 'right') {
        left = -w;
      }
      if (this.yAlign === 'middle') {
        top = -h / 2;
      } else if (this.yAlign === 'bottom') {
        top = -h;
      }
      const x = pixelLocation.x + left;
      const y = pixelLocation.y + top;
      const style = `position: absolute; left: ${x}px; top: ${y}px; visibility: visible; opacity: ${opacity};`;
      const currentStyle = this.element.getAttribute('style');
      if (style !== currentStyle) {
        this.element.setAttribute('style', style);
      }
    } else {
      this.element.setAttribute(
        'style',
        `position: absolute; left: -10000px; top: -10000px; visibility: hidden; opacity: ${opacity};`,
      );
    }
  }

  drawWithTransformMatrix(scene: Scene, worldMatrix: Type3DMatrix, color: TypeColor) {
    let isDifferent = false;
    const transformMatrix = m3.mul(scene.viewProjectionMatrix, worldMatrix);
    for (let i = 0; i < transformMatrix.length; i += 1) {
      if (round(transformMatrix[i], 8) !== this.lastMatrix[i]) {
        isDifferent = true;
      }
    }
    if (
      isDifferent
      || this.lastColor[3] !== round(color[3], 8)
    ) {
      this.transformHtml(transformMatrix, color[3]); // $FlowFixMe
      this.lastMatrix = round(transformMatrix, 8);
      this.lastColor = round(color, 8);
      this.forceDraw = false;
    }
  }
}

export default HTMLObject;
// Transform -1 to 1 space to 0 to width/height space
