"use strict";

import { LineEvent } from "./LineHelpers";
import { sendMessage, getSourceId, PostbackAction } from "./LineHelpers";
import TimeTrigger from "./TimeTrigger";
export default sendConfirm;

/**
 * 向聊天室傳送確認框
 */
function sendConfirm(e: LineEvent.All | { triggerUid: string }) {
  const now = new Date();
  const today = [
    now.getFullYear(),
    now.getMonth() + 1, // js month starts from 0
    now.getDate(),
  ].join("-");

  let sourceId;
  if ("source" in e) {
    sourceId = getSourceId(e);
  } else {
    if ((sourceId = TimeTrigger.find(e.triggerUid)?.sourceId)) return;
    throw new Error(`No sourceId for trigger ${e.triggerUid}`);
  }

  sendMessage("push", sourceId, [
    {
      type: "template",
      altText: "今天有人早退嗎",
      // When a user receives a message, it will appear as
      // an alternative to the image in the notification or
      // chat list of their device.

      template: {
        type: "confirm",
        text: "今天有人早退嗎",
        actions: [
          new PostbackAction("有", [today, "yes"]),
          new PostbackAction("沒", [today, "no"]),
        ],
      },
    },
  ]);
}
