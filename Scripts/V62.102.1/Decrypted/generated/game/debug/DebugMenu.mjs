import { getPopupSprite, getPopupSprites, getSprite, getSprites, getText, tips } from "../base/gui.mjs";
import { send, subscribe } from "../base/event.mjs";
import { getSCFile } from "../ui/activity/activity-utils.mjs";
function initDebugMenuK2(debugMenu) {
  debugMenu.addButton("Close all popup", "", 0, () => {
    SC.GUI.getInstance().closeAllPopups();
  }, 0);
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
  debugMenu.addButton("test-js-update", "K2Perf", 0, () => {
    tips("test js version 1");
  }, 0);
  debugMenu.addButton("vibration", "K2Perf", 0, async () => {
    send("cpp_catalogresulticon_pressed", new SC.CommonEventData());
  }, 0);
  debugMenu.addButton("CatalogResultIcon_Pressed", "K2Perf", 0, async () => {
    send("cpp_catalogresulticon_pressed", new SC.CommonEventData());
  }, 0);
  debugMenu.addButton("CommonPurchasePopup", "K2Perf", 0, async () => {
    let commonBtn = {
      title: "TID_DRAW_LOTTERY_K2",
      desc: "TID_DRAW_LOTTERY_CONFIRM_K2",
      close_cb: () => {
        tips("helloworld");
      },
      buttons: [
        {
          text: "TID_BUTTON_CANCEL",
          callback: () => {
            tips("helloworld_cancel");
          }
        },
        {
          text: "TID_BUTTON_CONFIRM",
          callback: () => {
            tips("helloworld_Comfirm");
          }
        }
      ]
    };
    let para = new SC.CommonEventData();
    para.setJsObject(0, commonBtn);
    SC.GUIUtils.openScriptableGenericPopup("ui/activity/CommonPurchasePopup.mjs", getSCFile(), "popup_generic", para);
  }, 0);
  debugMenu.addButton("FragmentExchangePopup", "K2Perf", 0, async () => {
    let para = new SC.CommonEventData();
    SC.GUIUtils.openScriptableGenericPopup("ui/activity/FragmentExchangePopup.mjs", getSCFile(), "activity_fragments", para);
  }, 0);
  debugMenu.addButton("CommonPurchasePopup2", "K2Perf", 0, async () => {
    let module = await tsImport("javascript/generated/game/ui/activity/CommonPurchasePopup.mjs");
    module.testOpen();
  }, 0);
  debugMenu.addButton("Chest", "K2Perf", 0, async () => {
    let para = new SC.CommonEventData();
    para.setInt(0, 1000010);
    let collabScFileName = "sc/collab_eva.sc";
    SC.GUIUtils.openScriptablePopup("ui/ChestDetailPopup.mjs", collabScFileName, "popup_reward", para, false);
  }, 0);
  debugMenu.addButton("activity_k2", "K2Perf", 0, async () => {
    SC.GUIUtils.openScriptablePopup("ui/activity/ActivityPopup.mjs", getSCFile(), "event_hub_screen_center", new SC.CommonEventData(), true);
  }, 0);
  let openLotteryBox = (level) => {
    let skin = SC.LogicDataTables.getSkinByName("LotteryBox", null);
    let skinName = `LotteryBox0${level <= 1 ? "" : level.toString()}`;
    let levelSkin = SC.LogicDataTables.getSkinByName(skinName, null);
    if (levelSkin) skin = levelSkin;
    let skinAnimSequence = SC.SkinAnimSequencePopup.getSkinAnimSequenceData(skin, SC.LogicSkinAnimSequenceData.SequenceType.SEQUENCE_TYPE_HIGHLIGHT);
    if (!skinAnimSequence && LASER_DEBUG) {
      tips(`ERROR: ${skin.getName()} missing HighlightAnimSequence`);
      skinAnimSequence = SC.LogicDataTables.getSkinAnimSequenceByName("UndertakerSBHighlightSequence", null);
    }
    if (skinAnimSequence) {
      SC.GUI.getInstance().showPopup(allocWithoutGC(SC.SkinAnimSequencePopup, skin, skinAnimSequence, SC.SceneCharacter.AnimId.ANIM_HIGHLIGHT, "", true, true), false, false);
    }
  };
  for (let i = 1; i < 6; i++) {
    debugMenu.addButton(`LotteryBox ${i}`, "Lottery", 0, async () => {
      openLotteryBox(i);
    }, 0);
  }
  subscribe("test_number_int", (evt) => {
    console.log("recv test_number_int");
  });
  subscribe("test_string", (evt) => {
    console.log("recv test_string");
  });
  subscribe("cpp_catalogresulticon_pressed", function(data) {
    debugger;
    let displayObject = data.m_pSender;
    console.log("CatalogResultIcon_Pressed", data);
  });
  subscribe("test_common_event", (evt) => {
    console.log("recv test_common_event");
  });
  debugMenu.addButton("send!!", "K2Perf", 0, async () => {
    debugger;
    tips("Hello from typescript");
    let evt = new SC.CommonEventData();
    evt.setStr(0, "");
    evt.setStr(1, "");
    send("test_common_event1", evt);
  }, 0);
  debugMenu.addButton("chest 1000010", "K2Perf", 0, async () => {
    SC.GameTSUtil.showPurchaseLotteryDraw(1000010);
  }, 0);
  debugMenu.addButton("chest 1000011", "K2Perf", 0, async () => {
    SC.GameTSUtil.showPurchaseLotteryDraw(1000011);
  }, 0);
  debugMenu.addButton("CommonTextPopup", "K2Perf", 0, async () => {
    let module = await tsImport("javascript/generated/game/ui/CommonTextPopup.mjs");
    module.testOpen();
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
