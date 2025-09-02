let OneTimeChestType = 1000010;
let TenTimeChestType = 1000011;
let FragmentChestType = 1000012;
const LotteryConfig = {
  K2DrawTokenID: 5000036,
  K2DrawToken: "K2DrawToken",
  K2DrawFragmentID: 5000035,
  K2DrawFragment: "K2DrawFragment",
  NotEnoughTockenBillingPackage: "com.supercell.laser_cn.drawtokenpack",
  // com.supercell.laser_cn.drawtokenpack0[0-9]
  OneTimeChestType,
  TenTimeChestType,
  FragmentChestType,
  ChestRecords: [OneTimeChestType, FragmentChestType],
  // Chest types to show in records(Popup). WITH DIFFERENT CATEGORY
  // call vibration at time while playing Chest animation.
  ChestVibration: []
};
export {
  LotteryConfig
};
//# sourceMappingURL=activity-cfg.mjs.map
