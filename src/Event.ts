"use strict";

import { WebhookEvent, PostbackEvent, MessageEvent } from "@line/bot-sdk";
import {
  replyText,
  sendMessage,
  PostbackAction,
  getSourceId,
} from "./LineHelpers";
import sendConfirm from "./Confirm";
import TimeTrigger from "./TimeTrigger";
export { handlePostback };

/**
 * When a program sends the app an HTTP POST request,
 * Apps Script runs the function doPost(e).
 */
async function doPost(e: GoogleAppsScript.Events.DoPost) {
  const postBody = JSON.parse(e.postData.contents);

  postBody.events.forEach((event: WebhookEvent) => {
    switch (event.type) {
      case "follow":
      case "join":
        replyText(event, "若欲開啟操作菜單\n請傳送英文字母「bot」");
        return;
      case "message":
        handleMessage(event);
        return;
      case "postback":
        handlePostback(event);
        return;
    }
  });
}

function handleMessage(e: MessageEvent) {
  // replyText(e, e.source.groupId);
  if (!("text" in e.message)) return;
  if (e.message.text != "bot") return;

  sendMessage("reply", e.replyToken, [
    {
      type: "template",
      altText: "菜單",
      template: {
        type: "buttons",
        text: "菜單",
        actions: [
          new PostbackAction("☑️ 要求一次確認", "sendConfirm"),
          {
            type: "datetimepicker",
            label: "🕓 設定每天大約幾點幾分確認",
            data: "setTimeTrigger",
            mode: "time",
          },
          new PostbackAction("🚩 中止週期", "removeTimeTrigger"),
          {
            type: "uri",
            label: "早退彙整表",
            uri: SpreadsheetApp.getActive().getUrl(),
          },
        ],
      },
    },
  ]);
}

function handlePostback(e: PostbackEvent) {
  const data = e.postback.data;
  const sourceId = getSourceId(e);
  // replyText(e, JSON.stringify(e));

  switch (data) {
    case "sendConfirm":
      sendConfirm(getSourceId(e));
      return;

    case "setTimeTrigger":
      if (!e.postback.params) return;
      if (!("time" in e.postback.params)) return;
      const time = e.postback.params.time;

      if (!time) {
        replyText(e, `設定未完成`);
        return;
      }

      TimeTrigger.remove(sourceId);
      new TimeTrigger(
        sourceId,
        time.split(":").map((str) => +str)
      );

      replyText(e, `設定完成：每天大約 ${time} 確認`);
      return;

    case "removeTimeTrigger":
      TimeTrigger.remove(sourceId);
      replyText(e, `已中止`);
      return;

    /**
     * 處理用戶對確認框的選擇
     */
    default:
      const sheet = SpreadsheetApp.getActive().getSheets()[0];
      const values = JSON.parse(data);

      sheet
        .getRange(sheet.getLastRow() + 1, 2, 1, values.length)
        .setValues([values]);

      replyText(e, "收到～～");
  }
}
