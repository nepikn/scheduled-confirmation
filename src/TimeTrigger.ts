"use strict";

import sendConfirm from "./Confirm";
import { setScriptArray, parseProp } from "./GasHelpers";

class TimeTrigger {
  triggerId;
  sourceId;
  time;

  /**
   * 新增 trigger 至 Trigger 分頁、
   * 也在 Script Properties 新增相關資料
   */
  constructor(sourceId: string, time = [15, 0]) {
    this.triggerId = ScriptApp.newTrigger(handleTimeTrigger.name)
      .timeBased()
      .atHour(time[0])
      .nearMinute(time[1])
      .everyDays(1)
      .create()
      .getUniqueId();
    this.sourceId = sourceId;
    this.time = time.join(":");

    setScriptArray("triggers", this, false);
  }

  static get all(): TimeTrigger[] {
    return parseProp("triggers");
  }

  static find(triggerId: string) {
    return this.all.find((timeTrigger) => (timeTrigger.triggerId = triggerId));
  }

  /**
   * 從 Trigger 分頁移除指定 trigger、
   * 也從 Script Properties 移除相關資料
   */
  static remove(sourceId: string) {
    const otherTriggers: TimeTrigger[] = [];

    this.all.forEach((timeTrigger) => {
      if (timeTrigger.sourceId != sourceId) {
        otherTriggers.push(timeTrigger);
        return;
      }

      const targProjectTrigger = ScriptApp.getProjectTriggers().find(
        (trigger) => trigger.getUniqueId() == timeTrigger.triggerId
      );

      if (!targProjectTrigger) return;

      ScriptApp.deleteTrigger(targProjectTrigger);
    });

    PropertiesService.getScriptProperties().setProperty(
      "triggers",
      JSON.stringify(otherTriggers)
    );
  }
}

function handleTimeTrigger(e: GoogleAppsScript.Events.FormsOnFormSubmit) {
  let sourceId = TimeTrigger.find(e.triggerUid)?.sourceId;

  if (!sourceId) throw new Error(`No sourceId for trigger ${e.triggerUid}`);

  sendConfirm(sourceId);
}

export default TimeTrigger;
