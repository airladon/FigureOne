function SlideNavigator() {
  let currentSlideIndex = 0;
  let slides;
  let prev;
  let next;
  let fig;
  let description;
  let inTransition = false;
  let modifiers = {};
  let eqn;

  const loadSlides = (slidesIn, prevButton, nextButton, f, descript, globalModifiers, equation) => {
    slides = slidesIn;
    prev = prevButton;
    next = nextButton;
    fig = f;
    description = descript;
    modifiers = globalModifiers;
    eqn = equation;
  };


  const getProperty = (property, indexIn) => {
    let index = indexIn;
    let prop = slides[index][property];
    while (prop === undefined && index > 0) {
      index -= 1;
      prop = slides[index][property];
    }
    return prop;
  };

  const getText = (indexIn) => {
    const text = getProperty('text', indexIn);
    if (text == null) {
      return '';
    }
    return text;
  };

  const getModifiers = (indexIn) => {
    const mods = getProperty('modifiers', indexIn);
    if (mods == null) {
      return {};
    }
    return mods;
  };

  const getForm = (indexIn) => {
    const form = getProperty('form', indexIn);
    return form;
  };

  const setSteadyState = (index) => {
    const slide = slides[index];
    let form = getForm(index);
    if (form != null) {
      if (Array.isArray(form)) {
        form = form.slice(-1)[0];
      }
      eqn.showForm(form);
    } else {
      eqn.hide();
    }
    const steadyStateCommon = getProperty('steadyStateCommon', index);
    if (steadyStateCommon != null) {
      steadyStateCommon();
    }
    if (slide.steadyState != null) {
      slide.steadyState();
    }
    inTransition = false;
    if (currentSlideIndex === 0) {
      prev.setOpacity(0.7);
      prev.isTouchable = false;
    } else if (prev.isTouchable === false) {
      prev.setOpacity(1);
      prev.isTouchable = true;
    }
    if (currentSlideIndex === slides.length - 1) {
      next.setLabel('Restart');
    } else {
      next.setLabel('Next');
    }
  };

  const transition = (index) => {
    const slide = slides[index];
    inTransition = true;
    const done = () => setSteadyState(index);
    if (typeof slide.transition === 'function') {
      slide.transition(done);
      return;
    }

    let form = getForm(index);
    const currentForm = eqn.getCurrentForm().name;
    if (
      form == null
      || (
        typeof form === 'string'
        && currentForm === form
      )) {
      done();
      return;
    }
    if (!eqn.isShown) {
      eqn.animations.new()
        .inParallel([
          eqn.animations.dissolveIn({ duration: 0.2, done }),
          eqn.animations.trigger({
            callback: () => {
              eqn.showForm(form);
            },
          }),
        ])
        .whenFinished(done)
        .start();
      return;
    }
    if (!Array.isArray(form)) {
      form = [form];
    }
    for (let i = 0; i < form.length; i += 1) {
      eqn.animations.addTo('_navigatorTransition')
        .goToForm({ target: form[i], animate: 'move', duration: 1 });
    }
    eqn.animations.addTo('_navigatorTransition')
      .whenFinished(done)
      .start();
    // eqn.goToForm({
    //   form, duration: 1, animate: 'move', callback: done,
    // });
  };

  const enterState = (index, fromPrev = false) => {
    currentSlideIndex = index;
    const slide = slides[index];
    const form = getForm(index);
    if (form === null) {
      eqn.hide();
    }
    const enterStateCommon = getProperty('enterStateCommon', index);
    if (enterStateCommon != null) {
      enterStateCommon();
    }
    if (slide.enterState != null) {
      slide.enterState();
    }
    if (fromPrev && (slide.transition || form)) {
      transition(index);
    } else {
      setSteadyState(index);
    }
  };

  const setText = (index, fromPrev = false) => {
    fig.stop('complete');
    description.stop();
    const m = getModifiers(index);
    description.custom.updateText({
      text: getText(index),
      modifiers: Fig.tools.misc.joinObjects({}, modifiers, m),
    });
    enterState(index, fromPrev);
  };

  const leaveState = (index, fromPrev = false) => {
    const slide = slides[currentSlideIndex];
    slide.leaveState();
    setText(index, fromPrev);
  };

  const goToSlide = (index, fromPrev = false) => {
    const leaveStateCommon = getProperty('leaveStateCommon', currentSlideIndex);
    if (leaveStateCommon != null) {
      leaveStateCommon();
    }
    if (slides[currentSlideIndex].leaveState != null) {
      leaveState(index, fromPrev);
    } else {
      setText(index, fromPrev);
    }
  };

  const nextSlide = () => {
    if (inTransition) {
      fig.stop('complete');
      inTransition = false;
      return;
    }
    const oldDescription = getText(currentSlideIndex);
    const nextSlideIndex = (currentSlideIndex + 1) % slides.length;
    goToSlide(nextSlideIndex, true);
    const newDescription = getText(nextSlideIndex);
    if (newDescription != oldDescription) {
      description.animations.new()
        .dissolveIn(0.2)
        .start();
    }
  };

  const prevSlide = () => {
    fig.stop('cancel');
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
