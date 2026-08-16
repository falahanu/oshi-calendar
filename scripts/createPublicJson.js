import "dotenv/config";
import axios from "axios";

import { groupEvents } from "../shared/groupEvents.ts";

// ========================================
// 設定
// ========================================

const owner = "falahanu";
const repo = "oshi-calendar";
const filePath = "apps/calendar/public/events_public.json";

// ========================================
// 実行情報
// ========================================

console.log("実行フォルダ:", process.cwd());
console.log("このファイル:", import.meta.url);
console.log("GitHub保存先:", filePath);

// ========================================
// Spreadsheet(GAS)から全件取得
// ========================================

const response = await axios.get(
  "https://script.google.com/macros/s/AKfycbw8N96LIXRrtqoWi0FgDYD4HDAjZluEviiq3dMx5m9npOJ3CnvhxgwUPswddlCt_Kq5Sw/exec"
);

const events = response.data;

console.log(
  JSON.stringify(events.slice(0, 3), null, 2)
);

// ========================================
// 公開対象期間を設定
// ========================================

const today = new Date();

const from = new Date(today);
from.setDate(from.getDate() - 365);

const to = new Date(today);
to.setDate(to.getDate() + 365);

// ========================================
// 前後365日のイベントだけ抽出
// ========================================

const filteredEvents = events.filter((event) => {
  const eventDate = new Date(event.date);

  return eventDate >= from && eventDate <= to;
});

// ========================================
// 管理者カレンダーと同じ統合処理を使用
// ========================================

const publicEvents = groupEvents(filteredEvents);

console.log(
  "公開用統合後:",
  publicEvents.length + "件"
);

// ========================================
// 公開用JSONを作成
// ========================================

const output = {
  lastUpdate: new Date().toISOString(),
  from: from.toISOString().substring(0, 10),
  to: to.toISOString().substring(0, 10),
  events: publicEvents
};

console.log("公開JSON作成完了");
console.log("イベント件数:", publicEvents.length + "件");

// ========================================
// GitHub設定
// ========================================

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

if (!GITHUB_TOKEN) {
  throw new Error(
    "GITHUB_TOKENが設定されていません。.envを確認してください。"
  );
}

// ========================================
// 公開用JSONを直接Base64化
// ※ローカルファイルには保存しない
// ========================================

const fileContent = Buffer.from(
  JSON.stringify(output, null, 2),
  "utf8"
);

const contentBase64 = fileContent.toString("base64");

// ========================================
// 現在のGitHub上のファイル情報を取得
// ========================================

const fileResponse = await axios.get(
  `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`,
  {
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
    },
  }
);

const sha = fileResponse.data.sha;

// ========================================
// GitHub上のファイルを更新
// ========================================

await axios.put(
  `https://api.github.com/repos/${owner}/${repo}/contents/${filePath}`,
  {
    message: "Update events_public.json",
    content: contentBase64,
    sha: sha,
  },
  {
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      Accept: "application/vnd.github+json",
    },
  }
);

console.log(
  "GitHubのevents_public.jsonを更新しました"
);

console.log(
  `GitHub保存先: ${filePath}`
);