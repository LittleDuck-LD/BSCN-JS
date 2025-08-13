puerTypePatch("GameMain", (type) => {
  type.NativeDialogType = {};
  type.NativeDialogType["NATIVE_DIALOG_NONE"] = 0;
  type.NativeDialogType["NATIVE_DIALOG_OUT_OF_SYNC"] = 1;
  type.NativeDialogType["NATIVE_DIALOG_CONNECTION_DISCONNECTED"] = 2;
  type.NativeDialogType["NATIVE_DIALOG_CONNECTION_FAILED"] = 3;
  type.NativeDialogType["NATIVE_DIALOG_CONNECTION_LOST"] = 4;
  type.NativeDialogType["NATIVE_DIALOG_WRONG_CLIENT_VERSION"] = 5;
  type.NativeDialogType["NATIVE_DIALOG_SERVER_MAINTENANCE"] = 6;
  type.NativeDialogType["NATIVE_DIALOG_LOGIN_FAILED"] = 7;
  type.NativeDialogType["NATIVE_DIALOG_LOGIN_TIMEOUT"] = 8;
  type.NativeDialogType["NATIVE_DIALOG_BANNED"] = 9;
  type.NativeDialogType["NATIVE_DIALOG_FIRST_RUN_IAP_NOTE"] = 10;
  type.NativeDialogType["NATIVE_DIALOG_SERVER_ERROR"] = 11;
  type.NativeDialogType["NATIVE_DIALOG_PURCHASE_FAILED"] = 12;
  type.NativeDialogType["NATIVE_DIALOG_PERSONAL_BREAK"] = 13;
  type.NativeDialogType["NATIVE_DIALOG_LOGGED_FROM_ANOTHER_DEVICE"] = 14;
  type.NativeDialogType["NATIVE_DIALOG_UNLOCK_UNAVAILABLE"] = 15;
  type.NativeDialogType["NATIVE_DIALOG_BANNED_CONTACT_PS"] = 16;
  type.NativeDialogType["NATIVE_DIALOG_NOT_YET_IN_STORE"] = 17;
  type.NativeDialogType["NATIVE_DIALOG_LOGIN_FAILED_15"] = 18;
  type.NativeDialogType["NATIVE_DIALOG_CRYPTO_ERROR"] = 19;
  type.NativeDialogType["NATIVE_DIALOG_TENCENT_ACCOUNT_CONFLICT"] = 20;
  type.NativeDialogType["NATIVE_DIALOG_LOGIN_DISABLED_FOR_PLATFORM"] = 21;
  type.NativeDialogType["NATIVE_DIALOG_AFK_DISCONNECT"] = 22;
  type.NativeDialogType["NATIVE_DIALOG_AFK_BANNED"] = 23;
  type.NativeDialogType["NATIVE_DIALOG_ACCOUNT_DELETED_AT_REQUEST"] = 24;
  type.NativeDialogType["NATIVE_DIALOG_ACCOUNT_DELETED_INACTIVITY"] = 25;
  type.NativeDialogType["NATIVE_DIALOG_ACCOUNT_DELETION_WARNING"] = 26;
  type.NativeDialogType["NATIVE_DIALOG_ACCOUNT_DELETION_WARNING_BLOCKING"] = 27;
  type.NativeDialogType["NATIVE_DIALOG_ACCOUNT_CREATION_DISABLED_FOR_PLATFORM"] = 28;
  type.NativeDialogType["NATIVE_DIALOG_TENCENT_ANTIADDICTION_TIPS"] = 29;
  type.NativeDialogType["NATIVE_DIALOG_TENCENT_ANTIADDICTION_LOGOUT"] = 30;
  type.NativeDialogType["NATIVE_DIALOG_TENCENT_ANTIADDICTION_STOP"] = 31;
  type.NativeDialogType["NATIVE_DIALOG_GUEST_LOGIN_PAYMENT_BLOCKED"] = 32;
  type.NativeDialogType["NATIVE_DIALOG_INCOMPLETE_PLAY_INSTALL"] = 33;
  type.NativeDialogType["NATIVE_DIALOG_CHINA_ENTER_HELPSHIFT_CONVERSATION"] = 34;
  type.NativeDialogType["NATIVE_DIALOG_LOGIN_BLOCKED"] = 35;
});
puerTypePatch("GameSelfhelpListener", (type) => {
  type.SelfhelpEnvironment = {};
  type.SelfhelpEnvironment["DEV"] = 0;
  type.SelfhelpEnvironment["STAGE"] = 1;
  type.SelfhelpEnvironment["PRODUCTION"] = 2;
});
puerTypePatch("", (type) => {
  type.FastFindResType = {};
  type.FastFindResType["CloseFind"] = 0;
  type.FastFindResType["Program"] = 1;
  type.FastFindResType["Art"] = 2;
});
puerTypePatch("Stage", (type) => {
  type.TouchMaskState = {};
  type.TouchMaskState["Create"] = 0;
  type.TouchMaskState["Mask"] = 1;
  type.TouchMaskState["None"] = 2;
});
puerTypePatch("MovieClip", (type) => {
  type.FramSkippingType = {};
  type.FramSkippingType["FRAME_SKIPPING_OFF"] = 0;
  type.FramSkippingType["FRAME_SKIPPING_ON"] = 1;
  type.FramSkippingType["FRAME_SKIPPING_INTERPOLATE"] = 2;
});
puerTypePatch("", (type) => {
  type.sc3dStreamingHint = {};
});
puerTypePatch("TencentLogin", (type) => {
  type.MSDK_SCREENDIR = {};
  type.MSDK_SCREENDIR["MSDK_SCREENDIR_SENSOR"] = 0;
  type.MSDK_SCREENDIR["MSDK_SCREENDIR_PORTRAIT"] = 1;
  type.MSDK_SCREENDIR["MSDK_SCREENDIR_LANDSCAPE"] = 2;
});
puerTypePatch("scPath", (type) => {
  type.AssumeNormalize = {};
  type.AssumeNormalize["ASSUME_NORMALIZED"] = 0;
});
//# sourceMappingURL=patch.mjs.map
