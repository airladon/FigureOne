const playwright = require('playwright');

(async () => {
  const browser = await playwright.webkit.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto('./index.html');
  await page.screenshot({ path: `example-${1}.png` });
  await browser.close();
})();
