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
export {
  getPopupSprite,
  getPopupSprites,
  getSprite,
  getSpriteFrom,
  getSprites,
  getSpritesFrom,
  getText,
  isMovieclipAtLabel,
  tips
};
//# sourceMappingURL=gui.mjs.map
