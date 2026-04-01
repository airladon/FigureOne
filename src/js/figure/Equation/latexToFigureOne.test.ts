import { latexToFigureOne } from './latexToFigureOne';

describe('latexToFigureOne', () => {
  // ---- simple expressions ---------------------------------------------------

  test('single variable', () => {
    const { elements, form } = latexToFigureOne('a');
    expect(form).toBe('a');
    expect(elements).toEqual({});
  });

  test('simple addition', () => {
    const { elements, form } = latexToFigureOne('a + b');
    expect(form).toEqual(['a', 'plus', 'b']);
    expect(elements.plus).toBe(' + ');
  });

  test('binary operators get spaces', () => {
    const { elements, form } = latexToFigureOne('a = b');
    expect(form).toEqual(['a', 'equals', 'b']);
    expect(elements.equals).toBe(' = ');
  });

  test('multiple operators of same type', () => {
    const { elements, form } = latexToFigureOne('a + b + c');
    expect(form).toEqual(['a', 'plus', 'b', 'plus_1', 'c']);
    expect(elements.plus).toBe(' + ');
    expect(elements.plus_1).toBe(' + ');
  });

  test('duplicate variables get unique names', () => {
    const { form } = latexToFigureOne('x + x');
    // Two x's should get different names
    expect(form).toEqual(['x', 'plus', 'x_1']);
  });

  // ---- fractions -------------------------------------------------------------

  test('simple fraction', () => {
    const { elements, form } = latexToFigureOne('\\frac{a}{b}');
    expect(form).toEqual({ frac: ['a', 'v', 'b'] });
    expect(elements.v).toEqual({ symbol: 'vinculum' });
  });

  test('fraction with complex numerator', () => {
    const { elements, form } = latexToFigureOne('\\frac{a + b}{c}');
    expect(form).toEqual({ frac: [['a', 'plus', 'b'], 'v', 'c'] });
    expect(elements.v).toEqual({ symbol: 'vinculum' });
  });

  test('nested fractions', () => {
    const { elements, form } = latexToFigureOne('\\frac{\\frac{a}{b}}{c}');
    // Outer frac's vinculum is created first ('v'), inner gets 'v_1'
    expect(form).toEqual({
      frac: [{ frac: ['a', 'v_1', 'b'] }, 'v', 'c'],
    });
    expect(elements.v).toEqual({ symbol: 'vinculum' });
    expect(elements.v_1).toEqual({ symbol: 'vinculum' });
  });

  test('fraction equals expression', () => {
    const { elements, form } = latexToFigureOne('a = \\frac{b}{c}');
    expect(form).toEqual(['a', 'equals', { frac: ['b', 'v', 'c'] }]);
    expect(elements.equals).toBe(' = ');
    expect(elements.v).toEqual({ symbol: 'vinculum' });
  });

  // ---- superscripts and subscripts ------------------------------------------

  test('simple superscript', () => {
    const { form } = latexToFigureOne('x^2');
    expect(form).toEqual({ sup: ['x', '2'] });
  });

  test('grouped superscript', () => {
    const { form } = latexToFigureOne('x^{2n}');
    expect(form).toEqual({ sup: ['x', ['2', 'n']] });
  });

  test('simple subscript', () => {
    const { form } = latexToFigureOne('x_i');
    expect(form).toEqual({ sub: ['x', 'i'] });
  });

  test('grouped subscript', () => {
    const { form } = latexToFigureOne('x_{ij}');
    expect(form).toEqual({ sub: ['x', ['i', 'j']] });
  });

  test('superscript and subscript combined', () => {
    const { form } = latexToFigureOne('x_i^2');
    expect(form).toEqual({ supSub: ['x', '2', 'i'] });
  });

  test('superscript and subscript (reverse order)', () => {
    const { form } = latexToFigureOne('x^2_i');
    expect(form).toEqual({ supSub: ['x', '2', 'i'] });
  });

  test('nested superscripts', () => {
    const { form } = latexToFigureOne('e^{x^2}');
    expect(form).toEqual({ sup: ['e', { sup: ['x', '2'] }] });
  });

  // ---- square roots ---------------------------------------------------------

  test('simple square root', () => {
    const { elements, form } = latexToFigureOne('\\sqrt{x}');
    expect(form).toEqual({ root: ['rad', 'x'] });
    expect(elements.rad).toEqual({ symbol: 'radical' });
  });

  test('square root of expression', () => {
    const { form } = latexToFigureOne('\\sqrt{a + b}');
    expect(form).toEqual({ root: ['rad', ['a', 'plus', 'b']] });
  });

  test('nth root', () => {
    const { form } = latexToFigureOne('\\sqrt[3]{x}');
    expect(form).toEqual({ root: { symbol: 'rad', content: 'x', root: '3' } });
  });

  test('nested sqrt', () => {
    const { elements, form } = latexToFigureOne('\\sqrt{\\sqrt{x}}');
    expect(form).toEqual({ root: ['rad', { root: ['rad_1', 'x'] }] });
    expect(elements.rad).toEqual({ symbol: 'radical' });
    expect(elements.rad_1).toEqual({ symbol: 'radical' });
  });

  // ---- integrals ------------------------------------------------------------

  test('simple integral', () => {
    const { elements, form } = latexToFigureOne('\\int f(x) dx');
    expect(elements.int_sym).toEqual({ symbol: 'int' });
    expect(form).toEqual({
      int: {
        symbol: 'int_sym',
        content: ['f', '(', 'x', ')', 'd', 'x_1'],
      },
    });
  });

  test('definite integral', () => {
    const { elements, form } = latexToFigureOne('\\int_a^b f(x) dx');
    expect(elements.int_sym).toEqual({ symbol: 'int' });
    expect(form).toEqual({
      int: {
        symbol: 'int_sym',
        content: ['f', '(', 'x', ')', 'd', 'x_1'],
        from: 'a',
        to: 'b',
      },
    });
  });

  test('integral with grouped limits', () => {
    const { form } = latexToFigureOne('\\int_{0}^{\\infty} e^{-x} dx');
    expect(form).toEqual({
      int: {
        symbol: 'int_sym',
        content: [{ sup: ['e', ['minus', 'x']] }, 'd', 'x_1'],
        from: '0',
        to: '\u221E',
      },
    });
  });

  // ---- sums and products ----------------------------------------------------

  test('simple sum', () => {
    const { elements, form } = latexToFigureOne('\\sum_{i=1}^{n} a_i');
    expect(elements.sum_sym).toEqual({ symbol: 'sum' });
    // Content is generated before limits, so content's 'i' gets 'i'
    // and the from-limit's 'i' gets 'i_1'
    expect(form).toEqual({
      sumOf: {
        symbol: 'sum_sym',
        content: { sub: ['a', 'i'] },
        from: ['i_1', 'equals', '1'],
        to: 'n',
      },
    });
  });

  test('simple product', () => {
    const { elements, form } = latexToFigureOne('\\prod_{k=1}^{n} a_k');
    expect(elements.prod_sym).toEqual({ symbol: 'prod' });
    expect(form).toEqual({
      prodOf: {
        symbol: 'prod_sym',
        content: { sub: ['a', 'k'] },
        from: ['k_1', 'equals', '1'],
        to: 'n',
      },
    });
  });

  // ---- brackets -------------------------------------------------------------

  test('parentheses', () => {
    const { elements, form } = latexToFigureOne('\\left( a + b \\right)');
    expect(elements.bk).toEqual({ symbol: 'bracket', side: 'left' });
    expect(elements.bk_1).toEqual({ symbol: 'bracket', side: 'right' });
    expect(form).toEqual({ brac: ['bk', ['a', 'plus', 'b'], 'bk_1'] });
  });

  test('square brackets', () => {
    const { elements, form } = latexToFigureOne('\\left[ x \\right]');
    expect(elements.sqbk).toEqual({ symbol: 'squareBracket', side: 'left' });
    expect(elements.sqbk_1).toEqual({ symbol: 'squareBracket', side: 'right' });
    expect(form).toEqual({ brac: ['sqbk', 'x', 'sqbk_1'] });
  });

  test('curly braces', () => {
    const { elements, form } = latexToFigureOne('\\left\\{ x \\right\\}');
    expect(elements.br).toEqual({ symbol: 'brace', side: 'left' });
    expect(elements.br_1).toEqual({ symbol: 'brace', side: 'right' });
    expect(form).toEqual({ brac: ['br', 'x', 'br_1'] });
  });

  // ---- Greek letters --------------------------------------------------------

  test('Greek letters', () => {
    const { form } = latexToFigureOne('\\alpha + \\beta');
    expect(form).toEqual(['\u03B1', 'plus', '\u03B2']);
  });

  test('capital Greek', () => {
    const { form } = latexToFigureOne('\\Delta x');
    expect(form).toEqual(['\u0394', 'x']);
  });

  // ---- symbols --------------------------------------------------------------

  test('infinity', () => {
    const { form } = latexToFigureOne('\\infty');
    expect(form).toBe('\u221E');
  });

  test('partial derivative', () => {
    const { form } = latexToFigureOne('\\frac{\\partial f}{\\partial x}');
    expect(form).toEqual({
      frac: [['\u2202', 'f'], 'v', ['\u2202_1', 'x']],
    });
  });

  // ---- text operators -------------------------------------------------------

  test('sin function', () => {
    const { elements, form } = latexToFigureOne('\\sin x');
    expect(form).toEqual(['sin', 'x']);
    expect(elements.sin).toEqual({ text: 'sin', style: 'normal' });
  });

  test('lim with subscript', () => {
    const { elements, form } = latexToFigureOne('\\lim_{x \\to 0} f(x)');
    // \lim is a text operator; the subscript attaches to it
    expect(elements.lim).toEqual({ text: 'lim', style: 'normal' });
    expect(form).toEqual([
      { sub: ['lim', ['x', '\u2192', '0']] },
      'f', '(', 'x_1', ')',
    ]);
  });

  // ---- overline / underline -------------------------------------------------

  test('overline', () => {
    const { elements, form } = latexToFigureOne('\\overline{x}');
    expect(elements.bar_sym).toEqual({ symbol: 'bar', side: 'top' });
    expect(form).toEqual({ bar: { content: 'x', symbol: 'bar_sym', side: 'top' } });
  });

  test('underline', () => {
    const { elements, form } = latexToFigureOne('\\underline{x}');
    expect(elements.bar_sym).toEqual({ symbol: 'bar', side: 'bottom' });
    expect(form).toEqual({ bar: { content: 'x', symbol: 'bar_sym', side: 'bottom' } });
  });

  // ---- spacing --------------------------------------------------------------

  test('thin space', () => {
    const { form } = latexToFigureOne('a\\,b');
    expect(form).toEqual(['a', ' ', 'b']);
  });

  test('quad space', () => {
    const { form } = latexToFigureOne('a\\quad b');
    expect(form).toEqual(['a', '    ', 'b']);
  });

  // ---- complex expressions --------------------------------------------------

  test('quadratic formula', () => {
    const { elements, form } = latexToFigureOne(
      'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}',
    );
    // Verify structure
    expect(elements.v).toEqual({ symbol: 'vinculum' });
    expect(elements.rad).toEqual({ symbol: 'radical' });
    expect(elements.equals).toBe(' = ');
    // form should be: ['x', 'equals', { frac: [numerator, 'v', denominator] }]
    expect(form[0]).toBe('x');
    expect(form[1]).toBe('equals');
    expect(form[2]).toHaveProperty('frac');
    // The fraction's numerator and denominator
    const [num, vincName, den] = form[2].frac;
    expect(vincName).toBe('v'); // vinculum
    // denominator: '2' and 'a' are suffixed because numerator uses them first
    expect(den).toEqual(['2_1', 'a_1']);
    expect(num).toContain('minus');
  });

  test('integral equation (tutorial 06 style)', () => {
    const { elements, form } = latexToFigureOne(
      '\\int_a^b f(x)\\,dx',
    );
    expect(elements.int_sym).toEqual({ symbol: 'int' });
    expect(form).toHaveProperty('int');
    expect(form.int.from).toBe('a');
    expect(form.int.to).toBe('b');
  });

  test('sum with fraction', () => {
    const { elements, form } = latexToFigureOne(
      '\\sum_{n=0}^{\\infty} \\frac{x^n}{n!}',
    );
    expect(elements.sum_sym).toEqual({ symbol: 'sum' });
    expect(elements.v).toEqual({ symbol: 'vinculum' });
    expect(form).toHaveProperty('sumOf');
    expect(form.sumOf.content).toHaveProperty('frac');
  });

  test('expression before and after integral', () => {
    const { form } = latexToFigureOne(
      'F(x) = \\int_a^x f(t)\\,dt',
    );
    // Should be: [F, (, x, ), equals, { int: ... }]
    expect(Array.isArray(form)).toBe(true);
    expect(form[4]).toBe('equals');
    expect(form[5]).toHaveProperty('int');
  });
});
