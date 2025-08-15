import PopupBase from "../../base/PopupBase.mjs";
import {
  getResourceCount,
  tryDoFragementLottery
} from "./activity-utils.mjs";
import { LotteryConfig } from "../../config/activity-cfg.mjs";
class FragmentExchangePopup extends PopupBase {
  constructor(popup) {
    super(popup, SC.ScriptableGenericPopup);
    this.dataBinds = [
      {
        path: "txt_name",
        refresh: "TID_FRAGMENT_EXCHANGE_DESC"
      },
      {
        path: "activity_button/txt",
        // cost
        refresh: () => {
          return SC.LogicDataTables.getRandomChestDataByType(LotteryConfig.FragmentChestType)?.getK2DrawFragmentPrice()?.toString() ?? "";
        }
      },
      {
        path: "activity_button",
        buttonClick: this.onExchangeClick
      },
      {
        path: "bounds",
        interactive: false
      },
      {
        path: "item_suipian/txt",
        // total count !!!
        refresh: this.refreshFragmentCount
      }
    ];
    try {
      this.createButton("button_close", this.onBackPress);
      this.bindingData(this.dataBinds);
      this.subscribe("cpp_commoditycountchanged", this.onItemDataChange);
      this.createPreview();
    } catch (e) {
      handleException(e);
    }
  }
  createPreview() {
    let mainMc = this.cobj.getMovieClip();
    let previewPlaceHolder = mainMc.getChildByName("hero");
    if (!previewPlaceHolder) return;
    let bg = new SC.ShopBgElement(null, "sc/ui.sc", "panel_offer", "", null, SC.LogicClearShopTickersCommand.FILTER_OFFERS, 0, SC.Shop.ShopCategory.SHOP_CATEGORY_OFFERS);
    this.manage(bg);
    let bundle = new SC.LogicOfferBundle();
    this.manage(bundle);
    let chainOfferItem = allocWithoutGC(SC.ChainOfferItem, bundle);
    bg.add(chainOfferItem, SC.ShopItemAnim.ENTRY_ANIM_BOUNCE_IN);
    mainMc.addChild(bg.getGuiContainer());
    DEL(previewPlaceHolder);
  }
  refreshFragmentCount(textField) {
    let fragmentCount = getResourceCount(LotteryConfig.K2DrawFragment);
    textField.as(SC.TextField).setText(fragmentCount.toString());
  }
  onItemDataChange(evt) {
    this.refreshControls(this.dataBinds);
  }
  onExchangeClick(btn) {
    let chestType = LotteryConfig.FragmentChestType;
    let price = SC.LogicDataTables.getRandomChestDataByType(LotteryConfig.FragmentChestType)?.getK2DrawFragmentPrice() ?? 999;
    tryDoFragementLottery(chestType, LotteryConfig.K2DrawFragment, price, SC.LogicK2DrawCommand.DrawOption.DrawOption_K2_DRAW_FRAGMENT);
    return false;
  }
  onDestruct() {
  }
  onUpdate(dt) {
  }
  onBackPress(btn) {
    this.cobj.backButtonPressed();
    this.cobj.fadeOut();
    return false;
  }
}
export {
  FragmentExchangePopup as default
};
//# sourceMappingURL=FragmentExchangePopup.mjs.map
