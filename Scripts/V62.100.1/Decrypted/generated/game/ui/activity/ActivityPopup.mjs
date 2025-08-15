import PopupBase from "../../base/PopupBase.mjs";
import { ManagedType } from "../../base/ObjectBase.mjs";
import { getSpriteFrom, newGameGUIContainer, tips } from "../../base/gui.mjs";
import { getSCFile } from "./activity-utils.mjs";
class ActivityPopup extends PopupBase {
  constructor(popup) {
    super(popup, SC.ScriptablePopup);
    this.selectedTabIndex = 0;
    try {
      console.log("ActivityPopup TS: constructor");
      popup.getMovieClip().setY(-SC.Stage.getInstance().getStageHeight() / 2);
      this.cobj.setUpHeader();
      this.collabScFileName = getSCFile();
      this.cobj.as(SC.ScriptablePopup).loadAndCacheAssetScope(this.collabScFileName);
      this.frameMovieClip = this.createManagedMovieClip(this.collabScFileName, "event_hub_screen_center");
      this.cobj.addChild(this.frameMovieClip);
      this.frameMovieClip.setY(SC.Stage.getInstance().getStageHeight() / 2);
      this.topLeftMovieClip = this.createManagedMovieClip(this.collabScFileName, "event_hub_screen_hud_top_left");
      this.cobj.addChild(this.topLeftMovieClip);
      this.topLeftMovieClip.setXY(-SC.Stage.getInstance().getStageWidth() / 2, -SC.Stage.getInstance().getStageHeight() / 2);
      this.bindButtonPress(this.cobj.getBackButton(), this.onBackPress);
      this.bindButtonPress(this.cobj.getHomeButton(), this.onHomePress);
      this.tabs = [
        {
          tabName: "TID_ACTIVITY_TAB_MILESTONE_K2",
          moduleName: "ui/activity/ActivityMilestoneContainer.mjs",
          movieClipName: "screen_area",
          scFileName: "sc/ui.sc"
        },
        {
          tabName: "TID_ACTIVITY_TAB_DRAW_LOTTERY_K2",
          moduleName: "ui/activity/LotteryDrawContainer.mjs",
          movieClipName: "activity_prize_draw",
          scFileName: this.collabScFileName
        },
        {
          tabName: "TID_ACTIVITY_TAB_CALENDAR_K2",
          moduleName: "ui/activity/ActivityCalendarContainer.mjs",
          // movieClipName: "activity_prize_calendar",
          // scFileName: this.collabScFileName,
          movieClipName: "screen_area",
          scFileName: "sc/ui.sc"
        }
      ];
      this.constructTabs();
      this.onTabButtonClick(this.selectButtonList.getButton(0), this.tabs[0], 0);
      this.frameMovieClip.m_interactive = true;
      this.subscribe("ActivityPopup_select_tab_by_index", (index) => {
        console.log("ActivityPopup_select_tab_by_index, index:", index);
        if (index >= 0 && index < this.tabs.length) {
          this.onTabButtonClick(this.selectButtonList.getButton(index), this.tabs[index], index);
        }
      });
      let tempory = true;
      if (tempory) {
        let headerMc = this.cobj.getMovieClip().getMovieClipByName("top_right");
        if (headerMc) {
          let childCount = headerMc.getTimelineChildCount();
          console.log("childCount", childCount);
          let infoMc = headerMc.getMovieClipByName("button_info_collab");
          for (let i = 0; i < childCount; i++) {
            let child = headerMc.getTimelineChild(i);
            child.m_visible = false;
          }
          infoMc.m_visible = true;
          this.createButtonParent("button_info_collab", headerMc, (btn) => {
            tips("Coming soon!");
            return false;
          });
        }
      }
    } catch (e) {
      console.log("ActivityPopup TS: constructor error", e);
    }
  }
  constructTabs() {
    let tabHeight = getSpriteFrom(this.frameMovieClip, "buttom_txt_mc").as(SC.MovieClip)?.getHeight() ?? 100;
    for (let i = 0; i < this.tabs.length; i++) {
      let tab = this.tabs[i];
      let tabContainer = newGameGUIContainer({ module: tab.moduleName, scFile: tab.scFileName, clip: tab.movieClipName, para: [{ tabHeight }] });
      tabContainer.setX(-SC.Stage.getInstance().getStageWidth() / 2);
      this.manage(tabContainer, ManagedType.UpdateAndAutoDestroy);
      this.cobj.getMovieClip().addChildAt(tabContainer, 1);
      tab.container = tabContainer;
    }
    this.constructBottomList();
  }
  // bottom tab button list
  constructBottomList() {
    let buttonListMc = getSpriteFrom(this.frameMovieClip, "buttom_txt_mc").as(SC.MovieClip);
    if (!buttonListMc) {
      console.error("ActivityPopup TS: buttonList is null");
      return;
    }
    this.selectButtonList = new SC.SelectableButtonList();
    this.manage(this.selectButtonList, ManagedType.AutoDestroy);
    for (let i = 0; i < this.tabs.length; i++) {
      let tab = this.tabs[i];
      let button = this.createButtonDetailed(
        "txt_mc" + (i + 1),
        buttonListMc,
        (btn) => {
          this.onTabButtonClick(button, tab, i);
          return true;
        },
        true,
        SC.SelectableButton
      );
      if (!button) {
        console.error("create button error", i);
        break;
      }
      tab.tabButton = button;
      button.setSelectableButtonList(this.selectButtonList);
      button.setSelected(true);
      button.getMovieClip().setText("txt", SC.StringTable.getString(tab.tabName));
      button.getMovieClip().setText("txt2", SC.StringTable.getString(tab.tabName));
      this.selectButtonList.addButton(button);
    }
  }
  onTabButtonClick(button, tab, index) {
    this.selectedTabIndex = index;
    this.selectButtonList.buttonSelected(button);
    for (const tabInfo of this.tabs) {
      let selected = tabInfo == tab;
      tabInfo.container.m_visible = selected;
      tabInfo.selected = selected;
      let frameIndex = tabInfo.tabButton?.getMovieClip().getFrameIndex(selected ? "active" : "inactive") ?? -1;
      if (frameIndex >= 0) {
        tabInfo.tabButton?.getMovieClip().gotoAndStopFrameIndex(frameIndex);
      }
    }
  }
  showResourceHUD() {
    if (this.selectedTabIndex == 1)
      return true;
    return false;
  }
  showTopHUD() {
    return true;
  }
  // showSettings():boolean {
  //     return true
  // }
  shouldShowResource(id) {
    return id == SC.TopResourceButton.ResourceType.TYPE_DIAMONDS || id == SC.TopResourceButton.ResourceType.TYPE_COINS || id == SC.TopResourceButton.ResourceType.TYPE_TICKET_CASH;
  }
  onUpdate(dt) {
  }
  onBackPress(btn) {
    this.cobj.backButtonPressed();
    this.cobj.fadeOut();
    return false;
  }
  onHomePress(btn) {
    this.cobj.homeButtonPressed();
    return false;
  }
  onReady() {
    console.log("ActivityPopup TS: ready");
  }
  onDestruct() {
    console.log("ActivityPopup TS: destruct");
  }
}
export {
  ActivityPopup as default
};
//# sourceMappingURL=ActivityPopup.mjs.map
