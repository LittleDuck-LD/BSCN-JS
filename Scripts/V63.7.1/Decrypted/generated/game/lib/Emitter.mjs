class Emitter {
  constructor(all) {
    this.all = all ?? /* @__PURE__ */ new Map();
  }
  /**
   * Register an event handler for the given type.
   * @param type Type of event to register handler for
   * @param handler Handler function to be called when event is emitted
   */
  on(type, handler) {
    const handlers = this.all.get(type);
    if (handlers) {
      handlers.push(handler);
    } else {
      this.all.set(type, [handler]);
    }
  }
  /**
   * Remove an event handler for the given type.
   * @param type Type of event to remove handler for
   * @param handler Specific handler function to remove, if not provided, all handlers will be removed
   */
  off(type, handler) {
    const handlers = this.all.get(type);
    if (handlers) {
      if (handler) {
        let index = handlers.indexOf(handler);
        if (index > -1) {
          handlers.splice(index, 1);
        }
      } else {
        this.all.set(type, []);
      }
    }
  }
  /**
   * Call all event handlers for the given type.
   * @param type Type of event to emit
   * @param evtData Event data to pass to handlers
   */
  emit(type, evtData) {
    let handlers = this.all.get(type);
    if (handlers && handlers.length > 0) {
      let handlersCopy = handlers.slice();
      for (const handler of handlersCopy) {
        try {
          handler(evtData);
        } catch (error) {
          handleException(error);
        }
      }
    }
  }
}
export {
  Emitter
};
//# sourceMappingURL=Emitter.mjs.map
