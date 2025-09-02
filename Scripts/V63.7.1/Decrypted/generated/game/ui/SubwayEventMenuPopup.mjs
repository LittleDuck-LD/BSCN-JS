import { getSpriteFrom } from "../base/gui.mjs";
import PopupBase from "../base/PopupBase.mjs";
class SubwayEventMenuPopup extends PopupBase {
  constructor(popup) {
    super(popup);
    console.log("SubwayEventMenuPopup TS: constructor");
    try {
      let btn = getSpriteFrom(this.cobj.getMovieClip(), "event_hub_screen_hud_top_right/button_link", SC.CustomButton);
      if (btn) {
        btn.m_visible = false;
        SC.GUIUtils.setButtonPressed(btn, this.onButtonLink);
      }
    } catch (e) {
      handleException(e);
    }
  }
  onButtonLink(btn) {
    SC.GameMain.getInstance().handleURL("brawlstars://extlink?page=https%3A%2F%2Fbs.qq.com", "", true);
    console.log("SubwayEventMenuPopup constructor ");
    return false;
  }
  onReady() {
    super.onReady();
    console.log("SubwayEventMenuPopup TS: onDestruct");
  }
  onUpdate(dt) {
  }
  onDestruct() {
    console.log("SubwayEventMenuPopup TS: onDestruct");
  }
}
export {
  SubwayEventMenuPopup as default
};
//# sourceMappingURL=SubwayEventMenuPopup.mjs.map
