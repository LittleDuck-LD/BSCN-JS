import { getSpriteFrom } from "./gui.mjs";
import { ManagedType, ObjectBase } from "./ObjectBase.mjs";
class GUIContainerBase extends ObjectBase {
  constructor(cobj, type) {
    super();
    this.cobj = cast(cobj, type);
    console.log("GUIContainerBase construct");
  }
  // protected destruct():void{
  //     super.destruct()
  //     console.log("ActivityPopup TS: destruct")
  // }
  update(dt) {
    this.managedObjectUpdate(dt);
    this.onUpdate(dt);
  }
  //button returned is auto managed
  createButton(instanceName, callBack, useDefaultTimelineResource = true) {
    if (!instanceName) return null;
    return this.createButtonParent(instanceName, this.cobj.getMovieClip(), callBack, useDefaultTimelineResource);
  }
  //button returned is auto managed
  // create button under parentMc
  createButtonParent(instanceName, parentMc, callBack, useDefaultTimelineResource = true) {
    return this.createButtonDetailed(instanceName, parentMc, callBack, useDefaultTimelineResource, SC.GameButton);
  }
  // buttonCls: class of button to create, default is CustomButton
  createButtonDetailed(instanceName, parentMc, callBack, useDefaultTimelineResource = true, buttonCls) {
    if (!parentMc) return null;
    if (!buttonCls)
      buttonCls = SC.CustomButton;
    let clip = parentMc.getMovieClipByName(instanceName);
    if (!clip) {
      console.error("Can't find btn:" + instanceName);
      return null;
    }
    return this.createButtonInternal(clip, parentMc, instanceName, callBack, useDefaultTimelineResource, buttonCls);
  }
  // create button on clip
  // need clip's parent is movieclip
  createButtonOnMovieclip(clip, callBack, useDefaultTimelineResource = true, buttonCls) {
    if (!clip) return null;
    let parent = clip.getParent();
    let instanceName = "";
    if (!parent.isMovieClip()) {
      SC.Debugger.error("clip's parent not a movieclip");
      return null;
    }
    let parentMc = parent.as(SC.MovieClip);
    instanceName = parentMc.as(SC.MovieClip).getInstanceName(clip);
    instanceName = instanceName == null ? "" : instanceName;
    return this.createButtonInternal(clip, parentMc, instanceName, callBack, useDefaultTimelineResource, buttonCls);
  }
  // buttonCls: class of button to create, default is CustomButton
  createButtonInternal(clip, parentMc, instanceName, callBack, useDefaultTimelineResource = true, buttonCls) {
    if (buttonCls == void 0)
      buttonCls = SC.CustomButton;
    let button = allocWithoutGC(buttonCls);
    button.setAutoTestName(instanceName);
    parentMc.changeTimelineChild(clip, button);
    clip.getMatrix().setToIdentity();
    clip.getColorTransform().reset();
    button.setDisplayObject(clip, useDefaultTimelineResource);
    button.setInteractiveRecursive(true);
    this.manage(button, ManagedType.AutoDestroy);
    let cb = (responseBtn) => {
      let result = callBack.call(this, responseBtn);
      if (result) return true;
      return false;
    };
    SC.GUIUtils.setButtonPressed(button, cb);
    return button;
  }
  // In fact. It is registering the Pre-press callback.
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
  bindButtonPress(btn, callBack) {
    if (!btn) {
      SC.Debugger.error("can not bindButtonPress");
      return false;
    }
    let cb = (responseBtn) => {
      let result = callBack.call(this, responseBtn);
      if (result) return true;
      return false;
    };
    SC.GUIUtils.setButtonPressed(btn, cb);
    return true;
  }
  // ts getMovieclip createMovieClipAndLocalize version
  createManagedMovieClip(file, name) {
    let mc = SC.StringTable.createMovieClipAndLocalize(file, name);
    this.manage(mc, ManagedType.AutoDestroy);
    return mc;
  }
  //#region data driven
  // NOTE:
  // 1. Databind refresh("reward_button/txt")  (try refresh child under a button) must lay before Databind buttonClick("reward_button") Because buttonClick will insert a button and breaking the path.
  // 2. Or you can use refresh("reward_button/*/txt"), "*" will match any sub path, then it works even if the button is inserted.
  bindingData(dataBinds, containerMC) {
    if (!dataBinds) {
      return;
    }
    containerMC = containerMC || this.cobj.getMovieClip();
    for (const dataBind of dataBinds) {
      let control = getSpriteFrom(containerMC, dataBind.path);
      dataBind.controlBinded = control;
      if (!control) {
        console.error("LotteryDrawContainer TS: control is null " + dataBind.path);
        continue;
      }
      if (dataBind.buttonClick) {
        if (!control.isMovieClip()) {
          console.error("LotteryDrawContainer TS: control is not movieclip " + dataBind.path);
          continue;
        }
        this.createButtonOnMovieclip(control.as(SC.MovieClip), dataBind.buttonClick);
      }
      this.refreshControl(dataBind);
    }
  }
  refreshByPath(path, dataBinds) {
    if (!dataBinds) {
      return;
    }
    for (const dataBind of dataBinds) {
      if (dataBind.path === path) {
        this.refreshControl(dataBind);
        break;
      }
    }
  }
  refreshControl(dataBind) {
    if (!isValid(dataBind) || !isValid(dataBind.controlBinded)) {
      return;
    }
    try {
      let control = dataBind.controlBinded;
      if (isValid(dataBind.refresh)) {
        if (control.isTextField()) {
          let textField = control.as(SC.TextField);
          if (typeof dataBind.refresh === "string") {
            if (dataBind.refresh.startsWith("TID_")) {
              textField.setText(SC.StringTable.getString(dataBind.refresh));
            } else {
              textField.setText(dataBind.refresh);
            }
          } else if (typeof dataBind.refresh === "function") {
            let ret = dataBind.refresh.call(this, control);
            if (typeof ret === "string") {
              textField.setText(ret);
            }
          }
        } else {
          if (typeof dataBind.refresh === "function") {
            dataBind.refresh.call(this, control);
          }
        }
      }
      if (isValid(dataBind.visible)) {
        if (typeof dataBind.visible === "boolean") {
          control.m_visible = dataBind.visible;
        } else if (typeof dataBind.visible === "function") {
          let ret = dataBind.visible.call(this, control);
          if (typeof ret === "boolean") {
            control.m_visible = ret;
          }
        }
      }
      if (isValid(dataBind.interactive)) {
        if (typeof dataBind.interactive === "boolean") {
          control.m_interactive = dataBind.interactive;
        } else if (typeof dataBind.interactive === "function") {
          let ret = dataBind.interactive.call(this, control);
          if (typeof ret === "boolean") {
            control.m_interactive = ret;
          }
        }
      }
    } catch (e) {
      handleException(e, `refreshControl ${dataBind.path}`);
    }
  }
  refreshControls(dataBinds) {
    if (!dataBinds) {
      return;
    }
    for (const dataBind of dataBinds) {
      let control = dataBind.controlBinded;
      if (!control) {
        continue;
      }
      this.refreshControl(dataBind);
    }
  }
  getDataBindByID(dataBindID, dataBinds) {
    if (!dataBindID) {
      return null;
    }
    for (const dataBind of dataBinds) {
      if (dataBind.id === dataBindID) {
        return dataBind;
      }
    }
    return null;
  }
  refreshControlById(dataBindID, dataBinds) {
    if (!dataBindID) {
      return;
    }
    let dataBind = this.getDataBindByID(dataBindID, dataBinds);
    if (!dataBind) {
      return;
    }
    this.refreshControl(dataBind);
  }
  //#endregion data driven
}
export {
  GUIContainerBase as default
};
//# sourceMappingURL=GUIContainerBase.mjs.map
