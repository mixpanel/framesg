let reqCounter = 1;

export default class Framesg {
  constructor(otherFrame, namespace, handlers={}) {
    this.other = otherFrame;
    this.namespace = namespace;
    this.handlers = Object.assign({}, handlers);
    this._pending = {};

    window.addEventListener('message', msg => {
      const {fRequestID, fResponseID, namespace, msgType, args, result} = msg.data;
      if (namespace === this.namespace) {
        if (fRequestID) {
          const handler = this.handlers[msgType];
          if (handler) {
            const handlerResult = handler(...args);
            if (typeof handlerResult !== 'undefined') {
              this.other.postMessage({
                fResponseID: fRequestID,
                msgType,
                namespace: this.namespace,
                result: handlerResult,
              }, '*');
            }
          }
        } else if (fResponseID) {
          // TODO resolve
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
