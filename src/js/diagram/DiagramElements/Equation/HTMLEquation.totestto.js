// import HTMLEquation from './HTMLEquation';

// describe('HTML Equation', () => {
//   test('Text', () => {
//     const t = new e.Text('test', 'id1', 'c1');
//     const rendered = t.render();
//     const expected = '<div id="id1" class="equation_element c1 equation_text">\n  test\n</div>';
//     expect(rendered).toBe(expected);
//   });
//   test('Line', () => {
//     const t1 = new e.Text('a+b', 'id1', 'c1');
//     const t2 = new e.Text('=', 'id2', 'c2');
//     const t3 = new e.Text('c', 'id3', 'c3');

//     const expected =
// `<div id="id_e1" class="equation_element class_e1">
//   <div id="id1" class="equation_element c1 equation_text">
//     a+b
//   </div>
//   <div id="id2" class="equation_element c2 equation_text">
//     =
//   </div>
//   <div id="id3" class="equation_element c3 equation_text">
//     c
//   </div>
// </div>`;
//     const line = new e.Line(
//       [t1, t2, t3],
//       'id_e1',
//       'class_e1',
//     );
//     expect(line.render()).toBe(expected);
//   });

//   test('Fraction', () => {
//     const n = new e.Line(
//       [new e.Text('a + b')],
//       'id_n1',
//       'class_n1',
//     );
//     const d = new e.Line(
//       [new e.Text('c')],
//       'id_d1',
//       'class_d1',
//     );
//     const f = new e.Fraction(
//       n,
//       d,
//       'id_f1',
//       'class_f1',
//     );
//     const expected =
// `<div id="id_f1" class="equation_element class_f1 fraction">
//   <div class="numerator">
//     <div id="id_n1" class="equation_element class_n1">
//       <div class="equation_element equation_text">
//         a + b
//       </div>
//     </div>
//   </div>
//   <div class="fraction_line"> </div>
//   <div class="denominator">
//     <div id="id_d1" class="equation_element class_d1">
//       <div class="equation_element equation_text">
//         c
//       </div>
//     </div>
//   </div>
// </div>`;
//     expect(f.render()).toBe(expected);
//   });
//   describe('Equation', () => {
//     test('a + b = c', () => {
//       // const line = new e.Line();
//       const eq = new e.Equation('e1', [new e.Text('a + b = c')]);
//       const expected =
// `<div id="e1" class="equation_element equation">
//   <div class="equation_element equation_text">
//     a + b = c
//   </div>
// </div>`;
//       expect(eq.render()).toBe(expected);
//     });
//   });

//   test.only('temp', () => {
//     // console.log(e.e([e.e('b'), e.e('&#177;'), e.sqrt('4ac')]).render());
//     const n = e.e('b');
//     const d = e.e('2');
//     const eq = new e.Equation([e.frac(n, d), e.e('='), e.e('0')]);
//     console.log(eq.render());
//     expect(true).toBe(true);
//   })
// });

// // b +- sqrt(4ac)
// // -------------- = d
// //     2A

// // E = e.e([
// //   e.frac([e.e('b') e.e('+') e.sqrt('4ac')], e.e('2A')),
// //   e.('='),
// //   e.('d')])

// //  / inf
// //  |
// //  | x^2 dx = 2x
// //  |
// // / 0


// // E = e([e.o('&int;').ss('0', 'inf') e.t('x').sp('2') e.t('dx') e.('=') e.('2x')])
