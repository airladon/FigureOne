// @flow

function makeDiv(
  id: string,
  classes: Array<string>,
  text: string,
  indent: number = 0,
) {
  const indentStr = ' '.repeat(indent);
  const idStr = id ? ` id="${id}"` : '';
  const classString = classes ? ` ${classes.join(' ')}` : '';
  let out = `${indentStr}<div${idStr} class="equation_element${classString}">\n`;
  out += `${text}\n`;
  out += `${indentStr}</div>`;
  return out;
}

// Most fundamental Equation Element properties includes element size and
// location, as well as html id and classes.
class HTMLElementProperties {
  id: string;
  classes: Array<string>;

  constructor(id: string = '', classes: string | Array<string> = '') {
    this.id = id;
    if (Array.isArray(classes)) {
      this.classes = classes;
    } else if (classes.length > 0) {
      this.classes = classes.split(' ');
    } else {
      this.classes = [];
    }
  }

  render(indent: number = 0, text: string = '') {
    return makeDiv(
      this.id,
      this.classes,
      text,
      indent,
    );
  }
}

class HTMLElement extends HTMLElementProperties {
  text: string;

  constructor(
    text: string,
    id: string = '',
    classes: string | Array<string> = [],
  ) {
    super(id, classes);
    this.classes.push('equation_text');
    this.text = text;
  }

  render(indent: number = 0) {
    return super.render(indent, `${' '.repeat(indent + 2)}${this.text}`);
  }
}

class HTMLElements extends HTMLElementProperties {
  content: Array<HTMLElement | HTMLElements | HTMLElementProperties>;

  constructor(
    content: Array<HTMLElement | HTMLElements | HTMLElementProperties | null>,
    id: string = '',
    classes: string | Array<string> = [],
  ) {
    super(id, classes);
    const filteredContent = [];
    content.forEach((c) => {
      if (c !== null) {
        filteredContent.push(c);
      }
    });
    this.content = filteredContent;
  }

  render(indent: number = 0) {
    return super.render(indent, this.content.map(c => c.render(indent + 2)).join('\n'));
  }
}

class Fraction extends HTMLElementProperties {
  numerator: HTMLElements;
  denominator: HTMLElements;

  constructor(
    numerator: HTMLElements,
    denominator: HTMLElements,
    id: string = '',
    classes: string | Array<string> = [],
  ) {
    super(id, classes);
    this.classes.push('fraction');
    this.numerator = numerator;
    this.denominator = denominator;
  }

  render(indent: number = 0) {
    const s = ' '.repeat(indent + 2);
    let out = '';
    out += `${s}<div class="numerator">\n`;
    out += this.numerator.render(indent + 4);
    out += `\n${s}</div>\n`;
    out += `${s}<div class="fraction_line"> </div>\n`;
    out += `${s}<div class="denominator">\n`;
    out += this.denominator.render(indent + 4);
    out += `\n${s}</div>`;
    return super.render(indent, out);
  }
}

class SuperSub extends HTMLElementProperties {
  superscript: HTMLElements | null;
  subscript: HTMLElements | null;
  content: HTMLElements;

  constructor(
    content: HTMLElements,
    superscript: HTMLElements | null,
    subscript: HTMLElements | null,
    id: string = '',
    classes: string | Array<string> = '',
  ) {
    super(id, classes);
    this.classes.push('supersub');
    this.superscript = superscript;
    this.subscript = subscript;
    this.content = content;
  }

  render(indent: number = 0) {
    const s = ' '.repeat(indent + 2);
    let out = '';
    out += `${s}<div class="supsub_content element">\n`;
    out += this.content.render(indent + 2);
    out += `\n${s}</div>\n`;
    out += `${s}<div class="super_sub element">\n`;
    out += `${s}<div class="super_sub_super superscript_text element">\n`;
    if (this.superscript !== null) {
      out += this.superscript.render(indent + 4);
    }
    out += `\n${s}</div>\n`;
    out += `${s}<div class="super_sub_sub subscript_text element">\n`;
    if (this.subscript !== null) {
      out += this.subscript.render(indent + 4);
    }
    out += `\n${s}</div>`;
    out += `\n${s}</div>\n`;
    return super.render(indent, out);
  }
}

class Subscript extends SuperSub {
  constructor(
    content: HTMLElements,       // eslint-disable-line no-use-before-define
    subscript: HTMLElements,
    id: string = '',
    classes: string | Array<string> = '',
  ) {
    super(content, null, subscript, id, classes);
    const index = this.classes.indexOf('supersub');
    if (index > -1) {
      this.classes.splice(index, 1);
    }
    this.classes.push('subscript');
  }
}

class Superscript extends SuperSub {
  constructor(
    content: HTMLElements,       // eslint-disable-line no-use-before-define
    superscript: HTMLElements,
    id: string = '',
    classes: string | Array<string> = '',
  ) {
    super(content, superscript, null, id, classes);
    const index = this.classes.indexOf('supersub');
    if (index > -1) {
      this.classes.splice(index, 1);
    }
    this.classes.push('superscript');
  }
}


class Root extends HTMLElementProperties {
  content: HTMLElements;

  constructor(
    content: HTMLElements,     // eslint-disable-line no-use-before-define
    id: string = '',
    classes: string | Array<string> = [],
  ) {
    super(id, classes);
    this.content = content;
  }

  render(indent: number = 0) {
    const s = ' '.repeat(indent + 2);
    let out = '';
    out += `${s}<div class="square_root element">\n`;
    out += `${s}  <div class="equation_element radical element">\n`;
    out += `${s}    &radic;\n`;
    out += `${s}  </div>\n`;
    out += this.content.render(indent + 4);
    out += `\n${s}</div>`;
    return super.render(indent, out);
  }
}

// function contentToE(content: string | HTMLElements): HTMLElements {
//   let c;
//   if (typeof content === 'string') {
//     c = new HTMLElements(content);
//   } else {
//     c = content;
//   }
//   return c;
// }

type EquationInput = Array<HTMLElements | HTMLElementProperties |
                           HTMLElement | string> |
                     HTMLElements | HTMLElementProperties |
                     HTMLElement | string;


function contentToElement(content: EquationInput): HTMLElements {
  if (content instanceof HTMLElements) {
    return content;
  }
  if (content instanceof HTMLElement
      || content instanceof HTMLElementProperties) {
    return new HTMLElements([content]);
  }
  if (typeof content === 'string') {
    return new HTMLElements([new HTMLElement(content)]);
  }

  // Otherwise must be array
  const elementArray: Array<HTMLElement | HTMLElements | HTMLElementProperties | null> = [];

  content.forEach((c) => {
    if (typeof c === 'string') {
      elementArray.push(new HTMLElement(c));
    } else {
      elementArray.push(c);
    }
  });
  return new HTMLElements(elementArray);
}


export default class HTMLEquation extends HTMLElements {
  constructor(id: string = '', classes: string | Array<string> = []) {
    super([], id, classes);
  }

  createEq(content: Array<HTMLElements | HTMLElementProperties | string>) {
    const elements = [];
    content.forEach((c) => {
      if (typeof c === 'string') {
        elements.push(new HTMLElement(c));
      } else {
        elements.push(c);
      }
      this.content = elements;
    });
  }

  htmlElement() {
    const element = document.createElement('div');
    element.setAttribute('id', this.id);
    element.innerHTML = this.render();
    this.classes.forEach((c) => {
      if (c) {
        element.classList.add(c);
      }
    });
    return element;
  }

  // eslint-disable-next-line class-methods-use-this
  el(
    content: 'string',
    id: string = '',
    classes: string | Array<string> = [],
  ) {
    return new HTMLElement(content, id, classes);
  }

  // eslint-disable-next-line class-methods-use-this
  supsub(
    content: EquationInput,
    superscript: EquationInput,
    subscript: EquationInput,
    id: string = '',
    classes: string | Array<string> = [],
  ) {
    return new SuperSub(
      contentToElement(content),
      contentToElement(superscript),
      contentToElement(subscript),
      id,
      classes,
    );
  }

  // eslint-disable-next-line class-methods-use-this
  sub(
    content: EquationInput,
    subscript: EquationInput,
    id: string = '',
    classes: string | Array<string> = [],
  ) {
    return new Subscript(
      contentToElement(content),
      contentToElement(subscript),
      id,
      classes,
    );
  }

  // eslint-disable-next-line class-methods-use-this
  sup(
    content: EquationInput,
    superscript: EquationInput,
    id: string = '',
    classes: string | Array<string> = [],
  ) {
    return new Superscript(
      contentToElement(content),
      contentToElement(superscript),
      id,
      classes,
    );
  }


  // e(
  //   content: string | Array<HTMLElementProperties>,
  //   id: string = '',
  //   classes: string | Array<string> = [],
  // ) {
  //   return new HTMLElements(content, id, classes);
  // }

  // eslint-disable-next-line class-methods-use-this
  frac(
    numerator: EquationInput,
    denominator: EquationInput,
    id: string = '',
    classes: string | Array<string> = [],
  ) {
    return new Fraction(
      contentToElement(numerator),
      contentToElement(denominator),
      id,
      classes,
    );
  }

  // eslint-disable-next-line class-methods-use-this
  sqrt(
    content: EquationInput,
    id: string = '',
    classes: string | Array<string> = [],
  ) {
    return new Root(
      contentToElement(content),
      id,
      classes,
    );
  }
}

