// @flow
import { colorArrayToRGBA } from './color';

function convertTextArrayToParagraphs(text: string | Array<string>) {
  let textToUse = '';
  if (Array.isArray(text)) {
    textToUse = `<p>${text.join('</p><p>')}</p>`;
  } else {
    textToUse = text;
  }
  return textToUse;
}

function centerV(text: string | Array<string> = '') {
  const textToUse = convertTextArrayToParagraphs(text);
  return `<div style="display: table; height: 100%;">
        <div style="display: table-cell; vertical-align: middle">
        ${textToUse}</div></div>`;
}

function centerVH(text: string = '') {
  const textToUse = convertTextArrayToParagraphs(text);
  return `<div style="display: table; height: 100%; text-align:center; width:100%">
        <div style="display: table-cell; vertical-align: middle">
        ${textToUse}</div></div>`;
}

function centerH(text: string = '') {
  const textToUse = convertTextArrayToParagraphs(text);
  return `<div style="text-align:center;">
        ${textToUse}</div>`;
}

function itemSelector(
  items: Array<string> = [''],
  classes: string = '',
  selectorIndex: number = 0,
) {
  let outStr = `<ul id="id__lesson_item_selector_${selectorIndex}" 
                    class=${classes}>`;
  items.forEach((item, index) => {
    outStr += `<li id="id__lesson_item_selector_${index}">${item}</li>`;
  });
  outStr += '</ul>';
  return outStr;
}

const unit = (deg: string, rad: string) => `<span class="lesson__unit_deg">${deg}</span><span class="lesson__unit_rad">${rad}</span>
  `;


function toHTML(
  text: string = '',
  id: string = '',
  classes: string = '',
  color: Array<number> | null = null,
) {
  let idStr = '';
  if (id) {
    idStr = ` id="${id}"`;
  }
  let classStr = '';
  if (classes) {
    classStr = ` class="${classes}"`;
  }
  let colorStr = '';
  if (color) {
    colorStr = ` style="color:${colorArrayToRGBA(color)};"`;
  }
  return {
    replacementText: `<span${idStr}${classStr}"${colorStr}>${text.replace(RegExp(/_/, 'gi'), ' ').trim()}</span>`,
  };
}

function highlight(classesOrColor: string | Array<number> = '') {
  let classStr = 'highlight_word';
  if (typeof classesOrColor === 'string') {
    classStr = `${classesOrColor} ${classStr}`;
  }
  let color = null;
  if (Array.isArray(classesOrColor)) {
    color = classesOrColor;
  }
  return {
    replacementText: (text: string) => toHTML(text, '', classStr, color),
  };
}

function highlightWord(text: string, classesOrColor: string | Array<number> = '') {
  let classStr = 'highlight_word';
  if (typeof classesOrColor === 'string') {
    classStr = `${classesOrColor} ${classStr}`;
  }
  let color = null;
  if (Array.isArray(classesOrColor)) {
    color = classesOrColor;
  }
  return {
    replacementText: toHTML(text, '', classStr, color).replacementText,
  };
}

function addClass(classes: string = '') {
  return {
    replacementText: (text: string) => toHTML(text, '', classes),
    // id: '',
  };
}

function addId(id: string = '') {
  return {
    replacementText: (text: string) => toHTML(text, id),
    // id: '',
  };
}

function clickWord(
  textToUse: string,
  id: string,
  actionMethod: Function,
  bind: Array<mixed>,
  classesOrColor: string | Array<number> | null = null,
  interactive: boolean = true,
) {
  let classStr = 'action_word';
  if (interactive) {
    classStr = `${classStr} interactive_word`;
  }
  if (typeof classesOrColor === 'string') {
    classStr = `${classesOrColor} ${classStr}`;
  }
  let color = null;
  if (Array.isArray(classesOrColor)) {
    color = classesOrColor;
  }
  const idToUse = () => id;
  // const id = `lesson__id_${textToUse}`;
  return {
    replacementText: () => toHTML(textToUse, idToUse(), classStr, color),
    id: idToUse,
    actionMethod,
    bind,
  };
}


function click(
  actionMethod: Function,
  bind: Array<mixed>,
  classesOrColor: string | Array<number> | null = null,
  interactive: boolean = true,
  id: string = '',
) {
  let classStr = 'action_word';
  if (interactive) {
    classStr = `${classStr} interactive_word`;
  }
  if (typeof classesOrColor === 'string') {
    classStr = `${classesOrColor} ${classStr}`;
  }
  let color = null;
  if (Array.isArray(classesOrColor)) {
    color = classesOrColor;
  }
  const idToUse = (text: string) => `lesson__id_${text}${id}`;
  return {
    replacementText: (text: string) => toHTML(text, idToUse(text), classStr, color),
    id: idToUse,
    actionMethod,
    bind,
  };
}

function actionWord(
  text: string,
  id: string = '',
  classesOrColor: string | Array<number> | null = null,
  interactive: boolean = true,
) {
  let classStr = 'action_word';
  if (interactive) {
    classStr = `${classStr} interactive_word`;
  }
  if (typeof classesOrColor === 'string') {
    classStr = `${classesOrColor} ${classStr}`;
  }
  let color = null;
  if (Array.isArray(classesOrColor)) {
    color = classesOrColor;
  }
  return {
    replacementText: toHTML(text, id, classStr, color).replacementText,
    id,
  };
}

function modifyText(
  text: string,
  key: string,
  mod: Object,
): string {
  let outText = '';
  const expression = new RegExp(`\\|${key}\\|`, 'gi');
  let replacement = '';
  if (typeof mod.replacementText === 'string') {
    replacement = mod.replacementText;
  } else {
    replacement = mod.replacementText(key).replacementText;
    // console.log(replacement)
  }
  outText = text.replace(expression, replacement);
  return outText;
}

function onClickId(
  id: string,
  actionMethod: Function,
  bind: Array<mixed>,
  additionalClassesToAdd: string = '',
) {
  const element = document.getElementById(id);
  if (element) {
    element.classList.add('action_word_enabled');
    additionalClassesToAdd.split(' ').forEach((classString) => {
      if (classString) {
        element.classList.add(classString);
      }
    });
    if (bind.length === 1) {
      element.onclick = actionMethod.bind(bind[0]);
    }
    if (bind.length === 2) {
      element.onclick = actionMethod.bind(bind[0], bind[1]);
    }
    if (bind.length === 3) {
      element.onclick = actionMethod.bind(bind[0], bind[1], bind[2]);
    }
    if (bind.length === 4) {
      element.onclick = actionMethod.bind(bind[0], bind[1], bind[2], bind[3]);
    }
    if (bind.length === 5) {
      element.onclick = actionMethod.bind(bind[0], bind[1], bind[2], bind[3], bind[4]);
    }
    if (bind.length === 6) {
      element.onclick = actionMethod.bind(bind[0], bind[1], bind[2], bind[3], bind[4], bind[5]);
    }
    if (bind.length === 7) {
      element.onclick = actionMethod.bind(
        bind[0], bind[1], bind[2], bind[3], bind[4],
        bind[5], bind[6],
      );
    }
    if (bind.length === 8) {
      element.onclick = actionMethod.bind(
        bind[0], bind[1], bind[2], bind[3], bind[4],
        bind[5], bind[6], bind[7],
      );
    }
    if (bind.length === 9) {
      element.onclick = actionMethod.bind(
        bind[0], bind[1], bind[2], bind[3], bind[4],
        bind[5], bind[6], bind[7], bind[8],
      );
    }
  }
}

function applyModifiers(
  text: string,
  modifiers: Object,
  highlightClass: string = 'highlight_word',
  monochrome: boolean = false,
) {
  let outText = text;
  Object.keys(modifiers).forEach((key) => {
    const mod = modifiers[key];
    outText = modifyText(outText, key, mod);
  });
  const r = RegExp(/\|([^|]*)\|/, 'gi');
  outText = outText.replace(r, `<span class="${highlightClass}">$1</span>`);
  if (monochrome) {
    const c = RegExp(/style="color:rgba\([^)]*\);"/, 'gi');
    outText = outText.replace(c, '');
    const h = RegExp(/highlight_word/, 'gi');
    outText = outText.replace(h, '');
    const i = RegExp(/interactive_word/, 'gi');
    outText = outText.replace(i, '');
    const id = RegExp(/id="[^"]*"/, 'gi');
    outText = outText.replace(id, '');
  }
  return outText;
}

function setOnClicks(modifiers: Object, additionalClassesToAdd: string = '') {
  Object.keys(modifiers).forEach((key) => {
    const mod = modifiers[key];
    if ('actionMethod' in mod) {
      onClickId(mod.id(key), mod.actionMethod, mod.bind, additionalClassesToAdd);
    }
  });
}

function setHTML(
  element: HTMLElement,
  text: string,
  modifiers: Object = {},
  classesToAdd: string = '',
) {
  const modifiedText = applyModifiers(text, modifiers);
  // eslint-disable-next-line no-param-reassign
  element.innerHTML = modifiedText;
  setOnClicks(modifiers, classesToAdd);
}

export {
  actionWord, click, highlight, addClass, addId,
  onClickId, highlightWord, centerV, centerH, centerVH, toHTML,
  clickWord, itemSelector, unit, applyModifiers,
  setOnClicks, setHTML,
};
