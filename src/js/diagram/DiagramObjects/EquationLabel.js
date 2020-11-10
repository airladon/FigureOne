// @flow
// import Diagram from '../Diagram';

import {
  Point, polarToRect, clipAngle, minAngleDiff,
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
// export type TypeEquationLabel = {
//   eqn: Equation;
//   updateRotation: (number, Point, number, number) => void;
//   setText: (string) => {};
//   getText: void => string;
//   // updateScale: (Point) => void;
// };

// deprecate
// export type TypeLabelEquationOptions = {
//   eqn: 'fraction' | 'fractionPre',
//   denominator: string,
//   numerator: string,
//   main?: string,
//   scale?: number,
//   fracScale?: number,
// };

function getRadiusOfRoundedRect(
  halfWidth: number,
  halfHeight: number,
  cornerR: number,
  angle: number,
) {
  const angleRadiusStart = Math.atan2(halfHeight - cornerR, halfWidth);
  const angleRadiusEnd = Math.atan2(halfHeight, halfWidth - cornerR);
  let normalizedAngle = angle;
  if (angle > Math.PI / 2 && angle < Math.PI) {
    normalizedAngle = Math.PI - angle;
  } else if (angle > Math.PI && angle < 3 * Math.PI / 2) {
    normalizedAngle = angle - Math.PI;
  } else if (angle > 3 * Math.PI / 2 && angle < 2 * Math.PI) {
    normalizedAngle = Math.PI * 2 - angle;
  }
  if (normalizedAngle <= angleRadiusStart) {
    return halfWidth * Math.tan(normalizedAngle);
  }
  if (normalizedAngle >= angleRadiusEnd) {
    return halfHeight * Math.tan(Math.PI / 2 - normalizedAngle);
  }
}
export type TypeLabelOptions = {
  label?: string | Equation | Array<string> | EQN_Equation,
  color?: Array<number>,
  scale?: number,
  position?: Point,
  form?: string,
  formType?: string,
  yAlign?: TypeVAlign,
  xAlign?: TypeHAlign,
};

export default class EquationLabel {
  eqn: Equation;
  updateRotation: (number, Point, ?number, ?number) => void;
  setText: (string) => void;
  getText: void => string;
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
      form: '0',
      formType: 'base',
      xAlign: 'center',
      yAlign: 'middle',
    };
    const optionsToUse = joinObjects({}, defaultOptions, options);
    const labelTextOrEquation = optionsToUse.label;
    const { color, scale, position } = optionsToUse;
    const { form, formType } = optionsToUse;
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
      eqn.setCurrentForm('base');
    } else if (labelTextOrEquation instanceof Equation) {
      eqn = labelTextOrEquation;
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
      eqn.setCurrentForm(form, formType);
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
        form,
        formType,
      };
      eqn = equations.equation(joinObjects(
        defaultEqnOptions, labelTextOrEquation,
      ));
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

  updateRotation(
    labelAngle: number,
    position: Point,
    offsetMag: number = 0,
    offsetAngle: number = 0,
    oval: boolean = true,
  ) {
    if (offsetMag !== 0) {
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
        h = currentForm.height / 2 + offsetMag;
        w = currentForm.width / 2 + offsetMag;
      }
      let r = 0; 
      if (oval) {
        // eslint-disable-next-line max-len
        const getR = (a, b, angle = labelAngle - offsetAngle) => a * b / Math.sqrt((b * Math.cos(angle)) ** 2 + (a * Math.sin(angle)) ** 2);
        if (change) {
          let i = 2;
          r = -1;
          const topCornerAngle = Math.atan(h / w);
          const topCornerR = h / Math.sin(topCornerAngle) + offsetMag;
          const delta = topCornerR - getR(w + offsetMag, h + offsetMag, topCornerAngle);
          let ovalOffset = 0;
          while (i < 13 && r < topCornerR) {
            ovalOffset = delta * i * 0.2;
            r = getR(w + ovalOffset, h + ovalOffset, topCornerAngle);
            i += 1;
          }
          this.aOffset = ovalOffset;
        }

        const a = this.aOffset + w;
        const b = this.aOffset + h;

        const phi = clipAngle(labelAngle, '0to360');
        const theta = clipAngle(Math.PI * 2 - Math.atan(-(b ** 2) / (a ** 2 * Math.tan(phi))), '0to360');
        const R = getR(a, b, theta);
        let sigma = clipAngle(phi + theta - Math.PI, '-180to180');
        if (sigma < 0) {
          sigma = sigma + Math.PI;
        }
        let xOffset = R * Math.cos(sigma);
        let yOffset = R * Math.sin(sigma);
        if (offsetAngle < 0) {
          yOffset = -yOffset;
          xOffset = -xOffset;
        }
        this.eqn.setPosition(position.add(xOffset, yOffset));
        console.log(
          round(phi * 180 / Math.PI, 0),
          round(theta * 180 / Math.PI, 0),
          round(sigma * 180 / Math.PI, 0),
          round(offsetAngle * 180 / Math.PI, 0)
        )
        // const labelAngleNorm = clipAngle(labelAngle, '0to360');
        // let m = labelAngleNorm;
        // if (labelAngleNorm > Math.PI / 2 && labelAngleNorm <= Math.PI) {
        //   m = Math.PI - labelAngle;
        // } else if (labelAngleNorm > Math.PI && labelAngleNorm < 3 * Math.PI / 2) {
        //   m = labelAngleNorm - Math.PI;
        // } else if (labelAngleNorm >= 3 * Math.PI / 2) {
        //   m = 2 * Math.PI - labelAngleNorm;
        // }
        // const t = Math.abs(Math.atan(-b / (a * Math.tan(m))));
        // const g = Math.PI / 2 - m;
        // const k = g - t;
        // const or = getR(a, b, t);
        // let op = or * Math.cos(k);
        // if (offsetAngle < 0) {
        //   op = -op;
        // }
        // let pr = or * Math.sin(k);
        // if (labelAngle < Math.PI / 2) {
        //   pr = -pr;
        // } else if (labelAngleNorm > 3 * Math.PI / 2) {
        //   pr = -pr;
        // }
        // console.log(
        //   round(labelAngle * 180 / Math.PI, 0),
        //   round(offsetAngle * 180 / Math.PI, 0),
        //   round(m * 180 / Math.PI, 0),
        //   round(t * 180 / Math.PI, 0),
        //   round(g * 180 / Math.PI, 0),
        //   round(k * 180 / Math.PI, 0),
        //   round(or, 2),
        //   round(op, 2),
        //   round(pr, 2),
        // )
        // this.eqn.setPosition(position.add(pr, op));

        if (this.eqn.parent != null && this.eqn.parent.parent != null && this.eqn.parent.parent._ell != null) {
          // console.log(this.eqn.parent.parent)
          const e = this.eqn.parent.parent._ell;
            e.custom.update({
              width: a * 2,
              height: b * 2,
            });
        }
      } else {
        r = getRadiusOfRoundedRect(labelWidth, labelHeight, 0, labelAngle);
        this.eqn.setPosition(position.add(polarToRect(r, offsetAngle)));
      }
    } else {
      this.eqn.setPosition(position);
    }
    this.eqn.transform.updateRotation(labelAngle);
    if (this.eqn.parent != null && this.eqn.parent.parent != null && this.eqn.parent.parent._ell != null) {
      const e = this.eqn.parent.parent._ell;
      e.setPosition(this.eqn.getPosition('diagram'));
    }
  }

  // const label = {
  //   eqn,
  //   updateRotation,
  //   setText,
  //   getText,
  //   // updateScale,
  // };

  // return label;
}

export type TypeEquationLabel = EquationLabel;
