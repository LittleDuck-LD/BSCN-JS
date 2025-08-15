async function waitSeconds(sec) {
  return await new Promise((resolve) => setTimeout(resolve, sec * 1e3));
}
async function waitFrame() {
  return await new Promise((resolve) => setTimeout(resolve, 10));
}
async function waitUntil(conditionFunc, interval, timeout) {
  interval = interval || 333;
  timeout = timeout || 6e4;
  return new Promise(async (resolve, reject) => {
    const startTime = Date.now();
    const check = async () => {
      try {
        if (Date.now() - startTime > timeout) {
          reject(new Error("Polling timeout"));
          return;
        }
        const result = await conditionFunc();
        if (result) {
          resolve();
        } else {
          setTimeout(check, interval);
        }
      } catch (error) {
        reject(error);
      }
    };
    check();
  });
}
async function waitPopup(type, interval, timeout) {
  return await waitUntil(() => SC.GUIUtils.isPopupShow(type), interval, timeout);
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
  waitFrame,
  waitPopup,
  waitSeconds,
  waitUntil
};
//# sourceMappingURL=util.mjs.map
