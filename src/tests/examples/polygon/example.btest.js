/* global page figure */
/* eslint-disable jest/no-export, no-await-in-loop */
// eslint-disable-next-line import/no-unresolved
const { toMatchImageSnapshot } = require('jest-image-snapshot');
const { steps } = require('./steps.js');

expect.extend({ toMatchImageSnapshot });

const messages = [];
page.on('console', (msg) => {
  for (let i = 0; i < msg.args().length; i += 1) {
    const result = `${msg.args()[i]}`;
    messages.push(result);
    console.log(result)
  }
});

function zeroPad(num, places) {
  var zero = places - num.toString().length + 1;
  return Array(+(zero > 0 && zero)).join("0") + num;
}

let index = 0;
function testBrowser(title, file, stepsIn) {
  jest.setTimeout(60000);

  // function delay(time) {
  //   return new Promise(function(resolve) {
  //       setTimeout(resolve, time)
  //   });
  // }
  const tests = [];
  let lastTime = 0;
  stepsIn.forEach((step) => {
    let test;
    let time;
    let action;
    let location;
    let description;
    if (Array.isArray(step)) {
      [time, action, location, description] = step;
    } else {
      time = step;
    }
    const delta = time - lastTime;
    test = [
      time,
      description || '',
      delta,
      action || null,
      location || [],
    ];
    // if (test.length === 2) {
    //   test.push('');
    //   test.push([]);
    // } else if (test.length === 3) {
    //   test.push([]);
    // }
    // const currentTime = test[0];
    // const delta = currentTime - lastTime;
    // test[0] = delta;
    lastTime = time;
    tests.push(test);
  });

  describe(title, () => {
    beforeAll(async () => {
      await page.setViewportSize({ width: 800, height: 600 });
      await page.goto(file);
      // image = await page.screenshot({ fullPage: true });
      // expect(image).toMatchImageSnapshot();
      await page.evaluate(() => {
        clearTimeout(timeoutId);
        figure.globalAnimation.setManualFrames();
        figure.globalAnimation.frame(0);
      });
    });
    test.each(tests)('%i %s',
    async (time, description, deltaTime, action, location) => {
      await page.evaluate(([delta, t, l]) => {
        figure.globalAnimation.frame(delta)
        // console.log(figure.globalAnimation.getWhen('now'))
        if (t != null) {
          const loc = Fig.tools.g2.getPoint(l || [0, 0]);
          figure[t](loc);
          // figure.globalAnimation.frame(0)
        }
        // console.log(figure.elements._highlightRect.state.pulse.startTime, figure.elements._highlightRect.lastDrawTime)
      }, [deltaTime, action, location]);
      image = await page.screenshot({ fullPage: true });
      expect(image).toMatchImageSnapshot({
        // customSnapshotIdentifier: `${zeroPad(index, 3)}-${time}-${description}`,
        customSnapshotIdentifier: `${zeroPad(time * 1000, 4)}-${description}`,
      });
      index += 1;
    });
  });
}

console.log(`file:/${__dirname}/example.html`)
testBrowser('Example 1', `file:/${__dirname}/example.html`, steps);

//   test(title, async () => {
//     let image;
//     await page.goto(file);
//     await page.evaluate(() => {
//       clearTimeout(timeoutId);
//       figure.globalAnimation.setManualFrames();
//       figure.globalAnimation.frame(0);
//       startUpdates();
//     });

//     for (let i = 0; i <= duration; i += step) {
//       await page.evaluate(
//         ([s]) => figure.globalAnimation.frame(s), [i === 0 ? 0 : step],
//       );
//       // delay(100);
//       image = await page.screenshot({ fullPage: true });
//       expect(image).toMatchImageSnapshot();
//     }
//   });
// }

// test(title, async () => {
//     await page.goto(file);
//     await page.evaluate(() => {
//       clearTimeout(timeoutId);
//     });
//     while (remainingHeight > 0) {
//       const image = await page.screenshot({
//         fullPage: true,
//       });
//       y += height;
//       remainingHeight -= height;
//       expect(image).toMatchImageSnapshot();
//     }
//     expect(messages).toEqual([]);
// }
// function browserStaticTester(title, file) {
//   jest.setTimeout(60000);
//   test(title, async () => {
//     await page.goto(file);
//     const dimensions = await page.evaluate(() => ({
//       width: document.documentElement.scrollWidth,
//       height: document.documentElement.scrollHeight,
//     }));
//     await page.setViewportSize({ width: dimensions.width, height: 1000 });
//     let remainingHeight = dimensions.height;
//     let y = 0;
//     while (remainingHeight > 0) {
//       await page.evaluate((scrollY) => {
//         window.scroll(0, scrollY);
//       }, [y]);
//       const height = Math.min(remainingHeight, 1000);
//       const clipY = Math.max(0, 1000 - (dimensions.height - y));
//       const image = await page.screenshot({
//         // fullPage: true,
//         clip: {
//           x: 0,
//           y: clipY,
//           width: dimensions.width,
//           height: 1000,
//         },
//       });
//       y += height;
//       remainingHeight -= height;
//       expect(image).toMatchImageSnapshot();
//     }
//     expect(messages).toEqual([]);
//   });
// }

// module.exports = {
//   browserStaticTester,
// };
