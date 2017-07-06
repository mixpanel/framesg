import Framesg from '../lib';

const childEl = document.querySelector('#child-frame');
const child = new Framesg(childEl.contentWindow, 'example-app', {
  ping: msg => console.log(`message from child: ${msg}`),
});

console.log(`Hello from parent`);
