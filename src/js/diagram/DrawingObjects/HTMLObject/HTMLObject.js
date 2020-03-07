// @flow

// import * as m2 from '../tools/m2';
import {
  Point, spaceToSpaceTransform,
} from '../../../tools/g2';
import DrawingObject from '../DrawingObject';


class HTMLObject extends DrawingObject {
  border: Array<Array<Point>>;
  id: string;
  location: Point;
  // diagramLimits: Rect;
  element: HTMLElement;
  parentDiv: HTMLElement;
  xAlign: 'left' | 'right' | 'center';
  yAlign: 'top' | 'bottom' | 'middle';
  show: boolean;

  copy: () => HTMLObject;
  +change: (string | HTMLElement, Array<number>) => void;

  constructor(
    parentDiv: HTMLElement,
    id: string,
    location: Point,
    yAlign: 'top' | 'bottom' | 'middle' = 'middle',
    xAlign: 'left' | 'right' | 'center' = 'center',
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
  }

  _dup() {
    const c = new HTMLObject(
      this.parentDiv, this.id,
      this.location._dup(), this.yAlign, this.xAlign,
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

  getGLBoundaries(): Array<Array<Point>> {
    const parentRect = this.parentDiv.getBoundingClientRect();
    const glSpace = {
      x: { bottomLeft: -1, width: 2 },
      y: { bottomLeft: -1, height: 2 },
    };
    const pixelSpace = {
      x: { bottomLeft: 0, width: parentRect.width },
      y: { bottomLeft: parentRect.height, height: -parentRect.height },
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

  change(newHtml: string | HTMLElement, lastDrawTransformMatrix: Array<number>) {
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

  transformHtml(transformMatrix: Array<number>) {
    if (this.show) {
      // this.element.style.visibility = 'visible';
      const glLocation = this.location.transformBy(transformMatrix);
      const pixelLocation = this.glToPixelSpace(glLocation);

      const w = this.element.clientWidth;
      const h = this.element.clientHeight;
      // console.log(w, h, this.element.id)
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
      this.element.style.position = 'absolute';
      this.element.style.left = `${x}px`;
      this.element.style.top = `${y}px`;
      this.element.style.visibility = 'visible';
      // this.element.classList.remove('diagram__hidden');
    } else {
      this.element.style.position = 'absolute';
      this.element.style.left = '-10000px';
      this.element.style.top = '-10000px';
      // this.element.classList.add('diagram__hidden');
      this.element.style.visibility = 'hidden';
      // this.element.style.visibility = 'hidden';
      // console.trace()
    }
  }

  drawWithTransformMatrix(transformMatrix: Array<number>) {
    this.transformHtml(transformMatrix);
  }
}

export default HTMLObject;
// Transform -1 to 1 space to 0 to width/height space
