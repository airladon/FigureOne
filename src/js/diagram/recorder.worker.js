// @flow

addEventListener("message", (event) => {
  console.log('worker', event.data);
  // postMessage(`From Worker: ${event.data[0] + 2 * event.data[1]}`)
});