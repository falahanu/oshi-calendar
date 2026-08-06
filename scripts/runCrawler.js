import { execSync } from "child_process";
import axios from "axios";
import { getOfficialEvents } from "./crawler/official.js";
import { getFanyEvents } from "./crawler/fany.js";
import { getLivePocketEvents } from "./crawler/livePocket.js";

const officialEvents = await getOfficialEvents();
const fanyEvents = await getFanyEvents();
const livePocketEvents = await getLivePocketEvents();
const allEvents = [
  ...officialEvents,
  ...fanyEvents,
  ...livePocketEvents,
];

const uniqueEvents = allEvents;

console.table(uniqueEvents);

console.log("POST開始");
const response = await axios.post(

  "https://script.google.com/macros/s/AKfycbw8N96LIXRrtqoWi0FgDYD4HDAjZluEviiq3dMx5m9npOJ3CnvhxgwUPswddlCt_Kq5Sw/exec",

  uniqueEvents,

  {
    headers: {
      "Content-Type": "application/json",
    },
  }

);
console.log("POST終了");
console.log(response.data);
console.log("公開JSON作成開始");

execSync("node scripts/createPublicJson.js", {
  stdio: "inherit"
});

console.log("公開JSON作成完了");
await import("./createPublicJson.js");