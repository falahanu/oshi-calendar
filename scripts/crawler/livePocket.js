import { chromium } from "playwright";

export async function getLivePocketEvents() {

    const browser = await chromium.launch({
        headless: false,
    });

    const page = await browser.newPage();

    await page.goto(
        "https://livepocket.jp/event/search?word=%E3%83%A4%E3%83%BC%E3%83%AC%E3%83%B3%E3%82%BA&commit=%E6%A4%9C%E7%B4%A2%E3%81%99%E3%82%8B"
    );

    await page.waitForTimeout(5000);

    const text = await page.locator("body").innerText();

    const lines = text
        .split("\n")
        .map(x => x.trim())
        .filter(x => x);

    const events = [];

    for (let i = 0; i < lines.length; i++) {

        if (lines[i] === "おすすめ特集") {
            break;
        }
        if (
            lines[i] === "販売中" ||
            lines[i] === "販売前"
        ) {

            const title = lines[i + 1];
            let date = lines[i + 3];

            date = date
                .replace("年", "/")
                .replace("月", "/")
                .replace("日", "")
                .replace(/\(.*?\)/, "");

            const parts = date.split("/");

            date =
                parts[0] + "/" +
                parts[1].padStart(2, "0") + "/" +
                parts[2].padStart(2, "0");
            const place = lines[i + 7];
            const performers = lines[i + 9];

            if (performers.includes("ヤーレンズ")) {

                events.push({
                    // id,
                    date,
                    title,
                    category: "ライブ",
                    place,
                    performers,
                    url: "",
                    source: "LivePocket",
                    status: "開催予定",
                    detail: ""
                });

            }

        }
    }

    await browser.close();

    return events;


}