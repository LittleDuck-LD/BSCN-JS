import PopupBase from "../base/PopupBase.mjs";
import { getString } from "../base/util.mjs";
import { getSCFile } from "./activity/activity-utils.mjs";
import { tips } from "../base/gui.mjs";
import { ManagedType } from "../base/ObjectBase.mjs";
function testOpen() {
  let para = {
    title: "TID_DRAW_LOTTERY_RULE_TITLE_K2",
    content: "TID_DRAW_LOTTERY_RULES_K2",
    onClose: () => {
      tips("[X] clicked");
    }
  };
  let eventData = new SC.CommonEventData();
  eventData.setJsObject(0, para);
  SC.GUIUtils.openScriptableGenericPopup("ui/CommonTextPopup.mjs", getSCFile(), "popup_activity_rules", eventData);
}
class CommonTextPopup extends PopupBase {
  constructor(popup) {
    super(popup, SC.ScriptableGenericPopup);
    // default para
    this.para = {
      title: "",
      content: "",
      titleControl: "title_txt",
      contentControl: "txt",
      closeControl: "button_close",
      multipleLine: true,
      scrollAreaEnabled: false
    };
    this.scrollArea = null;
    this.textContent = null;
    let param = this.cobj.getPara();
    if (param.isJsObject(0))
      Object.assign(this.para, param.getJsObject(0));
    this.createButton(this.para.closeControl, this.onBackPress);
    this.textContent = this.cobj.getMovieClip().getChildByName(this.para.contentControl)?.as(SC.TextField);
    let title = this.cobj.getMovieClip().getChildByName(this.para.titleControl)?.as(SC.TextField);
    if (title)
      title.setText(getString(this.para.title));
    if (this.textContent) {
      this.textContent.setText(getString(this.para.content));
      if (this.para.multipleLine) {
        this.textContent.setMultiLine(true);
        this.textContent.setAlign(SC.TextField.ALIGN_LEFT);
      }
      console.log(`this.para.scrollAreaEnabled = ${this.para.scrollAreaEnabled}`);
      if (this.para.scrollAreaEnabled) {
        this.createScrollArea(this.textContent);
      } else {
        SC.MovieClipHelper.autoAdjustText(this.textContent, true);
      }
    }
  }
  createScrollArea(content) {
    let scrollAreaBounds = new SC.Rect();
    content.getBounds(null, scrollAreaBounds);
    this.scrollArea = new SC.ScrollArea(content.getWidth(), content.getHeight(), 1);
    this.manage(this.scrollArea, ManagedType.UpdateAndAutoDestroy);
    this.scrollArea.enableHorizontalDrag(false);
    this.scrollArea.enableVerticalDrag(true);
    this.scrollArea.enablePinching(false);
    this.scrollArea.m_mask = true;
    this.scrollArea.setAlignment(SC.DragHandler.ALIGN_TOP | SC.DragHandler.ALIGN_LEFT);
    this.cobj.getMovieClip().addChildAt(this.scrollArea, content.getParentChildIndex());
    this.scrollArea.setXY(content.getX() + scrollAreaBounds.m_left, content.getY() + scrollAreaBounds.m_top);
    content.removeFromParent();
    content.setBounds(0, 0, content.getWidth(), content.getHeight());
    content.setXY(0, 0);
    this.manage(content, ManagedType.AutoDestroy);
    this.scrollArea.addContentDontUpdateBounds(content);
    let contentBounds = allocWithoutGC(SC.Rect, 0, 0, content.getTextFieldWidth(), content.getTextHeight());
    this.scrollArea.setForcedContentBounds(contentBounds);
    this.scrollArea.updateBounds();
    DEL(scrollAreaBounds);
  }
  onDestruct() {
  }
  onUpdate(dt) {
  }
  onBackPress(btn) {
    this.cobj.backButtonPressed();
    this.cobj.fadeOut();
    if (this.para.onClose) {
      this.para.onClose();
    }
    return false;
  }
}
export {
  CommonTextPopup as default,
  testOpen
};
//# sourceMappingURL=CommonTextPopup.mjs.map
