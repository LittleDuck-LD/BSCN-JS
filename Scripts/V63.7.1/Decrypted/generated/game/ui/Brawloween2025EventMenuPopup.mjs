import { getSpriteFrom } from "../base/gui.mjs";
import PopupBase from "../base/PopupBase.mjs";
class Brawloween2025EventMenuPopup extends PopupBase {
  constructor(popup) {
    super(popup);
    console.log("Brawloween2025EventMenuPopup TS: constructor");
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
    console.log("Brawloween2025EventMenuPopup constructor ");
    return false;
  }
  onReady() {
    super.onReady();
    console.log("Brawloween2025EventMenuPopup TS: onDestruct");
  }
  onUpdate(dt) {
  }
  onDestruct() {
    console.log("Brawloween2025EventMenuPopup TS: onDestruct");
  }
}
export {
  Brawloween2025EventMenuPopup as default
};
//# sourceMappingURL=Brawloween2025EventMenuPopup.mjs.map
