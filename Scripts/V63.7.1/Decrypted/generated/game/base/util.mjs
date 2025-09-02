import { subscribe, unsubscribe } from "./event.mjs";
async function waitSeconds(sec, signal) {
  return await new Promise(async (resolve, reject) => {
    if (signal && signal.aborted) {
      reject(signal.reason);
      return;
    }
    let timerId = setTimeout(resolve, sec * 1e3);
    if (signal) {
      signal.addEventListener("abort", () => {
        clearTimeout(timerId);
        reject(signal.reason);
      });
    }
  });
}
async function waitUntil(conditionFunc, timeout, signal, interval) {
  interval = interval || 333;
  timeout = timeout || 6e5;
  return new Promise(async (resolve, reject) => {
    if (signal && signal.aborted) {
      reject(signal.reason);
      return;
    }
    const startTime = Date.now();
    let timeoutId;
    const check = async () => {
      try {
        if (signal && signal.aborted) {
          reject(signal.reason);
          return;
        }
        if (Date.now() - startTime > timeout) {
          if (signal && !signal.aborted) {
            signal.abort("Polling timeout");
            return;
          } else {
            reject("Polling timeout");
            return;
          }
        }
        const result = await conditionFunc();
        if (result) {
          resolve();
        } else {
          timeoutId = setTimeout(check, interval);
        }
      } catch (error) {
        reject(error);
      }
    };
    check();
    if (signal) {
      signal.addEventListener("abort", () => {
        if (timeoutId) clearTimeout(timeoutId);
        reject(signal.reason);
      });
    }
  });
}
async function waitEvent(evt, timeout, signal) {
  return new Promise(async (resolve, reject) => {
    if (signal && signal.aborted) {
      reject(signal.reason);
      return;
    }
    let onEvent;
    let timeoutId;
    let clear = () => {
      if (onEvent) {
        unsubscribe(evt, onEvent);
        onEvent = null;
      }
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = 0;
      }
    };
    onEvent = (event) => {
      clear();
      resolve(event);
    };
    subscribe(evt, onEvent);
    if (timeout) {
      timeoutId = setTimeout(() => {
        clear();
        if (signal && !signal.aborted) {
          signal.abort(`wait ${evt} timeout`);
        } else {
          reject(`wait ${evt} timeout`);
        }
      }, timeout);
    }
    if (signal) {
      signal.addEventListener("abort", () => {
        clear();
        reject(signal.reason);
      });
    }
  });
}
async function waitFrame(frames = 1, signal) {
  return new Promise(async (resolve, reject) => {
    if (signal && signal.aborted) {
      reject(signal.reason);
      return;
    }
    const startTime = Date.now();
    let frameToWait = frames <= 0 ? 1 : frames;
    let onEvent;
    let clear = () => {
      if (onEvent) {
        unsubscribe("update", onEvent);
        onEvent = null;
      }
    };
    onEvent = (event) => {
      frameToWait--;
      if (frameToWait > 0) return;
      clear();
      resolve(Date.now() - startTime);
    };
    subscribe("update", onEvent);
    if (signal) {
      signal.addEventListener("abort", () => {
        clear();
        reject(signal.reason);
      });
    }
  });
}
async function waitPopup(type, timeout, signal, interval) {
  return await waitUntil(() => SC.GUIUtils.isPopupShow(type), timeout, signal, interval);
}
function addCommand(ctor, ...args) {
  let cmd = allocWithoutGC(ctor, ...args);
  SC.HomeMode.getInstance().addCommand(cmd);
  return cmd;
}
function hasCmdParam(cmd) {
  if (typeof globalThis.CmdParam === "undefined") return false;
  return globalThis.CmdParam[cmd];
}
function getString(mayBeTIDString) {
  if (!mayBeTIDString) return "";
  if (mayBeTIDString.startsWith("TID_")) return SC.StringTable.getString(mayBeTIDString);
  return mayBeTIDString;
}
export {
  addCommand,
  getString,
  hasCmdParam,
  waitEvent,
  waitFrame,
  waitPopup,
  waitSeconds,
  waitUntil
};
//# sourceMappingURL=util.mjs.map
