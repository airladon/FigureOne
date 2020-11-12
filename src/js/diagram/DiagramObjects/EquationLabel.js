// @flow
import {
  Point, clipAngle,
} from '../../tools/g2';
import {
  round,
} from '../../tools/math';
import { Equation } from '../DiagramElements/Equation/Equation';
import type {
  TypeVAlign, TypeHAlign,
} from '../DiagramElements/Equation/EquationForm';
import { joinObjects } from '../../tools/tools';
import type { EQN_Equation } from '../DiagramElements/Equation/Equation';

const DEBUG = true;

export type TypeLabelOptions = {
  label?: string | Equation | Array<string> | EQN_Equation,
  color?: Array<number>,
  scale?: number,
  position?: Point,
  form?: string,
  yAlign?: TypeVAlign,
  xAlign?: TypeHAlign,
};

/**
 * Equation label
 */
export default class EquationLabel {
  eqn: Equation;
  height: number;
  width: number;
  aOffset: number;

  constructor(
    equations: Object,
    options: TypeLabelOptions = {},
  ) {
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
    const { color, scale, position } = optionsToUse;
    // const { form } = optionsToUse;
    const { yAlign, xAlign } = optionsToUse;
    let eqn;
    if (typeof labelTextOrEquation === 'string') {
      eqn = equations.equation({
        elements: { base: labelTextOrEquation },
        color,
        formDefaults: {
          alignment: {
            fixTo: new Point(0, 0),
            xAlign,
            yAlign,
          },
        },
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
      labelTextOrEquation.forEach((labelText, index) => {
        elements[`_${index}`] = labelText;
        forms[index] = [labelText];
      });

      eqn = equations.equation({
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
      eqn = equations.equation(joinObjects(
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

  setText(text: string) {
    const form = this.eqn.getCurrentForm();
    if (form != null) {
      const key = Object.keys(form.elements)[0];
      // This is ok to fix for flow because all the elements of the
      // simple equation created by Equationlabel will be Primitives
      // $FlowFixMe
      const textObject = form.elements[key].drawingObject;
      if (textObject != null) {
        textObject.setText(text);
      }
      // console.log(form)
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
      labelAngle = Math.PI;
      if (offsetAngle < 0) {
        labelAngle = 0;
      }
    }
    if (orientation === 'upright') {
      if (Math.cos(lineAngle) < 0) {
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
    let positionOffset = new Point(0, 0);
    if (style === 'oval') {
      positionOffset = this.getOvalOffset(
        labelAngle - parentAngle,
        h, w, offsetMag, offsetAngle, change, location,
      );
    }

    let p;
    let r;
    p = position.add(positionOffset);
    r = labelAngle - parentAngleOffset;
    if (relativeToLine === false) {
      p = position.add(positionOffset).rotate(-labelAngle, position);
      r = labelAngle - parentAngleOffset + lineAngle;
    }
    if (relativeToLine && orientation === 'baseToLine') {
      r = labelAngle;
      // p = position.add(positionOffset).rotate(parentAngleOffset, position);
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
      theta = Math.PI * 2 - phi;
      R = getR(a, b, theta);
      xOffset = -R;
      yOffset = 0;
    } else if (location === 'end') {
      theta = Math.PI - phi;
      R = getR(a, b, theta);
      xOffset = R;
      yOffset = 0;
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

    return new Point(xOffset, yOffset);
  }
}

export type TypeEquationLabel = EquationLabel;
