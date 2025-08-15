import PopupBase from "../../base/PopupBase.mjs";
import { ManagedType } from "../../base/ObjectBase.mjs";
import { getSpriteFrom } from "../../base/gui.mjs";
class LotteryPurchasePopup extends PopupBase {
  // LogicRandomChestRewardData::RewardType
  constructor(popup) {
    super(popup);
    this.databind = [
      {
        path: "left_panel",
        visible: false
      },
      {
        path: "catalogue_center_title",
        visible: false
      },
      {
        path: "right_panel/buttons",
        visible: false
      },
      {
        path: "right_panel/description/collection_tags",
        visible: false
      },
      {
        path: "right_panel/btn_test",
        visible: false
      }
    ];
    this.datas = [];
    this.resourceDropTypes = [];
    this.cobj.setUpHeader();
    let clip = SC.StringTable.createMovieClipAndLocalize("sc/ui.sc", "catalogue");
    this.cobj.addContent(clip);
    this.cobj.setBackgroundY(-SC.Stage.getInstance().getStageHeight() / 2);
    this.manage(clip, ManagedType.AutoDestroy);
    this.registerButtonPress("button_back", this.onBackPress);
    this.registerButtonPress("button_home", this.onHomePress);
    this.bindingData(this.databind, clip);
    this.initDatas();
    let movieClip = getSpriteFrom(clip, "center_panel");
    this.scrollArea = SC.GUIContainer.createScrollArea(movieClip.as(SC.MovieClip), "scroll_area", 50);
    this.manage(this.scrollArea);
    this.scrollArea.enablePinching(false);
    this.scrollArea.enableHorizontalDrag(false);
    this.scrollArea.enableVerticalDrag(true);
    this.scrollArea.m_mask = false;
    this.scrollArea.setAlignment(SC.DragHandler.ALIGN_TOP | SC.DragHandler.ALIGN_LEFT);
    movieClip.addChild(this.scrollArea);
  }
  initDatas() {
    let type = this.cobj.as(SC.ScriptablePopup).getPara().getInt(0);
    console.log(`LotteryPurchasePopup chest type ${type}`);
    let items = SC.GameTSUtilExt.getRandomChestRewardDetailed(type);
    let size = items.size();
    for (let i = 0; i < size; i++) {
      let item = items.get(i);
      if (item < 1e3) {
        this.resourceDropTypes.push(item);
        continue;
      }
      console.log(`LotteryPurchasePopup item ${item}`);
      let data = SC.LogicDataTables.getDataById(item);
      console.log(`LotteryPurchasePopup data ${data.getName()}`);
      this.datas.push(data);
    }
    this.datas.sort((a, b) => {
      return a.getDataType() - b.getDataType();
    });
  }
  createListIcons() {
  }
  onDestruct() {
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
}
export {
  LotteryPurchasePopup as default
};
//# sourceMappingURL=LotteryPurchasePopup.mjs.map
