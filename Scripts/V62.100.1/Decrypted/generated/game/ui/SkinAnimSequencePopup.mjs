import PopupBase from "../base/PopupBase.mjs";
class SkinAnimSequencePopup extends PopupBase {
  constructor(popup) {
    try {
      super(popup);
      this.cobj.as(SC.PopupBase).getBackGround()?.setFrameSkippingRecursive(true);
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
  SkinAnimSequencePopup as default
};
//# sourceMappingURL=SkinAnimSequencePopup.mjs.map
