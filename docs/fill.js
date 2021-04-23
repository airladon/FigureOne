function fillHeader(title, path) {
  const e = document.getElementById('header');
  e.innerHTML = `
  <div class="header-bar">
    <div class="title-text">FigureOne</div>
    <div class="sub-title-text">Draw, animate and interact with shapes, text, plots and equations in Javascript.</div>

    <div class="links">
      <div class="title-link link">
        <a href="https://github.com/airladon/figureone/">GitHub</a>
      </div>
      <div class="title-link link">
        <a href="https://github.com/airladon/FigureOne/tree/master/docs/tutorials">Tutorials</a>
      </div>
      <div class="title-link link">
        <a href="https://airladon.github.io/FigureOne/api/">API Reference</a>
      </div>
    </div>
  </div>
  <h1 class="example-title">${title}</h1>
  <div class="see-the-code">
    See the code on <a href="https://github.com/airladon/FigureOne/tree/master/docs/examples/${path.replace(' ', '%20')}">Github</a>
  </div>
  `;
}


function fillFooter(path = '..') {
  function link(name) {
    return `<div class="examples-link link">
            <a href="${path}/${name.replace(' ', '%20')}/index.html">${name}</a>
            </div>`;
  }
  const e = document.getElementById('footer');
  e.innerHTML = `
    <div class="footer-bar">
      <div class="examples">
        <div class="other-examples">Interactive Figure Examples</div>
        ${link('Interactive Angle')}
        ${link('Sine Wave')}
        ${link('Total Angle of a Polygon')}
        ${link('Traveling Wave 02 - Sine Waves')}
        <div class="other-examples">Equation Navigation Examples</div>
        ${link('Pythagorean Theorem')}
        ${link('Holiday Equation')}
        <div class="other-examples">Interactive Slide Show Examples</div>
        ${link('Sine Limit')}
        ${link('Traveling Wave 01 - Shifting Equations')}
        ${link('Traveling Wave 03 - Velocity Frequency Wavelength')}
        <div class="other-examples">Interactive Video Examples</div>
        ${link('Interactive Video - Tiling')}
        ${link('Interactive Video - Trig 1 - Trig Functions')}
      <div class="footer">
        <p>Built for and used by <a class="link" href="https://www.thisiget.com">www.thisiget.com</a></p>
      </div>
    </div>
  `;
}
