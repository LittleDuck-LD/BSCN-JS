import { ModuleBase } from "../base/ModuleBase.mjs";
import { getSpriteFrom } from "../base/gui.mjs";
class ActivityModule extends ModuleBase {
  onDestruct() {
  }
  constructor() {
    super();
    try {
      console.log("ActivityModule constructor");
      this.subscribe("cpp_home_mode_exit", this.onHomeExit);
      this.subscribe("cpp_home_mode_enter", this.onHomeEnter);
      this.tick(this.checkRepeatly, 5e3);
    } catch (e) {
      handleException(e);
    }
  }
  checkRepeatly() {
    if (!this.maybeAtBattle) return;
    try {
      let ingame = getSpriteFrom(SC.Stage.getInstance().getMainSprite(), "/>/>/ingame_hud_top");
      if (!ingame) {
        return;
      }
      let combatHUD = ingame.getParent();
      let replayMode = false;
      let quitButton;
      let count = combatHUD.getNumChildren();
      for (let i = 0; i < count; i++) {
        let c = combatHUD.getChildAt(i);
        if (c && c.isCustomButton()) {
          let mc = c.as(SC.CustomButton).getMovieClip();
          if (mc) {
            if (mc.getTextFieldByName("following_txt") && c.m_visible) {
              replayMode = true;
            }
            if (mc.getTextFieldByName("TID_QUIT")) {
              quitButton = c.as(SC.CustomButton);
            }
          }
        }
      }
      if (replayMode && quitButton) {
        quitButton.m_visible = true;
      }
    } catch (e) {
      console.log(e);
    }
  }
  onHomeExit() {
    this.maybeAtBattle = true;
  }
  onHomeEnter() {
    this.maybeAtBattle = false;
  }
}
export {
  ActivityModule
};
//# sourceMappingURL=ActivityModule.mjs.map
