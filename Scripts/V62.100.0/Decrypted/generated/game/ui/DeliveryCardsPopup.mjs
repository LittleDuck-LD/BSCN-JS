import PopupBase from "../base/PopupBase.mjs";
import { tips } from "../base/gui.mjs";
import { LotteryConfig } from "../config/activity-cfg.mjs";
var GameplayHapticType = /* @__PURE__ */ ((GameplayHapticType2) => {
  GameplayHapticType2[GameplayHapticType2["None"] = 0] = "None";
  GameplayHapticType2[GameplayHapticType2["Weak"] = 1] = "Weak";
  GameplayHapticType2[GameplayHapticType2["Medium"] = 2] = "Medium";
  GameplayHapticType2[GameplayHapticType2["Strong"] = 3] = "Strong";
  GameplayHapticType2[GameplayHapticType2["Undefined"] = 4] = "Undefined";
  return GameplayHapticType2;
})(GameplayHapticType || {});
class DeliveryCardsPopup extends PopupBase {
  constructor(popup) {
    super(popup);
    this.openedChest = false;
    this.skinSplashMovieclip = null;
    this.skinToShow = null;
    try {
      this.cPopup = popup.as(SC.DeliveryCardsPopup);
      console.log("DeliveryCardsPopup TS: constructor");
      let cb = (popupType) => {
        if (popupType == SC.PopupBase.PopupType.SKIN_ANIM_SEQUENCE_POPUP && this.cPopup.m_state == SC.DeliveryCardsPopup.STATE_PRE_EGG && this.isLotteryReward()) {
          this.cPopup.proceedToState(SC.DeliveryCardsPopup.STATE_REVEAL, true);
          this.clearTimer(this.vibrationTimerId);
        }
      };
      this.subscribe("lotterbox_done", cb);
      this.subscribe("cpp_popup_close", cb);
      this.subscribe("skin_anim_sequence_done", (popupType) => {
        if (this.cPopup && this.cPopup.m_pCont) {
        }
      });
    } catch (error) {
      handleException(error, "DeliveryCardsPopup TS: constructor");
    }
  }
  //#region CPP CALLBACKS; return true to block native code.
  // cpp callback
  onSetData(data) {
    try {
      if (this.isLotteryReward()) {
        let toLog = LASER_DEBUG;
        let ret = `DeliveryCardsPopup TS: onSetData ${this.cPopup?.getK2RewardLevel()} 
`;
        for (let i = 0; i < data.size(); i++) {
          let chest = data.get(i);
          if (toLog) ret += ` chest: ${chest.getChestType()} 
`;
          let dropCount = chest.getDrops().size();
          for (let j = 0; j < dropCount; j++) {
            let drop = chest.getDrops().get(j);
            if (drop.getSkin() && this.hasHighlightAnim(drop.getSkin())) {
              drop.setK2ShowDropType(SC.LogicGatchaDrop.K2ShowDropType.K2_SHOW_TYPE_SKIP_HERO_ANIMATION);
            }
            if (toLog) ret += ` drop: ${drop.getType()} count: ${drop.getCount()} ${drop.getHero()?.getName() ?? ""}  ${drop.getSkin()?.getName() ?? ""}
`;
          }
        }
        if (toLog) console.log(ret);
      }
    } catch (error) {
      handleException(error, "onSetData");
    }
    return false;
  }
  // cpp callback
  sortData() {
    try {
      if (!this.cPopup || !this.cPopup.m_pChests) return false;
      console.log("DeliveryCardsPopup TS: sortData ");
    } catch (error) {
      handleException(error, "sortData");
    }
    return false;
  }
  // cpp callback [pre-refresh] Similar: onProceedToNextChest + onProceedToState
  onProceedToNextChest(state) {
    try {
      console.log(`DeliveryCardsPopup TS: onProceedToNextChest ${state}`);
      if (this.isLotteryReward()) {
        if (state == SC.DeliveryCardsPopup.STATE_PRE_EGG) {
          if (this.openedChest && !this.checkCurrentChestHasSkin()) {
            this.cPopup.m_state = SC.DeliveryCardsPopup.STATE_REVEAL;
            this.cPopup.refresh();
            return true;
          }
        }
      }
    } catch (error) {
      handleException(error, "onProceedToState");
    }
    return false;
  }
  // cpp callback [pre-refresh] Similar: onProceedToNextChest + onProceedToState
  onProceedToState(state) {
    try {
      console.log(`DeliveryCardsPopup TS: onProceedToState ${state}`);
      if (this.isLotteryReward()) {
        if (state == SC.DeliveryCardsPopup.STATE_REVEAL) {
          if (!this.openedChest) {
            this.cPopup.m_state = SC.DeliveryCardsPopup.STATE_PRE_EGG;
            this.cPopup.refresh();
            return true;
          }
        }
        if (state == SC.DeliveryCardsPopup.STATE_PRE_EGG) {
          if (this.openedChest && !this.checkCurrentChestHasSkin()) {
            this.cPopup.m_state = SC.DeliveryCardsPopup.STATE_REVEAL;
            this.cPopup.refresh();
            return true;
          }
        }
      }
    } catch (error) {
      handleException(error, "onProceedToState");
    }
    return false;
  }
  // cpp callback
  tryShowSkinAnimSequence(skin) {
    try {
      this.skinToShow = null;
      if (this.isLotteryReward() && this.hasHighlightAnim(skin)) {
        let skinConfigK2 = skin.getConfData()?.m_pSkinConfigDataK2;
        if (skinConfigK2) {
          let file = skinConfigK2.getHightlightSplashFile();
          let movieClip = skinConfigK2.getHightlightSplashMovieClip();
          if (file.length > 0 && movieClip.length > 0) {
            this.skinToShow = skin;
            this.cPopup.loadAndCacheAssetScope(file);
            this.skinSplashMovieclip = this.createManagedMovieClip(file, movieClip);
            this.cPopup.addChild(this.skinSplashMovieclip);
            let delyTime = this.skinSplashMovieclip.getMSPerFrame() * this.skinSplashMovieclip.getTotalFrames() * 1e3;
            this.delay(this.skinSplashFinished, delyTime);
            return true;
          }
        }
        this.openSkinSequenceAnim(skin);
      }
    } catch (error) {
      handleException(error, "tryShowSkinAnimSequence ");
    }
    return false;
  }
  // cpp callback
  refresh(state) {
    try {
      console.log(`DeliveryCardsPopup TS: refresh ${state}`);
      if (!this.cPopup) return false;
      if (this.isLotteryReward()) {
        if (state == SC.DeliveryCardsPopup.STATE_PRE_EGG) {
          if (!this.openedChest) {
            SC.HomeMode.getInstance().getHomeScreen().hideLoadingIcon();
            this.openLotteryBox();
            return true;
          }
        }
      }
    } catch (error) {
      handleException(error, "DeliveryCardsPopup TS: refresh");
    }
    return false;
  }
  //#endregion CPP CALLBACKS
  skinSplashFinished() {
    if (this.skinSplashMovieclip && this.skinToShow) {
      this.openSkinSequenceAnim(this.skinToShow);
      this.skinToShow = null;
      this.skinSplashMovieclip.stop();
      this.skinSplashMovieclip.removeFromParent();
      this.destroyManagedObject(this.skinSplashMovieclip);
      this.skinSplashMovieclip = null;
    }
  }
  checkCurrentChestHasSkin() {
    let chests = this.cPopup.getData();
    if (!chests || chests.size() == 0) return false;
    if (this.cPopup.getChestIndex() >= chests.size()) return false;
    let chest = chests.get(this.cPopup.getChestIndex());
    if (chest) {
      let dropCount = chest.getDrops().size();
      for (let i = 0; i < dropCount; i++) {
        let drop = chest.getDrops().get(i);
        if (drop.getSkin() || drop.getHero()) {
          return true;
        }
      }
    }
    return false;
  }
  openSkinSequenceAnim(skin) {
    this.openSkinSequenceAnimInternal(skin, false, "skin_anim_sequence_done", true);
  }
  openSkinSequenceAnimInternal(skin, clickClose, closeEvent, canOpenMultiple) {
    console.log(`DeliveryCardsPopup TS: tryShowSkinAnimSequence ${skin.getName()}`);
    let hideBackBtn = true;
    let skinAnimSequence = SC.SkinAnimSequencePopup.getSkinAnimSequenceData(skin, SC.LogicSkinAnimSequenceData.SequenceType.SEQUENCE_TYPE_HIGHLIGHT);
    if (!skinAnimSequence && LASER_DEBUG) {
      tips(`ERROR: ${skin.getName()} missing HighlightAnimSequence`);
      skinAnimSequence = SC.LogicDataTables.getSkinAnimSequenceByName("UndertakerSBHighlightSequence", null);
    }
    let seq = null;
    if (skinAnimSequence) {
      seq = allocWithoutGC(SC.SkinAnimSequencePopup, skin, skinAnimSequence, SC.SceneCharacter.AnimId.ANIM_HIGHLIGHT, closeEvent, clickClose, hideBackBtn);
      SC.GUI.getInstance().showPopup(seq, false, canOpenMultiple);
    }
    return seq;
  }
  openLotteryBox() {
    let skin = SC.LogicDataTables.getSkinByName("LotteryBox", null);
    let level = this.cPopup.getK2RewardLevel();
    let skinName = `LotteryBox$0{level <= 1 ? "" : level.toString()}`;
    let levelSkin = SC.LogicDataTables.getSkinByName(skinName, null);
    this.openedChest = true;
    if (levelSkin) skin = levelSkin;
    let popup = this.openSkinSequenceAnimInternal(skin, false, "lotterbox_done", true);
    let vibrationConfig = LotteryConfig.ChestVibration[level - 1];
    if (vibrationConfig) {
      let effectManager = popup?.getSceneRenderer()?.getRenderSystem()?.getEffectManager();
      let index = 0;
      let cb = void 0;
      cb = () => {
        this.clearTimer(this.vibrationTimerId);
        index++;
        if (index == vibrationConfig.length && effectManager) {
          effectManager.playHapticFeedback(3 /* Strong */);
          return;
        }
        if (effectManager) effectManager.playHapticFeedback(3 /* Strong */);
        if (index >= vibrationConfig.length) return;
        this.vibrationTimerId = this.delay(cb, vibrationConfig[index] * 1e3 / 30);
      };
      this.vibrationTimerId = this.delay(cb, vibrationConfig[index] * 1e3 / 30);
    }
  }
  hasHighlightAnim(skin) {
    let skinAnimSequence = SC.SkinAnimSequencePopup.getSkinAnimSequenceData(skin, SC.LogicSkinAnimSequenceData.SequenceType.SEQUENCE_TYPE_HIGHLIGHT);
    return skinAnimSequence != null;
  }
  isLotteryReward() {
    if (!this.cPopup) return false;
    return this.cPopup.getK2RewardLevel() > 0;
  }
  onReady() {
    super.onReady();
    console.log("DeliveryCardsPopup TS: onReady");
  }
  onUpdate(dt) {
  }
  onDestruct() {
    console.log("DeliveryCardsPopup TS: onDestruct");
  }
}
export {
  DeliveryCardsPopup as default
};
//# sourceMappingURL=DeliveryCardsPopup.mjs.map
