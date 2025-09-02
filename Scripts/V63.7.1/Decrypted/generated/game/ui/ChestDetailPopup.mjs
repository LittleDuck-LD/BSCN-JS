import PopupBase from "../base/PopupBase.mjs";
import { ManagedType } from "../base/ObjectBase.mjs";
import { getSCFile } from "./activity/activity-utils.mjs";
class ChestDetailPopup extends PopupBase {
  // LogicRandomChestRewardData::RewardType
  constructor(popup) {
    super(popup);
    this.databind = [
      {
        path: "title_txt",
        refresh: "TID_DRAW_LOTTERY_REWAWRD_LIST_K2"
      },
      {
        path: "button_close",
        buttonClick: this.onBackPress
      }
    ];
    this.datas = [];
    this.rows = [];
    this.rowsDisplayObjects = [];
    this.catalogResultIconList = [];
    this.scrollArea = null;
    this.maxColumns = 3;
    this.bigItem = null;
    this.heroModelItem = null;
    this.iconClip = null;
    this.curPreviewItemIndex = -1;
    this.resourceDropTypes = [];
    try {
      let movieClip = this.cobj.getMovieClip();
      this.bindingData(this.databind, movieClip);
      this.initDatas();
      this.scrollArea = SC.GUIContainer.createScrollArea(movieClip, "area_list", 50);
      this.manage(this.scrollArea, ManagedType.UpdateAndAutoDestroy);
      this.scrollArea.enablePinching(false);
      this.scrollArea.enableHorizontalDrag(false);
      this.scrollArea.enableVerticalDrag(true);
      this.scrollArea.m_mask = true;
      this.scrollArea.setAlignment(SC.DragHandler.ALIGN_TOP | SC.DragHandler.ALIGN_LEFT);
      movieClip.addChild(this.scrollArea);
      this.createRows();
    } catch (e) {
      handleException(e, "ChestDetailPopup TS: constructor");
    }
  }
  destructDatas() {
    for (let gachaDrop of this.datas) {
      DEL(gachaDrop);
    }
    this.datas = [];
  }
  initDatas() {
    console.log("################################################# ChestDetailPopup initDatas");
    this.destructDatas();
    let type = this.cobj.as(SC.ScriptablePopup).getPara().getInt(0);
    console.log(`ChestDetailPopup chest type ${type}`);
    let randomChest = SC.LogicDataTables.getRandomChestDataByType(type);
    let rewardCount = randomChest.getRewardCount();
    console.log(`rewardCount = ${rewardCount}`);
    for (let i = 0; i < rewardCount; ++i) {
      let rewardData = randomChest.getRewardData(i);
      let dropType = rewardData.getDropType();
      console.log(`dropType = ${dropType}, rewardData = ${rewardData.getName()}`);
      if (dropType == 0) {
        let rewardSet = rewardData.getSet();
        let rewardList = rewardSet.getRewardList();
        let rewardExtraList = rewardSet.getExtraRewardIntList();
        for (let j = 0; j < rewardList.size(); j++) {
          let globalId = rewardList.get(j);
          let itemDropType = SC.LogicGatchaDrop.getGatchaDropTypeFromGlobalId(globalId);
          let hero;
          if (itemDropType == SC.LogicGatchaDrop.GatchaDropType.TYPE_HERO) {
            let data = SC.LogicDataTables.getDataById(globalId);
            hero = data;
          }
          if (itemDropType == SC.LogicGatchaDrop.GatchaDropType.TYPE_SKIN) {
            let gatchaDrop = new SC.LogicGatchaDrop(itemDropType, 1, hero);
            let data = SC.LogicDataTables.getDataById(globalId);
            gatchaDrop.setSkin(data);
            console.log(`itemDropType = ${itemDropType}, amount = 1`);
            this.datas.push(gatchaDrop);
          }
        }
      } else if (dropType == SC.LogicGatchaDrop.GatchaDropType.TYPE_SKIN) {
        let gatchaDrop = new SC.LogicGatchaDrop(dropType, rewardData.getAmountMin(), null);
        console.log(`dropType = ${dropType}, amount = ${rewardData.getAmountMin()}`);
        this.datas.push(gatchaDrop);
      }
    }
  }
  destrucRows() {
    for (let row of this.rows) {
      row.removeFromParent();
      DEL(row);
    }
    this.rows = [];
    this.catalogResultIconList = [];
  }
  createRows() {
    let rowIndex = 0;
    let columnIndex = 0;
    let x = 0;
    let y = 0;
    let preItemHeight = 0;
    let index = 0;
    let collabScFileName = getSCFile();
    for (let gachaDrop of this.datas) {
      let item = null;
      if (gachaDrop.getType() == SC.LogicGatchaDrop.GatchaDropType.TYPE_SKIN) {
        item = allocWithoutGC(SC.CatalogResultIcon, null, gachaDrop.getSkin(), index);
        item.setupState(SC.CatalogResultIcon.State.NOT_OWNED);
        item.m_interactive = false;
        this.catalogResultIconList.push(item);
      } else {
        item = allocWithoutGC(SC.GatchaDropOverviewItem, gachaDrop, SC.GatchaDropOverviewItem.CTX_BP_COLLECT, false, null);
      }
      let itemBg = SC.StringTable.getMovieClip(collabScFileName, "activity_reward_item");
      itemBg.changeTimelineChild("reward_item", item);
      if (preItemHeight < itemBg.getHeight()) {
        preItemHeight = itemBg.getHeight();
      }
      let dataIndex = index;
      let itemBtn = new SC.CustomButton();
      itemBtn.setDisplayObject(itemBg);
      let cb = (responseBtn) => {
        this.onItemClicked(dataIndex);
        return false;
      };
      SC.GUIUtils.setButtonPressed(itemBtn, cb);
      itemBtn.setPixelSnappedXY(x + itemBg.getWidth() / 2, y + preItemHeight / 2);
      columnIndex++;
      x += itemBg.getWidth();
      if (columnIndex == this.maxColumns) {
        rowIndex++;
        columnIndex = 0;
        x = 0;
        y += preItemHeight;
        preItemHeight = 0;
      }
      itemBg.setChildVisible("highlight", false);
      this.scrollArea.addContentDontUpdateBounds(itemBtn);
      this.rows.push(itemBtn);
      this.rowsDisplayObjects.push(itemBg);
      if (index == 0) {
        this.onItemClicked(0);
      }
      index++;
    }
    this.scrollArea.updateBounds();
  }
  onItemClicked(index) {
    console.log(`onItemClicked, index = ${index}`);
    if (index >= this.datas.length || index < 0 || index == this.curPreviewItemIndex) return;
    if (this.curPreviewItemIndex >= 0 && this.curPreviewItemIndex < this.rowsDisplayObjects.length) {
      let rowBg2 = this.rowsDisplayObjects[this.curPreviewItemIndex];
      rowBg2.setChildVisible("highlight", false);
    }
    this.curPreviewItemIndex = index;
    let data = this.datas[index];
    let rowBg = this.rowsDisplayObjects[index];
    rowBg.setChildVisible("highlight", true);
    if (data.getType() == SC.LogicGatchaDrop.GatchaDropType.TYPE_SKIN) {
      this.previewSkin(data.getSkin());
    } else if (data.getType() == SC.LogicGatchaDrop.GatchaDropType.TYPE_VANITY_ITEM) {
      let itemData = data.getVanityItem();
      let emoteData = SC.CatalogUtil.getEmoteData(itemData);
      let sprayData = SC.CatalogUtil.getSprayData(itemData);
      let thumbnailData = SC.CatalogUtil.getPlayerThumbnailData(itemData);
      if (emoteData != null) {
        this.previewEmote(emoteData);
      } else if (sprayData != null) {
        this.previewSpray(sprayData);
      } else if (thumbnailData != null) {
        this.previewPlayerThumbnail(thumbnailData);
      }
    } else {
      this.previewOther(data);
    }
  }
  previewOther(data) {
    let movieClip = this.cobj.getMovieClip();
    let previewItem = movieClip.getMovieClipByName("item_preview");
    let resourcesPreview = previewItem?.getMovieClipByName("resources");
    if (resourcesPreview == null || data == null) return;
    previewItem.setChildVisible("resources", true);
    previewItem.setChildVisible("skin", false);
    previewItem.setChildVisible("pin", false);
    previewItem.setChildVisible("profile_icon", false);
    previewItem.setChildVisible("spray", false);
    this.destructBigItem();
    this.bigItem = new SC.GatchaDropOverviewItem(data, SC.GatchaDropOverviewItem.CTX_GATCHA, false, null);
    resourcesPreview.addChild(this.bigItem);
  }
  previewSkin(skin) {
    let movieClip = this.cobj.getMovieClip();
    let previewItem = movieClip.getMovieClipByName("item_preview");
    let skinPreview = previewItem?.getMovieClipByName("skin");
    if (skinPreview == null || skin == null) return;
    previewItem.setChildVisible("resources", false);
    previewItem.setChildVisible("skin", true);
    previewItem.setChildVisible("pin", false);
    previewItem.setChildVisible("profile_icon", false);
    previewItem.setChildVisible("spray", false);
    if (this.heroModelItem == null) {
      this.heroModelItem = new SC.HeroModelItem(skin, skinPreview, 0, false, true);
    } else if (this.heroModelItem.getSkin() != skin) {
      this.heroModelItem.setCurrentSkin(skin);
    }
    SC.HeroModelItem.playRandomSound(skin);
    if (SC.CollabUtil.isSpeicalHeroScreenAnimSkin(skin.getName())) {
      this.heroModelItem.getHeroSprite().setDefaultAnimation(SC.SceneCharacter.AnimId.ANIM_HAPPY, 0);
      this.heroModelItem.getHeroSprite().changeAnimationTo(SC.SceneCharacter.AnimId.ANIM_HAPPY, SC.SceneCharacter.AnimId.ANIM_HAPPY_LOOP);
    }
  }
  previewEmote(emoteData) {
    let movieClip = this.cobj.getMovieClip();
    let previewItem = movieClip.getMovieClipByName("item_preview");
    let pinPreview = previewItem?.getMovieClipByName("pin");
    if (pinPreview == null || emoteData == null) return;
    previewItem.setChildVisible("resources", false);
    previewItem.setChildVisible("skin", false);
    previewItem.setChildVisible("pin", true);
    previewItem.setChildVisible("profile_icon", false);
    previewItem.setChildVisible("spray", false);
    this.destructIconClip();
    this.iconClip = SC.CatalogResultIcon.createIconClip(emoteData);
    this.addIconClipAsPlaceholderSibling(pinPreview, "icon_ph", this.iconClip);
    this.iconClip.playOnce();
    if (emoteData.getSoundData() != null) {
      SC.SoundManager.getInstance().playVO(emoteData.getSoundData(), 0, 0, true, emoteData.getSfxIndex(), true);
    }
  }
  previewSpray(sprayData) {
    let movieClip = this.cobj.getMovieClip();
    let previewItem = movieClip.getMovieClipByName("item_preview");
    let sprayPreview = previewItem?.getMovieClipByName("spray");
    if (sprayPreview == null || sprayData == null) return;
    previewItem.setChildVisible("resources", false);
    previewItem.setChildVisible("skin", false);
    previewItem.setChildVisible("pin", false);
    previewItem.setChildVisible("profile_icon", false);
    previewItem.setChildVisible("spray", true);
    this.destructIconClip();
    this.iconClip = SC.CatalogResultIcon.createIconClip(sprayData);
    this.addIconClipAsPlaceholderSibling(sprayPreview, "icon_ph", this.iconClip);
    this.iconClip.playOnce();
    SC.SoundManager.getInstance().playSound(SC.LogicDataTables.getSoundByName("Spray_Activate", null));
  }
  previewPlayerThumbnail(playerThumbnailData) {
    let movieClip = this.cobj.getMovieClip();
    let previewItem = movieClip.getMovieClipByName("item_preview");
    let playerThumbnailPreview = previewItem?.getMovieClipByName("profile_icon");
    if (playerThumbnailPreview == null || playerThumbnailData == null) return;
    previewItem.setChildVisible("resources", false);
    previewItem.setChildVisible("skin", false);
    previewItem.setChildVisible("pin", false);
    previewItem.setChildVisible("profile_icon", true);
    previewItem.setChildVisible("spray", false);
    this.destructIconClip();
    this.iconClip = SC.CatalogResultIcon.createIconClip(playerThumbnailData);
    this.addIconClipAsPlaceholderSibling(playerThumbnailPreview, "icon_ph", this.iconClip);
  }
  destructIconClip() {
    if (this.iconClip != null) {
      this.iconClip.removeFromParent();
      DEL(this.iconClip);
      this.iconClip = null;
    }
  }
  addIconClipAsPlaceholderSibling(parentClip, placeholderInstanceName, iconClip) {
    let ph = parentClip.getMovieClipByName(placeholderInstanceName);
    if (ph != null) {
      ph.m_visible = false;
      let phBounds = new SC.Rect();
      ph.getBounds(null, phBounds);
      const sx = phBounds.getWidth() / iconClip.getWidth();
      const sy = phBounds.getHeight() / iconClip.getHeight();
      iconClip.setScale(Math.min(sx, sy));
      parentClip.addChild(iconClip);
      iconClip.setXY(ph.getX(), ph.getY());
      let newBounds = new SC.Rect();
      iconClip.getBounds(null, newBounds);
      iconClip.setXY(iconClip.getX() + phBounds.getMidX() - newBounds.getMidX(), iconClip.getY() + phBounds.getMidY() - newBounds.getMidY());
    } else {
      console.log(`Placeholder ${placeholderInstanceName} missing`);
    }
  }
  destructBigItem() {
    if (this.bigItem != null) {
      this.bigItem.removeFromParent();
      DEL(this.bigItem);
      this.bigItem = null;
    }
  }
  onDestruct() {
    if (this.heroModelItem != null) {
      DEL(this.heroModelItem);
    }
    this.destructBigItem();
    this.destructIconClip();
    this.destrucRows();
    this.destructDatas();
  }
  onUpdate(dt) {
    for (let item of this.catalogResultIconList) {
      item.update(dt, true);
    }
  }
  onBackPress(btn) {
    this.cobj.backButtonPressed();
    this.cobj.fadeOut();
    return false;
  }
}
export {
  ChestDetailPopup as default
};
//# sourceMappingURL=ChestDetailPopup.mjs.map
