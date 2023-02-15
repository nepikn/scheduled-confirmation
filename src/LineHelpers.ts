"use strict";

import { CHANNEL_ACCESS_TOKEN } from "./About";
export { getSourceId, replyText, sendMessage };

export class PostbackAction {
  type = "postback";
  label;
  displayText;
  data;

  constructor(label: string, data: any) {
    this.label = this.displayText = label;
    this.data = typeof data == "string" ? data : JSON.stringify(data);
  }
}

export namespace LineEvent {
  export type All = Message | Postback | Follow | Join;

  export interface Message extends Base {
    type: "message";
    message: { type: "text"; text: string };
  }

  export interface Postback extends Base {
    type: "postback";
    postback: { data: string; params?: { time?: string } };
  }

  export interface Follow extends Base {
    type: "follow";
  }

  export interface Join extends Base {
    type: "join";
  }

  interface Base {
    webhookEventId: string;
    deliveryContext: { isRedelivery: boolean };
    timestamp: number;
    source: Source<"user" | "group" | "room">;
    replyToken: string;
    mode: "active" | "standby";
  }

  type Source<Type> = { type: Type } & {
    [Property in Type as `${string & Property}Id`]?: string;
  } & { [index: string]: string };
}

function getSourceId(e: LineEvent.All) {
  const source = e.source;
  const idKey = source.type + "Id";

  if (!(idKey in source)) throw new Error("getSourceId fail");

  return source[idKey];
}

function replyText(e: LineEvent.All, message: string) {
  sendMessage("reply", e.replyToken, [
    {
      type: "text",
      text: message,
    },
  ]);
}

function sendMessage(type: "reply" | "push", target: string, messages: {}[]) {
  const payload: Payload = {
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

  interface Payload {
    messages: {}[];
    replyToken?: string;
    to?: string;
  }
}
