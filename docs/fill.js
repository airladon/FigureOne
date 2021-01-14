'use strict';

function fillHeader(title, path) {
  const e = document.getElementById('header');
  e.innerHTML = `
  <div class="header-bar">
    <h1 class="title-text">FigureOne</h1>
    <h2 class="title-text">Draw, animate and interact with shapes, text, plots and equations in Javascript.</h2>

    <div class="links">
      <div class="title-link link">
        <a href="https://github.com/airladon/figureone">GitHub</a>
      </div>
      <div class="title-link link">
        <a href="https://github.com/airladon/FigureOne/tree/master/tutorials">Tutorials</a>
      </div>
      <div class="title-link link">
        <a href="api/index.html">API Reference</a>
      </div>
    </div>
  </div>
  <h3 class="example-title">${title}</h3>
  <div class="see-the-code">
    See the code on <a href="https://github.com/airladon/FigureOne/tree/master/docs/examples/${path.replace(' ', '%20')}">Github</a>
  </div>
  `;
}

function fillFooter(path = '..') {
  const e = document.getElementById('footer');
  e.innerHTML = `
    <div class="footer-bar">
      <div class="examples">
        <div class="other-examples">Examples</div>
        <div class="title-link link">
          <a href="${path}/sinewave/sine_wave.html">Sine Wave</a>
        </div>
        <div class="title-link link">
          <a href="${path}/pythagoreantheorem/pythagorean_theorem.html">Pythagorean Theorem</a>
        </div>
        <div class="title-link link">
          <a href="${path}/interactiveangle/interactive_angle.html">Interactive Angle</a>
        </div>
        <div class="title-link link">
          <a href="${path}/polygontotalangle/polygon_total_angle.html">Total Angle of a Polygon</a>
        </div>
        <div class="title-link link">
          <a href="${path}/holiday/holiday.html">Holiday Equation</a>
        </div>
      </div>
      <div class="footer">
        <p>Built for and used by <a class="link" href="https://www.thisiget.com">www.thisiget.com</a></p>
      </div>
    </div>
  `;
}
// fillHeader();
