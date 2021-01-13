# Example - Sine Waves

This is part 2 of the Travelling Waves examples.

It is a static page with four interactive figures as part of an explanation of sine waves, and how to transform them.

Open `index.html` in a browser to view example.

![](./example.gif)

## Explanation

### HTML Styling

For simplicity, the html file contains the styling and content of the page.

In general, the style customizes the look and feel with vanilla css. The specific styling of the figure is however interesting to note, as its goal is to ensure a figure is able to be fully viewed on any screen size, no matter the aspect ratio of the screen. This is particularly useful for interactive figures.

Each figure is defined in the HTML code as a `figureOneContainer` div wrapped in a `wrapper` div. The width of the wrapper is defined by the width of the screen when the aspect ratio is <1:1 (e.g. portrait orientation on a mobile device) and the height of the screen when the aspect ratio is >1:1 (landscape).

```html
<div class="wrapper50">
    <div id="figureOneContainer1" class="ar50"></div>
</div>
```

```css
.wrapper50 {
    width: calc(100vw - 20px);
    max-width: 100%;
    padding-bottom: 10px;
    margin-left: auto;
    margin-right: auto;
}
@media (min-aspect-ratio: 1/1) {
    .wrapper50 {
        width: calc((100vh - 20px)/0.5);
    }
} 
.ar50 {
    width: 100%;
    padding-bottom: 50%;
}
```

### HTML Equations using MathJax

This example uses [MathJax](https://www.mathjax.org) to render the static equations within the HTML body text. MathJax is a great open source library for embedding static equations within HTML text.

For simplicity of the example, the equations are parsed, converted to HTML and then rendered all by the client at load time, meaning it can take a little while for the page to finish loading and generating all the equations.

In production, MathJax can be used to parse and generate all the equations in HTML at build time (so loading is faster), or to parse and generate all the equations as images. Both ways would make for a better user experience, but would unnecessarily complicate this example.


### Javascript files

This example demonstrates using multiple interactive figures on a web page, and putting links in the HTML code that cause behaviors in the figure.

Each figure is associated with an individual javascript file ('fig1.js', 'fig2.js', 'fig3.js', 'fig4.js') that handles layout and logic for the figure. Each file has a global function, within which the figure is created. This keeps all the variables created for the figure locally scoped. Each figure also shares a few methods which can be executed from the HTML code to make interactive links.

```js
// fig1.js
// Function in which all figure 1 logic is contained
function fig1() {
  // Code to create figure, and interactive logic here

  // At the end, share some methods for access outside of fig1
  const pulse = () => ...
  const drawFull = () => ...
  return {
    pulse,
    drawFull,
  }
}
// Create figure 1 and associate it with the variable `figure1`.
// The `pulse` and `drawFull` methods can then be executed with
// `figure1.pulse()` or `figure1.drawFull()` in the global scope.
const figure1 = fig1();
```

Within the HTML body, links are added to execute the globally shared methods of the figures. For example:

```html
<a href="javascript:figure1.pulse();" >trace</a>
```
