let SpriteConstructor = SC.Sprite.prototype.constructor;
let CustomButtonConstructor = SC.CustomButton.prototype.constructor;
let ScrollAreaConstructor = SC.ScrollArea.prototype.constructor;
let GUIContainerConstructor = SC.GUIContainer.prototype.constructor;
let ShapeConstructor = SC.Shape.prototype.constructor;
let TextFieldConstructor = SC.TextField.prototype.constructor;
let MovieClipConstructor = SC.MovieClip.prototype.constructor;
function checkSpriteType(sprite, castToClass) {
  if (castToClass == ShapeConstructor) return sprite.isShape();
  if (castToClass == TextFieldConstructor) return sprite.isTextField();
  if (castToClass == CustomButtonConstructor) return sprite.isCustomButton();
  if (castToClass == SpriteConstructor) return sprite.isSprite();
  if (castToClass == ScrollAreaConstructor) return sprite.isScrollArea();
  if (castToClass == GUIContainerConstructor) return sprite.isGUIContainer();
  if (castToClass == MovieClipConstructor) return sprite.isMovieClip();
  SC.Debugger.error("Not support type");
  return false;
}
function getPopupSprite(fromPopup, path, castToClass, checker) {
  return getSpriteFrom(SC.GUI.getInstance().getPopupByType(fromPopup), path, castToClass, checker);
}
function getPopupSprites(fromPopup, path, castToClass, checker) {
  return getSpritesFrom(SC.GUI.getInstance().getPopupByType(fromPopup), path, castToClass, checker);
}
function getSprite(path, castToClass, checker) {
  return getSpriteFrom(SC.Stage.getInstance().getMainSprite(), path, castToClass, checker);
}
function getSprites(path, castToClass, checker) {
  return getSpritesFrom(SC.Stage.getInstance().getMainSprite(), path, castToClass, checker);
}
function getSpritesFrom(container, path, castToClass, inChecker) {
  if (!container) return [];
  let results;
  if (castToClass || inChecker) {
    let checker = inChecker;
    if (castToClass) {
      checker = (displayObject) => {
        if (inChecker) return inChecker(displayObject) && checkSpriteType(displayObject, castToClass);
        return checkSpriteType(displayObject, castToClass);
      };
    }
    results = SC.GUIUtils.findSpritesVec(container, path, checker);
  } else
    results = SC.GUIUtils.findSpritesVec(container, path);
  let castedArray = [];
  let num = results.size();
  if (castToClass) {
    for (let i = 0; i < num; i++) {
      castedArray.push(cast(results.get(i), castToClass));
    }
  } else {
    for (let i = 0; i < num; i++) {
      castedArray.push(results.get(i));
    }
  }
  return castedArray;
}
function getSpriteFrom(container, path, castToClass, inChecker) {
  if (!container) return null;
  let ret = null;
  if (castToClass || inChecker) {
    let checker = inChecker;
    if (castToClass) {
      checker = (displayObject) => {
        if (inChecker) return inChecker(displayObject) && checkSpriteType(displayObject, castToClass);
        return checkSpriteType(displayObject, castToClass);
      };
    }
    ret = SC.GUIUtils.findSprite(container, path, checker);
  } else {
    ret = SC.GUIUtils.findSprite(container, path);
  }
  if (ret) {
    if (ret && castToClass) {
      return cast(ret, castToClass);
    }
    return ret;
  }
  return null;
}
function tips(msg, warning, showLong) {
  warning = warning || false;
  showLong = showLong || false;
  SC.GUI.getInstance().hudPrint(msg, warning, showLong);
}
function getText(displayObject, recursive = false) {
  if (!displayObject) return null;
  if (displayObject.isTextField()) {
    return SC.TextField.prototype.getText.call(displayObject);
  }
  if (recursive) {
    return getTextInChildren(displayObject);
  }
  return null;
}
function isMovieclipAtLabel(mc, label) {
  if (!mc.isStopped()) return false;
  let frameIndex = mc.getFrameIndex(label);
  if (frameIndex < 0) return false;
  return frameIndex == mc.getCurrentFrame();
}
function getTextInChildren(displayObject) {
  if (displayObject.isMovieClip()) {
    let mc = cast(displayObject, SC.MovieClip);
    let childNum = mc.getTimelineChildCount();
    for (let i = 0; i < childNum; i++) {
      let child = mc.getTimelineChild(i);
      if (child.isTextField()) {
        return SC.TextField.prototype.getText.call(child);
      } else if (child.isSprite()) {
        let result = getTextInChildren(cast(child, SC.Sprite));
        if (result) return result;
      }
    }
    return null;
  }
  if (displayObject.isSprite()) {
    let sprite = cast(displayObject, SC.Sprite);
    let num = sprite.getNumChildren();
    for (let i = 0; i < num; i++) {
      let child = sprite.getChildAt(num);
      if (child.isTextField()) {
        return SC.TextField.prototype.getText.call(child);
      } else if (child.isSprite()) {
        let result = getTextInChildren(cast(child, SC.Sprite));
        if (result) return result;
      }
    }
    return null;
  }
  return null;
}
function defaultValue(v, defaultValue2) {
  if (v == void 0) {
    return defaultValue2;
  }
  return v;
}
const CommonEventDataMaxNum = 3;
function makePara(...para) {
  let commonEvt = new SC.CommonEventData();
  if (para.length == 0) return commonEvt;
  if (para.length > CommonEventDataMaxNum) {
    SC.Debugger.error(`createPara num ${para.length}`);
  }
  for (let i = 0; i < para.length && i < CommonEventDataMaxNum; i++) {
    let p = para[i];
    if (p === null || p === void 0) {
      continue;
    }
    let t = typeof p;
    if (t == "number") {
      if (Number.isInteger(p)) {
        commonEvt.setInt(i, p);
      } else {
        commonEvt.setFloat(i, p);
      }
    } else if (t == "string") {
      commonEvt.setStr(i, p);
    } else if (t == "bigint") {
      commonEvt.setInt64(i, p);
    } else if (
      /*p instanceof SC.DisplayObject*/
      typeof p.isSprite == "function"
    ) {
      commonEvt.setDisplayObject(i, p);
    } else if (
      /*p instanceof SC.PiranhaMessage*/
      typeof p.getMessageType == "function"
    ) {
      commonEvt.setNetMessage(i, p);
    } else if (
      /*p instanceof SC.LogicData*/
      typeof p.getCSVRow == "function"
    ) {
      commonEvt.setLogicData(i, p);
    } else if (t == "object") {
      commonEvt.setJsObject(i, p);
    }
  }
  return commonEvt;
}
let checkFunctions = ["isInt", "isFloat", "isStr", "isInt64", "isDisplayObject", "isNetMessage", "isLogicData", "isJsObject"];
let getFunctions = ["getInt", "getFloat", "getStr", "getInt64", "getDisplayObject", "getNetMessage", "getLogicData", "getJsObject"];
function parasToAnyArray(event) {
  if (!event) return [];
  let result = [];
  for (let i = 0; i < CommonEventDataMaxNum; i++) {
    result.push(void 0);
    let types = checkFunctions.length;
    for (let j = 0; j < types; j++) {
      let checkFunction = event[checkFunctions[j]];
      let getFunction = event[getFunctions[j]];
      if (checkFunction && getFunction && checkFunction.call(event, i)) {
        result[i] = getFunction.call(event, i);
      }
    }
  }
  return result;
}
function openGenericPopup(params) {
  let scope = SC.GameTSUtilExt.loadStandaloneAsset(params.scFile, "");
  let popup = allocWithoutGC(
    SC.ScriptableGenericPopup,
    params.module,
    params.scFile,
    params.clip,
    params.para ? makePara(...params.para) : makePara(),
    defaultValue(params.fullScreen, false),
    defaultValue(params.glowBg, false),
    defaultValue(params.bgAssetFile, ""),
    defaultValue(params.bgAsset, ""),
    defaultValue(params.fullScreenHeader, ""),
    defaultValue(params.fullScreenHeaderFile, "")
  );
  SC.GameTSUtilExt.cacheAssetScope(popup, scope);
  SC.GUI.getInstance().showPopup(popup, defaultValue(params.centered, true), defaultValue(params.canAddMultiple, false), defaultValue(params.darkenBackground, false));
  return popup;
}
function openPopup(params) {
  let scope = SC.GameTSUtilExt.loadStandaloneAsset(params.scFile, "");
  let popup = allocWithoutGC(
    SC.ScriptablePopup,
    params.module,
    params.scFile,
    params.clip,
    params.para ? makePara(...params.para) : makePara(),
    defaultValue(params.fullScreen, false),
    defaultValue(params.glowBg, false),
    defaultValue(params.bgAssetFile, ""),
    defaultValue(params.bgAsset, ""),
    defaultValue(params.fullScreenHeader, ""),
    defaultValue(params.fullScreenHeaderFile, "")
  );
  SC.GameTSUtilExt.cacheAssetScope(popup, scope);
  SC.GUI.getInstance().showPopup(popup, defaultValue(params.centered, true), defaultValue(params.canAddMultiple, false), defaultValue(params.darkenBackground, false));
  return popup;
}
function newGameGUIContainer(params) {
  let paras = params.para ? makePara(...params.para) : makePara();
  return SC.GUIUtils.createScriptableGUIContainer(params.module, params.scFile, params.clip, paras);
}
export {
  CommonEventDataMaxNum,
  getPopupSprite,
  getPopupSprites,
  getSprite,
  getSpriteFrom,
  getSprites,
  getSpritesFrom,
  getText,
  isMovieclipAtLabel,
  makePara,
  newGameGUIContainer,
  openGenericPopup,
  openPopup,
  parasToAnyArray,
  tips
};
//# sourceMappingURL=gui.mjs.map
