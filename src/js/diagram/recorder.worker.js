// @flow

addEventListener("message", (event) => {
  // const [a, b] = event;
  // console.log('in worker')
  // // Do stuff with the message
  // postMessage(a + b);
  console.log('worker', event.data);
  postMessage(`From Worker: ${event.data[0] + 2 * event.data[1]}`)
});