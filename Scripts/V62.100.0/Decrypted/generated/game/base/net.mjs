function sendMessage(msg) {
  SC.MessageManager.getInstance().sendMessage(msg);
}
function onReceive(type, msg) {
  console.log("onReceive", type, " ", msg.getMessageType());
}
function register(msgID, handler) {
}
function unregister(msgID, handler) {
}
export {
  onReceive,
  register,
  sendMessage,
  unregister
};
//# sourceMappingURL=net.mjs.map
