const GameScriptFodler = "javascript/generated/game/";
async function regCppPopups() {
  let ret = await tsImport(GameScriptFodler + "ui/cpp_popups.mjs");
  if (!ret.CppPopups || ret.CppPopups.length == 0) return;
  for (const reg of ret.CppPopups) {
    SC.UIScripting.getInstance().regPopupHook(reg.Type, reg.Script);
  }
}
async function regModules() {
  let ret = await tsImport(GameScriptFodler + "module/modules.mjs");
  globalThis.m = new ret.Modules();
}
function onEnterHome() {
  regModules();
  console.log("_TS_ enterHome");
}
let send;
let deleyActions = [
  () => {
    tsImport(GameScriptFodler + "binding-patch/define.mjs");
  },
  () => {
    tsImport(GameScriptFodler + "binding-patch/define_manual.mjs");
  },
  regCppPopups,
  async () => {
    let ret = await tsImport(GameScriptFodler + "base/event.mjs");
    send = ret.send;
    console.log("_TS_ regEnterHome");
    ret.subscribe("cpp_home_mode_enter", function() {
      onEnterHome();
    });
  }
];
let currentAction = -1;
let doDelayAction = function() {
  if (currentAction < 0) {
    currentAction++;
    return;
  }
  if (currentAction >= 0 && currentAction < deleyActions.length) {
    try {
      deleyActions[currentAction]();
    } catch (e) {
      console.error(e);
    }
    currentAction++;
    return;
  }
  currentAction = null;
};
function gameInit() {
  console.log("_TS_ gameInit");
}
function update(delta) {
  if (currentAction != null) doDelayAction();
  if (send) send("update", delta, 1);
}
let useLocalTest = true;
function getTestFilePath(forceReload, forceCloundTest = false) {
  let path = forceReload ? `test-bundle.mjs?_=${Date.now()}` : "test-bundle.mjs";
  if (SC.GameTSUtilExt.testCDNPath && forceCloundTest) return SC.GameTSUtilExt.testCDNPath() + path;
  if (PuerhInspector && PuerhInspector.hasClient && PuerhInspector.hasClient("##Puerh_host##")) {
    return "devtool://contents/" + path;
  }
  if (useLocalTest && SC.LogicDefines.isPlatformDesktop()) {
    return "testlocal://contents/" + path;
  }
  return path;
}
globalThis.automaticTests = globalThis.runUT = async function(options, cloundTest = false) {
  try {
    let path = getTestFilePath(false, cloundTest);
    console.log("Test path:" + path);
    const utModule = await tsImport(path);
    utModule.run(options);
  } catch (e) {
    console.error(e);
    throw e;
  }
};
globalThis.initTests = async function() {
  try {
    let path = getTestFilePath(true);
    console.log("Test path:" + path);
    const utModule = await tsImport(path);
    utModule.init();
  } catch (e) {
    console.error(e);
    throw e;
  }
};
export {
  gameInit,
  update
};
//# sourceMappingURL=main.mjs.map
