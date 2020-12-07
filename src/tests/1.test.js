// import { toMatchImageSnapshot } from 'jest-image-snapshot';
const { toMatchImageSnapshot } = require('jest-image-snapshot');

expect.extend({ toMatchImageSnapshot });

// beforeAll(async () => {
//   await page.goto('https://whatismybrowser.com/')
// })

// const fullPath = module.parent.filename.split('/').slice(0, -1).join('/');
console.log(__dirname);

test('should display "google" text on page', async () => {
  await page.goto('file:///src/tests/index.html');
  // const browser = await page.$eval('.string-major', (el) => el.innerHTML)
  // expect(browser).toContain('Chrome')
  // await page.screenshot({ path: `example-${1}.png`, fullPage: true });
  const image = await page.screenshot({ fullPage: true });
  expect(image).toMatchImageSnapshot({
    // customSnapshotIdentifier: fileName,
  });
  await browser.close();
  // assert(false)
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
