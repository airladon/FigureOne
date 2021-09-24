// @flow
import {
  Point, clipAngle,
} from '../../tools/g2';
import {
  round,
} from '../../tools/math';
import { Equation } from '../Equation/Equation';
import type {
  TypeVAlign, TypeHAlign,
} from '../Equation/EquationForm';
import { joinObjects } from '../../tools/tools';
import type { EQN_Equation } from '../Equation/Equation';
import type { TypeColor } from '../../tools/types';
import type FigureCollections from './FigureCollections';

const DEBUG = false;

export type TypeLabelOptions = {
  label?: string | Equation | Array<string> | EQN_Equation,
  color?: TypeColor,
  scale?: number,
  position?: Point,
  form?: string,
  yAlign?: TypeVAlign,
  xAlign?: TypeHAlign,
};

/**
 * Orientation of the label.
 *
 * `'horizontal' | 'toLine' | 'awayLine' | 'upright'`
 *
 * Where:
 * - `'horizontal'`: Label will be horizontal
 * - `'baseToLine'`: Label will have same angle as line with text base toward
 *   the line
 * - `'baseAway'`: Label will have same angle as line with text base away from
 *   the line
 * - `'upright'`: Label will have same angle as line with text being more
 *   upright than upside down.
 */
export type TypeLabelOrientation = 'horizontal' | 'baseAway' | 'baseToLine'
                                      | 'upright';

/**
 * Label location relative to the line.
 *
 * `'top' | 'left' | 'bottom' | 'right' | 'start' | 'end' | 'positive' | 'negative'`
 *
 * '`top`' is in the positive y direction and `'right'` is in the positive
 * x direction. '`bottom`' and '`left`' are the opposite sides respectively.
 *
 * `'positive'` is on the side of the line that the line rotates toward when
 * rotating in the positive direction. `'negative'` is the opposite side.
 *
 * `'start'` is the start end of the line, while `'end'` is the opposide end
 * of the line.
 */
export type TypeLabelLocation = 'top' | 'left' | 'bottom' | 'right'
                                    | 'start' | 'end' | 'outside' | 'inside'
                                    | 'positive' | 'negative';

/**
 * Label sub location relative to line.
 *
 * `'top' | 'left' | 'bottom' | 'right'`
 *
 * The label sub location is a fallback for when an invalid case is encountered
 * by the primary location. When the primary location is `'top'` or `'bottom'`
 * and the line is perfectly vertical, then the sub location would be used.
 *
 * Similarly, if the primary location is `'left'` or `'right'` and the line is
 * perfectly horizontal, then the sub location would be used.
 */
export type TypeLabelSubLocation = 'top' | 'left' | 'bottom' | 'right';


/**
 * Equation label
 */
export default class EquationLabel {
  eqn: Equation;
  height: number;
  width: number;
  aOffset: number;
  lastOffsetMag: number;

  constructor(
    collections: FigureCollections,
    options: TypeLabelOptions = {},
  ) {
    this.lastOffsetMag = 0;
    const defaultOptions = {
      label: '',
      color: [0, 0, 1, 1],
      scale: 0.7,
      position: new Point(0, 0),
      xAlign: 'center',
      yAlign: 'middle',
    };
    const optionsToUse = joinObjects({}, defaultOptions, options);
    const labelTextOrEquation = optionsToUse.label;
    const {
      color, scale, position, font,
    } = optionsToUse;
    // const { form } = optionsToUse;
    const { yAlign, xAlign } = optionsToUse;
    let eqn;
    if (typeof labelTextOrEquation === 'string') {
      eqn = collections.equation({
        elements: { base: labelTextOrEquation },
        color,
        formDefaults: {
          alignment: {
            fixTo: new Point(0, 0),
            xAlign,
            yAlign,
          },
        },
        font,
        textFont: font,
        scale,
        forms: {
          base: ['base'],
        },
        position,
      });
      eqn.showForm('base');
    } else if (labelTextOrEquation instanceof Equation) {
      eqn = labelTextOrEquation;
      eqn.showForm(Object.keys(eqn.eqn.forms)[0]);
    } else if (Array.isArray(labelTextOrEquation)) {
      const elements = {};
      const forms = {};
      const formSeries = [];
      labelTextOrEquation.forEach((labelText, index) => {
        elements[`_${index}`] = labelText;
        forms[index] = [labelText];
        formSeries.push(`${index}`);
      });

      eqn = collections.equation({
        elements,
        forms,
        color,
        position,
        formDefaults: {
          alignment: {
            fixTo: new Point(0, 0),
            xAlign,
            yAlign,
          },
        },
        scale,
        formSeries,
      });
      eqn.showForm('0');
    } else {
      const defaultEqnOptions = {
        color,
        formDefaults: {
          alignment: {
            fixTo: new Point(0, 0),
            xAlign,
            yAlign,
          },
        },
        scale,
        // form,
      };
      eqn = collections.equation(joinObjects(
        defaultEqnOptions, labelTextOrEquation,
      ));
      // if (form == null) {
      eqn.showForm(Object.keys(eqn.eqn.forms)[0]);
    }
    this.eqn = eqn;
    this.width = 0;
    this.height = 0;
    this.aOffset = 0;
  }

  // TODO
  // setEqn() {
  // }

  showForm(formName: string) {
    this.eqn.showForm(formName);
  }

  setText(text: string) {
    const form = this.eqn.getCurrentForm();
    if (form != null) {
      const key = Object.keys(form.elements)[0];
      // This is ok to fix for flow because all the elements of the
      // simple equation created by Equationlabel will be Primitives
      // $FlowFixMe
      const textObject = form.elements[key].drawingObject;
      if (textObject != null) {
        textObject.setText(text); // $FlowFixMe
        form.elements[key].drawBorder = form.elements[key].drawingObject.textBorder; // $FlowFixMe
        form.elements[key].drawBorderBuffer = form.elements[key].drawingObject.textBorderBuffer;
      }
      form.arrange(
        this.eqn.eqn.scale,
        this.eqn.eqn.formDefaults.alignment.xAlign,
        this.eqn.eqn.formDefaults.alignment.yAlign,
        this.eqn.eqn.formDefaults.alignment.fixTo,
      );
    }
  }

  getText(): string {
    let textToReturn = '';
    const form = this.eqn.getCurrentForm();
    if (form != null) {
      const key = Object.keys(form.elements)[0];
      // This is ok to fix for flow because all the elements of the
      // simple equation created by Equationlabel will be Primitives
      // $FlowFixMe
      const textObject = form.elements[key].drawingObject;
      // This is ok to fix for flow because all the elements of the
      // simple equation created by Equationlabel will be Primitives
      // that are text objects
      if (textObject != null) {
        // $FlowFixMe
        textToReturn = textObject.text[0].text;
      }
    }
    return textToReturn;
  }

  // eslint-disable-next-line class-methods-use-this
  updateRotation(
    position: Point,
    lineAngle: number,
    offsetMag: number,
    location: 'top' | 'bottom' | 'left' | 'right' | 'positive' | 'negative' | 'start' | 'end' | 'inside' | 'outside',
    subLocation: 'top' | 'bottom' | 'left' | 'right',
    orientation: 'horizontal' | 'baseAway' | 'baseToLine' | 'upright',
    parentAngleOffset: number = 0,
    style: 'oval' | 'rectangle' = 'oval',
    relativeToLine: boolean = true,
    startThetaAngle: number = Math.PI * 2,
    endThetaAngle: number = Math.PI,
  ) {
    // Calculate the offsetAngle and label angle
    let offsetAngle = Math.PI / 2;
    let labelAngle = 0;
    if (location === 'start') {
      offsetAngle = -Math.PI;
    } else if (location === 'end') {
      offsetAngle = 0;
    } else {
      const offsetTop = Math.cos(lineAngle + parentAngleOffset) < 0 ? -Math.PI / 2 : Math.PI / 2;
      const offsetBottom = -offsetTop;
      const offsetLeft = Math.sin(lineAngle + parentAngleOffset) > 0 ? Math.PI / 2 : -Math.PI / 2;
      const offsetRight = -offsetLeft;

      if (location === 'top') {
        offsetAngle = offsetTop;
      }
      if (location === 'bottom') {
        offsetAngle = offsetBottom;
      }
      if (location === 'right') {
        offsetAngle = offsetRight;
      }
      if (location === 'left') {
        offsetAngle = offsetLeft;
      }
      if (location === 'positive') {
        offsetAngle = Math.PI / 2;
      }
      if (location === 'negative') {
        offsetAngle = -Math.PI / 2;
      }
      if (round(Math.sin(lineAngle + parentAngleOffset), 4) === 0
        && (location === 'left' || location === 'right')
      ) {
        if (subLocation === 'top') {
          offsetAngle = offsetTop;
        }
        if (subLocation === 'bottom') {
          offsetAngle = offsetBottom;
        }
      }
      if (round(Math.cos(lineAngle + parentAngleOffset), 4) === 0
        && (location === 'top' || location === 'bottom')
      ) {
        if (subLocation === 'right') {
          offsetAngle = offsetRight;
        }
        if (subLocation === 'left') {
          offsetAngle = offsetLeft;
        }
      }
      if (location === 'inside') {
        offsetAngle = -Math.PI / 2;
      }
      if (location === 'outside') {
        offsetAngle = Math.PI / 2;
      }
    }

    let parentAngle = parentAngleOffset;
    if (orientation === 'horizontal') {
      labelAngle = -lineAngle;
    }

    if (orientation === 'baseToLine') {
      parentAngle = 0;
      labelAngle = 0;
      if (offsetAngle < 0) {
        labelAngle = Math.PI;
      }
    }
    if (orientation === 'baseAway') {
      parentAngle = 0;
      labelAngle = Math.PI;
      if (offsetAngle < 0) {
        labelAngle = 0;
      }
    }
    if (orientation === 'upright') {
      parentAngle = 0;
      if (Math.cos(lineAngle + parentAngleOffset) < 0) {
        labelAngle = Math.PI;
      }
    }

    // half height and width of text
    let h = 0;
    let w = 0;
    const currentForm = this.eqn.getCurrentForm();
    let change = false;
    if (currentForm != null) {
      if (this.height !== currentForm.height) {
        this.height = currentForm.height;
        change = true;
      }
      if (this.width !== currentForm.width) {
        this.width = currentForm.width;
        change = true;
      }
      h = currentForm.height / 2;
      w = currentForm.width / 2;
    }
    if (offsetMag !== this.lastOffsetMag) {
      this.lastOffsetMag = offsetMag;
      change = true;
    }
    let positionOffset = new Point(0, 0);
    if (style === 'oval') {
      positionOffset = this.getOvalOffset(
        labelAngle - parentAngle,
        h, w, offsetMag, offsetAngle, change, location,
        startThetaAngle, endThetaAngle,
      );
    }

    let p;
    let r;
    p = position.add(positionOffset);
    r = labelAngle - parentAngle;
    if (relativeToLine === false) {
      p = position.add(positionOffset).rotate(lineAngle, position);
      r = labelAngle - parentAngle + lineAngle;
    }
    this.eqn.setPosition(p);
    this.eqn.transform.updateRotation(r);

    if (DEBUG) {  // $FlowFixMe
      const e = this.eqn.parent._debugEllipse;
      if (e != null) {
        e.setPosition(p);
        e.setRotation(r);
      }
    }
  }

  getOvalOffset(
    labelAngle: number,
    h: number,
    w: number,
    offsetMag: number,
    offsetAngle: number,
    change: boolean,
    location: 'top' | 'bottom' | 'left' | 'right' | 'positive' | 'negative' | 'start' | 'end' | 'inside' | 'outside',
    startThetaAngle: number = Math.PI * 2,
    endThetaAngle: number = Math.PI,
  ) {
    // eslint-disable-next-line max-len
    const getR = (a, b, angle) => a * b / Math.sqrt((b * Math.cos(angle)) ** 2 + (a * Math.sin(angle)) ** 2);

    // Create an oval around the label by:
    // * Find top corner of label
    // * Find distance (R) and angle to top corner
    // * The oval must go through this top corner
    // * Find 'a' and 'b' of the oval so that 'a' and 'b' are the width and
    //   height with the same offset (a = w + o), (b = h + o)
    // * To find 'o', make an oval with o = offsetMag and see how close
    //   its topCorner R is to the reference.
    // * If it doesn't reach the top corner reference, then step o in fifths
    //   of the delta until either 10 steps have occured, or the top corner
    //   is covered.
    if (change) {
      const topCornerAngle = Math.atan(h / w);
      const topCornerR = h / Math.sin(topCornerAngle) + offsetMag;
      const delta = topCornerR - getR(w + offsetMag, h + offsetMag, topCornerAngle);
      let i = 2;
      let testR = -1;
      let ovalOffset = 0;
      while (i < 33 && testR < topCornerR) {
        ovalOffset = delta * i * 0.1 + offsetMag;
        testR = getR(w + ovalOffset, h + ovalOffset, topCornerAngle);
        i += 1;
      }
      this.aOffset = ovalOffset;
    }

    const a = this.aOffset + w;
    const b = this.aOffset + h;

    const phi = clipAngle(labelAngle, '0to360');
    let theta;
    let xOffset = 0;
    let yOffset = 0;
    let R;
    if (location === 'start') {
      theta = startThetaAngle - phi;
      R = getR(a, b, theta);
      xOffset = -R * Math.cos(startThetaAngle);
      yOffset = -R * Math.sin(startThetaAngle);
    } else if (location === 'end') {
      theta = endThetaAngle - phi;
      R = getR(a, b, theta);
      xOffset = -R * Math.cos(endThetaAngle);
      yOffset = -R * Math.sin(endThetaAngle);
    } else {
      // Calculate the position
      // Refer to oval_math.pdf for working
      theta = clipAngle(Math.PI * 2 - Math.atan(-(b ** 2) / (a ** 2 * Math.tan(phi))), '0to360');
      R = getR(a, b, theta);
      let sigma = clipAngle(phi + theta - Math.PI, '-180to180');
      if (sigma < 0) {
        sigma += Math.PI;
      }
      xOffset = R * Math.cos(sigma);
      yOffset = R * Math.sin(sigma);
      if (offsetAngle < 0) {
        yOffset = -yOffset;
        xOffset = -xOffset;
      }
    }

    // DEBUG ONLY
    if (DEBUG) {
      if (this.eqn.parent != null) {  // $FlowFixMe
        if (this.eqn.parent._debugEllipse == null) {
          const e = this.eqn.shapes.ellipse({
            width: 1,
            height: 0.5,
            color: [0, 0, 1, 0.6],
            sides: 50,
          }); // $FlowFixMe
          this.eqn.parent.add('debugEllipse', e);
        } // $FlowFixMe
        const e = this.eqn.parent._debugEllipse;
        if (e != null) {
          e.custom.update({
            width: a * 2,
            height: b * 2,
          });
        }
      }
    }

    if (offsetMag === 0) {
      return new Point(0, 0);
    }
    return new Point(xOffset, yOffset);
  }
}

export type TypeEquationLabel = EquationLabel;
