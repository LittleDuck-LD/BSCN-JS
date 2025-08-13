import { addCommand } from "../../base/util.mjs";
function hasPrivacySettings() {
  return SC.LogicVersion.isChinaVersion();
}
function isTencentSelfServiceAvailable() {
  return SC.LogicVersion.isChinaVersion();
}
function isCountrySelectionAvailable() {
  return !SC.LogicVersion.isChinaVersion();
}
function shouldUseTencentSupportButton() {
  return SC.LogicVersion.isChinaVersion() && SC.TencentManager.getInstance() && SC.TencentManager.getInstance().isFeatureEnabled();
}
function isSupercellIDEnabled() {
  return false;
}
function isTencentEnabled() {
  const pAvatar = SC.HomeMode.getInstance().getPlayersAvatar();
  if ((pAvatar.getAccountBoundFlags() & 16) != 0) {
    return false;
  }
  return SC.TencentManager.getInstance() && SC.TencentManager.getInstance().isFeatureEnabled();
}
function hasWechatButton() {
  if (!SC.LogicVersion.isChinaVersion() || !SC.TencentManager.getInstance() || !isTencentEnabled()) {
    return false;
  }
  const guestEnabled = SC.LogicDefines.isPlatformIOS() || SC.LogicDefines.isPlatformDesktop();
  if (guestEnabled) {
    return SC.TencentManager.getInstance().isPlatformInstalled(1) || SC.TencentManager.getInstance().getLoggedInPlatform() == 1;
  }
  return true;
}
function getHome() {
  return SC.HomeMode.getInstance().getLogicHome().getHome();
}
function getPlayerData() {
  return getHome().getPlayerData();
}
function getConfData() {
  return getHome().getConfData();
}
function openFaq(openNotificationConversations = true) {
  if (SC.HomeMode.getInstance().getLogicHome().getHome().getConfData().isSupportDisabled()) {
    SC.GUI.getInstance().showPopup(new SC.QuestionPopup(110), true, false, true);
  } else if (shouldUseTencentSupportButton()) {
    SC.TencentManager.getInstance().openTencentSupport("SETTINGS");
  } else if (SC.HomeMode.isHelpshiftEnabled()) {
    addCommand(SC.LogicHelpOpenedCommand);
    SC.HelpshiftManager.getInstance().start();
    SC.HelpshiftManager.getInstance().updateMetadata("");
    if (SC.HelpshiftManager.getInstance().getNotificationCount() > 0 && openNotificationConversations) {
      if (SC.GameSelfhelpListener.shouldUsePromptBeforeSupportConversation()) {
        SC.GameMain.getInstance().showNativeDialog(SC.GameMain.NativeDialogType.NATIVE_DIALOG_CHINA_ENTER_HELPSHIFT_CONVERSATION);
      } else {
        SC.HelpshiftManager.getInstance().showConversation();
      }
    } else {
      const useSelfhelp = shouldUseSelfhelp();
      if (useSelfhelp) {
        debugger;
      } else {
        SC.HelpshiftManager.getInstance().showConversation();
      }
    }
    if (SC.GUI.getInstance()) {
    }
  } else {
  }
}
function shouldUseSelfhelp() {
  const pLocale = SC.StringTable.getLocale();
  if (pLocale.isFallbackToHelpshift()) {
    return false;
  }
  return SC.LogicDataTables.getClientGlobals().isSelfhelpEnabled();
}
function openTencentSelfService() {
  const pClientGlobals = SC.LogicDataTables.getClientGlobals();
  const assistantUrl = pClientGlobals.getTencentPersonalAssistantURL();
  const assistantID = pClientGlobals.getTencentPersonalAssistantGameId();
  const pAvatar = SC.HomeMode.getInstance().getPlayersAvatar();
  const playerName = pAvatar.getName();
  const pAccountId = SC.GameMain.getInstance().getAccountId();
  const accountIdStr = pAccountId ? pAccountId.getLong().toString() : "0";
  SC.TencentManager.getInstance().openTencentPersonalAssistant(assistantUrl, assistantID, playerName, accountIdStr);
}
function showWebPage(url) {
  if (SC.LogicVersion.isChinaVersion() && SC.TencentManager.getInstance() && SC.TencentManager.getInstance().isFeatureEnabled() && !SC.LogicDefines.isPlatformDesktop()) {
    SC.TencentManager.getInstance().openUrl(url);
  } else {
    SC.Application.openURL(url);
  }
}
function isInviteBlockOn() {
  return SC.HomeMode.getInstance().getLogicHome().getHome().getPlayerData().isInviteBlockOn();
}
function isTeamChatMuteOn() {
  return SC.HomeMode.getInstance().getLogicHome().getHome().getPlayerData().isTeamChatMuteOn();
}
export {
  getConfData,
  getHome,
  getPlayerData,
  hasPrivacySettings,
  hasWechatButton,
  isCountrySelectionAvailable,
  isInviteBlockOn,
  isSupercellIDEnabled,
  isTeamChatMuteOn,
  isTencentEnabled,
  isTencentSelfServiceAvailable,
  openFaq,
  openTencentSelfService,
  shouldUseSelfhelp,
  shouldUseTencentSupportButton,
  showWebPage
};
//# sourceMappingURL=SettingsScreenFunctions.mjs.map
