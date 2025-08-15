import GUIContainerBase from "../../base/GUIContainerBase.mjs";
import { openGenericPopup, openPopup, tips } from "../../base/gui.mjs";
import { addCommand, getString, waitUntil } from "../../base/util.mjs";
import { openSimplePopup } from "./CommonPurchasePopup.mjs";
import {
  getLotteryDsc,
  getResourceCount,
  getSCFile,
  ResultEnum
} from "./activity-utils.mjs";
import { LotteryConfig, LotteryConfig as Config } from "../../config/activity-cfg.mjs";
import { ManagedType } from "../../base/ObjectBase.mjs";
const InvalidGuaranteedDropDistance = 1e4;
class LotteryDrawContainer extends GUIContainerBase {
  constructor(container) {
    super(container, SC.GameGUIContainer);
    // NOTE:
    // 1. Databind refresh("reward_button/txt")  (try refresh children under a BUTTON) must lay before Databind buttonClick("reward_button") Because buttonClick will insert a button and breaking the path.
    // 2. Or you can use refresh("reward_button/*/txt"), "*" means any sub path, then it will work even if the button is inserted.
    this.dataBinds = [
      {
        path: "btn_reward/txt_red",
        refresh: "TID_DRAW_LOTTERY_REWAWRD_LIST_K2"
      },
      {
        path: "btn_reward",
        buttonClick: this.onRewardsPreviewButtonClick
      },
      {
        path: "btn_tehui/txt_tehui",
        refresh: "TID_DRAW_LOTTERY_DISCOUNT_K2"
      },
      {
        path: "btn_tehui",
        buttonClick: this.onFreeButtonClick
      },
      // exchange txt
      {
        path: "btn_duihuan/txt_duihuan",
        refresh: "TID_DRAW_LOTTERY_EXCHANGE_K2"
      },
      // exchange progress txt
      {
        path: "btn_duihuan/txt_progress",
        refresh: this.refreshExchangeProgressText
      },
      // exchange progress bar
      {
        path: "btn_duihuan/progress",
        refresh: this.refreshExchangeProgressBar
      },
      {
        path: "btn_duihuan",
        buttonClick: this.onExchangeButtonClick
      },
      {
        path: "btn_rule/txt",
        refresh: "TID_DRAW_LOTTERY_RULE_BUTTON_K2"
        //RULE
      },
      {
        path: "btn_rule",
        buttonClick: this.onRuleButtonClick
      },
      {
        path: "btn_record/txt_red",
        refresh: "TID_DRAW_LOTTERY_LOGS_K2"
      },
      {
        path: "btn_record",
        //record
        buttonClick: this.onRecordButtonClick
        //buttonClick :  this.onRecordButtonClick_old
      },
      {
        path: "header_gem_resource/button_gems",
        // 1 draw tempory
        visible: false
      },
      {
        path: "header_gem_resource2/button_gems",
        // 10 draw tempory
        visible: false
      },
      {
        path: "header_gem_resource/*/txt2",
        // 1 draw
        refresh: "TID_DRAW_LOTTERY_K2"
      },
      {
        path: "header_gem_resource2/*/txt2",
        // 10 draw
        refresh: (control) => {
          return SC.StringTable.getString("TID_DRAW_LOTTERY_TIMES_K2").replace("<VALUE>", "10");
        }
      },
      {
        path: "activity_prize_draw_buttom_right/txt",
        // guarantee text
        refresh: this.guaranteedDropCountRefresh
      },
      {
        path: "header_gem_resource",
        // 1 draw
        buttonClick: this.onOneTimeLotteryClick
      },
      {
        path: "header_gem_resource2",
        // 10 times
        buttonClick: this.onTenTimeLotteryClick
      },
      {
        path: "activity_prize_draw_buttom_right/txt_remaining",
        //remain lottery time( token count)
        refresh: (control) => {
          return SC.StringTable.getString("TID_DRAW_LOTTERY_DISCOUNT_TIMES_LEFT_K2").replace("<VALUE>", `${getResourceCount(Config.K2DrawToken)}`);
        }
      }
    ];
    console.log("LotteryDrawContainer TS: constructor");
    try {
      let offsetY = this.cobj.as(SC.ScriptableGameGUIContainer).getPara()?.getJsObject(0)?.["tabHeight"] ?? 100;
      let bg = this.cobj.getChildAt(0);
      bg.setY(SC.Stage.getInstance().getStageHeight() / 2);
      let fileName = getSCFile();
      let left = this.createManagedMovieClip(fileName, "activity_prize_draw_buttom_left");
      left.setY(SC.Stage.getInstance().getStageHeight() - offsetY);
      left.m_interactive = true;
      this.cobj.addChild(left);
      let right = this.createManagedMovieClip(fileName, "activity_prize_draw_buttom_right");
      right.setX(SC.Stage.getInstance().getStageWidth());
      right.setY(SC.Stage.getInstance().getStageHeight() - offsetY);
      right.m_interactive = true;
      this.cobj.addChild(right);
      this.bindingData(this.dataBinds, this.cobj);
      this.subscribe("cpp_commoditycountchanged", this.onItemDataChange);
      this.subscribe("cpp_popup_close", this.onPopupClose);
      console.log("LotteryDrawContainer TS: constructor end");
    } catch (e) {
      handleException(e, "LotteryDrawContainer constructor");
    }
  }
  onPopupClose(popupType) {
    console.log(`onPopupClose ${popupType}`);
    if (popupType == SC.PopupBase.PopupType.DELIVERY_CARDS_POPUP) {
      this.refreshControls(this.dataBinds);
    }
  }
  onRewardsPreviewButtonClick(control) {
    openPopup({ module: "ui/ChestDetailPopup.mjs", scFile: getSCFile(), clip: "popup_reward", para: [Config.OneTimeChestType], fullScreen: false });
    return true;
  }
  onFreeButtonClick(control) {
    let LogicArrayListClass = loadCppType("LogicArrayList<LogicOfferBundle*>");
    let shownBundles = new LogicArrayListClass();
    SC.HomeMode.getPlayerData().getK2ActivityShopOfferBundles(shownBundles);
    if (shownBundles.size() > 0) {
      openPopup({ module: "ui/activity/ActivityOfferPopup.mjs", scFile: "sc/ui.sc", clip: "screen_area", fullScreen: true });
    } else {
      SC.GUI.getInstance().hudPrint(SC.StringTable.getString("TID_K2_COMING_SOON"), true);
    }
    DEL(shownBundles);
    return true;
  }
  onExchangeButtonClick(control) {
    openGenericPopup({ module: "ui/activity/FragmentExchangePopup.mjs", scFile: getSCFile(), clip: "activity_fragment_exchange_item" });
    return true;
  }
  onRuleButtonClick(control) {
    openGenericPopup({ module: "ui/CommonTextPopup.mjs", scFile: getSCFile(), clip: "popup_activity_rules", para: [{
      title: "TID_DRAW_LOTTERY_RULE_TITLE_K2",
      content: "TID_DRAW_LOTTERY_RULES_K2",
      scrollAreaEnabled: true
    }] });
    return true;
  }
  getExchangeProggress(control) {
    let count = getResourceCount(LotteryConfig.K2DrawFragment);
    let needCount = SC.LogicDataTables.getRandomChestDataByType(LotteryConfig.FragmentChestType)?.getK2DrawFragmentPrice() ?? 100;
    return count / needCount;
  }
  refreshExchangeProgressText(control) {
    let count = getResourceCount(LotteryConfig.K2DrawFragment);
    let needCount = SC.LogicDataTables.getRandomChestDataByType(LotteryConfig.FragmentChestType)?.getK2DrawFragmentPrice() ?? 100;
    return `${count}/${needCount}`;
  }
  refreshExchangeProgressBar(control) {
    if (!control.isMovieClip()) return;
    let mc = control.as(SC.MovieClip);
    let totalFrames = mc.getTotalFrames();
    if (totalFrames <= 1) return;
    let count = getResourceCount(LotteryConfig.K2DrawFragment);
    let needCount = SC.LogicDataTables.getRandomChestDataByType(LotteryConfig.FragmentChestType)?.getK2DrawFragmentPrice() ?? 100;
    let currentFrame = totalFrames * (count / needCount) | 0;
    mc.gotoAndStopFrameIndex(Math.min(currentFrame, totalFrames - 1));
  }
  formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }
  //#region records
  onRecordButtonClick(control) {
    let chestData = SC.HomeMode.getInstance().getLogicHome()?.getHome()?.getPlayerData()?.getK2RandomChests();
    if (!chestData) {
      console.log("LotteryDrawContainer TS: onRecordButtonClick, !chestData || !chestCfgData");
      tips(getString("TID_DRAW_LOTTERY_NO_RECORD_K2"));
      return true;
    }
    this.fetchAndShowRewardRecords(control).catch((error) => {
      console.error("fetchAndShowRewardRecords:", error);
    });
    return true;
  }
  async fetchAndShowRewardRecords(control) {
    control.setEnabled(false);
    let records = await this.getRewardRecords();
    control.setEnabled(true);
    this.openRewardRecordsPopup(records);
  }
  async getRewardRecords() {
    let chestTypeToFetch = Config.ChestRecords;
    if (!chestTypeToFetch || chestTypeToFetch.length == 0) return [];
    this.tmpMessageRewardRecords = null;
    let messageRewardRecords = [];
    try {
      this.unsubscribe("cpp_K2RandomChestsRewardRecordMessage", this.onMessageRewardRecords);
      this.subscribe("cpp_K2RandomChestsRewardRecordMessage", this.onMessageRewardRecords);
      for (const chestType of chestTypeToFetch) {
        let chestCfgData = SC.LogicDataTables.getRandomChestDataByType(chestType);
        if (!chestCfgData) {
          console.log("LotteryDrawContainer TS: getRewardRecords, !chestCfgData chestType: ", chestType);
          return [];
        }
        console.log("LotteryDrawContainer TS: getRewardRecords, send GetK2RandomChestsRewardRecordMessage chestType: ", chestType);
        let requestMessage = allocWithoutGC(SC.GetK2RandomChestsRewardRecordMessage);
        requestMessage.setCategory(chestCfgData.getCategory());
        SC.MessageManager.getInstance().sendMessage(requestMessage);
        await waitUntil(() => {
          return this.tmpMessageRewardRecords != null;
        }, 100, 4e3);
        if (this.tmpMessageRewardRecords == null) {
          console.log("LotteryDrawContainer TS: getRewardRecords timeout");
          return [];
        }
        messageRewardRecords = messageRewardRecords.concat(this.tmpMessageRewardRecords);
        this.tmpMessageRewardRecords = null;
      }
      this.unsubscribe("cpp_K2RandomChestsRewardRecordMessage", this.onMessageRewardRecords);
    } catch (e) {
      handleException(e);
    }
    return messageRewardRecords;
  }
  onMessageRewardRecords(evtData) {
    console.log(`LotteryDrawContainer TS: onMessageRewardRecords`);
    let items = [];
    let sourceMessage = SC.GameTSUtil.getEventPiranhaMessage(evtData, 0);
    let message = cast(sourceMessage, SC.K2RandomChestsRewardRecordMessage);
    this.tmpMessageRewardRecords = [];
    let records = message?.getRewardRecords();
    if (!records || records.size() == 0) {
      return items;
    }
    let count = records.size();
    for (let i = 0; i < count; i++) {
      let record = records.get(i);
      let gid = record.getRewardGlobalId();
      let count2 = record.getRewardCount();
      let name = getString(SC.LogicDataTables.getDataById(gid)?.getTID());
      let timestamp = Number(record.getDropTimeMillis());
      let time = this.formatTimestamp(timestamp);
      if (!name) continue;
      items.push(
        {
          value: SC.StringTable.getString("TID_DRAW_LOTTERY_RECORD_ITEM_K2").replace("<TIME>", time).replace("<ITEM>", name).replace("<NUM>", count2.toString()),
          time: Number(record.getDropTimeMillis())
        }
      );
    }
    if (items.length == 0) {
      return;
    }
    items.sort((a, b) => b.time - a.time);
    this.tmpMessageRewardRecords = items;
  }
  openRewardRecordsPopup(items) {
    if (items.length == 0) {
      tips(getString("TID_DRAW_LOTTERY_NO_RECORD_K2"));
      return;
    }
    items.sort((a, b) => b.time - a.time);
    let itemStrs = items.map((item) => item.value);
    let para = {
      title: "TID_DRAW_LOTTERY_RECORD_TITLE_K2",
      content: itemStrs.join("\n"),
      scrollAreaEnabled: true
    };
    openGenericPopup({ module: "ui/CommonTextPopup.mjs", scFile: getSCFile(), clip: "popup_activity_rules", para: [para] });
  }
  onRecordButtonClick_old(control) {
    let chestData = SC.HomeMode.getInstance().getLogicHome()?.getHome()?.getPlayerData()?.getK2RandomChests();
    let chestCfgData = SC.LogicDataTables.getRandomChestDataByType(Config.OneTimeChestType);
    if (!chestData || !chestCfgData) {
      console.log("LotteryDrawContainer TS: onRecordButtonClick, !chestData || !chestCfgData");
      tips(getString("TID_DRAW_LOTTERY_NO_RECORD_K2"));
      return true;
    }
    console.log("LotteryDrawContainer TS: onRecordButtonClick, send GetK2RandomChestsRewardRecordMessage");
    let requestMessage = allocWithoutGC(SC.GetK2RandomChestsRewardRecordMessage);
    requestMessage.setCategory(chestCfgData.getCategory());
    SC.MessageManager.getInstance().sendMessage(requestMessage);
    return true;
  }
  showRewardRecords_old(message) {
    let records = message?.getRewardRecords();
    if (!records || records.size() == 0) {
      tips(getString("TID_DRAW_LOTTERY_NO_RECORD_K2"));
      return;
    }
    let items = [];
    let count = records.size();
    for (let i = 0; i < count; i++) {
      let record = records.get(i);
      let gid = record.getRewardGlobalId();
      let count2 = record.getRewardCount();
      let name = getString(SC.LogicDataTables.getDataById(gid)?.getTID());
      let timestamp = Number(record.getDropTimeMillis());
      let time = this.formatTimestamp(timestamp);
      if (!name) continue;
      items.push(
        {
          value: SC.StringTable.getString("TID_DRAW_LOTTERY_RECORD_ITEM_K2").replace("<TIME>", time).replace("<ITEM>", name).replace("<NUM>", count2.toString()),
          time: Number(record.getDropTimeMillis())
        }
      );
    }
    this.openRewardRecordsPopup(items);
  }
  //#endregion records
  getTypeTag(obj) {
    return Object.prototype.toString.call(obj).slice(8, -1);
  }
  onRewardRecordMessage_old(evtData) {
    console.log(`LotteryDrawContainer TS: onRewardRecordMessage`);
    let message = SC.GameTSUtil.getEventPiranhaMessage(evtData, 0);
    let rewardRecordMessage = cast(message, SC.K2RandomChestsRewardRecordMessage);
    this.showRewardRecords_old(rewardRecordMessage);
  }
  onItemDataChange(evtData) {
    let logicData = evtData.getLogicData(2);
    let data = SC.GameTSUtil.getEventLogicData(evtData, 2);
    console.log(`LotteryDrawContainer TS: onItemDataChange Type${evtData.getInt(0)} count ${evtData.getInt(1)} name ${logicData.getName()}`);
    this.refreshControls(this.dataBinds);
  }
  onOneTimeLotteryClick(control) {
    const Times = 1;
    let chestType = Config.OneTimeChestType;
    this.tryDoLottery(Times, chestType, Config.K2DrawToken, Config.NotEnoughTockenBillingPackage);
    return true;
  }
  onTenTimeLotteryClick(control) {
    const Times = 10;
    let chestType = Config.TenTimeChestType;
    this.tryDoLottery(Times, chestType, Config.K2DrawToken, Config.NotEnoughTockenBillingPackage);
    return true;
  }
  onUpdate() {
  }
  onDestruct() {
    console.log("LotteryDrawContainer TS: onDestruct");
    SC.HomeScreen.SKIP_GATCHA_ANIMATION = false;
  }
  //
  // refresh text
  // refresh visibility
  guaranteedDropCountRefresh(control) {
    if (!control.isTextField()) {
      SC.Debugger.error("guaranteedDropCountReresh: control is not text field");
      return;
    }
    let textField = control.as(SC.TextField);
    control.m_visible = false;
    let homeMode = SC.HomeMode.getInstance().getLogicHome();
    let homeClient = homeMode?.getHome();
    if (!homeClient) {
      console.error("homeClient is null");
      return;
    }
    let chestData = homeClient?.getPlayerData()?.getK2RandomChests();
    if (!chestData) {
      console.error("chestData is null");
      return;
    }
    let guaranteeRewardInfos = chestData?.getGuaranteeRewardInfo(homeMode, Config.OneTimeChestType);
    try {
      if (!guaranteeRewardInfos) {
        return;
      }
      let count = guaranteeRewardInfos.size();
      if (count == 0) {
        control.m_visible = true;
        textField.setText(SC.StringTable.getString("TID_DRAW_LOTTERY_ALREADY_HAVE_ALL_SKINS_K2"));
        DEL(guaranteeRewardInfos);
        return;
      }
      let minDistance = 1e6;
      let foundItem = null;
      for (let i = 0; i < count; i++) {
        let item = guaranteeRewardInfos.get(i);
        if (item.getGuaranteeOffset() < minDistance) {
          foundItem = item.getGlobalId();
          minDistance = item.getGuaranteeOffset();
        }
      }
      if (foundItem != null) {
        control.m_visible = true;
        let rewward = SC.LogicDataTables.getDataById(foundItem);
        let desc = SC.StringTable.getString("TID_DRAW_LOTTERY_GUARANTEE_TIMES_LEFT_K2").replace("<VALUE>", `${minDistance}`).replace("<ITEM>", SC.StringTable.getString(rewward.getTID()));
        textField.setText(desc);
      }
    } catch (e) {
      handleException(e, "Lottery guaranteedDropCountReresh");
    }
    let infoNum = guaranteeRewardInfos?.size() ?? 0;
    for (let i = 0; i < infoNum; i++) {
      DEL(guaranteeRewardInfos.get(i));
    }
    DEL(guaranteeRewardInfos);
  }
  //#region do lottery    ------------------------->
  // Token item not enough, buy it and continue to do lottery.
  buyItemAndContinueLottery(resourceName, price, times, para, btn, notEnoughBillingPackage, PurchaseOption, hideTokenPopup = false) {
    console.log(`lottery INSUFFICIENT Buy ${resourceName} use gem ${price} ${times}_Draw PurchaseOption ${PurchaseOption}`);
    let canExecute = SC.LogicPurchaseOfferCommand.canExecute(SC.HomeMode.getInstance().getLogicHome(), -1, notEnoughBillingPackage, null, PurchaseOption);
    if (canExecute == SC.LogicPurchaseOfferCommand.VALIDATION_RESULT_OK) {
      if (hideTokenPopup) {
        SC.HomeScreen.SKIP_GATCHA_ANIMATION = true;
        console.log(`lottery  buyItemAndContinueLottery SKIP_GATCHA_ANIMATION ${SC.HomeScreen.SKIP_GATCHA_ANIMATION}`);
      }
      addCommand(SC.LogicPurchaseOfferCommand, -1, notEnoughBillingPackage, null, PurchaseOption);
      if (para && para.buttons && para.buttons.length > 0) {
        for (let button of para.buttons) {
          button.btn?.setEnabled(false);
          button.btn?.setGrayOut(true);
        }
      }
      return;
    }
    if (canExecute == SC.LogicPurchaseOfferCommand.VALIDATION_RESULT_INSUFFICIENT_RESOURCES) {
      let costResourceType = SC.NotEnoughResourcesPopover.CostResourceType.COST_TYPE_GEMS;
      if (PurchaseOption == SC.LogicPurchaseOfferCommand.PurchaseOption.TICKET_CASH) {
        costResourceType = SC.NotEnoughResourcesPopover.CostResourceType.COST_TYPE_TICKET_CASH;
      }
      let listener = new SC.TitanScriptButtonListener("top-up", () => {
        let missingAmount = 0;
        let resourceType = SC.DirectPurchaseGemPacksPopup.CostResourceType.COST_TYPE_GEMS;
        if (costResourceType == SC.NotEnoughResourcesPopover.CostResourceType.COST_TYPE_GEMS) {
          let gems = SC.HomeMode.getInstance().getPlayersAvatar().getDiamonds();
          missingAmount = price - gems;
          resourceType = SC.DirectPurchaseGemPacksPopup.CostResourceType.COST_TYPE_GEMS;
        } else if (costResourceType == SC.NotEnoughResourcesPopover.CostResourceType.COST_TYPE_TICKET_CASH) {
          let ticketCash = SC.HomeMode.getInstance().getPlayersAvatar().getTickets(true);
          missingAmount = price - ticketCash;
          resourceType = SC.DirectPurchaseGemPacksPopup.CostResourceType.COST_TYPE_TICKET_CASH;
        }
        SC.DirectPurchaseGemPacksPopup.show(missingAmount, resourceType, true);
      });
      this.manage(listener, ManagedType.AutoDestroy);
      SC.NotEnoughResourcesPopover.show(btn.as(SC.GameButton), listener, costResourceType, price);
      return;
    }
  }
  tryDoLottery(times, chestType, resourceConsume, notEnoughBillingPackageNamePrefix, drawOption = SC.LogicK2DrawCommand.DrawOption.DrawOption_K2_DRAW_TOKEN) {
    let billingPkg = SC.LogicDataTables.getBillingPackageDataByChestType(chestType);
    let resouce = SC.LogicDataTables.getResourceByName(resourceConsume, null);
    let checkCanExecuteFunc = () => {
      return SC.LogicK2DrawCommand.canExecute(SC.HomeMode.getInstance().getLogicHome(), billingPkg, drawOption);
    };
    let popupToExecuteFunc = () => {
      let dsc = getLotteryDsc("TID_DRAW_LOTTERY_CONFIRM_K2", resouce, times);
      openSimplePopup(
        "TID_DRAW_LOTTERY_K2",
        dsc,
        () => {
          SC.HomeScreen.SKIP_GATCHA_ANIMATION = false;
          console.log(`lottery simply use ${resourceConsume} ${times} SKIP_GATCHA_ANIMATION ${SC.HomeScreen.SKIP_GATCHA_ANIMATION}`);
          addCommand(SC.LogicK2DrawCommand, billingPkg, drawOption);
        },
        /*no cancel btn*/
        null,
        () => {
          console.log(`lottery close ${times}_Draw`);
        }
      );
    };
    let canExecute = checkCanExecuteFunc();
    if (ResultEnum.VALIDATION_RESULT_OK == canExecute) {
      popupToExecuteFunc();
    } else if (canExecute == ResultEnum.VALIDATION_RESULT_INSUFFICIENT_RESOURCES) {
      let current = getResourceCount(resourceConsume);
      if (!notEnoughBillingPackageNamePrefix) {
        let tipsText = SC.StringTable.getString("TID_DRAW_LOTTERY_EXCHANGE_NOT_ENOUGH_K2").replace("<ITEM>", SC.StringTable.getString(resouce.getTID())).replace("<NUM>", current.toString());
        tips(tipsText);
        return;
      }
      let dsc = getLotteryDsc("TID_DRAW_LOTTERY_BUY_CONFIRM_K2", resouce, times);
      if (current >= times) {
        SC.Debugger.error(`lottery tryDoLottery ${times}_Draw, [INSUFFICIENT] current ${current} > times ${times}`);
        return;
      }
      let closeCB = () => {
        SC.HomeScreen.SKIP_GATCHA_ANIMATION = false;
        console.log(`lottery INSUFFICIENT onDestruct_cb ${times}_Draw SKIP_GATCHA_ANIMATION ${SC.HomeScreen.SKIP_GATCHA_ANIMATION}`);
      };
      let delta = times - current;
      let gemNeeded = SC.LogicAvatarHelper.getMissingK2DrawTokensInGems(delta);
      let crashTicketNeeded = SC.LogicAvatarHelper.getMissingK2DrawTokensInTicketCash(delta);
      let notEnoughBillingPackage = SC.LogicDataTables.getBillingPackageByName(`${notEnoughBillingPackageNamePrefix}${delta - 1}`, null);
      let purchasePara = {
        title: "TID_DRAW_LOTTERY_K2",
        desc: dsc,
        onConstuct: (popup) => {
          popup.subscribe("cpp_commoditycountchanged", (evtData) => {
            let logicData = evtData.getLogicData(2);
            let data = SC.GameTSUtil.getEventLogicData(evtData, 2);
            console.log(`LotteryDrawContainer TS: onItemDataChange Type${evtData.getInt(0)} count ${evtData.getInt(1)} name ${logicData.getName()}`);
            if (logicData.getName() == resourceConsume && checkCanExecuteFunc() == ResultEnum.VALIDATION_RESULT_OK) {
              console.log(`lottery ${resourceConsume} resource is enough to continue SKIP_GATCHA_ANIMATION ${SC.HomeScreen.SKIP_GATCHA_ANIMATION}`);
              popup.close();
              SC.HomeScreen.SKIP_GATCHA_ANIMATION = false;
              console.log(`lottery topup done to continue use ${resourceConsume} ${times} SKIP_GATCHA_ANIMATION ${SC.HomeScreen.SKIP_GATCHA_ANIMATION}`);
              addCommand(SC.LogicK2DrawCommand, billingPkg, drawOption);
            }
          });
        },
        close_cb: closeCB,
        onDestruct_cb: closeCB
      };
      purchasePara.buttons = [
        {
          price_type: SC.DirectPurchaseGemPacksPopup.CostResourceType.COST_TYPE_GEMS,
          price: gemNeeded,
          closeOnClick: false,
          callback: (btn) => {
            this.buyItemAndContinueLottery(
              resourceConsume,
              gemNeeded,
              times,
              purchasePara,
              btn,
              notEnoughBillingPackage,
              SC.LogicPurchaseOfferCommand.PurchaseOption.GEMS_ONLY,
              true
            );
          }
        },
        {
          price_type: SC.DirectPurchaseGemPacksPopup.CostResourceType.COST_TYPE_TICKET_CASH,
          price: crashTicketNeeded,
          closeOnClick: false,
          callback: (btn) => {
            this.buyItemAndContinueLottery(
              resourceConsume,
              crashTicketNeeded,
              times,
              purchasePara,
              btn,
              notEnoughBillingPackage,
              SC.LogicPurchaseOfferCommand.PurchaseOption.TICKET_CASH,
              true
            );
          }
        }
      ];
      openGenericPopup({ module: "ui/activity/CommonPurchasePopup.mjs", scFile: getSCFile(), clip: "popup_generic", para: [purchasePara], darkenBackground: true });
    } else {
      console.log("canExecute error code ", canExecute);
    }
  }
  //#endregion do lottery <<-----------------------
}
export {
  LotteryDrawContainer
};
//# sourceMappingURL=LotteryDrawContainer.mjs.map
