import { send } from "../../base/event.mjs";
import GUIContainerBase from "../../base/GUIContainerBase.mjs";
import { ManagedType } from "../../base/ObjectBase.mjs";
import { Type as LogicGemOfferType } from "../../enum/LogicGemOffer.mjs";
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}
var RewardState = /* @__PURE__ */ ((RewardState2) => {
  RewardState2[RewardState2["NotEarned"] = 1] = "NotEarned";
  RewardState2[RewardState2["ReadyToClaim"] = 2] = "ReadyToClaim";
  RewardState2[RewardState2["Claimed"] = 3] = "Claimed";
  return RewardState2;
})(RewardState || {});
class ActivityMilestoneContainer extends GUIContainerBase {
  constructor(container) {
    super(container, SC.GameGUIContainer);
    this.skinAlbumName = "EvaCollabSkinAlbum";
    console.log("ActivityMilestoneContainer TS: constructor");
    this.constructContent();
    this.setupEventMilestone();
    this.setupEventSkins();
    this.refreshEventSkins();
    this.subscribe("cpp_onItemsDelivered", this.onItemsDelivered);
  }
  constructContent() {
    try {
      console.log("ActivityMilestoneContainer TS: constructScrollArea");
      let stage = SC.Stage.getInstance();
      this.scrollArea = new SC.ScrollArea(stage.getStageWidth(), stage.getStageHeight(), 1);
      this.cobj.getMovieClip().addChild(this.scrollArea);
      this.manage(this.scrollArea, ManagedType.UpdateAndAutoDestroy);
      this.scrollArea.enableHorizontalDrag(true);
      this.scrollArea.enableVerticalDrag(false);
      this.scrollArea.setAlignment(SC.DragHandler.ALIGN_TOP | SC.DragHandler.ALIGN_LEFT);
      this.scrollArea.setPixelSnappedXY(0, 0);
      this.scrollArea.enablePinching(false);
      let collabScFileName = SC.CollabUtil.getDownloadedScFilenameAny();
      this.contentMovieClip = SC.StringTable.getMovieClip(collabScFileName, "activity_prize_draw_illustrated");
      this.contentMovieClip.m_interactive = true;
      this.scrollArea.addContentDontUpdateBounds(this.contentMovieClip);
      this.contentMovieClip.setPixelSnappedXY(0, stage.getStageHeight() / 2);
      this.manage(this.contentMovieClip, ManagedType.AutoDestroy);
      this.scrollArea.updateBounds();
      let bound = this.scrollArea.getContentBounds();
      console.log(`bound.left = ${bound.m_left}, bound.right = ${bound.m_right}`);
      let contentBounds = allocWithoutGC(SC.Rect, bound.m_left, bound.m_top, bound.m_left + bound.m_right, bound.m_bottom);
      this.scrollArea.setForcedContentBounds(contentBounds);
      this.scrollArea.getDragHandler().setLimitToBorders(true);
      this.createButtonParent("btn_right", this.contentMovieClip, this.onNextTabButtonClick);
    } catch (e) {
      handleException(e, "ActivityMilestoneContainer TS: constructor");
    }
  }
  createButtonWithParent(parent, instanceName, callBack) {
    let button = this.cobj.addGameButton(parent, instanceName);
    if (!button) {
      SC.Debugger.error("can not find btn:" + instanceName);
      return null;
    }
    let cb = (responseBtn) => {
      let result = callBack.call(this, responseBtn);
      if (result) return true;
      return false;
    };
    SC.GUIUtils.setButtonPressed(button, cb);
    return button;
  }
  setupEventSkins() {
    let eventSkins = this.contentMovieClip;
    this.heroRendererGroup = new SC.HeroRendererGroup();
    this.manage(this.heroRendererGroup, ManagedType.UpdateAndAutoDestroy);
    let playerData = SC.HomeMode.getInstance().getLogicHome().getHome().getPlayerData();
    let skinAlbum = SC.LogicDataTables.getSkinAlbumByName(this.skinAlbumName, null);
    let skinOfferNumber = 0;
    for (let i = 0; i < skinAlbum.getSkinsCount(); i++) {
      let skin = skinAlbum.getSkinsAt(i);
      if (!skin || skinAlbum.isExcludedFromCompletionCheck(skin))
        continue;
      ++skinOfferNumber;
      let skinDisplay = SC.MovieClipHelper.getMovieClipOrWarning(eventSkins, "item_" + skinOfferNumber);
      console.log("skinDisplay = " + skinDisplay);
      if (skinDisplay != null) {
        let heroArea = SC.MovieClipHelper.getMovieClipOrWarning(skinDisplay, "unlock", "hero_area");
        this.heroRendererGroup.createWithoutParams(heroArea, skin);
        if (SC.MovieClipHelper.getMovieClipOrWarning(skinDisplay, "bounds")) {
          heroArea.m_interactive = false;
          if (skin.isProgressionSkin()) {
            let unlockedLevel = playerData && playerData.getUnlockedProgressionSkinLevel(skin);
            if (unlockedLevel > 1) {
              let unlockedSkin = SC.LogicDataTables.findProgressionSkinByLevel(skin, unlockedLevel);
              if (unlockedSkin) {
                skin = unlockedSkin;
              }
            }
          }
          let skinBtn = this.cobj.addGameButton(skinDisplay, "bounds");
          let cb = (responseBtn) => {
            console.log("click skin ", skin.getName());
            this.openSkinPreview(skin);
            return false;
          };
          SC.GUIUtils.setButtonPressed(skinBtn, cb);
        }
        let skinInfoMovieClip = SC.MovieClipHelper.getMovieClipOrWarning(skinDisplay, "hero_eva_info");
        if (skinInfoMovieClip != null) {
          skinInfoMovieClip.setText("txt_name", SC.StringTable.getString(skin.getShopTID()));
        }
        let lockMovieClip = SC.MovieClipHelper.getMovieClipOrWarning(skinDisplay, "item_lock");
        if (lockMovieClip != null) {
          lockMovieClip.setText("txt_lock", SC.StringTable.getString("TID_COLLAB_K2_EVA_SKIN_UNLOCK_TIPS") + skinOfferNumber);
        }
      }
    }
  }
  setupEventMilestone() {
    let milestoneMovieClip = this.contentMovieClip.getMovieClipByName("event_milestone");
    if (milestoneMovieClip == null) return;
    let collabEvent = SC.CollabUtil.getCollabEvent();
    let playerCollabEventData = SC.CollabUtil.getPlayerCollabEventData();
    let currentCollabScore = 0;
    if (playerCollabEventData != null) {
      currentCollabScore = playerCollabEventData.getScore();
    }
    console.log("collabEvent = " + collabEvent + ", currentCollabScore = " + currentCollabScore);
    if (collabEvent == null) return;
    let milestones = collabEvent.getScoreRewardMilestones();
    let milestoneCount = collabEvent.getScoreRewardMilestonesCount();
    let maxCollabScore = SC.CollabUtil.getScoreForCompleteAllMilestones();
    console.log("milestoneCount = " + milestoneCount + ", maxCollabScore = " + maxCollabScore);
    let curScoreMovieClip = milestoneMovieClip.getMovieClipByName("item_jishuqi");
    if (curScoreMovieClip != null) {
      let bg = curScoreMovieClip.getMovieClipByName("bg_jishuqi");
      bg?.gotoAndStop("filled");
      curScoreMovieClip.setNumberText("txt_number_jishuqi", currentCollabScore);
      curScoreMovieClip.setText("txt_jishuqi", SC.StringTable.getString("TID_K2_EVA_STAR_AMOUNT"));
      let cb = (responseBtn) => {
        let collabScFileName = SC.CollabUtil.getDownloadedScFilenameAny();
        if (SC.MovieClipHelper.hasMovieClip(collabScFileName, "collab_info_screen_center")) {
          let infoPopup = allocWithoutGC(SC.InfoPopup, SC.InfoPopup.InfoScreenType.SCREEN_COLLAB_INFO, "", collabScFileName);
          SC.GUI.getInstance().showPopup(infoPopup, false);
        } else {
          console.log("collab_info_screen_center is not found in ", collabScFileName);
        }
        return false;
      };
      this.createButtonWithParent(curScoreMovieClip, "btn_info", cb);
    }
    let maxItems = 5;
    let preRewardScore = 0;
    for (let i = 0; i < milestoneCount && i < maxItems; i++) {
      let rewardItemName = "item_reward_" + (i + 1);
      let rewardItemMovieClip = milestoneMovieClip.getMovieClipByName(rewardItemName);
      let scoreTextField = milestoneMovieClip.getTextFieldByName("score_text_" + (i + 1));
      let progressBarMovieClip = milestoneMovieClip.getMovieClipByName("progress_purple_" + (i + 1));
      let lineMovieClip = milestoneMovieClip.getMovieClipByName("line_" + (i + 1));
      if (rewardItemMovieClip == null || scoreTextField == null || progressBarMovieClip == null) continue;
      let milestone = milestones.get(i);
      if (milestone == null) {
        console.log("milestone == null");
        continue;
      }
      let reward = milestone.getRewardWithFallbacksAt(0);
      let rewardScore = milestone.getCumulativePointsThreshold();
      let frameTotal = progressBarMovieClip.getTotalFrames();
      let rewardBg = rewardItemMovieClip.getMovieClipByName("bg_btn_green");
      if (currentCollabScore >= rewardScore) {
        progressBarMovieClip.gotoAndStopFrameIndex(frameTotal - 1);
        lineMovieClip?.gotoAndStop("liang");
        rewardBg?.gotoAndStop("liang");
      } else if (currentCollabScore > preRewardScore && currentCollabScore < rewardScore) {
        let curFrameIndex = clamp((currentCollabScore - preRewardScore) * (frameTotal - 1) / (rewardScore - preRewardScore), 0, frameTotal - 1);
        progressBarMovieClip.gotoAndStopFrameIndex(curFrameIndex);
        lineMovieClip?.gotoAndStop("hui");
        rewardBg?.gotoAndStop("an");
      } else {
        progressBarMovieClip.gotoAndStopFrameIndex(0);
        lineMovieClip?.gotoAndStop("hui");
        rewardBg?.gotoAndStop("an");
      }
      preRewardScore = rewardScore;
      if (reward == null) {
        console.log("reward == null");
        continue;
      }
      let rewardType = reward.getType();
      let rewardCount = reward.getCount();
      let rewardState = this.getMilestoneRewardState(rewardScore);
      console.log("rewardState = " + rewardState);
      scoreTextField.setNumberText(rewardScore);
      if (rewardType == LogicGemOfferType.TYPE_GEMS) {
        rewardItemMovieClip.setNumberText("txt_award", rewardCount);
      } else {
        rewardItemMovieClip.setChildVisible("txt_award", false);
      }
      if (rewardType == LogicGemOfferType.TYPE_SKIN) {
        let skin = reward.getSkin();
        if (skin != null) {
          let cb = (responseBtn) => {
            console.log("skin " + skin.getName() + " clicked, call openSkinPreview");
            this.openSkinPreview(skin);
            return false;
          };
          this.createButtonWithParent(milestoneMovieClip, rewardItemName, cb);
        }
      } else if (rewardType == LogicGemOfferType.TYPE_BRAWL_PASS_UNLOCK_BRAWLER) {
        let cb = (responseBtn) => {
          console.log("reward TYPE_BRAWL_PASS_UNLOCK_BRAWLER clicked");
          if (rewardState == 2 /* ReadyToClaim */) {
            SC.BrawlPassUnlockBrawlerPopup.showEventVersion(rewardCount, rewardScore);
          } else {
            let infoPopup = allocWithoutGC(SC.InfoPopup, SC.InfoPopup.InfoScreenType.SCREEN_BRAWLPASS_UNLOCK_ANY_BRAWLER_INFO, "", "");
            SC.GUI.getInstance().showPopup(infoPopup, false);
            this.replaceInfoPopupTextAndIcon(infoPopup, rewardScore);
          }
          return false;
        };
        this.createButtonWithParent(milestoneMovieClip, rewardItemName, cb);
      } else if (rewardType == LogicGemOfferType.TYPE_K2_EVA_FRAGMENT || rewardType == LogicGemOfferType.TYPE_K2_EVA_DRAW_TOKEN) {
        let cb = (responseBtn) => {
          console.log("other reward type:", rewardType);
          send("ActivityPopup_select_tab_by_index", 1);
          return false;
        };
        this.createButtonWithParent(milestoneMovieClip, rewardItemName, cb);
      }
    }
  }
  onNextTabButtonClick(btn) {
    send("ActivityPopup_select_tab_by_index", 1);
    return true;
  }
  refreshEventSkins() {
    let eventSkins = this.contentMovieClip;
    let playerData = SC.HomeMode.getInstance().getLogicHome().getHome().getPlayerData();
    let skinAlbum = SC.LogicDataTables.getSkinAlbumByName(this.skinAlbumName, null);
    let skinOfferNumber = 0;
    for (let i = 0; i < skinAlbum.getSkinsCount(); i++) {
      let skin = skinAlbum.getSkinsAt(i);
      if (!skin || skinAlbum.isExcludedFromCompletionCheck(skin))
        continue;
      ++skinOfferNumber;
      let skinDisplay = SC.MovieClipHelper.getMovieClipOrWarning(eventSkins, "item_" + skinOfferNumber);
      if (skinDisplay != null) {
        const owned = playerData && playerData.hasUnlockedSkin(skin);
        console.log("###### skin ", skin.getName(), ", is unlock = ", owned);
        skinDisplay.setChildVisible("item_lock", !owned);
      }
    }
    let eventMilestoneMovieClip = this.contentMovieClip.getMovieClipByName("event_milestone");
    if (eventMilestoneMovieClip != null) {
      let skinsUnlocked = SC.CollabUtil.getNumberOfUnlockedSkinsThatCountTowardsCompletionCheck(skinAlbum);
      let skinsTotal = skinAlbum.getNumberOfSkinsThatCountTowardsCompletionCheck();
      let ownedStr = SC.StringTable.getString("TID_SKIN_ALBUM_OWNED");
      ownedStr = ownedStr.replace("<NUM>", skinsUnlocked.toString());
      ownedStr = ownedStr.replace("<MAX>", skinsTotal.toString());
      console.log("############# ownedStr = ", ownedStr);
      SC.MovieClipHelper.setText(ownedStr, eventMilestoneMovieClip, "item_topright", "txt_progress_topright");
      let topBar = eventMilestoneMovieClip.getMovieClipByName("item_topright");
      let skinsProgress = topBar?.getMovieClipByName("progress_topright");
      if (skinsProgress != null) {
        let totalFrames = skinsProgress.getTotalFrames();
        let curFrame = clamp(totalFrames * skinsUnlocked / skinsTotal, 0, totalFrames - 1);
        skinsProgress.gotoAndStopFrameIndex(curFrame);
      }
    }
  }
  // HACK: Replace the first info text. By default it references brawl pass.
  replaceInfoPopupTextAndIcon(infoPopup, milestoneThreshold) {
    if (infoPopup == null) return;
    for (let childIndex = 0; childIndex < infoPopup.getMovieClip().getNumChildren(); ++childIndex) {
      let child = infoPopup.getMovieClip().getChildAt(childIndex);
      if (!child || !child.isMovieClip())
        continue;
      let clip = child.as(SC.MovieClip);
      if (!clip.getExportName() || clip.getExportName() != "brawlpass_unlock_any_brawler_info_screen_center")
        continue;
      let replacementInfoText1 = SC.StringTable.getString("TID_COLLAB_K2_EVA_UNLOCK_EPIC_BRAWLER_POPUP_INFO").replace("<VALUE>", milestoneThreshold.toString());
      SC.MovieClipHelper.setText(replacementInfoText1, clip, "info_txt1", "TID_BRAWLPASS_UNLOCK_ANY_BRAWLER_INFO_TXT1");
      if (!SC.LogicDataTables.getClientGlobals().getBoolValueSafe("DISABLE_UNLOCK_BRAWLER_INFO_POPUP_HACK", false)) {
        for (let wrapperChildIndex = 0; wrapperChildIndex < clip.getTimelineChildCount(); ++wrapperChildIndex) {
          let potentialWrapper = clip.getTimelineChild(wrapperChildIndex);
          if (!potentialWrapper || !potentialWrapper.isMovieClip())
            continue;
          let wrapper = potentialWrapper.as(SC.MovieClip);
          if (!SC.MovieClipHelper.getMovieClipOptional(wrapper, "brawler_unlock"))
            continue;
          if (!SC.MovieClipHelper.hasMovieClip(SC.CollabUtil.getDownloadedScFilenameAny(), "icon_collab_activity"))
            break;
          let replacementInfoImage = SC.StringTable.getMovieClip(SC.CollabUtil.getDownloadedScFilenameAny(), "icon_collab_activity");
          wrapper.changeTimelineChild("brawler_unlock", replacementInfoImage);
          break;
        }
      }
      break;
    }
  }
  getAllVisibleOffersForSkin(skin) {
    let clientHome = SC.HomeMode.getInstance().getLogicHome().getHome();
    let playerData = clientHome.getPlayerData();
    let offerBundles = [];
    let offers = playerData.getOffers();
    for (let i = 0; offers != null && i < offers.size(); i++) {
      let bundle = offers.get(i);
      if (bundle == null || bundle.isPurchased() || bundle.getItems() == null)
        continue;
      if (SC.Shop.isHiddenOfferBundle(bundle))
        continue;
      let items = bundle.getItems();
      if (items == null)
        continue;
      for (let i2 = 0; i2 < items.size(); i2++) {
        let offer = items.get(i2);
        if (offer.getType() != LogicGemOfferType.TYPE_SKIN || offer.getSkin() != skin)
          continue;
        console.log("LogicOfferBundle chronos eventId = ", bundle.getChronosEventId());
        offerBundles.push(bundle);
        break;
      }
    }
    return offerBundles;
  }
  openSkinPreview(skin) {
    let ctx = SC.PreviewBrawlerOrSkinRewardPopup.CTX_EVENT_SKIN_ALBUM;
    let popup = allocWithoutGC(SC.PreviewBrawlerOrSkinRewardPopup, null, skin, ctx, "");
    let skinAlbum = SC.LogicDataTables.getSkinAlbumByName(this.skinAlbumName, null);
    let acquireLocation = skinAlbum.findAcquireLocationForSkin(skin);
    let playerData = SC.HomeMode.getInstance().getLogicHome().getHome().getPlayerData();
    let owned = playerData && playerData.hasUnlockedSkin(skin);
    let isWidget = skin.isSkinWidget();
    if (isWidget) {
      popup.getMovieClip().setChildVisible("btn_test", false);
      popup.getMovieClip().setChildVisible("unlock_info", false);
    } else {
      if (!owned) {
        let cb = () => {
          console.log("acquireLocation = " + SC.LogicSkinAlbumData.acquireLocationToString(acquireLocation));
          if (acquireLocation == SC.LogicSkinAlbumData.AcquireLocation.AcquireLocation_BrawlPass) {
            let brawlPassPopup = allocWithoutGC(SC.BrawlPassPopup, SC.HomeMode.getPlayerData().getCurrentBrawlPassSeason());
            brawlPassPopup.scrollToSkinRewardItem(skin);
            SC.GUI.getInstance().showPopup(brawlPassPopup, false, false, true);
          } else if (acquireLocation == SC.LogicSkinAlbumData.AcquireLocation.AcquireLocation_EventMenu || acquireLocation == SC.LogicSkinAlbumData.AcquireLocation.AcquireLocation_EventGacha || acquireLocation == SC.LogicSkinAlbumData.AcquireLocation.AcquireLocation_NormalShop || acquireLocation == SC.LogicSkinAlbumData.AcquireLocation.AcquireLocation_EventShop) {
            let offerBundles = this.getAllVisibleOffersForSkin(skin);
            console.log("offerBundles.length = ", offerBundles.length);
            for (let i = 0; i < offerBundles.length; i++) {
              let offerBundle = offerBundles[i];
              console.log("SC.HomeMode.getInstance().getHomeScreen().openShop()");
              let shopPopup = SC.HomeMode.getInstance().getHomeScreen().openShop();
              if (shopPopup != null) {
                shopPopup.scrollToSingleOffer(offerBundle);
                return;
              }
            }
            console.log("SC.CollabUtil.openCollabOffer(LogicGemOfferType.TYPE_K2_EVA_DROP)");
            SC.CollabUtil.openCollabOffer(LogicGemOfferType.TYPE_K2_EVA_DROP);
          } else {
            console.log(SC.LogicSkinAlbumData.acquireLocationToString(acquireLocation) + " not handled in skin album button.");
          }
        };
        let text = SC.StringTable.getString("TID_SKIN_ALBUM_GET_IT_BUTTON");
        popup.setupOkButton(text, cb);
      }
    }
    console.log("show PreviewBrawlerOrSkinRewardPopup");
    SC.GUI.getInstance().showPopup(popup, true, false, true);
  }
  getMilestoneRewardState(threshold) {
    if (threshold <= 0) {
      return 1 /* NotEarned */;
    }
    let playerCollabData = SC.CollabUtil.getPlayerCollabEventData();
    if (playerCollabData == null) {
      return 1 /* NotEarned */;
    }
    if (playerCollabData.getScore() < threshold) {
      return 1 /* NotEarned */;
    }
    let pendingRewardCount = playerCollabData.getPendingScoreRewardsCount();
    for (let i = 0; i < pendingRewardCount; i++) {
      let pendingReward = playerCollabData.getPendingScoreRewardsAt(i);
      if (pendingReward != null && pendingReward.getCumulativePointsThreshold() == threshold) {
        return 2 /* ReadyToClaim */;
      }
    }
    return 3 /* Claimed */;
  }
  onItemsDelivered(rewardSeason) {
    console.log(`ActivityOfferPopup TS: onItemsDelivered, rewardSeason = `, rewardSeason);
    this.refreshEventSkins();
  }
  onReady() {
    console.log("ActivityMilestoneContainer TS: ready");
  }
  onUpdate(dt) {
  }
  onDestruct() {
    console.log("ActivityMilestoneContainer TS: onDestruct");
  }
}
export {
  ActivityMilestoneContainer as default
};
//# sourceMappingURL=ActivityMilestoneContainer.mjs.map
