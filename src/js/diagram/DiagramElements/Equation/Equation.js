// @flow
import {
  Point, Transform, parsePoint,
} from '../../../tools/g2';
import { joinObjects } from '../../../tools/tools';
// import { RGBToArray } from '../../../tools/color';
import {
  DiagramElementPrimative, DiagramElementCollection,
} from '../../Element';
import {
  DiagramFont,
} from '../../DrawingObjects/TextObject/TextObject';
import { Element, Elements } from './Elements/Element';
import EquationForm from './EquationForm';
import type {
  TypeHAlign, TypeVAlign,
} from './EquationForm';
// import HTMLObject from '../../DrawingObjects/HTMLObject/HTMLObject';
import * as html from '../../../tools/htmlGenerator';
import EquationSymbols from './EquationSymbols';
import { getDiagramElement, EquationFunctions } from './EquationFunctions';
import type { TypeEquationPhrase } from './EquationFunctions';


// Priority:
//   1. symbol
//   2. text
type TypeEquationElement = string | {
    // Text only
    text?: string;
    font?: DiagramFont;
    style?: 'italic' | 'normal' | null;
    // Symbol Only
    symbol?: string;
    numLines?: number;
    side?: 'top' | 'left' | 'bottom' | 'right';
    // Both Text and Symbol
    color?: Array<number>;
    mods?: {};
  } | DiagramElementPrimative | DiagramElementCollection;

export type TypeEquationElements = {
  [elementName: string]: TypeEquationElement;
};

// type TypeFormAlignment = {
//   fixTo?: Point | string,
//   alignH?: TypeHAlign | null,
//   alignV?: TypeVAlign | null,
// };
type TypeFormAlignment = {
  fixTo: DiagramElementPrimative | DiagramElementCollection | Point;
  alignH: TypeHAlign;
  alignV: TypeVAlign;
};

// A form is a steady state arrangement of elements
// A form's elements can have different properties, but these properties
// are generally the same independent on which form was shown before the
// current form.
// The only exception is the translation movement properties, which can be
// different depending on whether you are going to the current form from
// the previous one, or two the next one.
type TypeEquationFormObject = {
  content: TypeEquationPhrase,
  subForm?: string,
  scale?: number,
  alignment?: TypeFormAlignment,
  description?: string,           // For equation navigation
  modifiers?: {},                 // Modifiers for description
  // First Priority
  fromPrev?: {
    duration?: ?number,
    translation?: {
      [elementName: string]: {
        direction?: 'up' | 'down',
        style: 'curved' | 'linear',
        mag: number,
      },
    },
  },
  fromNext?: {
    duration?: ?number,
    translation?: {
      [elementName: string]: {
        direction?: 'up' | 'down',
        style: 'curved' | 'linear',
        mag: number,
      },
    },
  },
  // Last Priority
  duration?: ?number,               // null means to use velocity
  translation?: {
    [elementName: string]: {
      direction?: 'up' | 'down',
      style: 'curved' | 'linear',
      mag: number,
    },
  },
  elementMods?: {
    [elementName: string]: Object
  },
};

type TypeEquationForm = TypeEquationPhrase
                        | TypeEquationFormObject
                        | {
                          [subFormName: string]: TypeEquationFormObject
                                                 | TypeEquationPhrase;
                        };

export type TypeEquationForms = {
  [formName: string]: TypeEquationForm
};

export type TypeEquationOptions = {
  color?: Array<number>;
  fontMath?: DiagramFont;
  fontText?: DiagramFont;
  position?: Point;
  scale?: number,
  defaultFormAlignment?: TypeFormAlignment;
  elements?: TypeEquationElements;
  forms?: TypeEquationForms;
  formSeries?: Array<string> | {};
  //
};

export const foo = () => {};
// An Equation is a collection of elements that can be arranged into different
// forms.
// Equation allows setting of forms, and navigating through form series
// Eqn manages different forms of the
export class EquationNew extends DiagramElementCollection {
  eqn: {
    forms: { [formName: string]: {
        base: EquationForm;                   // There is always a base form
        [subFormName: string]: EquationForm;  // Sub forms may differ in units
        name: string;                         // Name of form
      }
    };
    functions: EquationFunctions;
    symbols: EquationSymbols;
    currentForm: string;
    currentSubForm: string;
    fontMath: DiagramFont;
    fontText: DiagramFont;
    scale: number;

    subFormPriority: Array<string>,

    // formSeries: { [seriesName: String]: Array<EquationForm> };
    formSeries: { [string]: Array<string> };
    currentFormSeries: Array<string>;
    currentFormSeriesName: string;

    //
    defaultFormAlignment: {
      fixTo: DiagramElementPrimative | DiagramElementCollection | Point;
      alignH: TypeHAlign;
      alignV: TypeVAlign;
    };

    isAnimating: boolean;

    descriptionElement: DiagramElementPrimative | null;
    descriptionPosition: Point;
  };

  // isTouchDevice: boolean;
  // animateNextFrame: void => void;
  shapes: Object;

  constructor(
    shapes: Object,
    options: TypeEquationOptions = {},
  ) {
    let { color } = options;
    if (color == null) {
      color = [0.5, 0.5, 0.5, 1];
    }
    const defaultOptions = {
      color,
      fontMath: new DiagramFont(
        'Times New Roman',
        'normal',
        0.2, '200', 'left', 'alphabetic', color,
      ),
      fontText: new DiagramFont(
        'Times New Roman',
        'italic',
        0.2, '200', 'left', 'alphabetic', color,
      ),
      position: new Point(0, 0),
      scale: 0.7,
      defaultFormAlignment: {
        fixTo: new Point(0, 0),
        alignH: 'left',
        alignV: 'baseline',
      },
      elements: {},
      forms: {},
      formSeries: {},
    };

    const optionsToUse = joinObjects({}, defaultOptions, options);
    optionsToUse.position = parsePoint(
      optionsToUse.position, new Point(0, 0),
    );
    optionsToUse.defaultFormAlignment.fixTo = parsePoint(
      optionsToUse.defaultFormAlignment.fixTo,
      optionsToUse.defaultFormAlignment.fixTo,
    );

    super(new Transform('Equation')
      .scale(1, 1)
      .rotate(0)
      .translate(0, 0), shapes.limits);
    this.shapes = shapes;
    this.color = optionsToUse.color;
    // this.isTouchDevice = isTouchDevice;
    // this.animateNextFrame = animateNextFrame;

    // Set default values
    this.eqn = {
      forms: {},
      currentForm: '',
      currentSubForm: '',
      subFormPriority: ['base'],
      formSeries: { base: [] },
      currentFormSeries: [],
      currentFormSeriesName: '',
      scale: optionsToUse.scale,
      defaultFormAlignment: optionsToUse.defaultFormAlignment,
      functions: new EquationFunctions(this.elements),
      symbols: new EquationSymbols(this.shapes, this.color),
      fontMath: optionsToUse.fontMath,
      fontText: optionsToUse.fontText,
      isAnimating: false,
      descriptionElement: null,
      descriptionPosition: new Point(0, 0),
    };

    this.setPosition(optionsToUse.position);

    if (optionsToUse.elements != null) {
      this.addElements(optionsToUse.elements);
    }

    if (optionsToUse.forms != null) {
      this.addForms(optionsToUse.forms);
    }

    if (optionsToUse.formSeries != null) {
      if (Array.isArray(optionsToUse.formSeries)) {
        this.eqn.formSeries = { base: optionsToUse.formSeries };
        this.eqn.currentFormSeries = this.eqn.formSeries.base;
        this.eqn.currentFormSeriesName = 'base';
      } else {
        this.eqn.formSeries = optionsToUse.formSeries;
        this.setFormSeries(Object.keys(this.eqn.formSeries)[0]);
      }
    }
  }

  setFormSeries(name: string) {
    if (this.eqn.formSeries[name] != null) {
      this.eqn.currentFormSeries = this.eqn.formSeries[name];
      this.eqn.currentFormSeriesName = name;
    }
  }

  getFormSeries() {
    return this.eqn.currentFormSeriesName;
  }

  addElements(
    elems: TypeEquationElements,
  ) {
    // Helper function to add text element
    const makeTextElem = (options: { text: string, font?: DiagramFont, style?: 'italic' | 'normal', color?: Array<number> }) => {
      // Priority:
      //  1. color
      //  2. font
      //  3. style
      //  4. fontMath or fontText based on actual text
      let fontToUse: DiagramFont = this.eqn.fontMath;
      if (options.text.match(/[A-Z,a-z]/)) {
        fontToUse = this.eqn.fontText;
      }
      if (options.style != null) {
        if (options.style === 'italic') {
          fontToUse = this.eqn.fontText;
        }
        if (options.style === 'normal') {
          fontToUse = this.eqn.fontMath;
        }
      }
      if (options.font != null) {
        fontToUse = options.font;
      }
      const p = this.shapes.txt(
        options.text,
        { position: new Point(0, 0), font: fontToUse },
      );
      if (options.color != null) {
        p.setColor(options.color);
      } else {
        p.setColor(p.drawingObject.text[0].font.color);
      }
      return p;
    };

    // Helper function to add symbol element
    const makeSymbolElem = (options: { symbol: string, numLines?: number,
    side?: 'top' | 'left' | 'bottom' | 'right', color?: Array<number>}) => {
      let symbol = this.eqn.symbols.get(options.symbol, options);
      // console.log('got', symbol)
      if (symbol == null) {
        symbol = makeTextElem({
          text: `Symbol ${options.symbol} not valid`,
        });
      }
      if (options.color == null) {
        symbol.setColor(this.color);
      }
      return symbol;
    };

    // Go through each element and add it
    Object.keys(elems).forEach((key) => {
      // const [key, elem] = entry;
      const elem = elems[key];
      if (typeof elem === 'string') {
        if (!(key.startsWith('space') && key.startsWith(' '))) {
          this.add(key, makeTextElem({ text: elem }));
        }
      } else if (elem instanceof DiagramElementPrimative) {
        this.add(key, elem);
      } else if (elem instanceof DiagramElementCollection) {
        this.add(key, elem);
      } else {
        let diagramElem;
        if (elem.symbol != null && typeof elem.symbol === 'string') {
          // console.log(elem.symbol)
          // $FlowFixMe
          diagramElem = makeSymbolElem(elem);
        } else if (elem.text != null && elem.text) {
          // $FlowFixMe
          diagramElem = makeTextElem(elem);
        }
        if (diagramElem != null) {
          if (elem.mods != null) {
            diagramElem.setProperties(elem.mods);
          }
          this.add(key, diagramElem);
        }
      }
    });

    const fullLineHeightPrimative = makeTextElem({ text: 'gh' });
    const form = this.createForm({ elem: fullLineHeightPrimative });
    form.content = [this.eqn.functions.contentToElement(fullLineHeightPrimative)];
    form.arrange(
      this.eqn.scale,
      'left',
      'baseline',
      new Point(0, 0),
    );
    this.eqn.functions.fullLineHeight = form;

    this.setFirstTransform(this.transform);
  }

  addDescriptionElement(
    descriptionElement: DiagramElementPrimative | null = null,
    descriptionPosition: Point = new Point(0, 0),
  ) {
    this.eqn.descriptionElement = descriptionElement;
    this.eqn.descriptionPosition = descriptionPosition;
    if (this.eqn.descriptionElement) {
      this.eqn.descriptionElement
        .setPosition(this.getDiagramPosition()
          .add(descriptionPosition));
    }
  }

  setPosition(pointOrX: Point | number, y: number = 0) {
    super.setPosition(pointOrX, y);
    const position = this.getDiagramPosition();
    // console.log(this.eqn, this.eqn.descriptionElement)
    if (this.eqn.descriptionElement != null) {
      this.eqn.descriptionElement.setPosition(position.add(this.eqn.descriptionPosition));
    }
  }

  // scaleForm(name: string, scale: number, subForm: string = 'base') {
  //   // console.log(name, this.form, formType, this.form[name][formType])
  //   if (name in this.eqn.forms) {
  //     if (subForm in this.eqn.forms[name]) {
  //       this.eqn.forms[name][subForm].arrange(
  //         scale,
  //         this.eqn.formAlignment.hAlign,
  //         this.eqn.formAlignment.vAlign,
  //         this.eqn.formAlignment.fixTo,
  //       );
  //     }
  //   }
  // }

  // scale(scale: number) {
  //   Object.keys(this.form).forEach((name) => {
  //     Object.keys(this.form[name]).forEach((formType) => {
  //       if (formType !== 'name') {
  //         this.scaleForm(name, scale, formType);
  //       }
  //     });
  //   });
  // }

  addPhrases(phrases: { [phraseName: string]: TypeEquationPhrase }) {
    Object.keys(phrases).forEach((phraseName) => {
      const phrase = phrases[phraseName];
      this.eqn.functions.phrases[phraseName] = phrase;
    });
  }

  addForms(forms: TypeEquationForms) {
    const isFormString = form => typeof form === 'string';
    const isFormArray = form => Array.isArray(form);
    const isFormMethodDefinition = (form) => {
      if (isFormString(form) || isFormArray(form)) {
        return false;
      }
      if (form != null && typeof form === 'object') {
        // $FlowFixMe
        const keys = Object.keys(form);
        if (keys.length === 1 && keys[0] in this.eqn.functions) {
          return true;
        }
      }
      return false;
    };
    const isFormElements = form => form instanceof Elements;
    const isFormFullObject = (form) => {
      if (isFormString(form) || isFormArray(form)
        || isFormMethodDefinition(form) || isFormElements(form)
      ) {
        return false;
      }
      if (form != null && typeof form === 'object' && form.content != null) {
        return true;
      }
      return false;
    };

    const addFormNormal = (name: string, form: TypeEquationForm) => {
      // $FlowFixMe
      const formContent = [this.eqn.functions.contentToElement(form)];
      this.addForm(name, formContent);
    };
    const addFormFullObject = (name: string, form: TypeEquationForm) => {
      // $FlowFixMe
      const formContent = [this.eqn.functions.contentToElement(form.content)];
      const {
        // $FlowFixMe
        subForm, elementMods, duration, alignment, scale,
        // $FlowFixMe
        description, modifiers, fromPrev, fromNext, translation, // $FlowFixMe
      } = form;
      const options = {
        subForm,
        // addToSeries,
        elementMods,
        duration,
        translation,
        alignment,
        scale,
        description,
        modifiers,
        fromPrev,
        fromNext,
      };
      // $FlowFixMe
      this.addForm(name, formContent, options);
    };

    Object.keys(forms).forEach((name) => {
      const form: TypeEquationForm = forms[name];
      if (isFormString(form) || isFormArray(form)
        || isFormMethodDefinition(form) || isFormElements(form)
      ) {
        addFormNormal(name, form);
      } else if (isFormFullObject(form)) {
        addFormFullObject(name, form);
      } else {
        Object.entries(form).forEach((subFormEntry) => {
          const [subFormName: string, subFormValue] = subFormEntry;
          // const subFormOption = { subForm: subFormName };
          if (isFormString(subFormValue) || isFormArray(subFormValue)
            || isFormMethodDefinition(subFormValue) || isFormElements(subFormValue)
          ) {
            // $FlowFixMe
            addFormFullObject(name, { content: subFormValue, subForm: subFormName });
          } else {
            // $FlowFixMe
            addFormFullObject(name, joinObjects(subFormValue, { subForm: subFormName }));
          }
        });
      }
    });
  }

  checkFixTo(
    fixTo: DiagramElementCollection
          | DiagramElementPrimative
          | string | Point | null,
  ): DiagramElementPrimative | DiagramElementCollection | Point {
    if (typeof fixTo === 'string') {
      const element = getDiagramElement(this, fixTo);
      if (element != null) {
        return element;
      }
      return new Point(0, 0);
    }
    if (fixTo instanceof DiagramElementPrimative
      || fixTo instanceof DiagramElementCollection
      || fixTo instanceof Point
    ) {
      return fixTo;
    }
    return new Point(0, 0);
  }

  createForm(
    elements: { [elementName: string]: DiagramElementPrimative |
                                       DiagramElementCollection }
    = this.elements,
  ) {
    return new EquationForm(
      elements,
      {
        getAllElements: this.getAllElements.bind(this),
        hideAll: this.hideAll.bind(this),
        show: this.show.bind(this),
        showOnly: this.showOnly.bind(this),
        stop: this.stop.bind(this),
        getElementTransforms: this.getElementTransforms.bind(this),
        setElementTransforms: this.setElementTransforms.bind(this),
        animateToTransforms: this.animateToTransforms.bind(this),
      },
    );
  }

  addForm(
    name: string,
    content: Array<Elements | Element>,
    options: {
      subForm?: string,
      scale?: number,
      alignment?: TypeFormAlignment,
      description?: string,
      modifiers?: Object,
      // First Priority
      fromPrev?: {
        duration?: ?number,
        translation?: {
          [elementName: string]: {
            direction?: 'up' | 'down',
            style: 'curved' | 'linear',
            mag: number,
          } | ['curved' | 'linear', 'up' | 'down', number],
        },
      },
      fromNext?: {
        duration?: ?number,
        translation?: {
          [elementName: string]: {
            direction?: 'up' | 'down',
            style: 'curved' | 'linear',
            mag: number,
          } | ['curved' | 'linear', 'up' | 'down', number],
        },
      },
      // Last Priority
      duration?: ?number,               // null means to use velocity
      translation?: {
        [elementName: string]: {
          direction?: 'up' | 'down',
          style: 'curved' | 'linear',
          mag: number,
        } | ['curved' | 'linear', 'up' | 'down', number],
      },
      elementMods?: {
        [elementName: string]: Object
      },
    } = {},
  ) {
    if (!(name in this.eqn.forms)) {
      // $FlowFixMe   - its ok for this to start undefined, it will be filled.
      this.eqn.forms[name] = {};
    }
    const defaultOptions = {
      subForm: 'base',
      elementMods: {},
      // duration: null,                // use velocities instead of time
      description: '',
      modifiers: {},
      scale: this.eqn.scale,
      alignment: this.eqn.defaultFormAlignment,
      translation: {},
    };
    let optionsToUse = defaultOptions;
    if (options) {
      optionsToUse = joinObjects({}, defaultOptions, options);
    }
    const {
      subForm, description, modifiers, duration,
    } = optionsToUse;
    this.eqn.forms[name].name = name;
    const form = this.eqn.forms[name];
    form[subForm] = this.createForm();
    form[subForm].description = description;
    form[subForm].modifiers = modifiers;
    form[subForm].name = name;
    form[subForm].subForm = subForm;
    form[subForm].duration = duration;

    // Populate element mods
    form[subForm].elementMods = {};
    Object.entries(optionsToUse.elementMods).forEach(([elementName, mods]) => {
      const diagramElement = getDiagramElement(this, elementName);
      form[subForm].elementMods[elementName] = { element: diagramElement, mods };
    });

    // Populate translation mods
    form[subForm].translation = {};
    Object.entries(optionsToUse.translation).forEach(([elementName, mods]) => {
      const diagramElement = getDiagramElement(this, elementName);
      let direction;
      let style;
      let mag;
      if (Array.isArray(mods)) {
        [style, direction, mag] = mods;
      } else {
        ({ style, direction, mag } = mods);
      }
      form[subForm].translation[elementName] = {
        element: diagramElement, style, direction, mag,
      };
    });

    // Populate translation mods
    if (optionsToUse.fromPrev != null) {
      form[subForm].fromPrev = {};
      if (optionsToUse.fromPrev.duration !== undefined) {
        form[subForm].fromPrev.duration = optionsToUse.fromPrev.duration;
      }
      form[subForm].fromPrev.translation = {};
      if (optionsToUse.fromPrev.translation != null) {
        Object.entries(optionsToUse.fromPrev.translation).forEach(([elementName, mods]) => {
          const diagramElement = getDiagramElement(this, elementName);
          let direction;
          let style;
          let mag;
          if (Array.isArray(mods)) {
            [style, direction, mag] = mods;
          } else {
            ({ style, direction, mag } = mods);
          }
          form[subForm].fromPrev.translation[elementName] = {
            element: diagramElement, style, direction, mag,
          };
        });
      }
    }

    // Populate translation mods
    if (optionsToUse.fromNext != null) {
      form[subForm].fromNext = {};
      if (optionsToUse.fromNext.duration !== undefined) {
        form[subForm].fromNext.duration = optionsToUse.fromNext.duration;
      }
      form[subForm].fromNext.translation = {};
      if (optionsToUse.fromNext.translation != null) {
        Object.entries(optionsToUse.fromNext.translation).forEach(([elementName, mods]) => {
          const diagramElement = getDiagramElement(this, elementName);
          let direction;
          let style;
          let mag;
          if (Array.isArray(mods)) {
            [style, direction, mag] = mods;
          } else {
            ({ style, direction, mag } = mods);
          }
          form[subForm].fromNext.translation[elementName] = {
            element: diagramElement, style, direction, mag,
          };
        });
      }
    }

    optionsToUse.alignment.fixTo = this.checkFixTo(optionsToUse.alignment.fixTo);
    form[subForm].content = content;
    form[subForm].arrange(
      optionsToUse.scale,
      optionsToUse.alignment.alignH,
      optionsToUse.alignment.alignV,
      optionsToUse.alignment.fixTo,
    );
    // const { addToSeries } = optionsToUse;
    // console.log(addToSeries)
    // if (addToSeries != null && addToSeries !== '' && typeof addToSeries === 'string') {
    //   if (this.eqn.formSeries[addToSeries] == null) {
    //     this.eqn.formSeries[addToSeries] = [];
    //   }
    //   this.eqn.formSeries[addToSeries].push(form);
    // }
    // make the first form added also equal to the base form as always
    // need a base form for some functions
    if (this.eqn.forms[name].base === undefined) {
      const baseOptions = joinObjects({}, optionsToUse);
      baseOptions.subForm = 'base';
      this.addForm(name, content, baseOptions);
    }

    if (this.eqn.currentForm === '') {
      this.eqn.currentForm = name;
    }
    if (this.eqn.currentSubForm === '') {
      this.eqn.currentSubForm = 'base';
    }
  }

  getCurrentForm() {
    if (this.eqn.forms[this.eqn.currentForm] == null) {
      return null;
    }
    if (this.eqn.forms[this.eqn.currentForm][this.eqn.currentSubForm] == null) {
      return null;
    }
    return this.eqn.forms[this.eqn.currentForm][this.eqn.currentSubForm];
  }

  render() {
    const form = this.getCurrentForm();
    if (form != null) {
      form.showHide();
      this.show();
      form.setPositions();
      form.applyElementMods();
      // this.updateDescription();
    }
  }

  setCurrentForm(
    formOrName: EquationForm | string,
    subForm: string = 'base',
  ) {
    if (typeof formOrName === 'string') {
      this.eqn.currentForm = '';
      this.eqn.currentSubForm = '';
      if (formOrName in this.eqn.forms) {
        this.eqn.currentForm = formOrName;
        if (subForm in this.eqn.forms[formOrName]) {
          this.eqn.currentSubForm = subForm;
        }
      }
    } else {
      this.eqn.currentForm = formOrName.name;
      this.eqn.currentSubForm = formOrName.subForm;
    }
  }

  showForm(
    formOrName: EquationForm | string,
    subForm: ?string = null,
  ) {
    this.show();
    let form = formOrName;
    if (typeof formOrName === 'string') {
      form = this.getForm(formOrName, subForm);
    }
    if (form) {
      this.setCurrentForm(form);
      this.render();
    }
  }

  getForm(
    formOrName: string | EquationForm,
    subForm: ?string,
  ): null | EquationForm {
    if (formOrName instanceof EquationForm) {
      return formOrName;
    }
    if (formOrName in this.eqn.forms) {
      let formTypeToUse = subForm;
      if (formTypeToUse == null) {
        const possibleFormTypes     // $FlowFixMe
          = this.eqn.subFormPriority.filter(fType => fType in this.eqn.forms[formOrName]);
        if (possibleFormTypes.length) {
          // eslint-disable-next-line prefer-destructuring
          formTypeToUse = possibleFormTypes[0];
        }
      }
      if (formTypeToUse != null) {
        return this.eqn.forms[formOrName][formTypeToUse];
      }
    }
    return null;
  }

  // This animates to a form
  goToForm(optionsIn: {
    name?: string,
    index?: number,
    duration?: ?number,
    prioritizeFormDuration?: boolean,
    delay?: number,
    fromWhere?: ?'fromPrev' | 'fromNext',
    animate?: 'move' | 'dissolve',
    callback?: ?() => void,
    // finishAnimatingAndCancelGoTo?: boolean,
    ifAnimating?: {
      cancelGoTo?: boolean;
      skipToTarget?: boolean;
    },
    // goToIfAnimating?: 'cancel' | 'continue',
    // ifAnimating: 'goToNow' | 'goToFromAnimationTarget' | 'canc'
    // toAnimationEndOnCancel?: boolean,
    dissolveOutTime?: number,
    dissolveInTime?: number,
    blankTime?: number,
  } = {}) {
    const defaultOptions = {
      duration: null,
      prioritizeFormDuration: true,
      delay: 0,
      fromWhere: null,
      animate: 'dissolve',
      callback: null,
      // finishAnimatingAndCancelGoTo: false,
      ifAnimating: {
        skipToTarget: true,
        cancelGoTo: true,
      },
    };
    const options = joinObjects(defaultOptions, optionsIn);

    if (this.eqn.isAnimating) {
      if (options.ifAnimating.skipToTarget) {
        this.stop(true, true);
        const currentForm = this.getCurrentForm();
        if (currentForm != null) {
          this.showForm(currentForm);
        }
      } else {
        this.stop(true, false);
      }
      this.eqn.isAnimating = false;
      if (options.ifAnimating.cancelGoTo) {
        return;
      }
    }
    // this.stop(true, true);
    // this.eqn.isAnimating = false;

    // Get the desired form - preference is name, then series index,
    // then next form in the current series
    let form: {
      base: EquationForm;                   // There is always a base form
      [subFormName: string]: EquationForm;  // Sub forms may differ in units
      name: string;                         // Name of form
    };
    if (options.name != null) {
      form = this.eqn.forms[options.name];
    } else if (options.index != null) {
      form = this.eqn.forms[this.eqn.currentFormSeries[options.index]];
    } else if (this.eqn.currentFormSeries.length > 0) {
      let index = 0;
      const currentForm = this.getCurrentForm();
      if (currentForm != null) {
        index = this.eqn.currentFormSeries.indexOf(currentForm.name);
        if (index < 0) {
          index = 0;
        }
      }
      let formIndex = index + 1;
      if (formIndex === this.eqn.currentFormSeries.length) {
        formIndex = 0;
      }
      form = this.eqn.forms[this.eqn.currentFormSeries[formIndex]];
    }

    if (form == null) {
      return;
    }

    // const nextForm = this.eqn.forms[this.eqn.currentFormSeries[formIndex]];
    let subForm = null;
    let subFormToUse = null;
    const possibleSubForms
          = this.eqn.subFormPriority.filter(sf => sf in form);
    if (possibleSubForms.length) {
      // eslint-disable-next-line prefer-destructuring
      subFormToUse = possibleSubForms[0];
    }
    if (subFormToUse != null) {
      // $FlowFixMe
      subForm = form[subFormToUse];
      let { duration } = options;
      if (options.prioritizeFormDuration) {
        if (options.fromWhere === 'fromPrev' && subForm.fromPrev != null && subForm.fromPrev.duration !== undefined) {
          ({ duration } = subForm.fromPrev);
        } else if (options.fromWhere === 'fromNext' && subForm.fromNext != null && subForm.fromNext.duration !== undefined) {
          ({ duration } = subForm.fromNext);
        } else if (subForm.duration !== undefined) {
          ({ duration } = subForm);
        }
      }

      if (duration != null && duration > 0 && options.animate === 'dissolve') {
        if (options.dissolveOutTime == null) {
          options.dissolveOutTime = duration * 0.4;
        }
        if (options.dissolveInTime == null) {
          options.dissolveInTime = duration * 0.4;
        }
        if (options.blankTime == null) {
          options.blankTime = duration * 0.2;
        }
      } else {
        if (options.dissolveOutTime == null) {
          options.dissolveOutTime = 0.4;
        }
        if (options.dissolveInTime == null) {
          options.dissolveInTime = 0.4;
        }
        if (options.blankTime == null) {
          options.blankTime = 0.2;
        }
      }

      if (duration === 0) {
        this.showForm(subForm);
        if (options.callback != null) {
          options.callback();
        }
      } else {
        this.eqn.isAnimating = true;
        const end = () => {
          this.eqn.isAnimating = false;
          if (options.callback != null) {
            options.callback();
          }
        };
        if (options.animate === 'move') {
          // console.log('move', duration, options, subForm.duration)
          // console.log('******************* animate')
          subForm.animatePositionsTo(
            options.delay,
            options.dissolveOutTime,
            duration,
            options.dissolveInTime,
            end,
            options.fromWhere,
          );
        } else {
          // console.log('******************* hideshow')
          subForm.allHideShow(
            options.delay,
            options.dissolveOutTime,
            options.blankTime,
            options.dissolveInTime,
            end,
          );
        }
        this.setCurrentForm(subForm);
      }
      // this.updateDescription();
    }
  }

  getFormIndex(formToGet: EquationForm | string) {
    const form = this.getForm(formToGet);
    let index = -1;
    if (form != null) {
      index = this.eqn.currentFormSeries.indexOf(form.name);
    }
    return index;
  }

  prevForm(time: number | null = null, delay: number = 0) {
    const currentForm = this.getCurrentForm();
    if (currentForm == null) {
      return;
    }
    let index = this.getFormIndex(currentForm);
    if (index > -1) {
      index -= 1;
      if (index < 0) {
        index = this.eqn.currentFormSeries.length - 1;
      }
      this.goToForm({
        index, duration: time, delay, fromWhere: 'fromNext',
      });
    }
  }

  nextForm(time: number | null = null, delay: number = 0) {
    let animate = 'move';

    const currentForm = this.getCurrentForm();
    if (currentForm == null) {
      return;
    }
    let index = this.getFormIndex(currentForm);
    if (index > -1) {
      index += 1;
      if (index > this.eqn.currentFormSeries.length - 1) {
        index = 0;
        animate = 'dissolve';
      }

      this.goToForm({
        index,
        duration: time,
        delay,
        fromWhere: 'fromPrev',
        animate,
      });
    }
  }

  replayCurrentForm(time: number) {
    if (this.eqn.isAnimating) {
      this.stop(true, true);
      this.stop(true, true);
      // this.animations.cancel('complete');
      // this.animations.cancel('complete');
      this.eqn.isAnimating = false;
      const currentForm = this.getCurrentForm();
      if (currentForm != null) {
        this.showForm(currentForm);
      }
      return;
    }
    // this.animations.cancel();
    // this.animations.cancel();
    this.stop();
    this.stop();
    this.eqn.isAnimating = false;
    this.prevForm(0);
    this.nextForm(time, 0.5);
  }

  animateToForm(
    name: string,
    time: number | null = null,
    delay: number = 0,
    callback: null | () => void = null,
  ) {
    // this.stopAnimatingColor(true, true);
    // this.stopAnimatingColor(true, true);
    this.stop();
    this.stop();
    // this.animations.cancel();
    // this.animations.cancel();
    const form = this.getForm(name);
    if (form != null) {
      form.animatePositionsTo(delay, 0.4, time, 0.4, callback);
    }
    this.setCurrentForm(name);
  }


  changeDescription(
    formOrName: EquationForm | string,
    description: string = '',
    modifiers: Object = {},
    subForm: string = 'base',
  ) {
    const form = this.getForm(formOrName, subForm);
    if (form != null) {
      form.description = `${description}`;
      form.modifiers = modifiers;
    }
  }

  getDescription(
    formOrName: EquationForm | string,
    subForm: string = 'base',
  ) {
    const form = this.getForm(formOrName, subForm);
    if (form != null && form.description != null) {
      return html.applyModifiers(form.description, form.modifiers);
    }
    return '';
  }

  // updateDescription(
  //   formOrName: EquationForm | string | null = null,
  //   subForm: string = 'base',
  // ) {
  //   const element = this.eqn.descriptionElement;
  //   if (element == null) {
  //     return;
  //   }
  //   if (element.isShown === false) {
  //     return;
  //   }
  //   let form = null;
  //   if (formOrName == null) {
  //     form = this.getCurrentForm();
  //   } else if (typeof formOrName === 'string') {
  //     form = this.getForm(formOrName, subForm);
  //   } else {
  //     form = formOrName;
  //   }
  //   if (form == null) {
  //     return;
  //   }
  //   if (form.description == null) {
  //     return;
  //   }

  //   const { drawingObject } = element;
  //   if (drawingObject instanceof HTMLObject) {
  //     drawingObject.change(
  //       html.applyModifiers(form.description, form.modifiers),
  //       element.lastDrawTransform.m(),
  //     );
  //     html.setOnClicks(form.modifiers);
  //   }
  // }
}
