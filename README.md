# LINE bot：定時確認

[範例 LINE bot](https://liff.line.me/1645278921-kWRPP32q/?accountId=962aipna)

## 用途

透過 Bot 選單來設定「每天大約幾點幾分確認」，完成後 Bot 將每天在設定時間傳送確認窗。用戶回覆「是／否」後，Bot 將在 Google Sheet 記錄回覆，方便日後查看。適用情境：記錄「本月哪幾天有人因故早退」等等。

## 主要技術

- TypeScript
- LINE Messaging API
- Google App Script service

## 待完成

- 用戶自訂確認窗提問
- 用戶自訂用於記錄的 Google Sheet
