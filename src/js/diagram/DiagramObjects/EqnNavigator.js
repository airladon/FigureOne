// @flow
import {
  Transform, Point, parsePoint,
} from '../../tools/g2';
import {
  DiagramElementCollection, DiagramElementPrimative,
} from '../Element';
import EquationForm from '../DiagramElements/Equation/EquationForm';
import * as html from '../../tools/htmlGenerator';
import { generateUniqueId, joinObjects } from '../../tools/tools';
import { EquationNew } from '../DiagramElements/Equation/Equation';

// eslint-disable-next-line no-use-before-define
// export type TypeEquationNavigator = EquationNavigator;

function updateDescription(
  eqn: EquationNew,
  subForm: string,
  descriptionElement: ?HTMLElement,
  index: number,
  setClicks: boolean = false,
  prefix: string = '',
) {
  const element = descriptionElement;
  if (element == null) {
    return;
  }
  let form = null;
  // $FlowFixMe
  // form = eqn.eqn.formSeries[index][formType];
  form = eqn.getForm(eqn.eqn.currentFormSeries[index], subForm);
  if (form == null) {
    return;
  }
  if (form.description == null) {
    return;
  }

  const monochrome = !setClicks;
  if (descriptionElement) {
    if (setClicks) {
      // eslint-disable-next-line no-param-reassign
      descriptionElement.innerHTML = html
        .applyModifiers(`${prefix}${form.description}`, form.modifiers);
      html.setOnClicks(form.modifiers);
    } else {
      // eslint-disable-next-line no-param-reassign
      descriptionElement.innerHTML = html
        .applyModifiers(`${prefix}${form.description}`, form.modifiers, '', monochrome);
    }
  }
}

function enableTouch(element: ?HTMLElement) {
  if (element) {
    element.classList.remove('lesson__eqn_nav__not_touchable');
  }
}

function disableTouch(element: ?HTMLElement) {
  if (element) {
    element.classList.add('lesson__eqn_nav__not_touchable');
  }
}

function updateButtons(
  // eslint-disable-next-line no-use-before-define
  nav: EqnNavigator,
  includeNextPrevPrefix: boolean = false,
) {
  let nextPrefix = '';
  let prevPrefix = '';
  if (includeNextPrevPrefix) {
    nextPrefix = 'NEXT: ';
    prevPrefix = 'PREV: ';
  }
  const currentForm = nav.eqn.getCurrentForm();
  if (currentForm != null) {
    const index = nav.eqn.getFormIndex(currentForm);
    if (index === 0) {
      disableTouch(nav.refresh);
      disableTouch(nav.prev);
      disableTouch(nav.prevDescription);
      disableTouch(nav.description);
      // enableTouch(nav.nextDescription, true);
    } else {
      enableTouch(nav.refresh);
      enableTouch(nav.prev);
      enableTouch(nav.prevDescription);
      enableTouch(nav.description);
    }
    if (nav.eqn.eqn.currentFormSeries.length > 1) {
      enableTouch(nav.next);
      enableTouch(nav.nextDescription);
    } else {
      disableTouch(nav.next);
      disableTouch(nav.nextDescription);
    }
    const nextIndex = index + 1;
    if (nextIndex > nav.eqn.eqn.currentFormSeries.length - 1) {
      if (nav.nextDescription) {
        // eslint-disable-next-line no-param-reassign
        nav.nextDescription.innerHTML = 'RESTART from begining';
      }
    } else {
      updateDescription(
        nav.eqn, currentForm.subForm, nav.nextDescription,
        nextIndex, false, nextPrefix,
      );
    }
    updateDescription(nav.eqn, currentForm.subForm, nav.description, index, true);
    // nav.eqn.updateDescription(currentForm);
    const prevIndex = index - 1;
    if (prevIndex >= 0) {
      updateDescription(
        nav.eqn, currentForm.subForm, nav.prevDescription,
        prevIndex, false, prevPrefix,
      );
    } else if (nav.prevDescription) {
      // eslint-disable-next-line no-param-reassign
      nav.prevDescription.innerHTML = '';
    }
  }
}

// eslint-disable-next-line no-use-before-define
function updateButtonsDescriptionOnly(nav: EqnNavigator) {
  const currentForm = nav.eqn.getCurrentForm();
  if (currentForm != null) {
    const index = nav.eqn.getFormIndex(currentForm);
    enableTouch(nav.description);
    updateDescription(nav.eqn, currentForm.subForm, nav.description, index, true);
  }
}

export type TypeNavTypeOptions = {
  forceTwoLines: boolean;
  arrows: boolean;
};

// Nav3Line
function makeType3Line(
  prevMethod: () => void,
  refreshMethod: () => void,
  nextMethod: () => void,
  options: TypeNavTypeOptions,
) {
  const table = document.createElement('table');
  const prevGroup = document.createElement('tr');
  const currentGroup = document.createElement('tr');
  const nextGroup = document.createElement('tr');
  const prev = document.createElement('td');
  const refresh = document.createElement('td');
  const next = document.createElement('td');
  const prevDescription = document.createElement('td');
  const description = document.createElement('td');
  const nextDescription = document.createElement('td');
  prevGroup.appendChild(prev);
  prevGroup.appendChild(prevDescription);
  nextGroup.appendChild(next);
  nextGroup.appendChild(nextDescription);
  currentGroup.appendChild(refresh);
  currentGroup.appendChild(description);
  table.appendChild(prevGroup);
  table.appendChild(currentGroup);
  table.appendChild(nextGroup);

  table.classList.add('lesson__eqn_nav__table');
  prevGroup.classList.add('lesson__eqn_nav__3line__prevRow');
  currentGroup.classList.add('lesson__eqn_nav__3line__currentRow');
  nextGroup.classList.add('lesson__eqn_nav__3line__nextRow');
  prev.classList.add('lesson__eqn_nav__3line__prevRow__button');
  refresh.classList.add('lesson__eqn_nav__3line__currentRow__button');
  next.classList.add('lesson__eqn_nav__3line__nextRow__button');
  prevDescription.classList.add('lesson__eqn_nav__3line__prevRow__description');
  description.classList.add('lesson__eqn_nav__3line__currentRow__description');
  description.classList.add('lesson__eqn_nav__description');
  nextDescription.classList.add('lesson__eqn_nav__3line__nextRow__description');

  const defaultOptions = {
    forceTwoLines: false,
    arrows: false,
  };
  const optionsToUse = joinObjects({}, defaultOptions, options);
  // if (!Array.isArray(options)) {
  //   optionsToUse = [options];
  // }
  // Use two lines to stop jittering when transitioning from one line to two
  // lines
  if (optionsToUse.forceTwoLines) {
    prevGroup.classList.add('lesson__eqn_nav__3line__prev_twoLines');
    currentGroup.classList.add('lesson__eqn_nav__3line__current_twoLines');
    nextGroup.classList.add('lesson__eqn_nav__3line__next_twoLines');
  }

  prevGroup.onclick = prevMethod;
  currentGroup.onclick = refreshMethod;
  nextGroup.onclick = nextMethod;

  next.innerHTML = 'Next';
  prev.innerHTML = 'Prev';
  refresh.innerHTML = 'Refresh';
  return {
    table,
    prevGroup,
    currentGroup,
    nextGroup,
    prev,
    refresh,
    next,
    prevDescription,
    description,
    nextDescription,
  };
}

// NavDescriptionOnly
function makeTypeDescriptionOnly(
  nextMethod: () => void,
) {
  const table = document.createElement('table');
  const currentGroup = document.createElement('tr');
  const description = document.createElement('td');
  currentGroup.appendChild(description);
  table.appendChild(currentGroup);
  table.classList.add('lesson__eqn_nav__table');
  currentGroup.classList.add('lesson__eqn_nav__description_only__currentRow');
  description.classList.add('lesson__eqn_nav__description_only__currentRow__description');
  description.classList.add('lesson__eqn_nav__description');
  currentGroup.onclick = nextMethod;
  return {
    table,
    currentGroup,
    description,
  };
}

// Nav1Line
function makeType1Line(
  prevMethod: () => void,
  refreshMethod: () => void,
  nextMethod: () => void,
  options: TypeNavTypeOptions,  // can be: 'twoLines'
) {
  const table = document.createElement('table');
  const currentGroup = document.createElement('tr');
  const prev = document.createElement('td');
  const next = document.createElement('td');
  const description = document.createElement('td');
  currentGroup.appendChild(prev);
  currentGroup.appendChild(description);
  currentGroup.appendChild(next);
  table.appendChild(currentGroup);

  table.classList.add('lesson__eqn_nav__table');
  currentGroup.classList.add('lesson__eqn_nav__1line__currentRow');
  prev.classList.add('lesson__eqn_nav__1line__prev__button');
  next.classList.add('lesson__eqn_nav__1line__next__button');
  description.classList.add('lesson__eqn_nav__1line__currentRow__description');
  description.classList.add('lesson__eqn_nav__description');

  const defaultOptions = {
    forceTwoLines: false,
    arrows: false,
  };
  const optionsToUse = joinObjects({}, defaultOptions, options);

  // Use two lines to stop jittering when transitioning from one line to two
  // lines
  if (optionsToUse.forceTwoLines) {
    currentGroup.classList.add('lesson__eqn_nav__1line__current_twoLines');
  }

  prev.onclick = prevMethod;
  description.onclick = refreshMethod;
  next.onclick = nextMethod;

  if (optionsToUse.arrows) {
    const nextArrow = document.createElement('div');
    nextArrow.classList.add('lesson__eqn_nav__arrow_right');
    next.appendChild(nextArrow);

    const prevArrow = document.createElement('div');
    prevArrow.classList.add('lesson__eqn_nav__arrow_left');
    prev.appendChild(prevArrow);
  } else {
    next.innerHTML = 'Next';
    prev.innerHTML = 'Prev';
  }

  return {
    table,
    currentGroup,
    prev,
    next,
    description,
  };
}

// Nav2Line
function makeType2Line(
  prevMethod: () => void,
  refreshMethod: () => void,
  nextMethod: () => void,
  options: TypeNavTypeOptions,
) {
  const table = document.createElement('table');
  const row = document.createElement('tr');
  const descriptionRows = document.createElement('tr');
  const currentGroup = document.createElement('tr');
  const prev = document.createElement('td');
  const next = document.createElement('td');
  const nextGroup = document.createElement('tr');
  // const descriptionRows = document.createElement('td');
  // const descriptionRow = document.createElement('tr');
  // const nextDescriptionRow = document.createElement('tr');
  const description = document.createElement('td');
  const nextDescription = document.createElement('td');
  currentGroup.appendChild(description);
  nextGroup.appendChild(nextDescription);
  descriptionRows.appendChild(currentGroup);
  descriptionRows.appendChild(nextGroup);

  row.appendChild(prev);
  row.appendChild(descriptionRows);
  row.appendChild(next);
  table.appendChild(row);

  table.classList.add('lesson__eqn_nav__table');
  currentGroup.classList.add('lesson__eqn_nav__2lines__currentRow');
  nextGroup.classList.add('lesson__eqn_nav__2lines__nextRow');
  prev.classList.add('lesson__eqn_nav__2lines__prev__button');
  next.classList.add('lesson__eqn_nav__2lines__next__button');
  description.classList.add('lesson__eqn_nav__2lines__currentRow__description');
  description.classList.add('lesson__eqn_nav__description');
  nextDescription.classList.add('lesson__eqn_nav__2lines__nextRow__description');

  const defaultOptions = {
    forceTwoLines: false,
    arrows: false,
  };
  const optionsToUse = joinObjects({}, defaultOptions, options);
  // Use two lines to stop jittering when transitioning from one line to two
  // lines
  if (optionsToUse.forceTwoLines > -1) {
    currentGroup.classList.add('lesson__eqn_nav__2lines__current_twoLines');
  }

  prev.onclick = prevMethod;
  description.onclick = refreshMethod;
  next.onclick = nextMethod;
  nextDescription.onclick = nextMethod;

  if (optionsToUse.arrows) {
    const nextArrow = document.createElement('div');
    nextArrow.classList.add('lesson__eqn_nav__arrow_right');
    next.appendChild(nextArrow);

    const prevArrow = document.createElement('div');
    prevArrow.classList.add('lesson__eqn_nav__arrow_left');
    prev.appendChild(prevArrow);
  } else {
    next.innerHTML = 'Next';
    prev.innerHTML = 'Prev';
  }

  return {
    table,
    currentGroup,
    nextGroup,
    prev,
    next,
    nextDescription,
    description,
  };
}

export type TypeNavigatorOptions = {
  equation?: EquationNew,
  offset?: Point,
  navType?: 'equationOnly' | 'description' | '1Line' | '2Line' | '3Line',
  navTypeOptions?: TypeNavTypeOptions,
  alignH?: 'left' | 'right' | 'center',
  alignV?: 'top' | 'bottom' | 'middle' | 'baseline',
  id?: string,
};

export default class EqnNavigator extends DiagramElementCollection {
  shapes: Object;
  // setEquation: (Equation) => void;
  next: ?HTMLElement;
  prev: ?HTMLElement;
  refresh: ?HTMLElement;
  nextDescription: ?HTMLElement;
  prevDescription: ?HTMLElement;
  description: ?HTMLElement;
  prevGroup: ?HTMLElement;
  nextGroup: ?HTMLElement;
  table: ?HTMLElement;
  _table: DiagramElementPrimative;
  currentGroup: ?HTMLElement;
  updateButtons: () => void;
  eqn: EquationNew;
  animateNextFrame: void => void;
  navType: 'equationOnly' | 'description' | '1Line' | '2Line' | '3Line';

  constructor(
    shapes: Object,
    // eqn: EquationNew,
    animateNextFrame: () => void,
    options: TypeNavigatorOptions = {},
  ) {
    super(new Transform('Eqn Nav')
      .scale(1, 1)
      .translate(0, 0), shapes.limits);
    // super(shapes, eqnOptions);
    this.shapes = shapes;
    // this.setEquation(equation);
    this.prev = null;
    this.next = null;
    this.refresh = null;
    this.description = null;
    this.nextDescription = null;
    this.prevDescription = null;
    this.table = null;
    this.prevGroup = null;
    this.currentGroup = null;
    this.nextGroup = null;
    this.animateNextFrame = animateNextFrame;

    const defaultOptions = {
      offset: new Point(0, 0),
      navType: 'twoLine',
      navTypeOptions: {
        forceTwoLines: false,
        arrows: false,
      },
      alignH: 'center',
      alignV: 'middle',
      id: generateUniqueId('id_lesson__equation_navigator_'),
    };
    const optionsToUse = joinObjects({}, defaultOptions, options);
    if (optionsToUse.equation != null) {
      // this.eqn = optionsToUse.equation;
      // this.eqn.onClick = this.clickNext.bind(this);
      // this.eqn.hasTouchableElements = true;
      // this.eqn.isTouchable = true;
      // this.eqn.touchInBoundingRect = true;
      this.connectToEquation(optionsToUse.equation);
    }

    this.navType = optionsToUse.navType;

    let navigatorHTMLElement = null;
    if (this.navType === '3Line') {
      navigatorHTMLElement = makeType3Line(
        this.clickPrev.bind(this),
        this.clickRefresh.bind(this),
        this.clickNext.bind(this),
        optionsToUse.navTypeOptions,
      );
    }
    if (this.navType === 'description') {
      navigatorHTMLElement = makeTypeDescriptionOnly(this.clickNext.bind(this));
    }
    if (this.navType === '1Line') {
      navigatorHTMLElement = makeType1Line(
        this.clickPrev.bind(this),
        this.clickRefresh.bind(this),
        this.clickNext.bind(this),
        optionsToUse.navTypeOptions,
      );
    }
    if (this.navType === '2Line') {
      navigatorHTMLElement = makeType2Line(
        this.clickPrev.bind(this),
        this.clickRefresh.bind(this),
        this.clickNext.bind(this),
        optionsToUse.navTypeOptions,
      );
    }

    // const eqnCollectionPosition = this.eqn.getPosition();
    if (navigatorHTMLElement != null) {
      const offsetToUse = parsePoint(optionsToUse.offset, new Point(0, 0));
      Object.assign(this, navigatorHTMLElement);
      const table = this.shapes.htmlElement(
        navigatorHTMLElement.table,
        `${optionsToUse.id}_table`,
        '',
        offsetToUse, optionsToUse.alignV, optionsToUse.alignH,
      );
      this.add('table', table);
    }
  }

  connectToEquation(eqn: EquationNew) {
    this.eqn = eqn;
    this.eqn.onClick = this.clickNext.bind(this);
    this.eqn.hasTouchableElements = true;
    this.eqn.isTouchable = true;
    this.eqn.touchInBoundingRect = true;
    // this.setTransformCallback = () => {
    //   const p = this.getPosition();
    //   this.eqn.setPosition(p);
    // }
  }

  // const navigator = shapes.collection(;
  // setEquation(eqn: Equation) {
  //   this.eqn = eqn;
  //   // this._eqn = [];
  //   this.add('eqn', eqn.collection);
  // }

  // setWidth(width) {

  // }

  clickNext() {
    this.eqn.nextForm(1.5);
    this.updateButtons();
    this.animateNextFrame();
  }

  clickPrev() {
    this.eqn.prevForm(1.5);
    this.updateButtons();
    this.animateNextFrame();
  }

  clickRefresh() {
    const currentForm = this.eqn.getCurrentForm();
    if (currentForm != null) {
      const index = this.eqn.getFormIndex(currentForm);
      if (index > 0) {
        this.eqn.replayCurrentForm(1.5);
        this.animateNextFrame();
      }
    }
    this.updateButtons();
  }

  updateButtons() {
    if (this.navType === 'equationOnly') {
      return;
    }
    if (this.navType === 'description') {
      updateButtonsDescriptionOnly(this);
    } else if (this.navType === '2Line') {
      updateButtons(this, true);
    } else {
      updateButtons(this);
    }
  }

  showForm(formOrName: EquationForm | string, formType: ?string = null) {
    this.show();
    this.eqn.showForm(formOrName, formType);
    // this.showForm(formOrName, formType);
    if (this._table) {
      this._table.show();
      this.updateButtons();
    }
  }
}
