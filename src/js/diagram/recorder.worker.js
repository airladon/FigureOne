// @flow

addEventListener("message", event => {
  // const [a, b] = event;
  // console.log('in worker')
  // // Do stuff with the message
  // postMessage(a + b);
  console.log('worker', event);
  postMessage('from Worker!!')
});