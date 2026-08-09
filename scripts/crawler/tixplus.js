import { chromium } from "playwright";

export async function getTixplusEvents(URL) {

    const browser = await chromium.launch({
        headless: false,
    });

    const page = await browser.newPage();

    console.log("===== Tixplus取得開始 =====");

    await page.goto(URL, {
        waitUntil: "domcontentloaded",
        timeout: 30000,
    });

    await page.waitForTimeout(3000);

    /*
     * ==========================================
     * 基本情報
     * ==========================================
     */

    const artist =
        await page.locator(".mainVisual__headingArtist").innerText();

    const title =
        await page.locator(".mainVisual__headingTitle").innerText();

    const cleanTitle = title
        .replace(/\s+/g, "")
        .trim();

    console.log("===== 基本情報 =====");
    console.log("出演者:", artist);
    console.log("タイトル:", cleanTitle);


    /*
     * ==========================================
     * 購入対象公演
     *
     * Tixplusでは
     * label.valBtn .selectedTxt
     * に購入対象の公演が入っている
     * ==========================================
     */

    const purchaseTexts = await page
        .locator("label.valBtn .selectedTxt")
        .allInnerTexts();

    console.log("===== purchase selectedTxt =====");
    console.log(purchaseTexts);


    /*
     * ==========================================
     * Schedule情報
     *
     * 日付・地域・時間・会場を取得
     * ==========================================
     */

    const scheduleItems = await page
        .locator(".schedule__item")
        .evaluateAll((items) => {

            return items.map(item => {

                const date =
                    item
                        .querySelector(".schedule__headingTime .date")
                        ?.textContent
                        ?.trim() || "";

                const area =
                    item
                        .querySelector(".schedule__area")
                        ?.textContent
                        ?.trim() || "";

                const time =
                    item
                        .querySelector(".schedule__time")
                        ?.textContent
                        ?.replace(/\s+/g, " ")
                        ?.trim() || "";

                const place =
                    item
                        .querySelector(".schedule__headingPlace")
                        ?.textContent
                        ?.replace(/\s+/g, " ")
                        ?.trim() || "";

                return {
                    date,
                    area,
                    time,
                    place,
                };

            }).filter(item => item.date);

        });

    console.log("===== schedule items =====");
    console.table(scheduleItems);


    /*
     * ==========================================
     * 公演をイベント化
     * ==========================================
     */

    const events = [];

    for (const purchaseText of purchaseTexts) {

        /*
         * 例：
         *
         * 8/4(火) 東京｜なかのZERO 大ホール
         *
         * 8/23(日) 福岡｜福岡国際会議場 メインホール【1部】
         */

        const match = purchaseText.match(
            /^(\d{1,2})\/(\d{1,2})\([^)]*\)\s*(.+?)｜(.+?)(?:【(\d+)部】)?$/
        );

        if (!match) {

            console.log(
                "解析できない公演:",
                purchaseText
            );

            continue;
        }

        const month = match[1].padStart(2, "0");
        const day = match[2].padStart(2, "0");

        const area = match[3].trim();
        const venue = match[4].trim();

        const part = match[5] || "";

        const date =
            `2026/${month}/${day}`;


        /*
         * ==========================================
         * 対応するScheduleを探す
         * ==========================================
         */
        const scheduleItem =
            scheduleItems.find(item => {

                const itemDate =
                    item.date.replace(/[月火水木金土日]/g, "");

                return (
                    itemDate === `${month}.${day}` &&
                    item.area === area
                );

            });
        /*
         * ==========================================
         * 開場・開演時間
         * ==========================================
         */

        let detail = "";

        if (scheduleItem) {

            const scheduleTime =
                scheduleItem.time;

            if (part) {

                /*
                 * 1部 / 2部を切り出す
                 *
                 * 例：
                 *
                 * 【1部】開場 12:00 / 開演 13:00
                 * 【2部】開場 16:00 / 開演 17:00
                 */

                const partMatch =
                    scheduleTime.match(
                        new RegExp(
                            `【${part}部】\\s*(.*?)(?=【\\d+部】|$)`
                        )
                    );

                if (partMatch) {

                    detail =
                        `【${part}部】${partMatch[1].trim()}`;

                } else {

                    detail =
                        `【${part}部】`;

                }

            } else {

                detail = scheduleTime;

            }

        }


        /*
         * ==========================================
         * イベント作成
         * ==========================================
         */

        events.push({

            id: part
                ? `TIXPLUS_${date.replaceAll("/", "")}_${part}`
                : `TIXPLUS_${date.replaceAll("/", "")}`,

            date,

            title: part
                ? `${cleanTitle}【${part}部】`
                : cleanTitle,

            category: "ライブ",

            place: `${area}・${venue}`,

            performers: artist,

            url: URL,

            source: "Tixplus",

            status: "開催予定",

            detail,

        });

    }


    /*
     * ==========================================
     * 重複除去
     * ==========================================
     */

    const uniqueEvents = [];

    for (const event of events) {

        const exists = uniqueEvents.find(
            item => item.id === event.id
        );

        if (!exists) {
            uniqueEvents.push(event);
        }

    }


    /*
     * ==========================================
     * 結果
     * ==========================================
     */

    console.log("===== Tixplus取得結果 =====");

    console.table(uniqueEvents);

    console.log(
        `Tixplus取得完了：${uniqueEvents.length}件`
    );


    await browser.close();

    return uniqueEvents;
}