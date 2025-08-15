import GUIContainerBase from "../../base/GUIContainerBase.mjs";
import { ManagedType } from "../../base/ObjectBase.mjs";
class ActivityCalendarContainer extends GUIContainerBase {
  constructor(container) {
    super(container, SC.GameGUIContainer);
    this.currentChapterNumber = -1;
    this.scrollArea = null;
    this.contentMovieClip = null;
    console.log("ActivityCalendarContainer TS: constructor");
  }
  constructContent() {
    try {
      console.log("ActivityCalendarContainer TS: constructScrollArea");
      let stage = SC.Stage.getInstance();
      this.scrollArea = new SC.ScrollArea(stage.getStageWidth(), stage.getStageHeight(), 1);
      this.cobj.getMovieClip().addChild(this.scrollArea);
      this.manage(this.scrollArea, ManagedType.UpdateAndAutoDestroy);
      this.scrollArea.enableHorizontalDrag(true);
      this.scrollArea.enableVerticalDrag(false);
      this.scrollArea.setAlignment(SC.DragHandler.ALIGN_TOP | SC.DragHandler.ALIGN_LEFT);
      this.scrollArea.setPixelSnappedXY(0, 0);
      this.scrollArea.enablePinching(false);
      let collabScFileName = SC.CollabUtil.getDownloadedScFilenameAny();
      this.contentMovieClip = SC.StringTable.getMovieClip(collabScFileName, "activity_prize_calendar");
      this.contentMovieClip.m_interactive = false;
      console.log(`this.contentMovieClip.x = ${this.contentMovieClip.getX()}`);
      this.scrollArea.addContentDontUpdateBounds(this.contentMovieClip);
      this.contentMovieClip.setPixelSnappedXY(0, stage.getStageHeight() / 2);
      this.manage(this.contentMovieClip, ManagedType.AutoDestroy);
      this.scrollArea.updateBounds();
      let bound = this.scrollArea.getContentBounds();
      console.log(`bound.left = ${bound.m_left}, bound.right = ${bound.m_right}`);
      let contentBounds = allocWithoutGC(SC.Rect, bound.m_left, bound.m_top, bound.m_right + bound.m_left, bound.m_bottom);
      this.scrollArea.setForcedContentBounds(contentBounds);
      console.log(`contentBounds.left = ${contentBounds.m_left}, contentBounds.right = ${contentBounds.m_right}`);
      this.scrollArea.getDragHandler().setLimitToBorders(true);
    } catch (e) {
      handleException(e, "ActivityCalendarContainer TS: constructor");
    }
  }
  getCurrentChapterNumber() {
    const confData = SC.HomeMode.getConfData();
    const collabData = SC.CollabUtil.getCollabData();
    let currentChapterNumber = 1;
    let entries = confData.getNewsInboxLinkEntries();
    let chapterCount = collabData.getChapterNewsInboxLinkIdsCount();
    console.log(`entries size = ${entries.size()}, chapterCount = ${chapterCount}`);
    if (confData && entries && entries.size() > 0 && collabData) {
      for (let i = 0; i < entries.size(); i++) {
        let entrie = entries.get(i);
        let id = entrie.getId();
        console.log(`entrie.getId() = ${entrie.getId()}`);
        let index = 0;
        for (let j = 0; j < chapterCount; j++) {
          let chapterId = collabData.getChapterNewsInboxLinkIdsAt(j);
          console.log(`chapterId = ${chapterId}, index = ${index}, j = ${j}`);
          if (chapterId == id) {
            index = j;
            break;
          }
        }
        if (currentChapterNumber < index + 1) {
          currentChapterNumber = index + 1;
        }
      }
    }
    return currentChapterNumber;
  }
  initUI() {
    let eventCalendar = this.contentMovieClip;
    this.currentChapterNumber = this.getCurrentChapterNumber();
    console.log(`currentChapterNumber = ${this.currentChapterNumber}`);
    for (let calendarChapterNumber = 1; calendarChapterNumber <= 4; ++calendarChapterNumber) {
      let button = SC.MovieClipHelper.getMovieClipOrWarning(eventCalendar, "button_" + calendarChapterNumber);
      let calendarItem = SC.MovieClipHelper.getMovieClipOrWarning(eventCalendar, "calendar_item" + calendarChapterNumber);
      if (!button || !calendarItem)
        break;
      if (calendarChapterNumber < this.currentChapterNumber) {
        button.gotoAndStop("over");
        calendarItem.gotoAndStop("over");
      } else if (calendarChapterNumber == this.currentChapterNumber) {
        button.gotoAndStop("active");
        calendarItem.gotoAndStop("active");
      } else {
        button.gotoAndStop("coming");
        calendarItem.gotoAndStop("coming");
      }
    }
  }
  onUpdate(dt) {
    if (this.currentChapterNumber < 0 && this.cobj.m_visible) {
      this.constructContent();
      this.initUI();
    }
  }
  onDestruct() {
    console.log("ActivityCalendarContainer TS: onDestruct");
  }
}
export {
  ActivityCalendarContainer as default
};
//# sourceMappingURL=ActivityCalendarContainer.mjs.map
