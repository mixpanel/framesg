import Framesg from '../lib';

const childEl = document.querySelector('#child-frame');
const child = new Framesg(childEl.contentWindow, 'example-app', {
  ping: msg => console.log(`message from child: ${msg}`),
});

const childMsgButton = document.querySelector('#child-msg-button');
childMsgButton.addEventListener('click', () => {
  child.send('ping', 'moo');
});

console.log(`Hello from parent`);
