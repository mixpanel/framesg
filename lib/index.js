let reqCounter = 1;

export default class Framesg {
  constructor(otherFrame, namespace, handlers={}) {
    this.other = otherFrame;
    this.namespace = namespace;
    this.handlers = Object.assign({}, handlers);
    this._pending = {};

    window.addEventListener('message', msg => {
      const {fRequestID, fResponseID, namespace, msgType, args, result, success, error} = msg.data;
      if (namespace === this.namespace) {
        if (fRequestID) {
          const handler = this.handlers[msgType];
          if (handler) {
            const handlerResult = handler(...args);
            if (handlerResult && handlerResult.then && handlerResult.catch) {
              // it quacks like a Promise
              handlerResult
                .then(promiseResult => this.other.postMessage({
                  fResponseID: fRequestID,
                  msgType,
                  namespace: this.namespace,
                  result: promiseResult,
                  success: true,
                }, '*'))
                .catch(promiseError => this.other.postMessage({
                  error: promiseError,
                  fResponseID: fRequestID,
                  msgType,
                  namespace: this.namespace,
                  success: false,
                }, '*'));
            } else {
              // regular value, respond immediately
              this.other.postMessage({
                fResponseID: fRequestID,
                msgType,
                namespace: this.namespace,
                result: handlerResult,
                success: true,
              }, '*');
            }
          }
        } else if (fResponseID) {
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

  send(msgType) {
    const fRequestID = reqCounter++;
    const pending = new Promise((resolve, reject) => {
      this._pending[fRequestID] = {resolve, reject};
    });

    this.other.postMessage({
      fRequestID,
      msgType,
      namespace: this.namespace,
      args: Array.prototype.slice.call(arguments, 1),
    }, '*');

    return pending;
  }
}
