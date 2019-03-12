// @flow
import {
  Point, Transform, parsePoint,
} from '../../../tools/g2';
import { joinObjects } from '../../../tools/tools';
import { RGBToArray } from '../../../tools/color';
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
    elementOptions?: {};
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

type TypeEquationFormObject = {
  content: TypeEquationPhrase,
  elementMods?: {
    [elementName: string]: {
      color?: Array<number>,
      direction: 'fromPrev' | 'fromNext' | 'fromAny' | null,
      elementOptions?: {},
    }
  },
  subForm?: string,
  scale?: number,
  alignment?: TypeFormAlignment,
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
  formSeries?: Array<string>;
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
    //
    // formSeries: { [seriesName: String]: Array<EquationForm> };
    formSeries: Array<string>;
    currentFormSeries: string;

    //
    defaultFormAlignment: {
      fixTo: DiagramElementPrimative | DiagramElementCollection | Point;
      alignH: TypeHAlign;
      alignV: TypeVAlign;
    };

    isAnimating: boolean;

    descriptionElement: DiagramElementPrimative | null;
    descriptionPosition: Point;

    // getCurrentFormSeries: () => ?Array<EquationForm>;
    // getCurrentForm: () => ?EquationForm;
    //
    // showForm: (EquationForm | string, ?string) => {};
    //
  };

  // isTouchDevice: boolean;
  // animateNextFrame: void => void;
  shapes: Object;

  constructor(
    shapes: Object,
    // equations: Object,
    // equation: Object,
    // isTouchDevice: boolean,
    // animateNextFrame: void => void,
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
      formSeries: [],
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
      formSeries: [],
      currentFormSeries: '',
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
      this.setFormSeries(optionsToUse.formSeries);
    }
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
      // if (options.color == null) {
      //   p.setColor(this.color);
      // }
      if (options.color != null) {
        p.setColor(options.color);
      } else {
        p.setColor(RGBToArray(p.drawingObject.text[0].font.color));
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
        if (!key.startsWith('space')) {
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
          if (elem.elementOptions != null) {
            diagramElem.setProperties(elem.elementOptions);
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
        subForm, addToSeries, elementMods, time, alignment, scale,
        // $FlowFixMe
        description, modifiers,             // $FlowFixMe
      } = form;
      const options = {
        subForm,
        addToSeries,
        elementMods,
        time,
        alignment,
        scale,
        description,
        modifiers,
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
      elementMods?: Object,
      time?: number | null | { fromPrev?: number, fromNext?: number },
      scale?: number,
      alignment?: TypeFormAlignment,
      description?: string,
      modifiers?: Object,
    } = {},
  ) {
    if (!(name in this.eqn.forms)) {
      // $FlowFixMe   - its ok for this to start undefined, it will be filled.
      this.eqn.forms[name] = {};
    }
    const defaultOptions = {
      subForm: 'base',
      elementMods: {},
      time: null,                // use velocities instead of time
      description: '',
      modifiers: {},
      scale: this.eqn.scale,
      alignment: this.eqn.defaultFormAlignment,
    };
    let optionsToUse = defaultOptions;
    if (options) {
      optionsToUse = joinObjects({}, defaultOptions, options);
    }
    const {
      subForm, description, modifiers,
      time, elementMods,
    } = optionsToUse;
    this.eqn.forms[name].name = name;
    const form = this.eqn.forms[name];
    form[subForm] = this.createForm();
    // form[subForm].name = subForm;
    form[subForm].description = description;
    form[subForm].modifiers = modifiers;
    form[subForm].name = name;
    form[subForm].subForm = subForm;
    form[subForm].elementMods = {};
    if (typeof time === 'number') {
      form[subForm].time = {
        fromPrev: time, fromNext: time, fromAny: time,
      };
    } else if (time == null) {
      form[subForm].time = null;
    } else {
      const defaultTime = { fromPrev: null, fromNext: null, fromAny: null };
      form[subForm].time = joinObjects(defaultTime, time);
    }
    Object.keys(elementMods).forEach((elementName) => {
      const diagramElement = getDiagramElement(this, elementName);
      if (diagramElement) {
        let color;
        let elementOptions;
        if (Array.isArray(elementMods[elementName])) {
          [color, elementOptions] = elementMods[elementName];
        } else {
          ({
            color, elementOptions,
          } = elementMods[elementName]);
        }
        form[subForm].elementMods[elementName] = {
          element: diagramElement,
          color,
          elementOptions,
        };
      }
    });

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

  setFormSeries(series: Array<string>) {
    this.eqn.formSeries = series.slice();
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

  goToForm(
    name: ?string | number = null,
    time: number | null = null,
    delay: number = 0,
    fromWhere: 'fromPrev' | 'fromNext' | 'fromAny' | null = 'fromAny',
    animate: boolean = true,
    callback: null | () => void = null,
  ) {
    if (this.eqn.isAnimating) {
      // this.stop(true, true);
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
    // this.stop();
    this.stop();
    this.eqn.isAnimating = false;

    // By default go to the next form in a series
    let nextIndex = 0;
    if (name == null) {
      let index = 0;
      const currentForm = this.getCurrentForm();
      if (currentForm != null) {
        index = this.eqn.formSeries.indexOf(currentForm.name);
        if (index < 0) {
          index = 0;
        }
      }
      nextIndex = index + 1;
      if (nextIndex === this.eqn.formSeries.length) {
        nextIndex = 0;
      }
    } else if (typeof name === 'number') {
      nextIndex = name;
    } else {
      nextIndex = this.eqn.formSeries.indexOf(name);
      if (nextIndex < 0) {
        nextIndex = 0;
      }
    }

    const nextForm = this.eqn.forms[this.eqn.formSeries[nextIndex]];
    let nextSubForm = null;
    let subFormToUse = null;
    const possibleSubForms
          = this.eqn.subFormPriority.filter(sf => sf in nextForm);
    if (possibleSubForms.length) {
      // eslint-disable-next-line prefer-destructuring
      subFormToUse = possibleSubForms[0];
    }

    if (subFormToUse != null) {
      // $FlowFixMe
      nextSubForm = nextForm[subFormToUse];
      if (time === 0) {
        this.showForm(nextSubForm);
        if (callback != null) {
          callback();
        }
      } else {
        this.eqn.isAnimating = true;
        const end = () => {
          this.eqn.isAnimating = false;
          if (callback != null) {
            callback();
          }
        };
        if (animate) {
          let timeToUse = time;
          // $FlowFixMe - this is going to be ok
          if (nextSubForm.time != null && nextSubForm.time[fromWhere] != null) {
            timeToUse = nextSubForm.time[fromWhere];
          }
          // console.log('******************* animate')
          nextSubForm.animatePositionsTo(delay, 0.4, timeToUse, 0.4, end);
        } else {
          // console.log('******************* hideshow')
          nextSubForm.allHideShow(delay, 0.5, 0.2, 0.5, end);
        }
        this.setCurrentForm(nextSubForm);
      }
      // this.updateDescription();
    }
  }

  getFormIndex(formToGet: EquationForm | string) {
    const form = this.getForm(formToGet);
    let index = -1;
    if (form != null) {
      index = this.eqn.formSeries.indexOf(form.name);
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
        index = this.eqn.formSeries.length - 1;
      }
      this.goToForm(index, time, delay, 'fromNext');
    }
  }

  nextForm(time: number | null = null, delay: number = 0) {
    let animate = true;
    const currentForm = this.getCurrentForm();
    if (currentForm == null) {
      return;
    }
    let index = this.getFormIndex(currentForm);
    if (index > -1) {
      index += 1;
      if (index > this.eqn.formSeries.length - 1) {
        index = 0;
        animate = false;
      }
      this.goToForm(index, time, delay, 'fromPrev', animate);
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
