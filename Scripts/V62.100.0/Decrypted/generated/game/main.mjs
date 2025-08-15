import "./binding-patch/define.mjs";
import "./binding-patch/define_manual.mjs";
import { subscribe } from "./base/event.mjs";
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
function enterHome() {
  regModules();
  console.log("_TS_ enterHome");
}
function gameInit() {
  regCppPopups();
  console.log("_TS_ gameInit");
  subscribe("cpp_home_mode_enter", function() {
    enterHome();
  });
}
function update(delta) {
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
  enterHome,
  gameInit,
  update
};
//# sourceMappingURL=main.mjs.map
