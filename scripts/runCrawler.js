import { execSync } from "child_process";
import axios from "axios";

import { getOfficialEvents } from "./crawler/official.js";
import { getOfficialNewsEvents } from "./crawler/officialNews.js";
import { getFanyEvents } from "./crawler/fany.js";
import { getLivePocketEvents } from "./crawler/livePocket.js";
import { getTixplusEvents } from "./crawler/tixplus.js";
import { getEplusEvents } from "./crawler/eplus.js";


// ========================================
// ① 情報収集
// ========================================

console.log("===== 情報収集開始 =====");

const officialEvents = await getOfficialEvents();

const officialNewsEvents = await getOfficialNewsEvents();

const fanyEvents = await getFanyEvents();

const livePocketEvents = await getLivePocketEvents();

const tixplusEvents = await getTixplusEvents(
    "https://tixplus.jp/feature/yarlens/tour2026/general-q7w2x/"
);
const eplusEvents = await getEplusEvents(
    "https://eplus.jp/sf/word/0000075407"
);

// ========================================
// ② 全情報をまとめる
// ========================================

const allEvents = [

    ...officialEvents,

    ...officialNewsEvents,

    ...fanyEvents,

    ...livePocketEvents,

    ...tixplusEvents,
    
    ...eplusEvents
];


// ========================================
// ③ 重複除去はしない
// ========================================
//
// 同じイベントが複数の情報源に存在する場合も、
// 情報源ごとのデータとしてそのまま残す。
// チケットサイトの1部・2部などもそのまま残す。
// ========================================

const uniqueEvents = allEvents;


// ========================================
// ④ 収集結果を確認
// ========================================

console.log(
    `情報収集完了：${uniqueEvents.length}件`
);

console.table(uniqueEvents);


// ========================================
// ⑤ Googleスプレッドシートへ送信
// ========================================

console.log("===== Googleスプレッドシートへ送信開始 =====");

const response = await axios.post(

    "https://script.google.com/macros/s/AKfycbw8N96LIXRrtqoWi0FgDYD4HDAjZluEviiq3dMx5m9npOJ3CnvhxgwUPswddlCt_Kq5Sw/exec",

    uniqueEvents,

    {
        headers: {
            "Content-Type": "application/json",
        },
    }

);

console.log("Googleスプレッドシートへの送信完了");

console.log(response.data);


// ========================================
// ⑥ 公開用JSONを作成
// ========================================

console.log("===== 公開JSON作成開始 =====");

execSync("node scripts/createPublicJson.js", {
    stdio: "inherit"
});

console.log("===== 公開JSON作成完了 =====");