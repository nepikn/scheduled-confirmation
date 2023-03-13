"use strict";

import {
  WebhookEvent,
  ReplyableEvent,
  Message,
  PostbackAction as TypesPostbackAction,
} from "@line/bot-sdk";
import { CHANNEL_ACCESS_TOKEN } from "./About";
export { getSourceId, replyText, sendMessage };

export class PostbackAction implements TypesPostbackAction {
  type = "postback" as "postback";
  label;
  displayText;
  data;

  constructor(label: string, data: any) {
    this.label = this.displayText = label;
    this.data = typeof data == "string" ? data : JSON.stringify(data);
  }
}

function getSourceId(e: WebhookEvent) {
  const source = e.source;

  if (!(source.type + "Id" in source)) throw new Error("getSourceId fail");

  switch (source.type) {
    case "user":
      return source.userId;
    case "group":
      return source.groupId;
    case "room":
      return source.roomId;
  }
}

function replyText(e: ReplyableEvent, message: string) {
  sendMessage("reply", e.replyToken, [
    {
      type: "text",
      text: message,
    },
  ]);
}

function sendMessage(
  type: "reply" | "push",
  target: string,
  messages: Message[]
) {
  const payload: GoogleAppsScript.URL_Fetch.Payload = {
    messages,
  };

  switch (type) {
    case "reply":
      payload.replyToken = target;
      break;
    case "push":
      payload.to = target;
      break;
  }

  const response = UrlFetchApp.fetch(
    `https://api.line.me/v2/bot/message/${type}`,
    {
      method: "post",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + CHANNEL_ACCESS_TOKEN,
      },
      payload: JSON.stringify(payload),
    }
  );

  console.log(`${response.getResponseCode()}: ${response.getContentText()}`);
}
