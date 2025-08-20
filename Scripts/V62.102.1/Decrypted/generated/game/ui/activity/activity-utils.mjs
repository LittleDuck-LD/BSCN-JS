import { addCommand, hasCmdParam } from "../../base/util.mjs";
import { tips } from "../../base/gui.mjs";
function isLocalDebug() {
  if (LASER_DEBUG && hasCmdParam("local-activity")) return true;
  return false;
}
function getSCFile() {
  if (isLocalDebug()) return "sc/collab_eva.sc";
  return SC.CollabUtil.getDownloadedScFilenameAny();
}
function getChestRewardList(chestType, filter) {
  let randomChest = SC.LogicDataTables.getRandomChestDataByType(chestType);
  let rewardCount = randomChest.getRewardCount();
  let datas = [];
  for (let i = 0; i < rewardCount; ++i) {
    let rewardData = randomChest.getRewardData(i);
    let dropType = rewardData.getDropType();
    if (dropType == 0) {
      let rewardSet = rewardData.getSet();
      let rewardList = rewardSet.getRewardList();
      let rewardExtraList = rewardSet.getExtraRewardIntList();
      for (let j = 0; j < rewardList.size(); j++) {
        let globalId = rewardList.get(j);
        let itemDropType = SC.LogicGatchaDrop.getGatchaDropTypeFromGlobalId(globalId);
        if (itemDropType == SC.LogicGatchaDrop.GatchaDropType.TYPE_HERO && filter.has(SC.LogicGatchaDrop.GatchaDropType.TYPE_HERO)) {
          let data = SC.LogicDataTables.getDataById(globalId);
          datas.push(data);
        }
        if (itemDropType == SC.LogicGatchaDrop.GatchaDropType.TYPE_SKIN && filter.has(SC.LogicGatchaDrop.GatchaDropType.TYPE_SKIN)) {
          let data = SC.LogicDataTables.getDataById(globalId);
          datas.push(data);
        } else if (itemDropType == SC.LogicGatchaDrop.GatchaDropType.TYPE_VANITY_ITEM && filter.has(SC.LogicGatchaDrop.GatchaDropType.TYPE_VANITY_ITEM)) {
          let data = SC.LogicDataTables.getDataById(globalId);
          datas.push(data);
        } else if (itemDropType == SC.LogicGatchaDrop.GatchaDropType.TYPE_ITEM && filter.has(SC.LogicGatchaDrop.GatchaDropType.TYPE_ITEM)) {
          let data = SC.LogicDataTables.getDataById(globalId);
          datas.push(data);
        }
      }
    } else {
    }
  }
  return datas;
}
function getResourceCount(resName) {
  return SC.HomeMode.getInstance()?.getPlayersAvatar()?.getResourceCount(SC.LogicDataTables.getResourceByName(resName, null)) ?? 0;
}
var ResultEnum = /* @__PURE__ */ ((ResultEnum2) => {
  ResultEnum2[ResultEnum2["VALIDATION_RESULT_OK"] = 0] = "VALIDATION_RESULT_OK";
  ResultEnum2[ResultEnum2["VALIDATION_RESULT_ERROR"] = 1] = "VALIDATION_RESULT_ERROR";
  ResultEnum2[ResultEnum2["VALIDATION_RESULT_INVALID_DATA"] = 2] = "VALIDATION_RESULT_INVALID_DATA";
  ResultEnum2[ResultEnum2["VALIDATION_RESULT_NOT_K2_CHEST_OFFER"] = 3] = "VALIDATION_RESULT_NOT_K2_CHEST_OFFER";
  ResultEnum2[ResultEnum2["VALIDATION_RESULT_ALREADY_PURCHASED"] = 4] = "VALIDATION_RESULT_ALREADY_PURCHASED";
  ResultEnum2[ResultEnum2["VALIDATION_RESULT_OFFER_INVALID"] = 5] = "VALIDATION_RESULT_OFFER_INVALID";
  ResultEnum2[ResultEnum2["VALIDATION_RESULT_INSUFFICIENT_RESOURCES"] = 6] = "VALIDATION_RESULT_INSUFFICIENT_RESOURCES";
  ResultEnum2[ResultEnum2["VALIDATION_RESULT_INVALID_DRAW_OPTION"] = 7] = "VALIDATION_RESULT_INVALID_DRAW_OPTION";
  return ResultEnum2;
})(ResultEnum || {});
function tryDoFragementLottery(chestType, resourceName, price, drawOption = SC.LogicK2DrawCommand.DrawOption.DrawOption_K2_DRAW_FRAGMENT) {
  let billingPkg = SC.LogicDataTables.getBillingPackageDataByChestType(chestType);
  let resouce = SC.LogicDataTables.getResourceByName(resourceName, null);
  let canExecute = SC.LogicK2DrawCommand.canExecute(SC.HomeMode.getInstance().getLogicHome(), billingPkg, drawOption);
  if (0 /* VALIDATION_RESULT_OK */ == canExecute) {
    console.log(`lottery simply use ${resourceName} `);
    addCommand(SC.LogicK2DrawCommand, billingPkg, drawOption);
  } else if (canExecute == 6 /* VALIDATION_RESULT_INSUFFICIENT_RESOURCES */) {
    let tipsText = SC.StringTable.getString("TID_DRAW_LOTTERY_EXCHANGE_NOT_ENOUGH_K2").replace("<ITEM>", SC.StringTable.getString(resouce.getTID())).replace("<NUM>", price.toString());
    tips(tipsText);
    return;
  } else {
    console.log("canExecute error code ", canExecute);
  }
}
function getLotteryDsc(dsc, logicData, num) {
  return SC.StringTable.getString(dsc).replace("<ITEM>", `${SC.StringTable.getString(logicData.getTID())}`).replace("<NUM>", num.toString());
}
export {
  ResultEnum,
  getChestRewardList,
  getLotteryDsc,
  getResourceCount,
  getSCFile,
  isLocalDebug,
  tryDoFragementLottery
};
//# sourceMappingURL=activity-utils.mjs.map
