import mitt from "../lib/mitt.mjs";
let emitter = mitt();
var Channel = /* @__PURE__ */ ((Channel2) => {
  Channel2[Channel2["Script"] = 1] = "Script";
  Channel2[Channel2["Cpp"] = 2] = "Cpp";
  Channel2[Channel2["Default"] = 3] = "Default";
  return Channel2;
})(Channel || {});
function send(type, evt, channel = 3 /* Default */) {
  if ((channel & 1 /* Script */) == 1 /* Script */) emitter.emit(type, evt);
  if ((channel & 2 /* Cpp */) == 2 /* Cpp */) SC.ScriptEventBridge.eventFromScript(type, evt);
}
function subscribe(type, handler, channel = 3 /* Default */) {
  if ((channel & 1 /* Script */) == 1 /* Script */) emitter.on(type, handler);
  if ((channel & 2 /* Cpp */) == 2 /* Cpp */) SC.ScriptEventBridge.subscribe(type);
}
function unsubscribe(type, handler, channel = 3 /* Default */) {
  if ((channel & 1 /* Script */) == 1 /* Script */) emitter.off(type, handler);
  if ((channel & 2 /* Cpp */) == 2 /* Cpp */) SC.ScriptEventBridge.unsubscribe(type);
}
export {
  Channel,
  send,
  subscribe,
  unsubscribe
};
//# sourceMappingURL=EventDispatcher.mjs.map
