import { getPopupSprite, getPopupSprites, getSprite, getSprites, getText } from "../base/gui.mjs";
import { Channel, send } from "../base/EventDispatcher.mjs";
function initDebugMenuK2(debugMenu) {
  console.log("DebugMenu init in typescript");
  debugMenu.addButton("TypeScript", "K2Perf", 0, () => {
    console.log("Hello from typescript log");
    SC.GUI.getInstance().hudPrint("Hello from typescript", false, false, false);
  }, 0);
  console.log("DebugMenu init in typescript");
  debugMenu.addButton("hero collection", "K2Perf", 0, () => {
    console.log("Hello from typescript log");
    let result = getPopupSprites(SC.PopupBase.PopupType.HERO_LIST_POPUP, "hero_list/*/brawler_list");
    console.log("hero_list/*/brawler_list: NUM" + result.length);
    for (let i = 0; i < result.length; i++) {
      console.log("HeroList: " + SC.TitanUtil.getAddrStr(result[i]));
    }
  }, 0);
  debugMenu.addButton("ts event bool", "K2Perf", 0, () => {
    send("test_bool", true);
  }, 0);
  debugMenu.addButton("ts event int", "K2Perf", 0, () => {
    send("test_number_int", 123);
  }, 0);
  debugMenu.addButton("ts event float", "K2Perf", 0, () => {
    send("test_number_float", 123.456);
  }, 0);
  debugMenu.addButton("ts event string", "K2Perf", 0, () => {
    send("test_string", "Hello from typescript");
  }, 0);
  debugMenu.addButton("ts event CommoneEventData script", "K2Perf", 0, () => {
    let data = new SC.CommonEventData();
    data.setStr(1, "Hello from typescript script only");
    data.setInt(0, 99);
    send("test_common_event", data, Channel.Script);
  }, 0);
  debugMenu.addButton("ts event CommoneEventData cpp", "K2Perf", 0, () => {
    let data = new SC.CommonEventData();
    data.setStr(1, "Hello from typescript cpponly");
    data.setInt(0, 99);
    send("test_common_event", data, Channel.Cpp);
  }, 0);
  debugMenu.addButton("ts event CommoneEventData cpp/script", "K2Perf", 0, () => {
    let data = new SC.CommonEventData();
    data.setStr(1, "Hello from typescript cpp/script");
    data.setInt(0, 99);
    send("test_common_event", data);
  }, 0);
  debugMenu.addButton("runUT", "K2Perf", 0, () => {
    console.log("call runUT");
    globalThis.runUT();
    console.log("call runUT end");
  }, 0);
  if (PLATFORM_DESKTOP) {
    debugMenu.addButton("runUT(HeroCollection)", "K2Perf", 0, () => {
      console.log("call runUT");
      let reporterOpt = { outputFileName: "HeroCollection", uploadLog: true, saveHtml: true };
      globalThis.runUT({ grep: "HeroCollection", reporter: "BrawlJsonReporter", reporterOptions: reporterOpt });
      console.log("call runUT end");
      SC.LaserDebug.toggleDebugMenu();
    }, 0);
  }
  debugMenu.addButton("CDN runUT(HeroCollection)", "K2Perf", 0, () => {
    console.log("call runUT");
    let reporterOpt = { outputFileName: "HeroCollection", uploadLog: true, saveHtml: true };
    globalThis.runUT({ grep: "HeroCollection", reporter: "BrawlJsonReporter", reporterOptions: reporterOpt }, true);
    console.log("call runUT end");
    SC.LaserDebug.toggleDebugMenu();
  }, 0);
  debugMenu.addButton("runUT(lobby)", "K2Perf", 0, () => {
    console.log("call runUT");
    globalThis.runUT({ grep: "lobbytest" });
    console.log("call runUT end");
  }, 0);
  debugMenu.addButton("Test GM", "K2Perf", 0, () => {
    console.log("call runUT");
    console.log("call runUT end");
  }, 0);
  debugMenu.addButton("Print", "K2Perf", 0, () => {
    console.log("getptr: " + SC.GUIUtils.getPtr(SC.GUI.getInstance()));
  }, 0);
  let testFunc = (container, exp) => {
    console.log("findSpritesVec => " + exp);
    let found = SC.GUIUtils.findSpritesVec(container, exp);
    console.log("findSpritesVec result: " + found.size());
    for (let i = 0; i < found.size(); i++) {
      let item = found.get(i);
      console.log("Sprite found: " + SC.GUIUtils.getPtr(item));
    }
  };
  debugMenu.addButton("find", "K2Perf", 0, () => {
    console.log("find sprite");
    testFunc(SC.GUI.getInstance().getPopupByType(SC.PopupBase.PopupType.OLD_RECRUIT_TOKEN_AUTOCOLLECT_POPUP), "confirm_btn");
    testFunc(SC.GUI.getInstance().getPopupByType(SC.PopupBase.PopupType.OLD_RECRUIT_TOKEN_AUTOCOLLECT_POPUP), "confirm_btn/*");
  }, 0);
  debugMenu.addButton("findAndGetText", "K2Perf", 0, () => {
    console.log("find sprite");
    testFunc(SC.GUI.getInstance().getPopupByType(SC.PopupBase.PopupType.OLD_RECRUIT_TOKEN_AUTOCOLLECT_POPUP), "confirm_btn");
    SC.GUI.getInstance().hudPrint("findAndGetText: " + getText(getPopupSprite(SC.PopupBase.PopupType.OLD_RECRUIT_TOKEN_AUTOCOLLECT_POPUP, "confirm_btn")), false, false);
  }, 0);
  let res = getSprites("", SC.CustomButton);
  debugMenu.addButton("find2", "K2Perf", 0, () => {
    console.log("find sprite");
    testFunc(SC.Stage.getInstance().getMainSprite(), "k2_old_recruit_token_autocollectt_popup");
  }, 0);
  debugMenu.addButton("find3", "K2Perf", 0, () => {
    console.log("find sprite");
    testFunc(SC.Stage.getInstance().getMainSprite(), "k2_old_recruit_token_autocollectt_popup/ui_dataicon_default");
  }, 0);
  debugMenu.addButton("open menu", "K2Perf", 0, () => {
    console.log("find sprite");
    SC.GUIUtils.showPopup(SC.PopupBase.PopupType.HERO_LIST_POPUP);
  }, 0);
  debugMenu.addButton("debug ctrl", "K2Perf", 0, () => {
    console.log("find sprite");
    let result = getSprite("/*/*/*/k2_old_recruit_token_autocollectt_popup/confirm_btn/button_timeline/*/txt");
    console.log("/*/*/*/k2_old_recruit_token_autocollectt_popup/confirm_btn/button_timeline/*/txt : " + SC.TitanUtil.getAddrStr(result));
    let result2 = getSprite("/*/k2_old_recruit_token_autocollectt_popup/confirm_btn/button_timeline/*/txt");
    console.log("/*/k2_old_recruit_token_autocollectt_popup/confirm_btn/button_timeline/*/txt : " + SC.TitanUtil.getAddrStr(result2));
    let result3 = getSprite("k2_old_recruit_token_autocollectt_popup/confirm_btn/button_timeline/*/txt");
    console.log("k2_old_recruit_token_autocollectt_popup/confirm_btn/button_timeline/*/txt : " + SC.TitanUtil.getAddrStr(result3));
  }, 0);
  debugMenu.addButton("find4", "K2Perf", 0, () => {
    console.log("find sprite");
    testFunc(SC.Stage.getInstance().getMainSprite(), "k2_old_recruit_token_autocollectt_popup/*/button_timeline");
  }, 0);
  debugMenu.addButton("find/", "K2Perf", 0, () => {
    console.log("find sprite");
    testFunc(SC.Stage.getInstance().getMainSprite(), "/");
  }, 0);
}
export {
  initDebugMenuK2
};
//# sourceMappingURL=DebugMenu.mjs.map
