import { getConfData, hasPrivacySettings, hasWechatButton, isCountrySelectionAvailable, isInviteBlockOn, isTeamChatMuteOn, isTencentEnabled, isTencentSelfServiceAvailable, openFaq, openTencentSelfService, shouldUseTencentSupportButton, showWebPage } from "./SettingsScreenFunctions.mjs";
let screenRootMC;
let qqButton;
let wechatButton;
let tOSButton;
let pPButton;
let creditsButton;
let parentsButton;
let thirdPartySharingButton;
let apiTokenButton;
let dropRatesButton;
let adsButton;
let deviceLinkButton;
let chinaButton;
let languageButton;
let controlsButton;
let latencyButton;
let privacySettingsButton;
let faqButton;
let faqNumber;
let apiTokenTextField;
let playerIdTextField;
let blockFriendRequestButton;
let hapticsButton;
let doNotDisturbButton;
let muteChatButton;
let dualChannelButton;
let dualChannelHelpButton;
let screenInstance = null;
let m_apiToken = "";
let m_checkWhenConnectedToTencent = false;
let m_apiTokenExpiryTime = null;
let m_inviteBlockChangePending = false;
function createSelectableButtonByMC(movieclip, enabled) {
  if (!movieclip) return null;
  const button = new SC.GameSelectableButton();
  button.setMovieClip(movieclip, true);
  button.setSelected(enabled);
  button.getMovieClip().setText("text_on", SC.StringTable.getString("TID_SETTINGS_ON"));
  button.getMovieClip().setText("text_off", SC.StringTable.getString("TID_SETTINGS_OFF"));
  return button;
}
function createSelectableButton(mcName, enabled) {
  let movieclip = screenRootMC.getMovieClipByName(mcName);
  return createSelectableButtonByMC(movieclip, enabled);
}
const listenerMap = /* @__PURE__ */ new Map();
function newButtonListener(name, callback) {
  name = name[0].toUpperCase() + name.slice(1);
  const listener = new SC.TitanScriptButtonListener(
    "Settings_" + name,
    (button) => {
      console.log(name + " clicked");
      callback(button, name);
    }
  );
  listenerMap.set(name, listener);
  return listener;
}
function addButtonListener(button, name, callback) {
  let listener = newButtonListener(name, callback);
  SC.TitanUtil.addButtonListener(button, listener);
}
function update() {
  if (hapticsButton.isSelected() != SC.GameSettings.getInstance().hapticsEnabled()) {
    SC.GUI.getInstance().fadeOutPopover();
    SC.GameSettings.getInstance().enableHaptics(hapticsButton.isSelected());
  }
  if (dualChannelButton.isSelected() != SC.GameSettings.getInstance().dualChannelEnabled()) {
    SC.GameSettings.getInstance().enableDualChannel(dualChannelButton.isSelected(), true);
  }
  doNotDisturbButton.setGrayOut(m_inviteBlockChangePending);
  if (!m_inviteBlockChangePending) {
    doNotDisturbButton.setSelected(isInviteBlockOn());
  }
  muteChatButton.setSelected(isTeamChatMuteOn());
  if (faqNumber) {
    const count = SC.HelpshiftManager.getInstance().getNotificationCount();
    if (count == 0) {
      faqNumber.m_visible = false;
    } else {
      const pTF = faqNumber.getTextFieldByName("count_txt");
      if (pTF) {
        pTF.setNumberText(count);
        faqNumber.gotoAndStop("red");
      } else {
        faqNumber.gotoAndStop("attention");
      }
      faqNumber.m_visible = true;
    }
  }
  if (m_checkWhenConnectedToTencent) {
    if (SC.TencentManager.getInstance().isAuthorized()) {
      m_checkWhenConnectedToTencent = false;
      updateTencentVisibility();
    }
  }
  if (!!m_apiToken && SC.xTimer.getSecondsSince1970() > m_apiTokenExpiryTime) {
    m_apiToken = "";
    setApiTokenVisible(false);
  }
}
function setApiToken(token, tokenRefreshSeconds) {
  m_apiToken = token;
  m_apiTokenExpiryTime = SC.xTimer.getSecondsSince1970() + BigInt(tokenRefreshSeconds);
  setApiTokenVisible(true);
}
async function settingScreen(self, ScreenClose) {
  try {
    const CPPManagedObjects = init(self);
    screenInstance = self;
    await ScreenClose;
    CPPManagedObjects.forEach((obj) => obj[Symbol.dispose]());
    screenInstance = null;
  } catch (e) {
    console.error(e);
    throw e;
  }
}
function init(screenInstance2) {
  const CPPManagedObjects = [];
  let KEY_K2_SETTING_POPUP_USING_SUPERCELL = 563;
  let scOriginalRes = SC.LogicConfData.getK2ChronosIntValue(KEY_K2_SETTING_POPUP_USING_SUPERCELL, 1);
  if (scOriginalRes == 1) {
    screenRootMC = SC.ResourceManager.getMovieClip("sc/ui.sc", "settings_popup_original");
  } else {
    screenRootMC = SC.ResourceManager.getMovieClip("sc/ui.sc", "settings_popup");
  }
  screenInstance2.setMovieClip(screenRootMC);
  if (scOriginalRes) {
    screenRootMC.setX(-80);
  }
  console.log(`SettingsScreen Using scRes: ${scOriginalRes}`);
  blockFriendRequestButton = createSelectableButton("button_allow_friend_requests", SC.FriendsManager.getInstance().isBlockFriendRequests());
  addButtonListener(blockFriendRequestButton, "blockFriendRequest", buttonClicked);
  screenRootMC.addChild(blockFriendRequestButton);
  CPPManagedObjects.push(blockFriendRequestButton);
  doNotDisturbButton = createSelectableButton("button_do_not_disturb", isInviteBlockOn());
  addButtonListener(doNotDisturbButton, "doNotDisturb", buttonClicked);
  screenRootMC.addChild(doNotDisturbButton);
  screenRootMC.setText("do_not_disturb_txt", SC.StringTable.getString("TID_SETTINGS_MUTE_TEAM_INVITES"));
  CPPManagedObjects.push(doNotDisturbButton);
  muteChatButton = createSelectableButton("button_mute_chat", isTeamChatMuteOn());
  addButtonListener(muteChatButton, "muteChat", buttonClicked);
  screenRootMC.addChild(muteChatButton);
  const hasMuteTeamChat = !SC.HomeScreen.isPlayerAgeGated();
  muteChatButton.m_visible = hasMuteTeamChat;
  const muteChatTxt = screenRootMC.getTextFieldByName("mute_chat_txt");
  if (muteChatTxt) {
    muteChatTxt.m_visible = hasMuteTeamChat;
    muteChatTxt.setText(SC.StringTable.getString("TID_SETTINGS_MUTE_TEAM_CHAT"));
  }
  CPPManagedObjects.push(muteChatButton);
  hapticsButton = createSelectableButton("button_haptics", SC.GameSettings.getInstance().hapticsEnabled());
  screenRootMC.addChild(hapticsButton);
  CPPManagedObjects.push(hapticsButton);
  dualChannelButton = createSelectableButton("button_dual_channels", SC.GameSettings.getInstance().dualChannelEnabled());
  if (dualChannelButton) {
    screenRootMC.addChild(dualChannelButton);
    CPPManagedObjects.push(dualChannelButton);
    const dualChannelTxt = screenRootMC.getTextFieldByName("dual_channels_txt");
    if (dualChannelTxt) {
      dualChannelTxt.setText(SC.StringTable.getString("TID_K2_DUAL_CHANNEL_TITLE"));
    }
    dualChannelHelpButton = screenInstance2.addGameButton("btn_dual_channels_help", false);
    if (dualChannelHelpButton) {
      CPPManagedObjects.push(dualChannelHelpButton);
      addButtonListener(dualChannelHelpButton, "dualChannelHelpButton", buttonClicked);
    }
  } else {
    let dualChannelsMc = screenRootMC.getMovieClipByName("dual_channels");
    if (dualChannelsMc) {
      let selectBtnMC = dualChannelsMc.getMovieClipByName("button_dual_channels");
      dualChannelButton = createSelectableButtonByMC(selectBtnMC, SC.GameSettings.getInstance().dualChannelEnabled());
      dualChannelsMc.addChild(dualChannelButton);
      CPPManagedObjects.push(dualChannelButton);
      let listerner = newButtonListener("dualChannelHelpButton", buttonClicked);
      dualChannelHelpButton = SC.GameButton.createButton(dualChannelsMc, "btn_dual_channels_help", listerner);
      SC.TitanUtil.addButtonListener(dualChannelHelpButton, listerner);
      CPPManagedObjects.push(dualChannelHelpButton);
      const dualChannelTxt = dualChannelsMc.getTextFieldByName("dual_channels_txt");
      if (dualChannelTxt) {
        dualChannelTxt.setText(SC.StringTable.getString("TID_K2_DUAL_CHANNEL_TITLE"));
      }
    }
  }
  if (isTencentSelfServiceAvailable()) {
    chinaButton = screenInstance2.addGameButton("button_country", true);
    CPPManagedObjects.push(chinaButton);
    addButtonListener(chinaButton, "chinaButton", buttonClicked);
    SC.MovieClipHelper.setTextAndScaleIfNecessary(
      chinaButton.getMovieClip().getTextFieldByName("Text"),
      SC.StringTable.getString("TID_SELF_SERVICE_BUTTON"),
      false,
      false
    );
  } else if (SC.DeviceLinkWindow.isAvailableFromSettings()) {
    deviceLinkButton = screenInstance2.addGameButton("button_country", true);
    addButtonListener(deviceLinkButton, "deviceLinkButton", buttonClicked);
    SC.MovieClipHelper.setTextAndScaleIfNecessary(
      deviceLinkButton.getMovieClip().getTextFieldByName("Text"),
      SC.StringTable.getString("TID_LINK_DEVICE_BUTTON"),
      false,
      false
    );
  } else {
    screenRootMC.setChildVisible("button_country", false);
  }
  screenRootMC.setChildVisible("TID_SETTINGS_LOCATION", isCountrySelectionAvailable());
  faqButton = screenInstance2.addGameButton("button_faq", true);
  addButtonListener(faqButton, "faqButton", buttonClicked);
  faqNumber = faqButton.getMovieClip().getMovieClipByName("number_of_entrys");
  if (faqNumber) {
    faqNumber.m_visible = false;
  }
  if (shouldUseTencentSupportButton()) {
    faqButton.setText("TID_FAQ_BUTTON", SC.StringTable.getString("TID_TENCENT_CUSTOMER_SUPPORT"));
  }
  languageButton = screenInstance2.addGameButton("button_language", true);
  CPPManagedObjects.push(languageButton);
  addButtonListener(languageButton, "languageButton", buttonClicked);
  const pLocale = SC.StringTable.getLocale();
  const pLocales = SC.LogicDataTables.getTable(1);
  if (SC.LogicDefines.isPlatformTencent()) {
    const cdKeyText = SC.StringTable.getString("TID_TENCENT_CDKEY_EXCHANGE");
    let bShow = true;
    const pConfData = SC.HomeMode.getConfData();
    if (pConfData) {
      bShow = pConfData.isCNCDKeyEntryEnabled();
    }
    languageButton.m_visible = bShow;
    languageButton.m_interactive = true;
    languageButton.setText(cdKeyText, true);
    screenRootMC.setChildVisible("TID_SETTINGS_LANGUAGE", false);
  } else if (SC.LogicVersion.isChinaVersion() || SC.TitanUtil.isNullptr(pLocale) || SC.TitanUtil.isNullptr(pLocales) || SC.TitanUtil.isNullptr(pLocale) || pLocales.getItemCount() < 2) {
    languageButton.m_visible = false;
    languageButton.m_interactive = true;
    screenRootMC.setChildVisible("TID_SETTINGS_LANGUAGE", false);
  }
  screenInstance2.setChildVisible("button_fb_connect", false);
  screenInstance2.setChildVisible("button_yoozoo_connect", false);
  if (SC.LogicVersion.isChinaVersion()) {
    qqButton = screenInstance2.addGameButton("button_qq_connect", true);
    addButtonListener(qqButton, "qqButton", buttonClicked);
    qqButton.setText(SC.StringTable.getString("TID_SETTINGS_BUTTON_QQ_LOGIN"), true);
    wechatButton = screenInstance2.addGameButton("button_wechat_connect", true);
    addButtonListener(wechatButton, "wechatButton", buttonClicked);
    wechatButton.setText(SC.StringTable.getString("TID_SETTINGS_BUTTON_WECHAT_LOGIN"), true);
    SC.MovieClipHelper.autoAdjustChildTexts(qqButton, false, true, true);
    SC.MovieClipHelper.autoAdjustChildTexts(wechatButton, false, true, true);
    wechatButton.m_visible = hasWechatButton();
  } else {
    screenInstance2.setChildVisible("button_wechat_connect", false);
    screenInstance2.setChildVisible("button_qq_connect", false);
  }
  screenInstance2.setChildVisible("button_sc_id", false);
  screenInstance2.setChildVisible("TID_SETTINGS_SC_ID", false);
  tOSButton = screenInstance2.addGameButton("button_terms", true);
  pPButton = screenInstance2.addGameButton("button_privacy", true);
  creditsButton = screenInstance2.addGameButton("button_credits", true);
  parentsButton = screenInstance2.addGameButton("button_parentsguide", true);
  thirdPartySharingButton = screenInstance2.addGameButton("button_thirdparty", true);
  apiTokenButton = screenInstance2.addGameButton("button_api", true);
  dropRatesButton = screenInstance2.addGameButton("button_random_reward_rates");
  dropRatesButton.m_visible = false;
  addButtonListener(tOSButton, "tOSButton", buttonClicked);
  addButtonListener(pPButton, "pPButton", buttonClicked);
  addButtonListener(creditsButton, "creditsButton", buttonClicked);
  addButtonListener(parentsButton, "parentsButton", buttonClicked);
  addButtonListener(thirdPartySharingButton, "thirdPartySharingButton", buttonClicked);
  addButtonListener(apiTokenButton, "apiTokenButton", buttonClicked);
  apiTokenTextField = apiTokenButton.getMovieClip().getTextFieldByName("Text");
  apiTokenTextField.setText(SC.StringTable.getString("TID_API_TOKEN_SHOW"));
  playerIdTextField = screenRootMC.getTextFieldByName("player_id_txt");
  playerIdTextField.m_visible = false;
  playerIdTextField.setText("");
  let hasParentsGuideButton = true;
  let hasThirdPartySharingButton = false;
  const pThirdPartyButtonTID = "TID_THIRD_PARTY_SHARING_BUTTON_TENCENT";
  let hasApiTokenButton = false;
  if (SC.LogicVersion.isChinaVersion() || SC.RenderSystem.useChinaGfxTweaks()) {
    hasParentsGuideButton = !!SC.StringTable.getLocale().getParentsGuideUrl();
    hasThirdPartySharingButton = !!SC.StringTable.getLocale().getThirdPartySharingUrl();
    hasApiTokenButton = !getConfData().isApiTokenDisabled();
    tOSButton.getMovieClip().setText("TID_TERMS_OF_SERVICE_BUTTON", SC.StringTable.getString("TID_TERMS_OF_SERVICE_BUTTON_TENCENT"));
    scaleMultilineTextForLongestWordForButton(tOSButton, "TID_TERMS_OF_SERVICE_BUTTON");
    const ppText = SC.StringTable.getString("TID_PRIVACY_POLICY_BUTTON_TENCENT");
    pPButton.getMovieClip().setText("TID_PRIVACY_POLICY_BUTTON", ppText);
    scaleMultilineTextForLongestWordForButton(pPButton, "TID_PRIVACY_POLICY_BUTTON");
    if (hasParentsGuideButton) {
      parentsButton.getMovieClip().setText("TID_PARENTS_GUIDE_BUTTON", SC.StringTable.getString("TID_PARENTS_GUIDE_BUTTON_TENCENT"));
      scaleMultilineTextForLongestWordForButton(parentsButton, "TID_PARENTS_GUIDE_BUTTON_TENCENT");
    }
  }
  parentsButton.m_visible = hasParentsGuideButton;
  parentsButton.m_interactive = hasParentsGuideButton;
  thirdPartySharingButton.m_visible = hasThirdPartySharingButton;
  thirdPartySharingButton.m_interactive = hasThirdPartySharingButton;
  thirdPartySharingButton.getMovieClip().setText("TID_PRIVACY_POLICY_BUTTON", SC.StringTable.getString(pThirdPartyButtonTID));
  scaleMultilineTextForLongestWordForButton(thirdPartySharingButton, "TID_THIRD_PARTY_SHARING_BUTTON");
  apiTokenButton.m_visible = hasApiTokenButton;
  apiTokenButton.m_interactive = hasApiTokenButton;
  if (hasApiTokenButton) {
    playerIdTextField.setText(SC.SettingsScreenK2.getPlayerAvatarHashCode());
  }
  setApiTokenVisible(false);
  screenRootMC.setChildVisible("TID_SETTINGS_GOOGLE", false);
  screenRootMC.setChildVisible("button_google_connect", false);
  screenRootMC.setChildVisible("TID_SETTINGS_KAKAO", false);
  screenRootMC.setChildVisible("button_kakao_connect", false);
  if (SC.LogicVersion.isChinaVersion()) {
    const pTitle = screenRootMC.getTextFieldByName("title_friends_txt");
    const pBg = screenRootMC.getMovieClipByName("friends_bg");
    pTitle.setText(SC.StringTable.getString("TID_SETTINGS_SOCIAL_TITLE_TENCENT"));
    if (SC.StringTable.getLocale().isRTL()) {
      pTitle.setAlign(4);
    }
    if (wechatButton && qqButton && !hasWechatButton()) {
      const shrinkOffset = wechatButton.getX() - qqButton.getX();
      pBg.setWidth(pBg.getWidth() - shrinkOffset);
      pBg.setX(pBg.getX() - shrinkOffset * 0.5);
      if (SC.StringTable.getLocale().isRTL()) {
        pTitle.setX(pTitle.getX() - shrinkOffset);
      }
    }
  } else if (!SC.HomeScreen.isPlayerAgeGated()) {
    const pTitle = screenRootMC.getTextFieldByName("title_friends_txt");
    pTitle.setText(SC.StringTable.getString("TID_SETTINGS_FIND_FRIENDS"));
    if (SC.StringTable.getLocale().isRTL()) {
      pTitle.setAlign(4);
    }
  } else {
    screenRootMC.setChildVisible("friends_bg", false);
  }
  privacySettingsButton = screenInstance2.addGameButton("button_privacy_settings", true);
  if (hasPrivacySettings()) {
    privacySettingsButton.getMovieClip().setText("TID_PRIVACY_POLICY_BUTTON", SC.StringTable.getString("TID_CHINA_PRIVACY_SETTINGS_BUTTON"));
    privacySettingsButton.m_visible = true;
  } else if (SC.SettingsPrivacyScreen.hasGlobalVersionDeleteAccount()) {
    privacySettingsButton.getMovieClip().setText("TID_PRIVACY_POLICY_BUTTON", SC.StringTable.getString("TID_DELETE_ACCOUNT_TITLE"));
    privacySettingsButton.m_visible = true;
  } else {
    privacySettingsButton.m_visible = false;
  }
  addButtonListener(privacySettingsButton, "privacySettingsButton", buttonClicked);
  latencyButton = screenInstance2.addGameButton("button_birthday", true);
  latencyButton.getMovieClip().setText("TID_ENTER_BIRTHDAY_BUTTON", SC.StringTable.getString("TID_SETTINGS_LOGOUT_BUTTON"));
  latencyButton.m_visible = false;
  scaleMultilineTextForLongestWordForButton(latencyButton, "TID_ENTER_BIRTHDAY_BUTTON");
  addButtonListener(latencyButton, "latencyButton", buttonClicked);
  screenInstance2.setChildVisible("button_jp", false);
  controlsButton = screenInstance2.addGameButton("button_edit_controls", false);
  addButtonListener(controlsButton, "controlsButton", buttonClicked);
  scaleMultilineTextForLongestWordForButton(controlsButton, "TID_EDIT_CONTROLS");
  adsButton = screenInstance2.addGameButton("button_ads", false);
  addButtonListener(adsButton, "adsButton", buttonClicked);
  scaleMultilineTextForLongestWordForButton(adsButton, "TID_SETTINGS_BUTTON_MANAGE_CONSENT_CHOICES");
  adsButton.getMovieClip().setText("TID_SETTINGS_BUTTON_MANAGE_CONSENT_CHOICES", SC.StringTable.getString("TID_K2_APP_AGREEMENT"));
  scaleMultilineTextForLongestWordForButton(adsButton, "TID_SETTINGS_BUTTON_MANAGE_CONSENT_CHOICES");
  updateTencentVisibility();
  SC.MovieClipHelper.autoAdjustChildTexts(screenInstance2, true, false, true);
  return CPPManagedObjects;
}
function inviteBlockStateChanged() {
  doNotDisturbButton.setSelected(isInviteBlockOn());
  m_inviteBlockChangePending = false;
}
function teamChatMuteStateChanged() {
  muteChatButton.setSelected(isTeamChatMuteOn());
}
function buttonClicked(pButton, name) {
  if (!screenInstance) return;
  if (name) {
    name = name[0].toLowerCase() + name.slice(1);
  }
  if (pButton != dualChannelHelpButton) {
    SC.GUI.getInstance().fadeOutPopover();
  }
  if (pButton == faqButton || name == "faqButton") {
    openFaq();
  } else if (pButton == deviceLinkButton || name == "deviceLinkButton") {
    if (SC.HomeMode.getInstance().getHomeScreen().checkAndPromptForDemoAccount()) {
      return;
    }
    SC.SettingsScreenK2.showDeviceLinkWindow();
  } else if (pButton == creditsButton || name == "creditsButton") {
    SC.SettingsScreenK2.showAboutScreen();
  } else if (pButton == chinaButton || name == "chinaButton") {
    if (isTencentSelfServiceAvailable()) {
      openTencentSelfService();
    }
  } else if (pButton == pPButton || name == "pPButton") {
    showWebPage(SC.StringTable.getLocale().getPrivacyPolicyUrl());
  } else if (pButton == tOSButton || name == "tOSButton") {
    showWebPage(SC.StringTable.getLocale().getTermsAndServiceUrl());
  } else if (pButton == parentsButton || name == "parentsButton") {
    showWebPage(SC.StringTable.getLocale().getParentsGuideUrl());
  } else if (pButton == thirdPartySharingButton || name == "thirdPartySharingButton") {
    showWebPage(SC.StringTable.getLocale().getThirdPartySharingUrl());
  } else if (pButton == apiTokenButton || name == "apiTokenButton") {
    if (!m_apiToken) {
      SC.SettingsScreenK2.sendApiTokenMessage();
    } else {
      SC.Application.copyString(m_apiToken);
      SC.GUI.getInstance().showCenteredFloaterText(
        SC.StringTable.getString("TID_API_TOKEN_COPIED"),
        0,
        4294967295
      );
    }
  } else if (pButton == dropRatesButton || name == "DropRatesButton") {
    showWebPage(SC.StringTable.getLocale().getDropRatesUrl());
  } else if (pButton == languageButton || name == "languageButton") {
    const pClientGlobals = SC.LogicDataTables.getClientGlobals();
    SC.TencentManager.getInstance().openCdKeyExchange(pClientGlobals.getTencentCdKeyExchangeURL());
  } else if (pButton == blockFriendRequestButton || name == "blockFriendRequest") {
    SC.FriendsManager.getInstance().toggleBlockFriendRequests();
  } else if (pButton == doNotDisturbButton || name == "doNotDisturb") {
    if (!m_inviteBlockChangePending) {
      SC.MessageManager.getInstance().sendMessage(SC.SetInvitesBlockedMessage[Symbol.alloc](!isInviteBlockOn()));
      m_inviteBlockChangePending = true;
    }
  } else if (pButton == muteChatButton || name == "muteChat") {
    SC.MessageManager.getInstance().sendMessage(SC.SetTeamChatMutedMessage[Symbol.alloc](!isTeamChatMuteOn()));
  } else if (pButton == controlsButton || name == "controlsButton") {
    SC.SettingsScreenK2.controlButtonClicked();
  } else if (pButton == privacySettingsButton || name == "privacySettingsButton") {
    if (hasPrivacySettings()) {
      SC.SettingsScreenK2.showSettingsPrivacyScreen();
    } else if (SC.SettingsPrivacyScreen.hasGlobalVersionDeleteAccount()) {
      SC.SettingsPrivacyScreen.openDeleteAccount();
    }
  } else if (pButton == latencyButton || name == "latencyButton") {
    SC.SettingsScreenK2.showLatencyTestsPopup();
  } else if (pButton == adsButton || name == "adsButton") {
    showWebPage(SC.StringTable.getString("TID_K2_APP_AGREEMENT_URL"));
  } else if ((pButton == qqButton || name == "qqButton") && SC.TencentManager.getInstance() && SC.TencentManager.getInstance().isFeatureEnabled()) {
    if (SC.TencentManager.getInstance().isLoggedInQQorWeChat()) {
      if (SC.TencentManager.getInstance().getLoggedInPlatform() == 2) {
        SC.SettingsScreenK2.showLogoutPopup();
      }
    } else {
      SC.TencentManager.getInstance().loginQQ(false);
      m_checkWhenConnectedToTencent = true;
    }
  } else if ((pButton == wechatButton || name == "wechatButton") && SC.TencentManager.getInstance() && SC.TencentManager.getInstance().isFeatureEnabled()) {
    if (SC.TencentManager.getInstance().isLoggedInQQorWeChat()) {
      if (SC.TencentManager.getInstance().getLoggedInPlatform() == 1) {
        SC.SettingsScreenK2.showLogoutPopup();
      }
    } else if (!SC.TencentManager.getInstance().isPlatformInstalled(1)) {
      SC.GUI.getInstance().showCenteredFloaterText(SC.StringTable.getString("TID_SETTINGS_WECHAT_NOT_INSTALLED"));
    } else {
      SC.TencentManager.getInstance().loginWeChat(false);
      m_checkWhenConnectedToTencent = true;
    }
  } else if (pButton == dualChannelHelpButton || name == "dualChannelHelpButton") {
    SC.SettingsScreenK2.showDualChannelHelp(dualChannelHelpButton);
  }
}
function setApiTokenVisible(visible) {
  playerIdTextField.m_visible = visible;
  apiTokenTextField.setText(visible ? SC.StringTable.getString("TID_API_TOKEN_COPY").replace("<TOKEN>", m_apiToken) : SC.StringTable.getString("TID_API_TOKEN_SHOW"));
  SC.MovieClipHelper.autoAdjustText(apiTokenTextField, false, true, true);
}
function updateTencentVisibility() {
  const showTencent = !!(isTencentEnabled() && SC.LogicVersion.isChinaVersion());
  if (wechatButton) {
    wechatButton.m_visible = showTencent && hasWechatButton();
  }
  if (qqButton) {
    qqButton.m_visible = showTencent;
  }
  if (!showTencent) {
    return;
  }
  let qqLogged = false;
  let wechatLogged = false;
  if (SC.TencentManager.getInstance().isLoggedInQQorWeChat()) {
    const loggedInPlatform = SC.TencentManager.getInstance().getLoggedInPlatform();
    qqLogged = loggedInPlatform == 2;
    wechatLogged = loggedInPlatform == 1;
  }
  qqButton.setText(SC.StringTable.getString(qqLogged ? "TID_SETTINGS_QQ_LOGGED_IN" : "TID_SETTINGS_BUTTON_QQ_LOGIN"), true);
  qqButton.getMovieClip().gotoAndStop(qqLogged ? "inactive" : "active");
  const isQQButtonEnabled = !wechatLogged;
  qqButton.setEnabled(isQQButtonEnabled);
  wechatButton.setText(SC.StringTable.getString(wechatLogged ? "TID_SETTINGS_WECHAT_LOGGED_IN" : "TID_SETTINGS_BUTTON_WECHAT_LOGIN"), true);
  wechatButton.getMovieClip().gotoAndStop(wechatLogged ? "inactive" : "active");
  const isWechatButtonEnabled = !qqLogged;
  wechatButton.setEnabled(isWechatButtonEnabled);
}
function scaleMultilineTextForLongestWordForButton(button, textFieldName) {
  SC.MovieClipHelper.scaleMultilineTextForLongestWord(
    button.getMovieClip().getTextFieldByName(textFieldName),
    true,
    false
  );
}
export {
  buttonClicked,
  settingScreen as default,
  inviteBlockStateChanged,
  setApiToken,
  teamChatMuteStateChanged,
  update
};
//# sourceMappingURL=SettingsScreen.mjs.map
