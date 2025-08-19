function runCommandGM(debugActionCommand, numParam, strParam) {
  strParam = strParam || "";
  const tempButton = new SC.DebugCommandButton(debugActionCommand, numParam, strParam);
  tempButton.buttonPressed();
}
async function runGM(buttonText) {
  let debugMenu = SC.LaserDebug.getDebugMenu();
  if (!debugMenu) return;
  let button = SC.DebugMenu.prototype.findDebugButton.call(debugMenu, buttonText);
  if (!button) {
    console.warn("runGM failed, button not found: ", buttonText);
    return;
  }
  button.buttonPressed();
}
export {
  runCommandGM,
  runGM
};
//# sourceMappingURL=debug-util.mjs.map
