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
  ready() {
    console.log("OldRecruitTokenAutoCollecttPopup TS: ready");
  }
  update(dt) {
  }
  destruct() {
    console.log("OldRecruitTokenAutoCollecttPopup TS: destruct");
  }
}
export {
  OldRecruitTokenAutoCollecttPopup as default
};
//# sourceMappingURL=OldRecruitTokenAutoCollecttPopup.mjs.map
