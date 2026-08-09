import { chromium } from "playwright";

function getValueAfter(lines, label) {

    const index = lines.indexOf(label);

    if (index === -1) {
        return "";
    }

    return lines[index + 1] || "";

}
export async function getFanyEvents() {

    const browser = await chromium.launch({
        headless: false,
    });

    const page = await browser.newPage();

    await page.goto(
        "https://ticket.fany.lol/search/event?keywords=%E3%83%A4%E3%83%BC%E3%83%AC%E3%83%B3%E3%82%BA"
    );

    await page.waitForTimeout(3000);

    const links = await page.locator("a").all();

    const urls = [];

    for (const link of links) {

        const href = await link.getAttribute("href");

        if (
            href &&
            href.includes("/reception/")
        ) {

            if (!urls.includes(href)) {

                urls.push(href);

            }

        }

    }

    console.log("イベント数：" + urls.length);

    const events = [];

    for (const url of urls) {

        console.log("取得中：" + url);

        await page.goto(url);

        await page.waitForTimeout(1500);

        const text = await page.locator("body").innerText();
        const lines = text
            .split("\n")
            .map(x => x.trim())
            .filter(x => x);

        let id = "";
        let date = "";
        let title = "";
        let place = "";
        let performers = "";
        let detail = "";

        for (let i = 0; i < lines.length; i++) {

            if (
                lines[i].match(/\d{4}\/\d{2}\/\d{2}/)
            ) {

                date = lines[i];
                date = date.replace(/\(.*?\)/, "");
                title = lines[i + 1] || "";

                place = lines[i + 3] || "";

                // 時間を取得
                // 例：開場 12:00 / 開演 13:00
                for (let j = i; j < Math.min(i + 15, lines.length); j++) {

                    const timeMatch = lines[j].match(
                        /(?:開場\s*)?\d{1,2}:\d{2}\s*(?:[～~\/／]\s*(?:開演\s*)?\d{1,2}:\d{2})?/
                    );

                    if (timeMatch) {
                        detail = timeMatch[0];
                        break;
                    }

                }

                break;

            }
            performers = getValueAfter(lines, "出演");

        }

        const exists = events.find(event =>
            event.date === date &&
            event.title === title
        );

        if (!exists) {

            id = url
                .replace("https://ticket.fany.lol/reception/", "FANY_")
                .replace("/", "_");

            events.push({
                id,
                date,
                title,
                category: "ライブ",
                place,
                performers,
                url,
                source: "FANY",
                status: "開催予定",
                detail
            });

        }
    }

    console.log(events);

    await browser.close();

    return events;
}

