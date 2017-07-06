import Framesg from '../lib';

const child = new Framesg(window.parent, 'example-app', {
  ping: msg => console.log(`message from parent: ${msg}`),
});

console.log(`Hello from child`);
