let reqCounter = 1;

export default class Framesg {
  constructor(otherFrame, FMNamespace, handlers={}) {
    this.other = otherFrame;
    if (typeof FMNamespace === 'object') {
      this.receiveNamespace = FMNamespace.receive;
      this.sendNamespace = FMNamespace.send;
    } else {
      this.receiveNamespace = new RegExp(`^${FMNamespace}$`);
      this.sendNamespace = FMNamespace;
    }
    this.handlers = Object.assign({}, handlers);
    this._pending = {};

    window.addEventListener('message', msg => {
      // parse msg
      const {
        fRequestID, fResponseID,
        namespace, msgType, args,
        result, success, error
      } = msg.data;

      // only handle msgs for this channel
      if (typeof namespace === 'string' && namespace.match(this.receiveNamespace)) {

        if (fRequestID) {

          // handle request from other frame

          const handler = this.handlers[msgType];
          if (handler) {
            const handlerResult = handler(...args);
            if (handlerResult && handlerResult.then && handlerResult.catch) {
              // it quacks like a Promise
              handlerResult
                .then(promiseResult => this.respond(fRequestID, {result: promiseResult}))
                .catch(promiseError => this.reject(fRequestID, {error: promiseError}));
            } else {
              // regular value, respond immediately
              this.respond(fRequestID, {result: handlerResult, success: true});
            }
          }

        } else if (fResponseID) {

          // handle response to a previous request from this frame

          const pending = this._pending[fResponseID];
          if (pending) {
            if (success) {
              pending.resolve(result);
            } else {
              pending.reject(error);
            }
            delete this._pending[fResponseID];
          } else {
            console.error(`Received framesg response to non-existent request ${fResponseID}`);
          }

        }
      }
    });
  }

  addHandler(msgType, handler) {
    this.handlers[msgType] = handler;
  }

  // send error response to request from other frame
  reject(fRequestID, attrs={}) {
    this.respond(fRequestID, Object.assign({success: false}, attrs));
  }

  // send response to request from other frame
  respond(fRequestID, attrs={}) {
    this.other.postMessage(Object.assign({
      fResponseID: fRequestID,
      namespace: this.sendNamespace,
      success: true,
    }, attrs), '*');
  }

  // send request to other frame
  send(msgType) {
    const fRequestID = reqCounter++;
    const pending = new Promise((resolve, reject) => {
      this._pending[fRequestID] = {resolve, reject};
    });

    this.other.postMessage({
      fRequestID,
      msgType,
      namespace: this.sendNamespace,
      args: Array.prototype.slice.call(arguments, 1),
    }, '*');

    return pending;
  }
}
