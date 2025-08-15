import { Channel, subscribe, unsubscribe } from "./event.mjs";
var ManagedType = /* @__PURE__ */ ((ManagedType2) => {
  ManagedType2[ManagedType2["Update"] = 1] = "Update";
  ManagedType2[ManagedType2["AutoDestroy"] = 2] = "AutoDestroy";
  ManagedType2[ManagedType2["UpdateAndAutoDestroy"] = 3] = "UpdateAndAutoDestroy";
  return ManagedType2;
})(ManagedType || {});
class ObjectBase {
  // for debug purpose
  constructor(name) {
    this.name = name;
  }
  destruct() {
    this.unsubscribeAll();
    this.onDestruct();
    this.destroyManagedObjects();
    this.clearAllTimers();
  }
  destroyManagedObject(obj) {
    if (this.managedObjects == void 0 || obj == void 0) {
      return;
    }
    for (let i = 0; i < this.managedObjects.length; i++) {
      let info = this.managedObjects[i];
      if (info.ManageObject == obj) {
        DEL(obj);
        this.managedObjects.splice(i, 1);
        break;
      }
    }
  }
  destroyManagedObjects() {
    if (this.managedObjects == void 0) {
      return;
    }
    for (let i = this.managedObjects.length - 1; i >= 0; i--) {
      let info = this.managedObjects[i];
      if ((info.ManagedType & 2 /* AutoDestroy */) == 2 /* AutoDestroy */) {
        DEL(info.ManageObject);
      }
    }
    this.managedObjects = void 0;
  }
  // managedObject.update is driven by host object
  managedObjectUpdate(dt) {
    if (!this.managedObjects) return;
    const update = 1 /* Update */;
    for (let i = 0; i < this.managedObjects.length; i++) {
      let obj = this.managedObjects[i];
      if ((obj.ManagedType & update) == update) {
        let managedObject = obj.ManageObject;
        let update2 = managedObject["update"];
        if (update2) update2.call(managedObject, dt);
      }
    }
  }
  /*
  managedAlloc<T extends new (...args: any) => any>
  (
      ctor: T,   ...args: ConstructorParameters<T>
  ): InstanceType<T>
  {
      let ret = new ctor( ...args)
      this.manage(ret, ManagedType.AutoDestroy)
      return ret
  }
  */
  manage(obj, managedType = 2 /* AutoDestroy */) {
    if (!isValid(obj)) return;
    if ((managedType & 1 /* Update */) == 1 /* Update */ && (this["update"] == void 0 || obj["update"] == void 0)) {
      SC.Debugger.error("update not supported by this object");
      return;
    }
    if (this.managedObjects == void 0) {
      this.managedObjects = [];
    }
    for (let i = 0; i < this.managedObjects.length; i++) {
      if (this.managedObjects[i].ManageObject == obj) {
        this.managedObjects[i].ManagedType |= managedType;
        return;
      }
    }
    this.managedObjects.push({ ManageObject: obj, ManagedType: managedType });
  }
  subscribe(type, handler, channel = Channel.Default) {
    if (this.eventInfos == void 0) {
      this.eventInfos = [];
    }
    let subscribeChannel = channel;
    let info = this.eventInfos.find((info2) => info2.type == type && info2.handler == handler);
    if (info != void 0) {
      if ((info.channel & channel) == channel) {
        SC.Debugger.error("event info already exist");
        return;
      }
      subscribeChannel = channel & ~info.channel;
      info.channel |= channel;
    } else {
      subscribeChannel = channel;
      info = { type, handler, channel: subscribeChannel };
      this.eventInfos.push(info);
    }
    if (info.realHandler == void 0) {
      info.realHandler = handler.bind(this);
    }
    subscribe(type, info.realHandler, subscribeChannel);
  }
  unsubscribe(type, handler, channel = Channel.Default) {
    if (this.eventInfos == void 0) {
      return;
    }
    let info = this.eventInfos.find((info2) => info2.type == type && info2.handler == handler);
    if (info != void 0) {
      unsubscribe(type, info.realHandler, channel);
      if ((info.channel & channel) == info.channel) {
        this.eventInfos = this.eventInfos.filter((info2) => !(info2.type == type && info2.handler == handler));
        return;
      }
      info.channel &= ~channel;
      return;
    }
  }
  unsubscribeAll() {
    if (this.eventInfos == void 0) {
      return;
    }
    for (let info of this.eventInfos) {
      unsubscribe(info.type, info.realHandler, info.channel);
    }
    this.eventInfos = [];
  }
  /**
   * delay a callback
   * @param callback
   * @param delay in ms
   * @param args
   */
  delay(callback, delay, ...args) {
    if (this.timers == void 0) {
      this.timers = [];
    }
    let timer = setTimeout(callback.bind(this), delay, ...args);
    this.timers.push(timer);
    return timer;
  }
  /**
   * tick a callback repeatedly
   * @param callback
   * @param interval in ms
   * @param args
   */
  tick(callback, interval, ...args) {
    if (this.timers == void 0) {
      this.timers = [];
    }
    let timer = setInterval(callback.bind(this), interval, ...args);
    this.timers.push(timer);
    return timer;
  }
  /**
   * clear a timer
   * @param timer timer id returned by delay or tick function.
   */
  clearTimer(timer) {
    if (timer == void 0) return;
    if (!this.timers) {
      return;
    }
    this.timers = this.timers.filter((t) => t != timer);
    clearTimeout(timer);
  }
  clearAllTimers() {
    if (!this.timers) {
      return;
    }
    for (let timer of this.timers) {
      clearTimeout(timer);
    }
    this.timers = null;
  }
  //#endregion timer
}
export {
  ManagedType,
  ObjectBase
};
//# sourceMappingURL=ObjectBase.mjs.map
