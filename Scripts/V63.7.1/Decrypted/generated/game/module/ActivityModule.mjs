import { ModuleBase } from "../base/ModuleBase.mjs";
class ActivityModule extends ModuleBase {
  constructor() {
    super();
    this.isK2CollabEvent = false;
    this.collabEventId = -1;
    try {
      console.log("ActivityModule constructor");
    } catch (e) {
      handleException(e);
    }
  }
  onDestruct() {
  }
  setActivityEventId(eventId) {
    this.collabEventId = eventId;
    let k2CollabEvent = SC.CollabUtil.getK2DownloadedCollabEventDataActive();
    this.isK2CollabEvent = k2CollabEvent && k2CollabEvent.getEventId() == eventId;
    console.log(`setActivityEventId TS: eventId = ${eventId}, isK2CollabEvent = ${this.isK2CollabEvent}`);
  }
}
export {
  ActivityModule
};
//# sourceMappingURL=ActivityModule.mjs.map
