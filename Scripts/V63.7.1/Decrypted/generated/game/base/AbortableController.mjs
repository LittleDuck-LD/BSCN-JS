class AbortableController {
  constructor() {
    this.signal = new AbortableSignal();
  }
  abort(reason) {
    this.signal.abort(reason);
  }
  get isAborted() {
    return this.signal.aborted;
  }
}
class AbortableSignal {
  constructor() {
    this.aborted = false;
    this.reason = "";
    this.listeners = [];
  }
  addEventListener(type, callback) {
    if (this.aborted) {
      callback();
    }
    if (type === "abort") {
      this.listeners.push(callback);
    }
  }
  abort(reason) {
    if (this.aborted) return;
    this.aborted = true;
    this.reason = reason;
    this.listeners.forEach((cb) => cb());
  }
}
export {
  AbortableController,
  AbortableSignal
};
//# sourceMappingURL=AbortableController.mjs.map
