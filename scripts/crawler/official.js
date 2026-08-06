import { chromium } from "playwright";

export async function getOfficialEvents() {

    const browser = await chromium.launch({
        headless: false,
    });

    const page = await browser.newPage();

    await page.goto(
        "https://www.kdashstage.jp/profile/archives/4"
    );

    await page.waitForTimeout(3000);

    const text = await page.locator("body").innerText();

    const lines = text
        .split("\n")
        .map(x => x.trim())
        .filter(x => x);

    const events = [];

    // 「出演・イベント予定/ON AIR・EVENTS」を探す
    const start = lines.findIndex(x =>
        x.includes("出演・イベント予定")
    );

    // 「レギュラー情報」で終了
    const end = lines.findIndex(x =>
        x.includes("ヤーレンズ レギュラー情報")
    );

    if (start === -1 || end === -1) {

        console.log("出演情報が見つかりませんでした");

        await browser.close();
        return [];

    }

    for (let i = start + 1; i < end; i++) {

        const line = lines[i];

        if (!line.match(/^2026\/\d{2}\/\d{2}/)) {
            continue;
        }

        const date = line.match(/^\d{4}\/\d{2}\/\d{2}/)[0];

        let rest = line.replace(date, "").trim();

        // 時間
        let time = "";
        const timeMatch = rest.match(/\d{1,2}:\d{2}～\d{1,2}:\d{2}/);

        if (timeMatch) {
            time = timeMatch[0];
            rest = rest.replace(time, "").trim();
        }

        // カテゴリ
        let category = "その他";

        if (
            rest.includes("日本テレビ") ||
            rest.includes("テレビ朝日") ||
            rest.includes("テレビ東京") ||
            rest.includes("フジテレビ") ||
            rest.includes("NHK") ||
            rest.includes("テレビ")
        ) {

            category = "テレビ";

        } else if (
            rest.includes("ラジオ") ||
            rest.includes("Podcast")
        ) {

            category = "ラジオ";

        } else if (
            rest.includes("開演") ||
            rest.includes("開場")
        ) {

            category = "ライブ";

        }

        let place = "";
        let title = rest;

        if (category === "テレビ" || category === "ラジオ") {

            const idx = rest.indexOf("「");

            if (idx > 0) {

                place = rest.substring(0, idx).trim();
                title = rest.substring(idx).replace(/[「」]/g, "");

            }

        }

        if (category === "ライブ") {

            const idx = rest.indexOf("［");

            if (idx > 0) {

                place = rest.substring(0, idx).trim();
                title = rest.substring(idx).replace(/[［］]/g, "");

            }

        }

        events.push({

            date,
            title,
            category,
            place,
            performers: "ヤーレンズ",
            url: "https://www.kdashstage.jp/profile/archives/4",
            source: "公式HP",
            status: "開催予定",
            detail: time

        });

    }

    console.table(events);

    await browser.close();

    return events;

}