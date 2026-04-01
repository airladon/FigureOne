/**
 * LaTeX to FigureOne equation form converter.
 *
 * Converts a LaTeX math expression string into FigureOne `elements` and `form`
 * objects that can be passed directly to `figure.add({ make: 'equation', ... })`.
 *
 * Supported LaTeX constructs:
 *   - Fractions: \frac{a}{b}
 *   - Superscripts / subscripts: x^2, x_{ij}, x_i^2
 *   - Square roots: \sqrt{x}, \sqrt[n]{x}
 *   - Integrals: \int, \int_{a}^{b} f(x)\,dx
 *   - Sums / products: \sum_{i=1}^{n}, \prod_{k=0}^{n}
 *   - Brackets: \left( ... \right), \left[ ... \right], \left\{ ... \right\}
 *   - Overline / underline: \overline{x}, \underline{x}
 *   - Accents: \hat{x}, \tilde{x}, \dot{x}, \vec{x}
 *   - Greek letters: \alpha, \Beta, etc.
 *   - Operators: \sin, \cos, \lim, \log, etc.
 *   - Symbols: \cdot, \times, \pm, \infty, \to, \partial, etc.
 *   - Spacing: \,  \;  \quad  \qquad
 *   - Text mode: \text{...}, \mathrm{...}
 *
 * @module latexToFigureOne
 */

// ---------------------------------------------------------------------------
// Greek letter → Unicode mappings
// ---------------------------------------------------------------------------
const GREEK_LETTERS: Record<string, string> = {
  // lowercase
  alpha: '\u03B1', beta: '\u03B2', gamma: '\u03B3', delta: '\u03B4',
  epsilon: '\u03B5', varepsilon: '\u03B5', zeta: '\u03B6', eta: '\u03B7',
  theta: '\u03B8', vartheta: '\u03D1', iota: '\u03B9', kappa: '\u03BA',
  lambda: '\u03BB', mu: '\u03BC', nu: '\u03BD', xi: '\u03BE',
  pi: '\u03C0', rho: '\u03C1', sigma: '\u03C3', varsigma: '\u03C2',
  tau: '\u03C4', upsilon: '\u03C5', phi: '\u03C6', varphi: '\u03D5',
  chi: '\u03C7', psi: '\u03C8', omega: '\u03C9',
  // uppercase
  Gamma: '\u0393', Delta: '\u0394', Theta: '\u0398', Lambda: '\u039B',
  Xi: '\u039E', Pi: '\u03A0', Sigma: '\u03A3', Upsilon: '\u03A5',
  Phi: '\u03A6', Psi: '\u03A8', Omega: '\u03A9',
};

// ---------------------------------------------------------------------------
// Symbol command → Unicode mappings
// ---------------------------------------------------------------------------
const SYMBOLS: Record<string, string> = {
  // binary operators
  cdot: '\u00B7', times: '\u00D7', pm: '\u00B1', mp: '\u2213', div: '\u00F7',
  ast: '*', star: '\u2605', circ: '\u2218',
  // relations
  leq: '\u2264', le: '\u2264', geq: '\u2265', ge: '\u2265',
  neq: '\u2260', ne: '\u2260', approx: '\u2248', equiv: '\u2261',
  sim: '\u223C', simeq: '\u2243', propto: '\u221D', prec: '\u227A',
  succ: '\u227B', ll: '\u226A', gg: '\u226B',
  // arrows
  to: '\u2192', rightarrow: '\u2192', leftarrow: '\u2190',
  Rightarrow: '\u21D2', Leftarrow: '\u21D0',
  leftrightarrow: '\u2194', Leftrightarrow: '\u21D4',
  mapsto: '\u21A6', uparrow: '\u2191', downarrow: '\u2193',
  // misc math
  partial: '\u2202', nabla: '\u2207', infty: '\u221E',
  forall: '\u2200', exists: '\u2203', neg: '\u00AC',
  // set theory
  in: '\u2208', notin: '\u2209', subset: '\u2282', supset: '\u2283',
  subseteq: '\u2286', supseteq: '\u2287',
  cup: '\u222A', cap: '\u2229', emptyset: '\u2205', varnothing: '\u2205',
  // dots
  ldots: '\u2026', cdots: '\u22EF', vdots: '\u22EE', ddots: '\u22F1',
  dots: '\u2026',
  // misc
  ell: '\u2113', hbar: '\u210F', Re: '\u211C', Im: '\u2111', aleph: '\u2135',
  prime: '\u2032',
};

// ---------------------------------------------------------------------------
// Text-mode operators (rendered upright / roman style)
// ---------------------------------------------------------------------------
const TEXT_OPERATORS: Set<string> = new Set([
  'sin', 'cos', 'tan', 'cot', 'sec', 'csc',
  'arcsin', 'arccos', 'arctan',
  'sinh', 'cosh', 'tanh', 'coth',
  'log', 'ln', 'exp',
  'lim', 'limsup', 'liminf',
  'max', 'min', 'sup', 'inf',
  'det', 'dim', 'ker', 'deg', 'gcd', 'hom',
  'arg', 'Pr',
]);

// ---------------------------------------------------------------------------
// Binary operator characters (get spaces around them in output)
// ---------------------------------------------------------------------------
const BINARY_OPS = new Set(['+', '-', '=', '<', '>']);

const OPERATOR_NAMES: Record<string, string> = {
  '+': 'plus',
  '-': 'minus',
  '=': 'equals',
  '<': 'lt',
  '>': 'gt',
};

// ---------------------------------------------------------------------------
// Tokeniser
// ---------------------------------------------------------------------------
type TokenType =
  | 'command' | 'text' | 'lbrace' | 'rbrace'
  | 'lbracket' | 'rbracket' | 'caret' | 'underscore';

interface Token {
  type: TokenType;
  value: string;
}

function tokenize(latex: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < latex.length) {
    const ch = latex[i];

    // ----- backslash commands -------------------------------------------------
    if (ch === '\\') {
      i++;
      if (i >= latex.length) break;
      const next = latex[i];

      // Single-character commands  \, \; \: \! \  \{ \}
      if (',;:! '.includes(next)) {
        tokens.push({ type: 'command', value: next });
        i++;
        continue;
      }
      if (next === '{') {
        // \{ is an escaped brace — treat as text
        tokens.push({ type: 'command', value: '\\{' });
        i++;
        continue;
      }
      if (next === '}') {
        tokens.push({ type: 'command', value: '\\}' });
        i++;
        continue;
      }
      if (next === '\\') {
        // \\ line break — ignore for equation parsing
        i++;
        continue;
      }

      // Multi-character command:  \frac, \alpha, etc.
      let cmd = '';
      while (i < latex.length && /[a-zA-Z]/.test(latex[i])) {
        cmd += latex[i];
        i++;
      }
      if (cmd.length > 0) {
        tokens.push({ type: 'command', value: cmd });
      }
      continue;
    }

    // ----- braces & brackets --------------------------------------------------
    if (ch === '{') { tokens.push({ type: 'lbrace', value: ch }); i++; continue; }
    if (ch === '}') { tokens.push({ type: 'rbrace', value: ch }); i++; continue; }
    if (ch === '[') { tokens.push({ type: 'lbracket', value: ch }); i++; continue; }
    if (ch === ']') { tokens.push({ type: 'rbracket', value: ch }); i++; continue; }

    // ----- super / subscript --------------------------------------------------
    if (ch === '^') { tokens.push({ type: 'caret', value: ch }); i++; continue; }
    if (ch === '_') { tokens.push({ type: 'underscore', value: ch }); i++; continue; }

    // ----- whitespace (ignored in math mode) ----------------------------------
    if (/\s/.test(ch)) { i++; continue; }

    // ----- everything else is literal text ------------------------------------
    tokens.push({ type: 'text', value: ch });
    i++;
  }

  return tokens;
}

// ---------------------------------------------------------------------------
// AST node types
// ---------------------------------------------------------------------------
type ASTNode =
  | { type: 'text'; value: string }
  | { type: 'sequence'; children: ASTNode[] }
  | { type: 'frac'; numerator: ASTNode; denominator: ASTNode }
  | { type: 'sup'; base: ASTNode; superscript: ASTNode }
  | { type: 'sub'; base: ASTNode; subscript: ASTNode }
  | { type: 'supsub'; base: ASTNode; superscript: ASTNode; subscript: ASTNode }
  | { type: 'sqrt'; content: ASTNode; index?: ASTNode }
  | { type: 'largeOp'; op: 'int' | 'sum' | 'prod'; from?: ASTNode; to?: ASTNode; content: ASTNode }
  | { type: 'brac'; left: string; right: string; content: ASTNode }
  | { type: 'overline'; content: ASTNode }
  | { type: 'underline'; content: ASTNode }
  | { type: 'accent'; accent: string; content: ASTNode }
  | { type: 'textOp'; name: string }
  | { type: 'space'; size: string };

// ---------------------------------------------------------------------------
// Parser (recursive descent)
// ---------------------------------------------------------------------------
class Parser {
  private tokens: Token[];
  private pos: number;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
    this.pos = 0;
  }

  private peek(): Token | null {
    return this.pos < this.tokens.length ? this.tokens[this.pos] : null;
  }

  private advance(): Token {
    return this.tokens[this.pos++];
  }

  private expect(type: TokenType): Token {
    const tok = this.peek();
    if (!tok || tok.type !== type) {
      throw new Error(
        `LaTeX parse error: expected ${type} but got ${tok ? `${tok.type}(${tok.value})` : 'EOF'} at token ${this.pos}`,
      );
    }
    return this.advance();
  }

  /** Entry point. */
  parse(): ASTNode {
    return this.parseSequence();
  }

  // ---- sequence of items (stops at }, ], \right, or EOF) -------------------

  private parseSequence(): ASTNode {
    const items: ASTNode[] = [];

    while (this.pos < this.tokens.length) {
      const tok = this.peek();
      if (!tok) break;
      // Stop tokens
      if (tok.type === 'rbrace' || tok.type === 'rbracket') break;
      if (tok.type === 'command' && tok.value === 'right') break;

      // Large operators consume the rest of the current scope as content
      if (tok.type === 'command' && (tok.value === 'int' || tok.value === 'sum' || tok.value === 'prod')) {
        items.push(this.parseLargeOperator());
        continue;
      }

      const item = this.parseItem();
      if (item) items.push(item);
    }

    if (items.length === 0) return { type: 'text', value: '' };
    if (items.length === 1) return items[0];
    return { type: 'sequence', children: items };
  }

  // ---- single item (atom + optional ^/_ ) -----------------------------------

  private parseItem(): ASTNode | null {
    const atom = this.parseAtom();
    if (!atom) return null;
    return this.attachSupSub(atom);
  }

  private attachSupSub(base: ASTNode): ASTNode {
    let superscript: ASTNode | undefined;
    let subscript: ASTNode | undefined;

    // ^ and _ can appear in either order, at most once each
    for (let i = 0; i < 2; i++) {
      const tok = this.peek();
      if (!tok) break;
      if (tok.type === 'caret' && !superscript) {
        this.advance();
        superscript = this.parseAtom()!;
      } else if (tok.type === 'underscore' && !subscript) {
        this.advance();
        subscript = this.parseAtom()!;
      } else {
        break;
      }
    }

    if (superscript && subscript) return { type: 'supsub', base, superscript, subscript };
    if (superscript) return { type: 'sup', base, superscript };
    if (subscript) return { type: 'sub', base, subscript };
    return base;
  }

  // ---- atom (single indivisible piece) --------------------------------------

  private parseAtom(): ASTNode | null {
    const tok = this.peek();
    if (!tok) return null;

    if (tok.type === 'lbrace') return this.parseGroup();
    if (tok.type === 'text') { this.advance(); return { type: 'text', value: tok.value }; }
    if (tok.type === 'command') return this.parseCommand();

    return null;
  }

  private parseGroup(): ASTNode {
    this.expect('lbrace');
    const content = this.parseSequence();
    this.expect('rbrace');
    return content;
  }

  // ---- command dispatch -----------------------------------------------------

  private parseCommand(): ASTNode | null {
    const tok = this.advance(); // consume command token
    const cmd = tok.value;

    // ---- structural commands ----
    if (cmd === 'frac') return this.parseFrac();
    if (cmd === 'sqrt') return this.parseSqrt();
    if (cmd === 'left') return this.parseBrackets();

    // ---- accents / decorations ----
    if (cmd === 'overline' || cmd === 'bar') return { type: 'overline', content: this.parseAtom()! };
    if (cmd === 'underline') return { type: 'underline', content: this.parseAtom()! };
    if (cmd === 'hat' || cmd === 'tilde' || cmd === 'dot' || cmd === 'vec'
      || cmd === 'ddot' || cmd === 'breve' || cmd === 'check' || cmd === 'acute'
      || cmd === 'grave') {
      return { type: 'accent', accent: cmd, content: this.parseAtom()! };
    }

    // ---- text mode ----
    if (cmd === 'text' || cmd === 'mathrm' || cmd === 'textrm' || cmd === 'textit' || cmd === 'mathit') {
      return this.parseTextBlock();
    }

    // ---- spacing ----
    if (cmd === ',') return { type: 'space', size: 'thin' };
    if (cmd === ';' || cmd === ':') return { type: 'space', size: 'medium' };
    if (cmd === '!') return { type: 'space', size: 'neg' };
    if (cmd === ' ') return { type: 'space', size: 'normal' };
    if (cmd === 'quad') return { type: 'space', size: 'quad' };
    if (cmd === 'qquad') return { type: 'space', size: 'qquad' };

    // ---- escaped braces as text ----
    if (cmd === '\\{') return { type: 'text', value: '{' };
    if (cmd === '\\}') return { type: 'text', value: '}' };

    // ---- Greek letters ----
    if (GREEK_LETTERS[cmd]) return { type: 'text', value: GREEK_LETTERS[cmd] };

    // ---- math symbols ----
    if (SYMBOLS[cmd]) return { type: 'text', value: SYMBOLS[cmd] };

    // ---- text operators ----
    if (TEXT_OPERATORS.has(cmd)) return { type: 'textOp', name: cmd };

    // ---- unknown command → pass through as text ----
    return { type: 'text', value: `\\${cmd}` };
  }

  private parseFrac(): ASTNode {
    const numerator = this.parseAtom()!;
    const denominator = this.parseAtom()!;
    return { type: 'frac', numerator, denominator };
  }

  private parseSqrt(): ASTNode {
    let index: ASTNode | undefined;
    // optional index: \sqrt[n]{...}
    if (this.peek()?.type === 'lbracket') {
      this.advance(); // consume [
      const items: ASTNode[] = [];
      while (this.peek() && this.peek()!.type !== 'rbracket') {
        const item = this.parseItem();
        if (item) items.push(item);
      }
      this.expect('rbracket');
      index = items.length === 1 ? items[0] : { type: 'sequence', children: items };
    }
    const content = this.parseAtom()!;
    return { type: 'sqrt', content, index };
  }

  private parseLargeOperator(): ASTNode {
    const tok = this.advance(); // \int, \sum, \prod
    const op = tok.value as 'int' | 'sum' | 'prod';

    // Parse optional limits (^ and _ in any order)
    let from: ASTNode | undefined;
    let to: ASTNode | undefined;
    for (let i = 0; i < 2; i++) {
      const p = this.peek();
      if (!p) break;
      if (p.type === 'underscore' && !from) {
        this.advance();
        from = this.parseAtom()!;
      } else if (p.type === 'caret' && !to) {
        this.advance();
        to = this.parseAtom()!;
      } else {
        break;
      }
    }

    // Content is the rest of the current scope
    const content = this.parseSequence();

    return { type: 'largeOp', op, from, to, content };
  }

  private parseBrackets(): ASTNode {
    // \left has already been consumed. Next token is the delimiter.
    const leftDelim = this.readDelimiter();
    const content = this.parseSequence(); // stops at \right
    // consume \right
    if (this.peek()?.type === 'command' && this.peek()?.value === 'right') {
      this.advance();
    }
    const rightDelim = this.readDelimiter();
    return { type: 'brac', left: leftDelim, right: rightDelim, content };
  }

  private readDelimiter(): string {
    const tok = this.peek();
    if (!tok) return '(';
    if (tok.type === 'text') {
      this.advance();
      return tok.value;
    }
    if (tok.type === 'command') {
      this.advance();
      if (tok.value === '\\{' || tok.value === 'lbrace') return '{';
      if (tok.value === '\\}' || tok.value === 'rbrace') return '}';
      if (tok.value === 'langle') return '<';
      if (tok.value === 'rangle') return '>';
      if (tok.value === 'vert' || tok.value === '|') return '|';
      return tok.value;
    }
    // [ and ] can be delimiters too
    if (tok.type === 'lbracket' || tok.type === 'rbracket') {
      this.advance();
      return tok.value;
    }
    return '(';
  }

  private parseTextBlock(): ASTNode {
    this.expect('lbrace');
    let text = '';
    while (this.peek() && this.peek()!.type !== 'rbrace') {
      const t = this.advance();
      if (t.type === 'command') {
        text += `\\${t.value}`;
      } else {
        text += t.value;
      }
    }
    this.expect('rbrace');
    return { type: 'text', value: text };
  }
}

// ---------------------------------------------------------------------------
// Code generator — converts AST to FigureOne elements + form
// ---------------------------------------------------------------------------
class CodeGenerator {
  /** Accumulated element definitions (symbols, styled text, operators). */
  elements: Record<string, any> = {};

  /**
   * Track how many times a given *display text* has been emitted so we can
   * generate unique element names via the `name_N` convention.
   */
  private textUsage: Record<string, number> = {};

  /** Counter per symbol type so each gets a unique name. */
  private symbolCounters: Record<string, number> = {};

  // ---- element name helpers -------------------------------------------------

  /**
   * Return a unique FigureOne element name for the given display text.
   * First occurrence of "x" → "x"; second → "x_1"; third → "x_2"; etc.
   */
  private nextTextName(text: string): string {
    const count = this.textUsage[text] ?? 0;
    this.textUsage[text] = count + 1;
    if (count === 0) return text;
    return `${text}_${count}`;
  }

  /** Add a symbol element and return its unique name. */
  private addSymbol(symbolType: string, extra?: Record<string, any>): string {
    const counter = this.symbolCounters[symbolType] ?? 0;
    this.symbolCounters[symbolType] = counter + 1;

    // Derive a readable base name from symbol type
    const baseNames: Record<string, string> = {
      vinculum: 'v', int: 'int_sym', sum: 'sum_sym', prod: 'prod_sym',
      radical: 'rad', bracket: 'bk', squareBracket: 'sqbk',
      brace: 'br', angleBracket: 'abk', bar: 'bar_sym',
    };
    const base = baseNames[symbolType] ?? symbolType;
    const name = counter === 0 ? base : `${base}_${counter}`;

    const def: Record<string, any> = { symbol: symbolType };
    if (extra) Object.assign(def, extra);
    this.elements[name] = def;
    return name;
  }

  /**
   * Register a text element that needs an explicit definition (e.g. styled
   * operators, multi-char text with special properties).
   */
  private addTextElement(displayText: string, props: Record<string, any>): string {
    const name = this.nextTextName(displayText);
    this.elements[name] = { text: displayText, ...props };
    return name;
  }

  /** Register an operator element (e.g. ' + ') and return its name. */
  private addOperator(char: string): string {
    const paddedText = ` ${char} `;
    const baseName = OPERATOR_NAMES[char] ?? `op_${char}`;
    const count = this.textUsage[baseName] ?? 0;
    this.textUsage[baseName] = count + 1;
    const name = count === 0 ? baseName : `${baseName}_${count}`;
    this.elements[name] = paddedText;
    return name;
  }

  // ---- main generation ------------------------------------------------------

  generate(node: ASTNode): any {
    switch (node.type) {
      case 'text': return this.genText(node.value);
      case 'sequence': return this.genSequence(node.children);
      case 'frac': return this.genFrac(node);
      case 'sup': return this.genSup(node);
      case 'sub': return this.genSub(node);
      case 'supsub': return this.genSupSub(node);
      case 'sqrt': return this.genSqrt(node);
      case 'largeOp': return this.genLargeOp(node);
      case 'brac': return this.genBrac(node);
      case 'overline': return this.genOverline(node);
      case 'underline': return this.genUnderline(node);
      case 'accent': return this.genAccent(node);
      case 'textOp': return this.genTextOp(node.name);
      case 'space': return this.genSpace(node.size);
      default: return '';
    }
  }

  private genText(text: string): any {
    if (text === '') return '';
    if (BINARY_OPS.has(text)) return this.addOperator(text);
    return this.nextTextName(text);
  }

  private genSequence(children: ASTNode[]): any {
    const items = children.map((c) => this.generate(c)).filter((x) => x !== '');
    if (items.length === 0) return '';
    if (items.length === 1) return items[0];
    // Flatten nested arrays one level for cleaner FigureOne forms
    const flat: any[] = [];
    for (const item of items) {
      if (Array.isArray(item)) {
        flat.push(...item);
      } else {
        flat.push(item);
      }
    }
    return flat;
  }

  private genFrac(node: { numerator: ASTNode; denominator: ASTNode }): any {
    const vName = this.addSymbol('vinculum');
    const num = this.generate(node.numerator);
    const den = this.generate(node.denominator);
    return { frac: [num, vName, den] };
  }

  private genSup(node: { base: ASTNode; superscript: ASTNode }): any {
    return { sup: [this.generate(node.base), this.generate(node.superscript)] };
  }

  private genSub(node: { base: ASTNode; subscript: ASTNode }): any {
    return { sub: [this.generate(node.base), this.generate(node.subscript)] };
  }

  private genSupSub(node: { base: ASTNode; superscript: ASTNode; subscript: ASTNode }): any {
    return {
      supSub: [
        this.generate(node.base),
        this.generate(node.superscript),
        this.generate(node.subscript),
      ],
    };
  }

  private genSqrt(node: { content: ASTNode; index?: ASTNode }): any {
    const radName = this.addSymbol('radical');
    const content = this.generate(node.content);
    if (node.index) {
      const idx = this.generate(node.index);
      return { root: { symbol: radName, content, root: idx } };
    }
    return { root: [radName, content] };
  }

  private genLargeOp(node: {
    op: string; from?: ASTNode; to?: ASTNode; content: ASTNode;
  }): any {
    const content = this.generate(node.content);
    const from = node.from ? this.generate(node.from) : undefined;
    const to = node.to ? this.generate(node.to) : undefined;

    if (node.op === 'int') {
      const symName = this.addSymbol('int');
      const def: Record<string, any> = { symbol: symName, content };
      if (from !== undefined) def.from = from;
      if (to !== undefined) def.to = to;
      return { int: def };
    }

    // sum and prod
    const symType = node.op === 'sum' ? 'sum' : 'prod';
    const fnName = node.op === 'sum' ? 'sumOf' : 'prodOf';
    const symName = this.addSymbol(symType);
    const def: Record<string, any> = { symbol: symName, content };
    if (from !== undefined) def.from = from;
    if (to !== undefined) def.to = to;
    return { [fnName]: def };
  }

  private delimiterToSymbol(delim: string): { type: string; side: 'left' | 'right' } {
    const isLeft = '(<[{'.includes(delim) || delim === '|';
    const side: 'left' | 'right' = isLeft ? 'left' : 'right';
    switch (delim) {
      case '(': case ')': return { type: 'bracket', side };
      case '[': case ']': return { type: 'squareBracket', side };
      case '{': case '}': return { type: 'brace', side };
      case '<': return { type: 'angleBracket', side: 'left' };
      case '>': return { type: 'angleBracket', side: 'right' };
      case '|': return { type: 'bar', side };
      case '.': return { type: 'bracket', side }; // invisible delimiter
      default: return { type: 'bracket', side };
    }
  }

  private genBrac(node: { left: string; right: string; content: ASTNode }): any {
    const leftInfo = this.delimiterToSymbol(node.left);
    const rightInfo = this.delimiterToSymbol(node.right);
    const lbName = this.addSymbol(leftInfo.type, { side: 'left' });
    const rbName = this.addSymbol(rightInfo.type, { side: 'right' });
    const content = this.generate(node.content);
    return { brac: [lbName, content, rbName] };
  }

  private genOverline(node: { content: ASTNode }): any {
    const barName = this.addSymbol('bar', { side: 'top' });
    const content = this.generate(node.content);
    return { bar: { content, symbol: barName, side: 'top' } };
  }

  private genUnderline(node: { content: ASTNode }): any {
    const barName = this.addSymbol('bar', { side: 'bottom' });
    const content = this.generate(node.content);
    return { bar: { content, symbol: barName, side: 'bottom' } };
  }

  private genAccent(node: { accent: string; content: ASTNode }): any {
    const content = this.generate(node.content);
    const accentChars: Record<string, string> = {
      hat: '\u0302', tilde: '\u0303', dot: '\u0307', ddot: '\u0308',
      vec: '\u2192', breve: '\u0306', check: '\u030C', acute: '\u0301',
      grave: '\u0300',
    };
    const accentChar = accentChars[node.accent] ?? '^';
    const commentName = this.nextTextName(accentChar);
    return {
      topComment: {
        content,
        comment: commentName,
        scale: 0.6,
      },
    };
  }

  private genTextOp(name: string): any {
    return this.addTextElement(name, { style: 'normal' });
  }

  private genSpace(size: string): string {
    switch (size) {
      case 'thin': return ' ';
      case 'medium': return ' ';
      case 'normal': return ' ';
      case 'quad': return '    ';
      case 'qquad': return '        ';
      case 'neg': return '';
      default: return ' ';
    }
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** Result of converting a LaTeX expression to FigureOne form. */
export interface LatexResult {
  /**
   * Element definitions to pass as `elements` in the equation options.
   * Contains only symbols and elements that need explicit configuration;
   * simple text elements are auto-created by FigureOne.
   */
  elements: Record<string, any>;
  /**
   * The form content (a {@link TypeEquationPhrase}) to use in a form
   * definition, e.g. `forms: { 0: result.form }`.
   */
  form: any;
}

/**
 * Convert a LaTeX math expression into a FigureOne equation form.
 *
 * @example
 * const { elements, form } = Fig.latexToFigureOne('\\frac{a}{b} = c');
 * figure.add({
 *   make: 'equation',
 *   elements,
 *   forms: { base: form },
 * });
 */
export function latexToFigureOne(latex: string): LatexResult {
  const tokens = tokenize(latex);
  const parser = new Parser(tokens);
  const ast = parser.parse();
  const generator = new CodeGenerator();
  const form = generator.generate(ast);
  return {
    elements: generator.elements,
    form,
  };
}

export default latexToFigureOne;
