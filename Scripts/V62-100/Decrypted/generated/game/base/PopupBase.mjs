import GUIContainerBase from "./GUIContainerBase.mjs";
import { ManagedType } from "./ObjectBase.mjs";
class PopupBase extends GUIContainerBase {
  constructor(popup, popupClass) {
    super(popup, popupClass ?? SC.PopupBase);
    console.log("PopupBase construct1");
  }
  onReady() {
  }
  ready() {
    console.log("PopupBase TS: ready");
    this.onReady();
  }
  // public update(dt:number):void {
  //     super.update(dt) // test this.
  // }
  createContainer(moduleName, instanceName, addToChildIndex) {
    let mc = this.cobj.getMovieClip().getMovieClipByName(instanceName);
    if (!mc) {
      SC.Debugger.error("instanceName " + instanceName + " not found");
      return null;
    }
    let container = SC.GUIUtils.createScriptableGUIContainer(moduleName, mc);
    if (addToChildIndex == void 0) {
      this.cobj.getMovieClip().addChild(container);
    } else {
      this.cobj.getMovieClip().addChildAt(container, addToChildIndex);
    }
    this.manage(container, ManagedType.UpdateAndAutoDestroy);
    return container;
  }
  createContainerWithSC(moduleName, scFile, movieclipName, addToChildIndex) {
    let container = SC.GUIUtils.createScriptableGUIContainer(moduleName, scFile, movieclipName);
    if (addToChildIndex == void 0) {
      this.cobj.getMovieClip().addChild(container);
    } else {
      if (addToChildIndex < 0) {
        this.cobj.getMovieClip().addChild(container);
      } else {
        this.cobj.getMovieClip().addChildAt(container, addToChildIndex);
      }
    }
    this.manage(container, ManagedType.UpdateAndAutoDestroy);
    return container;
  }
  close() {
    this.cobj.fadeOut();
  }
}
export {
  PopupBase as default
};
//# sourceMappingURL=PopupBase.mjs.map
