# framesg

Talk to iframes sanely. Framesg manages request/response cycles on top of `window.postMessage` with ES2015 Promises.

## Installation

Install via `npm`, for packaging with a bundler such as `Webpack` or `Browserify`:

    npm install --save framesg

If your target environment does not supply `Promise` natively, provide it with any A+\-compliant implementation such as [Bluebird](http://bluebirdjs.com/).

## Usage

Register handlers with a target window, e.g., the parent of the current iframe:
```javascript
import Framesg from 'framesg';
const parentFrame = new Framesg(window.parent, 'my-app', {

  sayHello: username => alert(`Hello ${username}!`),

  getUserInfo: userID => userInfo[userID], // response to caller

});
```
The first argument is the window/iframe to communicate with (typically `window.parent` within an iframe, and `iframeEl.contentWindow` within a parent where `iframeEl` is the iframe's DOM element). The second argument (`'my-app'` in the example above) is a user-supplied namespace. The third argument is an object mapping endpoint names to handler functions.

Send a message to another frame:
```javascript
parentFrame.send('getWidgetInfo', widgetID)
  .then(widgetInfo => console.log(widgetInfo))
  .catch(err => console.error(`Error getting widget info: ${err}`));
```
`send` returns a promise, which is resolved with the response value from the other frame.

If a handler returns a promise rather than an immediate value, the response message is only sent to the other frame when the promise is resolved or rejected, which is useful for asynchronous actions:
```javascript
const childFrame = new Framesg(iframeEl.contentWindow, 'my-app', {

  fetchWombatInfo: wombatID => new Promise((resolve, reject) =>
    makeLegacyWombatApiCall(
      function success(wombatInfo) { resolve(wombatInfo); },
      function error(errorMsg) { reject(errorMsg); }
    )
  ),

});
```

More handlers can be added after initialization:
```javascript
parentFrame.addHandler('marco', () => 'polo');
```

## License

MIT
