import "./binding-patch/define.mjs";
import "./binding-patch/define_manual.mjs";
import "./binding-patch/define_debug.mjs";
import { CppPopupModules } from "./ui/cpp_popups.mjs";
let useLocalTest = true;
function getSelectorForDisplayObject(d) {
  if (!d) return "";
  const rPathWithoutClassName = [];
  const rPathWithClassName = [];
  const GameRoot = SC.Stage.getInstance().getMainSprite();
  let temp = d;
  while (temp != GameRoot) {
    const exportName = SC.GameTSUtil.getDisplayObjectExportName(temp);
    const instanceName = SC.GameTSUtil.getDisplayObjectInstanceName(temp);
    if (instanceName) {
      rPathWithClassName.push("#" + instanceName);
      rPathWithoutClassName.push("#" + instanceName);
    } else if (exportName) {
      rPathWithClassName.push("." + exportName);
      rPathWithoutClassName.push("." + exportName);
    } else {
      const className = SC.GameTSUtil.getDisplayObjectClassName(temp);
      rPathWithClassName.push(className);
      if (temp == d) rPathWithoutClassName.push(className);
    }
    temp = temp.getParent();
  }
  if (rPathWithoutClassName.length) {
    return rPathWithoutClassName.reverse().join(" ");
  } else {
    return rPathWithClassName.reverse().join(">");
  }
}
function regCppModules() {
  if (CppPopupModules.size == 0) return;
  let uiScripting = SC.UIScripting.getInstance();
  for (const [popup, moduleName] of CppPopupModules) {
    uiScripting.regPopupHook(popup, moduleName);
  }
}
function gameInit() {
  regCppModules();
}
function update(delta) {
}
function getTestFilePath(forceReload, forceCloundTest = false) {
  let path = forceReload ? `test-bundle.mjs?_=${Date.now()}` : "test-bundle.mjs";
  console.log("Get test file path:" + path);
  if (!PuerhInspector || !PuerhInspector.hasClient || !PuerhInspector.hasClient("##Puerh_host##")) {
    console.log("Get test file path: !PuerhInspector.hasClient");
    if (SC.GameTSUtil.testCDNPath && forceCloundTest) return SC.GameTSUtil.testCDNPath() + path;
    if (useLocalTest && SC.LogicDefines.isPlatformDesktop()) {
      return "testlocal://contents/" + path;
    }
    console.log(`Get test file path: forceCloundTest ${forceCloundTest}`);
    if (SC.GameTSUtil.testCDNPath) return SC.GameTSUtil.testCDNPath() + path;
  }
  return "devtool://contents/" + path;
}
globalThis.automaticTests = globalThis.runUT = async function(options, cloundTest = false) {
  try {
    let path = getTestFilePath(false, cloundTest);
    console.log("Test path:" + path);
    const utModule = await import(path);
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
    const utModule = await import(path);
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
