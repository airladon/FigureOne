// enterStateCommon
// enterState
// showCommon
// show
// transition
// showForm
// steadyStateCommon
// steadyState
// leaveStateCommon
// leaveState

// export type OBJ_NavigatorSlide = {
//   text?: OBJ_TextLines,
//   modifiersCommon?: OBJ_TextModifiersDefinigion;
//   modifiers?: OBJ_TextModifiersDefinition;
//   enterStateCommon?: () => void,
//   enterState?: () => void,
//   showCommon?: Array<string | FigureElement>,
//   show?: Array<string | FigureElement>,
//   transition?: (() => void) => void;
//   steadyStateCommon?: () => void;
//   steadyState?: () => void;
//   leaveStateCommon?: () => void;
//   leaveState?: () => void;
// }

// export type OBJ_Navigator = {
//   collection: Figure | FigureElementCollection,
//   slides: Array<OBJ_NavigatorSlide>,
//   prevButton?: FigureElement | string,
//   nextButton?: FigureElement | string,
//   text?: string | FigureElementCollection,
//   equation?: Equation | string | Array<string | Equation>,
//   equationDefaults: {
//     duration?: number,
//     animate?: 'move' | 'dissolve' | 'instant',
//   },
//   lastSlideCallback?: () => void,
//   firstSlideCallback?: () => void,
// }

function SlideNavigator() {
  let currentSlideIndex = 0;
  let slides;
  let prevButton;
  let nextButton;
  let textElement;
  let inTransition = false;
  let equations;
  let equationDefaults;
  let collection;

  const loadSlides = (o) => {
    if (o.collection instanceof Fig.Figure) {
      collection = o.collection.elements;
    } else {
      ({ collection } = o);
    }
    ({ slides } = o);
    if (typeof o.text === 'string') {
      textElement = collection.getElement(o.text);
    } else if (o.text != null) {
      textElement = o.text;
    } else {
      textElement = null;
    }
    equations = [];
    if (Array.isArray(o.equation)) {
      o.equation.forEach((e) => {
        equations.push(collection.getElement(e));
      });
    } else if (o.equation != null) {
      equations = [o.equation];
    }
    equationDefaults = Fig.tools.misc.joinObjects({}, {
      duration: 1,
      animate: 'move',
    }, o.equationDefaults || {});
    prevButton = collection.getElement(o.prevButton);
    nextButton = collection.getElement(o.nextButton);
  };


  const getProperty = (property, indexIn, defaultValue = null) => {
    let index = indexIn;
    let prop = slides[index][property];
    while (prop === undefined && index > 0) {
      index -= 1;
      prop = slides[index][property];
    }
    if (prop === undefined) {
      return defaultValue;
    }
    return prop;
  };

  const getText = i => getProperty('text', i, '');
  const getForm = (i) => {
    const forms = getProperty('form', i, null);
    if (forms == null) {
      return [];
    }
    if (!Array.isArray(forms)) {
      return [forms];
    }
    return forms;
  };

  const showForms = (forms, hideOnly = false) => {
    for (let i = 0; i < equations.length; i += 1) {
      const e = equations[i];
      if (forms.length > i && forms[i] != null) {
        if (!hideOnly) {
          e.showForm(forms[i]);
        }
      } else {
        e.hide();
      }
    }
  };

  const setSteadyState = (from) => {
    const index = currentSlideIndex;
    const slide = slides[index];
    const form = getForm(index);
    showForms(form);
    getProperty('steadyStateCommon', index, () => {})(from);
    if (slide.steadyState != null) {
      slide.steadyState(from);
    }
    if (prevButton != null) {
      if (currentSlideIndex === 0) {
        prevButton.setOpacity(0.7);
        prevButton.isTouchable = false;
      } else if (prevButton.isTouchable === false) {
        prevButton.setOpacity(1);
        prevButton.isTouchable = true;
      }
    }
    if (nextButton != null) {
      if (currentSlideIndex === slides.length - 1) {
        nextButton.setLabel('Restart');
      } else {
        nextButton.setLabel('Next');
      }
    }
  };

  const transition = (from) => {
    let done = () => {
      setSteadyState(from);
      inTransition = false;
    };
    if (from !== 'prev') {
      return done();
    }
    inTransition = true;
    const slide = slides[currentSlideIndex];
    if (typeof slide.transition === 'function') {
      return slide.transition(done, from);
    }

    const forms = getForm(currentSlideIndex);
    for (let i = 0; i < equations.length; i += 1) {
      const e = equations[i];
      if (forms.length > i && forms[i] != null) {
        const form = forms[i];
        const currentForm = e.getCurrentForm().name;
        if (!e.isShown) {
          e.animations.new()
            .inParallel([
              e.animations.dissolveIn({ duration: 0.2 }),
              e.animations.trigger({
                callback: () => {
                  e.showForm(form);
                },
              }),
            ])
            .whenFinished(done)
            .start();
          done = null;
        } else if (form !== currentForm) {
          const { animate, duration } = equationDefaults;
          e.animations.new()
            .goToForm({ target: form, animate, duration })
            .whenFinished(done)
            .start();
          done = null;
        }
      }
    }
    if (done != null) {
      return done();
    }
    return null;
  };

  const setText = (index = false) => {
    if (textElement == null) {
      return;
    }
    const mods = getProperty('modifiers', index, {});
    const commonMods = getProperty('modifiersCommon', index, {});
    textElement.custom.updateText({
      text: getText(index),
      modifiers: Fig.tools.misc.joinObjects({}, commonMods, mods),
    });
  };

  // from: 'next' | 'prev' | number | null
  const goToSlide = (index, fromIn = null) => {
    let from = fromIn;
    if (from == null) {
      from = currentSlideIndex;
      if (index === currentSlideIndex + 1) {
        from = 'prev';
      } else if (index === currentSlideIndex - 1) {
        from = 'next';
      }
    }

    // Leave States
    getProperty('leaveStateCommon', currentSlideIndex, () => {})();
    if (slides[currentSlideIndex].leaveState != null) {
      slides[currentSlideIndex].leaveState(index);
    }

    // Reset and Set Text
    collection.stop('complete');
    setText(index);
    // enterState(index, from);

    // Enter new slide
    currentSlideIndex = index;
    const slide = slides[index];
    const forms = getForm(index);
    showForms(forms, true);
    getProperty('enterStateCommon', index, () => {})(from);
    if (slide.enterState != null) {
      slide.enterState(from);
    }

    // Move to transition
    transition(from);
  };

  const nextSlide = () => {
    if (inTransition) {
      collection.stop('complete');
      inTransition = false;
      return;
    }
    if (textElement == null) {
      return;
    }
    const oldText = getText(currentSlideIndex);
    const nextSlideIndex = (currentSlideIndex + 1) % slides.length;
    goToSlide(nextSlideIndex, true);
    const newText = getText(nextSlideIndex);
    if (newText !== oldText) {
      textElement.animations.new()
        .dissolveIn(0.2)
        .start();
    }
  };

  const prevSlide = () => {
    collection.stop('cancel');
    const prevSlideIndex = (currentSlideIndex - 1) < 0 ? slides.length - 1 : currentSlideIndex - 1;
    goToSlide(prevSlideIndex, false);
  };

  return {
    prevSlide,
    nextSlide,
    loadSlides,
    goToSlide,
  };
}

// const nav = navigator();
