import PopupBase from "../base/PopupBase.mjs";
class OldRecruitTokenAutoCollecttPopup extends PopupBase {
  constructor(popup) {
    super(popup);
    console.log("OldRecruitTokenAutoCollecttPopup TS: constructor");
    this.registerButtonPress("confirm_btn", this.onComfirmPress);
  }
  onComfirmPress(btn) {
    console.log("OldRecruitTokenAutoCollecttPopup constructor ");
    return true;
  }
  onReady() {
    super.onReady();
    console.log("OldRecruitTokenAutoCollecttPopup TS: onDestruct");
  }
  onUpdate(dt) {
  }
  onDestruct() {
    console.log("OldRecruitTokenAutoCollecttPopup TS: onDestruct");
  }
}
export {
  OldRecruitTokenAutoCollecttPopup as default
};
//# sourceMappingURL=OldRecruitTokenAutoCollecttPopup.mjs.map
