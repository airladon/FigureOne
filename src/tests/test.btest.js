const playwright = require('playwright');

(async () => {
  const browser = await playwright.chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  // page.on('console', msg => {
  //   for (let i = 0; i < msg.args().length; ++i)
  //       console.log(`${i}: ${msg.args()[i]}`);
  // });
  await page.goto('file:///src/tests/index.html');
  function delay(time) {
    return new Promise(function(resolve) { 
        setTimeout(resolve, time)
    });
  }
  await delay(3000);
  // page.on('console', msg => {
  // for (let i = 0; i < msg.args().length; ++i)
  //     console.log(`${i}: ${msg.args()[i]}`);
  // });
  // await page.goto('https://thisiget-test.herokuapp.com/content/Math/Geometry_1/Angle/explanation/base?page=1');
  await page.screenshot({ path: `example-${1}.png` });
  await browser.close();
})();


// const pw = require('playwright');

// (async () => {
//   const browser = await pw.webkit.launch(); // or 'chromium', 'firefox'
//   const context = await browser.newContext();
//   const page = await context.newPage();

//   await page.goto('https://pixijs.io/examples/#/demos-basic/container.js');
//   function delay(time) {
//     return new Promise(function(resolve) { 
//         setTimeout(resolve, time)
//     });
//   }
//   await delay(3000);
//   await page.screenshot({ path: 'example.png' });
//   await browser.close();
// })();