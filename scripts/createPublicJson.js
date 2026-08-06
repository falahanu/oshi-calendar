console.log("実行フォルダ:", process.cwd());
console.log("このファイル:", import.meta.url);
console.log("保存先:", "./public/events_public.json");
import path from "path";

console.log(
  path.resolve("./public/events_public.json")
);

import axios from "axios";
import fs from "fs";

// Spreadsheet(GAS)から全件取得
const response = await axios.get(
  "https://script.google.com/macros/s/AKfycbw8N96LIXRrtqoWi0FgDYD4HDAjZluEviiq3dMx5m9npOJ3CnvhxgwUPswddlCt_Kq5Sw/exec"
);

const events = response.data;

const today = new Date();

const from = new Date(today);
from.setDate(from.getDate() - 365);

const to = new Date(today);
to.setDate(to.getDate() + 365);

// 前後365日だけ抽出
const publicEvents = events.filter(event => {

  const eventDate = new Date(event.date);

  return eventDate >= from && eventDate <= to;

});

// 公開用JSON
const output = {

  lastUpdate: new Date().toISOString(),

  from: from.toISOString().substring(0, 10),

  to: to.toISOString().substring(0, 10),

  events: publicEvents

};


fs.writeFileSync(

  "../oshi-calendar/public/events_public.json",

  JSON.stringify(output, null, 2),

  "utf8"

);

console.log("公開JSON作成完了");
console.log(publicEvents.length + "件");