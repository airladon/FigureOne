// @flow
import { colorArrayToRGBA } from './color';
import { generateUniqueId, joinObjects } from './tools';
import Recorder from '../diagram/Recorder';

function convertTextArrayToParagraphs(
  text: string | Array<string>,
  firstParagraphMargin: number | null = null,
) {
  let textToUse = '';
  let firstPStyle = '';
  if (firstParagraphMargin != null) {
    firstPStyle = ` style="margin-top:${firstParagraphMargin}%"`;
  }
  if (Array.isArray(text)) {
    text.forEach((t, index) => {
      if (t.startsWith('<')) {
        textToUse += t;
      } else if (index === 0) {
        textToUse += `<p style="margin-top:${firstPStyle}">${t}</p>`;
      } else {
        textToUse += `<p>${t}</p>`;
      }
    });
    // textToUse = `<p${style}>${text.join('</p><p>')}</p>`;
  } else {
    textToUse = text;
  }
  return textToUse;
}

function withClass(text: string | Array<string> = '', classText: string) {
  const textToUse = convertTextArrayToParagraphs(text);
  return `<div class="${classText}">${textToUse}</div>`;
}

function centerV(text: string | Array<string> = '') {
  const textToUse = convertTextArrayToParagraphs(text, 0);
  return `<div style="display: table; height: 100%; width: 100%;">
        <div style="display: table-cell; vertical-align: middle; height: 100%; width: 100%;">
        ${textToUse}</div></div>`;
}

function centerVH(text: string | Array<string> = '') {
  const textToUse = convertTextArrayToParagraphs(text, 0);
  return `<div style="display: table; height: 100%; text-align:center; width:100%;">
        <div style="display: table-cell; vertical-align: middle; height: 100%; width: 100%;">
        ${textToUse}</div></div>`;
}

function centerH(text: string | Array<string> = '') {
  const textToUse = convertTextArrayToParagraphs(text);
  return `<div style="text-align:center;">
        ${textToUse}</div>`;
}

function style(
  options: number | {
    left?: number,
    top?: number,
    line?: number,
    right?: number,
    size?: number,
    className?: string,
    color?: Array<number>,
    centerV?: boolean,
    centerH?: boolean,
    list?: ?'ordered' | 'unordered',
    listStyleType?: string,  // css styes
  } = 0,
  text: string | Array<string> = '',
) {
  let marginLeft = '';
  let marginRight = '';
  let marginTop = '';
  let marginLine = '';
  let size = '';
  let className = '';
  let color = '';
  let listStyleType = '';
  if (typeof options === 'number') {
    marginTop = `margin-top:${options}%`;
  } else {
    if (options.left != null) {
      marginLeft = `margin-left:${options.left}%;`;
    }
    if (options.right != null) {
      marginRight = `margin-right:${options.right}%;`;
    }
    if (options.centerV) {
      marginTop = 'margin-top:0;';
    }
    if (options.top != null) {
      marginTop = `margin-top:${options.top}%;`;
    }
    if (options.line != null) {
      marginLine = `margin-top:${options.line}%;`;
    }
    if (options.size != null) {
      size = `font-size:${options.size}em;`;
    }
    if (options.className) {
      className = `class="${options.className}"`;
    }
    if (options.color) {
      color = `color:${colorArrayToRGBA(options.color)};`;
    }
    if (options.listStyleType) {
      listStyleType = `list-style-type:${options.listStyleType};`;
    }
  }

  const p = `<p style="${marginLeft}${marginRight}${marginLine}${size}${color}"${className}>`;
  const pFirst = `<p style="${marginLeft}${marginRight}${marginTop}${size}${color}"${className}>`;

  const li = `<li style="${marginLeft}${marginRight}${marginLine}${size}${color}${listStyleType}"${className}>`;
  const ul = `<ul style="${marginLeft}${marginRight}${marginTop}${size}${color}"${className}>`;
  const ol = `<ol style="${marginLeft}${marginRight}${marginTop}${size}${color}"${className}>`;

  let textToUse;
  if (options.list != null) {
    if (Array.isArray(text)) {
      textToUse = text.join(`</li>${li}`);
    } else {
      textToUse = text;
    }
    if (options.list === 'unordered') {
      textToUse = `${ul}${li}${textToUse}</ul>`;
    } else {
      textToUse = `${ol}${li}${textToUse}</ol>`;
    }
  } else {
    if (Array.isArray(text)) {
      textToUse = text.join(`</p>${p}`);
    } else {
      textToUse = text;
    }
    textToUse = `${pFirst}${textToUse}</p>`;
  }
  if (options.centerH) {
    textToUse = centerH(textToUse);
  }
  if (options.centerV) {
    textToUse = centerV(textToUse);
  }
  return textToUse;
}

function itemSelector(
  items: Array<string> = [''],
  classes: string = '',
  selectorIndex: number = 0,
) {
  let outStr = `<ul id="id__figureone_item_selector_${selectorIndex}" 
                    class=${classes}>`;
  items.forEach((item, index) => {
    outStr += `<li id="id__figureone_item_selector_${index}">${item}</li>`;
  });
  outStr += '</ul>';
  return outStr;
}

const unit = (deg: string, rad: string) => `<span class="figureone__unit_deg">${deg}</span><span class="figureone__unit_rad">${rad}</span>
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

function link(
  linkStr: string,
  colorOrOptions: Array<number> | {
    color?: ?Array<number>,
    id?: string,
    classes?: string,
    text?: ?string,
    newTab?: ?boolean,
  } | null = null,
) {
  let classStr = 'action_word interactive_word';
  let colorToUse = null;
  const defaultOptions = {
    color: null,
    id: `figureone__id_${generateUniqueId()}`,
    interactive: true,
    classes: '',
    text: null,
    newTab: true,
  };
  let options = defaultOptions;
  if (Array.isArray(colorOrOptions)) {
    colorToUse = colorOrOptions;
  } else if (colorOrOptions != null) {
    options = joinObjects(defaultOptions, colorOrOptions);
  }
  const {
    color, id, classes, text,
  } = options;
  if (color != null) {
    colorToUse = color;
  }

  if (classes !== '') {
    classStr = `${classStr} ${classes}`;
  }

  const target = options.newTab ? ' target="_blank"' : '';
  const idToUse = () => id;
  return {
    replacementText: (textIn: string) => {
      const idStr = id ? ` id="${id}"` : '';
      const colorStr = colorToUse ? ` style="color:${colorArrayToRGBA(colorToUse)};"` : '';
      return {
        replacementText: `<a href=${linkStr}${idStr}class="${classStr}"${colorStr} rel="noreferrer noopener"${target}>${(text || textIn).trim()}</a>`,
      };
    },
    id: idToUse,
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

function click(
  actionMethod: Function,
  bind: Array<mixed>,
  colorOrOptions: Array<number> | {
    color?: ?Array<number>,
    interactive?: boolean,
    id?: string,
    classes?: string,
    text?: ?string,
  } | null = null,
) {
  let classStr = 'action_word';
  let colorToUse = null;
  const defaultOptions = {
    color: null,
    id: `figureone__id_${generateUniqueId()}`,
    interactive: true,
    classes: '',
    text: null,
  };
  let options = defaultOptions;
  if (Array.isArray(colorOrOptions)) {
    colorToUse = colorOrOptions;
  } else if (colorOrOptions != null) {
    options = joinObjects(defaultOptions, colorOrOptions);
  }
  const {
    interactive, color, id, classes, text,
  } = options;
  if (color != null) {
    colorToUse = color;
  }
  if (interactive) {
    classStr = `${classStr} interactive_word`;
  }
  if (classes !== '') {
    classStr = `${classStr} ${classes}`;
  }
  const idToUse = () => id;
  return {
    replacementText: (textIn: string) => toHTML(text || textIn, idToUse(), classStr, colorToUse),
    id: idToUse,
    actionMethod,
    bind,
  };
}

function clickW(
  textToUse: string,
  actionMethod: Function,
  bind: Array<mixed>,
  color: Array<number> | null = null,
) {
  return click(actionMethod, bind, {
    color,
    text: textToUse,
  });
}

function actionWord(
  text: string,
  id: string = generateUniqueId(),
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
  if (typeof mod === 'string') {
    replacement = mod;
  } else if (typeof mod.replacementText === 'string') {
    replacement = mod.replacementText;
  } else {
    replacement = mod.replacementText(key).replacementText;
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
    const onClickFn = () => {
      const recorder = new Recorder();
      if (recorder.isRecording) {
        recorder.recordEvent('click', 'id');
      }
      actionMethod.bind(...bind)();
    };
    element.onclick = onClickFn;
    // if (bind.length === 1) {
    //   element.onclick = actionMethod.bind(bind[0]);
    // }
    // if (bind.length === 2) {
    //   element.onclick = actionMethod.bind(bind[0], bind[1]);
    // }
    // if (bind.length === 3) {
    //   element.onclick = actionMethod.bind(bind[0], bind[1], bind[2]);
    // }
    // if (bind.length === 4) {
    //   element.onclick = actionMethod.bind(bind[0], bind[1], bind[2], bind[3]);
    // }
    // if (bind.length === 5) {
    //   element.onclick = actionMethod.bind(bind[0], bind[1], bind[2], bind[3], bind[4]);
    // }
    // if (bind.length === 6) {
    //   element.onclick = actionMethod.bind(bind[0], bind[1], bind[2], bind[3], bind[4], bind[5]);
    // }
    // if (bind.length === 7) {
    //   element.onclick = actionMethod.bind(
    //     bind[0], bind[1], bind[2], bind[3], bind[4],
    //     bind[5], bind[6],
    //   );
    // }
    // if (bind.length === 8) {
    //   element.onclick = actionMethod.bind(
    //     bind[0], bind[1], bind[2], bind[3], bind[4],
    //     bind[5], bind[6], bind[7],
    //   );
    // }
    // if (bind.length === 9) {
    //   element.onclick = actionMethod.bind(
    //     bind[0], bind[1], bind[2], bind[3], bind[4],
    //     bind[5], bind[6], bind[7], bind[8],
    //   );
    // }
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
    // if (mod.replacementText != null) {
    outText = modifyText(outText, key, mod);
    // }
  });
  const r = RegExp(/\|([^|]*)\|/gi);
  outText = outText.replace(r, `<span class="${highlightClass}">$1</span>`);
  if (monochrome) {
    const c = RegExp(/style="color:rgba\([^)]*\);"/gi);
    outText = outText.replace(c, '');
    const h = RegExp(/highlight_word/gi);
    outText = outText.replace(h, '');
    const i = RegExp(/interactive_word/gi);
    outText = outText.replace(i, '');
    const id = RegExp(/id="[^"]*"/gi);
    outText = outText.replace(id, '');
  }
  return outText;
}

function setOnClicks(modifiers: Object, additionalClassesToAdd: string = '') {
  Object.keys(modifiers).forEach((key) => {
    const mod = modifiers[key];
    if (typeof mod !== 'string' && 'actionMethod' in mod) {
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
  itemSelector, unit, applyModifiers,
  setOnClicks, setHTML, withClass, style, clickW, link,
};
