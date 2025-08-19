import PopupBase from "../base/PopupBase.mjs";
import { getSpriteFrom } from "../base/gui.mjs";
class HeroScreenPopup extends PopupBase {
  constructor(popup) {
    try {
      super(popup);
      let bottomLeft = getSpriteFrom(this.cobj.getMovieClip(), "hero_screen_hud_bottom_left");
      if (bottomLeft) {
        let tryBuble = getSpriteFrom(bottomLeft, "try_bubble");
        if (tryBuble) {
          let skinAnimMC = getSpriteFrom(bottomLeft, "button_show_skin_anim");
          if (skinAnimMC && skinAnimMC.getParent()) {
            let btn = skinAnimMC?.getParent()?.getParent();
            let isBtn = btn?.isCustomButton();
            if (isBtn) {
              bottomLeft.addChildAt(btn, tryBuble.m_parentChildIndex);
            }
          }
        }
      }
    } catch (e) {
      handleException(e);
    }
  }
  onReady() {
    super.onReady();
  }
  onUpdate(dt) {
  }
  onDestruct() {
  }
}
export {
  HeroScreenPopup as default
};
//# sourceMappingURL=HeroScreenPopup.mjs.map
