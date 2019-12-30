// @flow
import {
  Point,
} from '../../../../tools/g2';
import { duplicateFromTo } from '../../../../tools/tools';
import Bounds from './Bounds';
import {
  DiagramElementPrimitive, DiagramElementCollection,
} from '../../../Element';

// Equation is a class that takes a set of drawing objects (TextObjects,
// DiagramElementPrimitives or DiagramElementCollections and HTML Objects
// and arranges their size in a )
class BlankElement {
  ascent: number;
  descent: number;
  width: number;
  height: number;

  constructor(width: number = 0.03, ascent: number = 0, descent: number = 0) {
    this.width = width;
    this.ascent = ascent;
    this.descent = descent;
    this.height = this.ascent + this.descent;
  }

  _dup() {
    return new BlankElement(this.width, this.ascent, this.descent);
  }
}

class Element {
  content: DiagramElementPrimitive | DiagramElementCollection | BlankElement;
  ascent: number;
  descent: number;
  width: number;
  location: Point;
  height: number;
  scale: number;
  fullSize: ?{
    left: number,
    width: number,
    height: number,
    ascent: number,
    descent: number,
  }

  constructor(content: DiagramElementPrimitive | DiagramElementCollection | BlankElement) {
    this.content = content;
    this.ascent = 0;
    this.descent = 0;
    this.width = 0;
    this.location = new Point(0, 0);
    this.height = 0;
  }

  calcSize(location: Point, scale: number) {
    const { content } = this;
    if (content instanceof BlankElement) {
      this.width = content.width * scale;
      this.height = content.height * scale;
      this.ascent = content.ascent * scale;
      this.descent = content.descent * scale;
      this.location = location._dup();
      this.scale = scale;
    }
    if (content instanceof DiagramElementCollection
        || content instanceof DiagramElementPrimitive) {
      // Update translation and scale
      content.transform.updateTranslation(location.x, location.y);
      content.transform.updateScale(scale, scale);
      content.updateLastDrawTransform();
      if (content.internalSetTransformCallback != null) {
        content.internalSetTransformCallback(content.transform);
      }

      // Get the boundaries of element
      // const t = content.lastDrawTransform._dup();
      // content.lastDrawTransform = content.transform._dup();
      const r = content.getRelativeVertexSpaceBoundingRect();
      // content.lastDrawTransform = t;
      this.location = location._dup();
      this.scale = scale;
      this.ascent = r.top * scale;
      this.descent = -r.bottom * scale;
      this.height = r.height * scale;
      this.width = r.width * scale;
    }
  }

  _dup(namedCollection?: Object) {
    let c;
    if (this.content instanceof BlankElement) {
      c = new Element(this.content);
    } else if (namedCollection) {
      c = new Element(namedCollection[this.content.name]);
    } else {
      c = new Element(this.content);
    }
    c.ascent = this.ascent;
    c.descent = this.descent;
    c.width = this.width;
    c.location = this.location._dup();
    c.height = this.height;
    c.scale = this.scale;
    return c;
  }

  getAllElements() {
    if (this.content instanceof BlankElement) {
      return [];
    }
    return [this.content];
  }

  setPositions() {
    const { content } = this;
    if (content instanceof DiagramElementCollection
        || content instanceof DiagramElementPrimitive) {
      content.transform.updateTranslation(this.location.x, this.location.y);
      content.transform.updateScale(this.scale, this.scale);
      content.updateLastDrawTransform();
    }
  }

  offsetLocation(offset: Point = new Point(0, 0)) {
    this.location = this.location.add(offset);
  }

  getBounds(useFullSize: boolean) {
    if (useFullSize && this.fullSize != null) {
      return new Bounds({
        left: this.fullSize.left,
        right: this.fullSize.left + this.fullSize.width,
        top: this.location.y + this.fullSize.ascent,
        bottom: this.location.y - this.fullSize.descent,
        width: this.fullSize.width,
        height: this.fullSize.height,
        ascent: this.fullSize.ascent,
        descent: this.fullSize.descent,
      });
    }
    return new Bounds({
      left: this.location.x,
      right: this.location.x + this.width,
      top: this.location.y + this.ascent,
      bottom: this.location.y - this.descent,
      width: this.width,
      height: this.height,
      ascent: this.ascent,
      descent: this.descent,
    });
  }
}

class Elements {
  content: Array<Element | Elements>;
  ascent: number;
  descent: number;
  width: number;
  location: Point;
  height: number;
  +getAllElements: () => Array<DiagramElementPrimitive | DiagramElementCollection>;
  fullSize: ?{
    left: number,
    width: number,
    height: number,
    ascent: number,
    descent: number,
  }

  constructor(content: Array<Element | Elements | null>) {
    const nonNullContent = [];
    content.forEach((c) => {
      if (c !== null) {
        nonNullContent.push(c);
      }
    });
    this.content = nonNullContent;
    this.ascent = 0;
    this.descent = 0;
    this.width = 0;
    this.location = new Point(0, 0);
    this.height = 0;
  }

  _dup(namedCollection?: Object) {
    const contentCopy = [];
    // console.log("Asdf", this.content, namedCollection)
    this.content.forEach(element => contentCopy.push(element._dup(namedCollection)));
    const c = new Elements(contentCopy);
    duplicateFromTo(this, c, ['content']);
    return c;
  }

  calcSize(location: Point, scale: number) {
    let des = 0;
    let asc = 0;
    const loc = location._dup();
    this.content.forEach((element) => {
      element.calcSize(loc, scale);

      loc.x += element.width;
      if (element.descent > des) {
        des = element.descent;
      }
      if (element.ascent > asc) {
        asc = element.ascent;
      }
    });
    // if (this.content.length === 4 && this.content[0] instanceof Fraction) {
    //   console.log(this.content)
    //   console.log(this.content[0].location, this.content[1].location)
    //   // debugger;
    // }
    this.width = loc.x - location.x;
    this.ascent = asc;
    this.descent = des;
    this.location = location._dup();
    this.height = this.descent + this.ascent;
  }

  getAllElements() {
    let elements = [];
    this.content.forEach((e) => {
      // if (e instanceof Element && !(e.content instanceof BlankElement)) {
      //   elements.push(e.content);
      // } else {
      elements = [...elements, ...e.getAllElements()];
      // }
    });
    return elements;
  }

  setPositions() {
    this.content.forEach((e) => {
      e.setPositions();
    });
  }

  offsetLocation(offset: Point = new Point(0, 0)) {
    this.location = this.location.add(offset);
    this.content.forEach((e) => {
      e.offsetLocation(offset);
    });
  }

  getBounds(useFullSize: boolean) {
    if (useFullSize && this.fullSize != null) {
      return new Bounds({
        left: this.fullSize.left,
        right: this.fullSize.left + this.fullSize.width,
        top: this.location.y + this.fullSize.ascent,
        bottom: this.location.y - this.fullSize.descent,
        width: this.fullSize.width,
        height: this.fullSize.height,
        ascent: this.fullSize.ascent,
        descent: this.fullSize.descent,
      });
    }
    return new Bounds({
      left: this.location.x,
      right: this.location.x + this.width,
      top: this.location.y + this.ascent,
      bottom: this.location.y - this.descent,
      width: this.width,
      height: this.height,
      ascent: this.ascent,
      descent: this.descent,
    });
  }
}

export { BlankElement, Element, Elements };
