# Example - Travelling Wave 02 - Sine Waves

This is part 2 of the Travelling Waves examples.

It is a static page with four interactive figures as part of an explanation of sine waves, and how to transform them.

Open `index.html` in a browser to view example, or the example is hosted [here](https://airladon.github.io/FigureOne/examples/Traveling%20Wave%2001%20-%20Sine%20Waves/index.html).


![](./example.gif)

## Explanation


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

Splitting the four figures into separate files makes the example easier to code and read. However, as downloading separate files can be time consuming, in production it is recommended they be bundled into a single file.