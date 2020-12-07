const playwright = require('playwright');

(async () => {
  const browser = await playwright.chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  page.on('console', msg => {
    for (let i = 0; i < msg.args().length; ++i)
        console.log(`${i}: ${msg.args()[i]}`);
  });
  await page.goto('file:///src/tests/index.html');
  page.on('console', msg => {
  for (let i = 0; i < msg.args().length; ++i)
      console.log(`${i}: ${msg.args()[i]}`);
  });
  // await page.goto('https://thisiget-test.herokuapp.com/content/Math/Geometry_1/Angle/explanation/base?page=1');
  await page.screenshot({ path: `example-${1}.png`, fullPage: true });
  await browser.close();
})();
