// import { toMatchImageSnapshot } from 'jest-image-snapshot';
const { toMatchImageSnapshot } = require('jest-image-snapshot');

expect.extend({ toMatchImageSnapshot });

test('should display "google" text on page', async () => {
  await page.goto('file:///src/tests/index.html');
  // await page.goto(`file:/${__dirname}/index.html`);
  const image = await page.screenshot({ fullPage: true });
  expect(image).toMatchImageSnapshot();
  await browser.close();
});


// const playwright = require('playwright');

// (async () => {
//   const browser = await playwright.chromium.launch();
//   const context = await browser.newContext();
//   const page = await context.newPage();
//   page.on('console', msg => {
//     for (let i = 0; i < msg.args().length; ++i)
//         console.log(`${i}: ${msg.args()[i]}`);
//   });
//   await page.goto('file:///src/tests/index.html');
//   page.on('console', msg => {
//   for (let i = 0; i < msg.args().length; ++i)
//       console.log(`${i}: ${msg.args()[i]}`);
//   });
//   // await page.goto('https://thisiget-test.herokuapp.com/content/Math/Geometry_1/Angle/explanation/base?page=1');
//   await page.screenshot({ path: `example-${1}.png`, fullPage: true });
//   await browser.close();
// })();
