import PopupBase from "../../base/PopupBase.mjs";
import { ManagedType } from "../../base/ObjectBase.mjs";
class ActivityOfferPopup extends PopupBase {
  constructor(popup) {
    super(popup);
    this.rows = [];
    try {
      console.log("ActivityOfferPopup TS: constructor");
      popup.getMovieClip().setY(-SC.Stage.getInstance().getStageHeight() / 2);
      let VectorMovieClipClass = loadCppType("std::vector<MovieClip*>");
      console.log("ActivityOfferPopup TS: VectorMovieClipClass " + VectorMovieClipClass.toString());
      this.vecContainers = new VectorMovieClipClass();
      this.manage(this.vecContainers);
      this.cobj.setUpHeader();
      this.registerButtonPress("button_back", this.onBackPress);
      this.registerButtonPress("button_home", this.onHomePress);
      this.initUI();
      this.refreshRows();
      this.subscribe("cpp_onItemsDelivered", this.onItemsDelivered);
      this.subscribe("cpp_onShopDataChange", this.onShopDataChange);
    } catch (e) {
      handleException(e, "ActivityOfferPopup TS: constructor");
    }
  }
  refreshRows() {
    this.createRows();
    this.addItemsToScrollArea();
    this.scrollArea.updateBounds();
  }
  initUI() {
    console.log("ActivityOfferPopup TS: initUI");
    SC.MovieClipHelper.initScreenContainersForTS(this.cobj.getMovieClip(), "shop_chain_offer_screen_", this.vecContainers);
    for (let i = 0; i < this.vecContainers.size(); i++) {
      let container = this.vecContainers.get(i);
      if (container != null) {
        SC.MovieClipHelper.autoAdjustChildTexts(container);
      }
    }
    console.log("ActivityOfferPopup TS: fullScreenNavi");
    let fullScreenNavi = this.cobj.getFullScreenNavi();
    if (fullScreenNavi != null) {
      fullScreenNavi.removeFromParent();
      this.cobj.getMovieClip().addChild(fullScreenNavi);
    }
    let centerCont = this.vecContainers.get(SC.MovieClipHelper.ContainerEnum.CONTAINER_CENTER);
    centerCont.setX(0);
    this.scrollArea = this.createItemScrollArea(centerCont, "scroll_area");
    this.manage(this.scrollArea, ManagedType.UpdateAndAutoDestroy);
    let confData = SC.HomeMode.getConfData();
    console.log("new LogicArrayList");
    let LogicArrayListClass = loadCppType("LogicArrayList<LogicOfferBundle*>");
    let shownBundles = new LogicArrayListClass();
    SC.HomeMode.getPlayerData().getK2ActivityShopOfferBundles(shownBundles);
    if (shownBundles == null || shownBundles.size() == 0) {
      DEL(shownBundles);
      return;
    }
    let topLeftCont = this.vecContainers.get(SC.MovieClipHelper.ContainerEnum.CONTAINER_TOP_LEFT);
    console.log("topLeftCont.x = ", topLeftCont.getX(), ", topLeftCont.y = ", topLeftCont.getY());
    topLeftCont.setX(-SC.Stage.getInstance().getStageWidth() / 2);
    let offerBundle = shownBundles.get(0);
    DEL(shownBundles);
    let shopPanelLayoutData = offerBundle.getShopPanelLayoutData();
    let themeEntry = confData.getShopChainOfferThemeEntry(shopPanelLayoutData);
    let titleText = themeEntry != null && themeEntry.getTitleText() != null ? themeEntry.getTitleText().getContent() : SC.StringTable.getString("TID_ACTIVITY_OFFER_TITLE");
    console.log("ActivityOfferPopup TS: titleText = ", titleText);
    this.topTitleTF = SC.MovieClipHelper.getTextFieldFromContainers(this.vecContainers, "title_txt");
    if (this.topTitleTF != null && fullScreenNavi != null) {
      this.topTitleTF.setText(titleText);
      let headerBgChildIndex = fullScreenNavi.getChildIndexByName("header_bgr");
      let childIndex = headerBgChildIndex >= 0 ? headerBgChildIndex + 1 : -1;
      SC.MovieClipHelper.moveDisplayObjectToNewParentKeepingPosition(this.topTitleTF, fullScreenNavi, childIndex);
    }
    this.titleTimerTF = SC.MovieClipHelper.getTextFieldFromContainers(this.vecContainers, "timer_txt");
    let topRightCont = this.vecContainers.get(SC.MovieClipHelper.ContainerEnum.CONTAINER_TOP_RIGHT);
    console.log("topRightCont.x = ", topRightCont.getX(), ", topRightCont.y = ", topRightCont.getY());
    topRightCont.m_visible = false;
    let referenceSizeTF = centerCont.getTextFieldByName("reference_size");
    if (referenceSizeTF != null) {
      this.bgReferenceWidth = referenceSizeTF.getTextFieldWidth();
      this.bgReferenceHeight = referenceSizeTF.getTextFieldHeight();
    } else {
      console.log("reference_size text field missing");
      this.bgReferenceWidth = 0;
      this.bgReferenceHeight = 0;
    }
    let bgScalerClip = centerCont.getMovieClipByName("bg_scaler");
    if (bgScalerClip != null) {
      let bgClip = bgScalerClip.getMovieClipByName("bg");
      if (bgClip != null) {
        let bgFrameIndex = 0;
        if (themeEntry != null && themeEntry.getBgFrameName().length > 0) {
          const themeFrameIndex = bgClip.getFrameIndex(themeEntry.getBgFrameName());
          if (themeFrameIndex != -1) {
            bgFrameIndex = themeFrameIndex;
          } else {
            console.log("Bg frame ", themeEntry.getBgFrameName(), " missing");
          }
        }
        bgClip.gotoAndStopFrameIndex(bgFrameIndex);
      }
      if (this.bgReferenceWidth < 1 || this.bgReferenceHeight < 1) {
        this.bgReferenceWidth = bgScalerClip.getWidth();
        this.bgReferenceHeight = bgScalerClip.getHeight();
      }
      this.adjustBackgroundClipScale(bgScalerClip, this.bgReferenceWidth, this.bgReferenceHeight);
    }
  }
  createItemScrollArea(parent, instanceName) {
    console.log("createItemScrollArea");
    let scrollAreaTF = parent.getTextFieldByName(instanceName);
    let scrollArea = new SC.ScrollArea(scrollAreaTF.getTextFieldWidth(), scrollAreaTF.getTextFieldHeight(), 1);
    scrollArea.enablePinching(false);
    scrollArea.enableHorizontalDrag(true);
    scrollArea.enableVerticalDrag(false);
    scrollArea.m_mask = false;
    scrollArea.setAlignment(SC.DragHandler.ALIGN_TOP | SC.DragHandler.ALIGN_LEFT);
    parent.addChild(scrollArea);
    scrollArea.setPixelSnappedXY(scrollAreaTF.getX() + scrollAreaTF.getBoundsLeft(), scrollAreaTF.getY() + scrollAreaTF.getBoundsTop());
    return scrollArea;
  }
  destructRows() {
    this.scrollArea.removeAllContent();
    for (let i = 0; i < this.rows.length; i++) {
      let row = this.rows[i];
      DEL(row);
    }
    this.rows = [];
  }
  createRows() {
    this.destructRows();
    let LogicArrayListClass = loadCppType("LogicArrayList<LogicOfferBundle*>");
    let shownBundles = new LogicArrayListClass();
    SC.HomeMode.getPlayerData().getK2ActivityShopOfferBundles(shownBundles);
    let purchasedRows = [];
    let unpurchasRows = [];
    for (let i = 0; i < shownBundles.size(); i++) {
      let bundle = shownBundles.get(i);
      console.log("bundle", bundle);
      let row = this.createListOfferByBundleType(bundle);
      if (bundle.isPurchasedOrClaimedFromChain()) {
        purchasedRows.push(row);
      } else {
        unpurchasRows.push(row);
      }
    }
    this.rows = unpurchasRows.concat(purchasedRows);
    DEL(shownBundles);
  }
  addItemsToScrollArea() {
    let x = 20;
    let y = (SC.Stage.getInstance().getStageHeight() - SC.GUI.UI_ASSET_HEIGHT) * 0.3 + 8;
    for (let i = 0; i < this.rows.length; i++) {
      let row = this.rows[i];
      row.addItemsToScrollArea(this.scrollArea);
      row.setAnimationState(SC.ShopBgElement.OPERATION_FORCE_ANIMS_TO_END);
      row.beforeInitialArrange();
      row.beforeWidthCalculation();
      if (row.getAnim().m_visible) {
        row.getGuiContainer().setXY(x, y);
        row.setShowChainOfferArrow(false);
        x += row.getWidth();
      }
      row.afterWidthCalculation();
      row.setAnimationState(SC.ShopBgElement.OPERATION_SET_ANIMATIONS_BASED_ON_STATE);
      SC.MovieClipHelper.autoAdjustChildTexts(row.getGuiContainer(), false);
      row.afterInitialArrange();
    }
  }
  createListOfferByBundleType(bundle) {
    const title = SC.Shop.getOfferBundleTitle(bundle);
    console.log("createListOfferByBundleType, title = ", title);
    const usePanelLayoutData = false;
    let offerBundleItem = SC.Shop.createListOfferBundleItemByBundleTypeForTS(bundle, title, usePanelLayoutData);
    let outerAsset = SC.Shop.getResultOuterPanelName();
    console.log("createListOfferByBundleType, outerAsset = ", outerAsset);
    let bg = new SC.ShopBgElement(null, "sc/ui.sc", outerAsset, title, null, SC.LogicClearShopTickersCommand.FILTER_OFFERS, bundle.getChronosEventId(), SC.Shop.ShopCategory.SHOP_CATEGORY_OFFERS);
    bg.add(offerBundleItem, SC.ShopItemAnim.ENTRY_ANIM_BOUNCE_IN);
    bg.afterContentAddition();
    bg.startEntryAnimations(0);
    return bg;
  }
  adjustBackgroundClipScale(bg, referenceWidth, referenceHeight) {
    const stageW = SC.Stage.getInstance().getStageWidth();
    const stageH = SC.Stage.getInstance().getStageHeight();
    let originalScale = bg.getScaleX();
    const marginX = Math.max(SC.Stage.getInstance().getMarginRight(), SC.Stage.getInstance().getMarginLeft()) * 2;
    const marginY = Math.max(SC.Stage.getInstance().getMarginTop(), SC.Stage.getInstance().getMarginBottom()) * 2;
    const scaleX = (stageW + 4 + marginX) / referenceWidth;
    const scaleY = (stageH + 4 + marginY) / referenceHeight;
    if (scaleX > 1 || scaleY > 1) {
      const scale = Math.max(scaleX, scaleY);
      bg.setScale(scale);
    }
  }
  onBackPress(btn) {
    this.cobj.backButtonPressed();
    this.cobj.fadeOut();
    return false;
  }
  onHomePress(btn) {
    this.cobj.homeButtonPressed();
    return false;
  }
  onShopDataChange(evt) {
    console.log(`ActivityOfferPopup TS: onShopDataChange, evt = `, evt);
    this.refreshRows();
  }
  onItemsDelivered(rewardSeason) {
    console.log(`ActivityOfferPopup TS: onItemsDelivered, rewardSeason = `, rewardSeason);
    this.refreshRows();
  }
  showResourceHUD() {
    return true;
  }
  showTopHUD() {
    return true;
  }
  shouldShowResource(id) {
    return id == SC.TopResourceButton.ResourceType.TYPE_DIAMONDS || id == SC.TopResourceButton.ResourceType.TYPE_COINS || id == SC.TopResourceButton.ResourceType.TYPE_TICKET_CASH;
  }
  onReady() {
    console.log("ActivityOfferPopup TS: ready");
  }
  onUpdate(dt) {
    for (let i = 0; i < this.rows.length; i++) {
      let row = this.rows[i];
      row.update(dt);
    }
  }
  onDestruct() {
    console.log("ActivityOfferPopup TS: onDestruct");
    this.destructRows();
  }
  getPopupType() {
    console.log("ActivityOfferPopup TS: getPopupType");
    return SC.PopupBase.PopupType.K2_ACTIVITY_OFFER_POPUP;
  }
}
export {
  ActivityOfferPopup as default
};
//# sourceMappingURL=ActivityOfferPopup.mjs.map
