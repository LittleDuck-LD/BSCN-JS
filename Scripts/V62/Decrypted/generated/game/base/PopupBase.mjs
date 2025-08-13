import { getSpriteFrom } from "./gui.mjs";
class PopupBase {
  constructor(popup) {
    this.cobj = cast(popup, SC.PopupBase);
    console.log("PopupBase construct");
  }
  // In fact. It is regitering the Pre-press callback.
  // callback return true: continue call native buttonPressed
  // false: not call native buttonPressed.
  registerButtonPress(path, callBack) {
    let btn = getSpriteFrom(this.cobj.getMovieClip(), path, SC.CustomButton);
    if (!btn) {
      SC.Debugger.error("can not find btn:" + path);
      return;
    }
    let cb = (responseBtn) => {
      let result = callBack.call(this, responseBtn);
      if (result) return true;
      return false;
    };
    SC.GUIUtils.setButtonPressed(btn, cb);
  }
}
export {
  PopupBase as default
};
//# sourceMappingURL=PopupBase.mjs.map
