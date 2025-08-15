import PopupBase from "../../base/PopupBase.mjs";
import { getSpriteFrom, openGenericPopup, tips } from "../../base/gui.mjs";
import { send } from "../../base/event.mjs";
import { getSCFile } from "./activity-utils.mjs";
function openSimplePopup(title, desc, comfirmCallback, cancelCallback, close_cb = () => {
}, comfirmText = "TID_BUTTON_CONFIRM", cancel = "TID_BUTTON_CANCEL", closeOnBtnClick = true) {
  let commonBtn = {
    title,
    desc,
    close_cb,
    buttons: []
  };
  if (cancelCallback) {
    commonBtn.buttons.push(
      {
        text: cancel,
        callback: cancelCallback,
        redBtn: true,
        closeOnClick: closeOnBtnClick
      }
    );
  }
  if (comfirmCallback) {
    commonBtn.buttons.push(
      {
        text: comfirmText,
        callback: comfirmCallback,
        closeOnClick: closeOnBtnClick
      }
    );
  }
  openGenericPopup({ module: "ui/activity/CommonPurchasePopup.mjs", scFile: getSCFile(), clip: "popup_generic", para: [commonBtn], darkenBackground: true });
}
function test2PriceBtnOpen() {
  let commonBtn = {
    title: "TID_DRAW_LOTTERY_K2",
    desc: "TID_DRAW_LOTTERY_CONFIRM_K2",
    close_cb: () => {
      tips("[X] clicked");
    },
    buttons: [
      {
        price_type: SC.DirectPurchaseGemPacksPopup.CostResourceType.COST_TYPE_GEMS,
        price: 10,
        callback: () => {
          tips("helloworld_cancel");
        }
      },
      {
        price_type: SC.DirectPurchaseGemPacksPopup.CostResourceType.COST_TYPE_TICKET_CASH,
        price: 20,
        callback: () => {
          tips("helloworld_Comfirm");
        }
      }
    ]
  };
  openGenericPopup({ module: "ui/activity/CommonPurchasePopup.mjs", scFile: getSCFile(), clip: "popup_generic", para: [commonBtn], darkenBackground: true });
}
function testOpen() {
  let commonBtn = {
    title: "TID_DRAW_LOTTERY_K2",
    desc: "TID_DRAW_LOTTERY_CONFIRM_K2",
    close_cb: () => {
      tips("[X] clicked");
    },
    buttons: [
      {
        price_type: 5000036,
        //SC.DirectPurchaseGemPacksPopup.CostResourceType.COST_TYPE_GEMS,
        price: 10,
        callback: () => {
          tips("helloworld_cancel");
        }
      }
    ]
  };
  openGenericPopup({ module: "ui/activity/CommonPurchasePopup.mjs", scFile: getSCFile(), clip: "popup_generic", para: [commonBtn], darkenBackground: true });
}
class CommonPurchasePopup extends PopupBase {
  constructor(popup) {
    super(popup, SC.ScriptableGenericPopup);
    this.allBtn = [
      "button_ok",
      "button_no",
      "button_yes",
      "button_negative",
      "ok_button1",
      "ok_button2",
      "ok_button3",
      "button_close"
    ];
    this.OneBtnLayout = {
      btn: "button_ok",
      price_btn: "ok_button1",
      red_btn: "button_negative"
    };
    this.TwoBtnLayout = [
      {
        btn: "button_no",
        price_btn: "ok_button2"
      },
      {
        btn: "button_yes",
        price_btn: "ok_button3"
      }
    ];
    //price_money
    //price_gems
    //price_ticket_cash
    //price_gold
    //price_free
    this.priceName = {
      [SC.DirectPurchaseGemPacksPopup.CostResourceType.COST_TYPE_COINS]: "price_gold",
      [SC.DirectPurchaseGemPacksPopup.CostResourceType.COST_TYPE_GEMS]: "price_gems",
      [SC.DirectPurchaseGemPacksPopup.CostResourceType.COST_TYPE_TICKET_CASH]: "price_ticket_cash"
    };
    this.defaultResourcePriceName = "price_gold";
    try {
      this.para = this.cobj.as(SC.ScriptableGenericPopup).getPara().getJsObject(0);
      let para = this.para;
      let popupMC = this.cobj.getMovieClip();
      for (const btn of this.allBtn) {
        let sprite = popupMC.getMovieClipByName(btn);
        if (sprite) {
          sprite.m_visible = false;
        } else {
          SC.Debugger.error("button on not found: " + btn);
        }
      }
      if (para.close_cb || para.close_event) {
        popupMC.getMovieClipByName("button_close").m_visible = true;
        this.createButton("button_close", (btn) => {
          this.onBackPress(null);
          if (para.close_cb) {
            para.close_cb();
          }
          if (para.close_event) {
            send(para.close_event, new SC.CommonEventData());
          }
          return true;
        });
      }
      if (para.onConstuct) {
        para.onConstuct(this);
      }
      if (para.desc) {
        let txt = para.desc;
        if (para.desc.startsWith("TID_"))
          txt = SC.StringTable.getString(para.desc);
        popupMC.getChildByName("txt").as(SC.TextField).setText(txt);
      }
      if (para.title) {
        let txt = para.title;
        if (para.title.startsWith("TID_"))
          txt = SC.StringTable.getString(para.title);
        popupMC.getChildByName("title_txt").as(SC.TextField).setText(txt);
      }
      if (para.buttons.length == 1) {
        let btn = para.buttons[0];
        let btnName = this.OneBtnLayout;
        this.createBtn(btnName, btn);
      } else if (para.buttons.length == 2) {
        let btn1 = para.buttons[0];
        let btn2 = para.buttons[1];
        let btnName1 = this.TwoBtnLayout[0];
        let btnName2 = this.TwoBtnLayout[1];
        this.createBtn(btnName1, btn1);
        this.createBtn(btnName2, btn2);
      }
    } catch (e) {
      handleException(e, "CommonPurchasePopup");
    }
  }
  createBtn(btnName, btnInfo) {
    let popupMC = this.cobj.getMovieClip();
    let realBtnName = btnInfo.redBtn && btnName.red_btn ? btnName.red_btn : btnName.btn;
    let isPrice = false;
    if (isValid(btnInfo.price) && isValid(btnInfo.price_type)) {
      realBtnName = btnName.price_btn;
      isPrice = true;
    }
    let btnMC = popupMC.getMovieClipByName(realBtnName);
    btnMC.m_visible = true;
    let btn = this.createButtonOnMovieclip(
      btnMC,
      (btn2) => {
        if (btnInfo.callback) {
          btnInfo.callback(btn2);
        }
        if (btnInfo.event) {
          send(btnInfo.event, new SC.CommonEventData());
        }
        if (btnInfo.closeOnClick == void 0 || btnInfo.closeOnClick) {
          this.onBackPress(null);
        }
        return true;
      }
    );
    btnInfo.btn = btn;
    if (isPrice) {
      let count = btnMC.getTimelineChildCount();
      for (let i = 0; i < count; i++) {
        let child = btnMC.getTimelineChild(i);
        let name = btnMC.getInstanceName(child);
        if (name && (name.indexOf("price") >= 0 || name.indexOf("discount") >= 0)) child.m_visible = false;
      }
      let priceName = this.priceName[btnInfo.price_type] ?? this.defaultResourcePriceName;
      let priceSprite = btnMC.getChildByName(priceName);
      let priceMovieClip = priceSprite.as(SC.MovieClip);
      let iconOrigin = priceMovieClip.getChildByName("icon");
      priceSprite.m_visible = true;
      let textField = getSpriteFrom(priceSprite.as(SC.Sprite), "txt", SC.TextField);
      if (textField) {
        if (iconOrigin) {
          SC.GameTSUtil.setValueWithIcon(iconOrigin, textField, btnInfo.price.toString());
        }
      }
      if (btnInfo.price_type > 1e5) {
        let resouceData = SC.LogicDataTables.getResourceById(btnInfo.price_type);
        let icon = allocWithoutGC(SC.DataIcon, resouceData);
        this.manage(icon);
        priceMovieClip.changeTimelineChild(iconOrigin, icon);
        DEL(iconOrigin);
      }
    } else {
      let textField = getSpriteFrom(btnMC, "txt", SC.TextField);
      if (btnInfo.text) {
        let txt = btnInfo.text;
        if (btnInfo.text.startsWith("TID_"))
          txt = SC.StringTable.getString(btnInfo.text);
        textField?.setText(txt);
      }
    }
  }
  onDestruct() {
    SC.GUI.getInstance().removePopover();
    for (let button of this.para.buttons) {
      button.btn = null;
    }
    if (this.para) {
      if (this.para.onDestruct_cb) {
        this.para.onDestruct_cb();
      }
      if (this.para.destruct_event) {
        send(this.para.destruct_event, new SC.CommonEventData());
      }
    }
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
  CommonPurchasePopup as default,
  openSimplePopup,
  test2PriceBtnOpen,
  testOpen
};
//# sourceMappingURL=CommonPurchasePopup.mjs.map
