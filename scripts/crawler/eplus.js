import { chromium } from "playwright";

export async function getEplusEvents(URL) {

    const browser = await chromium.launch({
        headless: false,
    });

    const page = await browser.newPage();

    console.log("===== e+取得開始 =====");

    try {

        // ========================================
        // ① 一覧ページを1回だけ取得
        // ========================================

        await page.goto(URL, {
            waitUntil: "domcontentloaded",
            timeout: 30000,
        });

        await page.waitForTimeout(3000);

        const eventLinks = await page.locator("a").evaluateAll((links) => {

            return links
                .map((link) => ({
                    text: link.innerText.trim(),
                    href: link.getAttribute("href") || "",
                }))
                .filter((item) =>
                    item.text &&
                    item.href.includes("/sf/detail/")
                )
                .map((item) => ({
                    ...item,
                    href: new URL(item.href, "https://eplus.jp").href,
                }));

        });

        console.log("===== 公演・配信リンク =====");
        console.table(eventLinks);

        // ========================================
        // ② 通常公演と配信を分ける
        // ========================================

        const normalEvents = eventLinks.filter(
            (item) => !item.text.includes("Streaming+")
        );

        const streamingEvents = eventLinks.filter(
            (item) => item.text.includes("Streaming+")
        );

        console.log("通常公演:", normalEvents.length);
        console.log("配信:", streamingEvents.length);

        const events = [];

        // ========================================
        // 共通：日付取得
        // ========================================

        function extractDate(text) {

            const match = text.match(
                /(\d{4})\/(\d{1,2})\/(\d{1,2})\(.\)/
            );

            if (!match) {
                return "";
            }

            return `${match[1]}-${match[2].padStart(2, "0")}-${match[3].padStart(2, "0")}`;
        }

        // ========================================
        // 共通：タイトル取得
        // ========================================

        function extractTitle(text) {

            const lines = text
                .split("\n")
                .map((line) => line.trim())
                .filter(Boolean);

            const datePattern =
                /^\d{4}\/\d{1,2}\/\d{1,2}\(.+\)$/;

            const skipWords = [
                "先着",
                "抽選",
                "受付中",
                "受付終了",
                "受付前",
                "予定枚数終了",
                "Streaming+",
                "アーカイブあり",
            ];

            for (const line of lines) {

                if (datePattern.test(line)) {
                    continue;
                }

                if (skipWords.includes(line)) {
                    continue;
                }

                if (line.includes("配信開始")) {
                    continue;
                }

                if (line.includes("開演")) {
                    continue;
                }

                if (line.includes("開場")) {
                    continue;
                }

                if (line.includes("（東京都）")) {
                    continue;
                }

                if (line.includes("(東京都)")) {
                    continue;
                }

                return line;
            }

            return "";
        }

        // ========================================
        // 共通：ID用キー
        // ========================================

        function extractEventKey(href) {

            const match = href.match(
                /\/sf\/detail\/([^?]+)/
            );

            return match
                ? match[1]
                : href.replace(/[^a-zA-Z0-9_-]/g, "_");
        }

        // ========================================
        // 共通：出演者取得
        //
        // 詳細ページの「出演」付近から取得
        // ========================================

        function extractPerformers(bodyText) {
            const lines = bodyText
                .split("\n")
                .map((line) => line.trim())
                .filter(Boolean);

            const performerIndex = lines.findIndex(
                (line) => line === "出演"
            );

            if (performerIndex === -1) {
                return "";
            }

            // 「出演」の後にある出演者候補を確認
            for (
                let i = performerIndex + 1;
                i < Math.min(performerIndex + 10, lines.length);
                i++
            ) {
                const line = lines[i];

                // 明らかな補足情報は除外
                if (
                    line.includes("元") ||
                    line.includes("お笑い") ||
                    line.includes("芸人") ||
                    line.includes("プロフィール") ||
                    line.includes("チケット") ||
                    line.includes("料金") ||
                    line.includes("会場") ||
                    line.includes("開演") ||
                    line.includes("開場") ||
                    line.includes("東京都")
                ) {
                    continue;
                }

                // 「ヤーレンズ、トット」のような出演者一覧を優先
                if (line.includes("、")) {
                    return line;
                }
            }

            // 複数名表記が見つからなければ、
            // 「出演」の直後の候補を返す
            for (
                let i = performerIndex + 1;
                i < Math.min(performerIndex + 10, lines.length);
                i++
            ) {
                const line = lines[i];

                if (
                    !line.includes("元") &&
                    !line.includes("お笑い") &&
                    !line.includes("芸人") &&
                    !line.includes("プロフィール") &&
                    !line.includes("チケット") &&
                    !line.includes("料金") &&
                    !line.includes("会場") &&
                    !line.includes("開演") &&
                    !line.includes("開場") &&
                    !line.includes("東京都")
                ) {
                    return line;
                }
            }

            return "";
        }

        // ========================================
        // ③ 通常公演
        //
        // 詳細ページには各公演1回だけアクセス
        // ========================================

        for (const event of normalEvents) {

            console.log("===== 個別公演取得 =====");
            console.log(event.href);

            const detailPage = await browser.newPage();

            try {

                await detailPage.goto(event.href, {
                    waitUntil: "domcontentloaded",
                    timeout: 30000,
                });

                await detailPage.waitForTimeout(1000);

                const bodyText =
                    await detailPage.locator("body").innerText();

                // ------------------------------------
                // 日付
                // ------------------------------------

                const date = extractDate(bodyText);

                // ------------------------------------
                // 開演時間
                // ------------------------------------

                const timeMatch = bodyText.match(
                    /開演[：:]\s*(\d{1,2}:\d{2})/
                );

                const time = timeMatch
                    ? timeMatch[1]
                    : "";

                // ------------------------------------
                // タイトル
                // ------------------------------------

                const title = extractTitle(event.text);

                // ------------------------------------
                // 会場
                // ------------------------------------

                let place = "";

                const placeMatch = bodyText.match(
                    /\n([^\n]+)（東京都）/
                );

                if (placeMatch) {

                    place = placeMatch[1].trim();

                } else {

                    const placeMatch2 = bodyText.match(
                        /\n([^\n]+)\(東京都\)/
                    );

                    if (placeMatch2) {
                        place = placeMatch2[1].trim();
                    }
                }

                // ------------------------------------
                // 出演者
                // ------------------------------------

                const performers =
                    extractPerformers(bodyText);

                console.log(
                    "===== 詳細ページ出演者 ====="
                );
                console.log(performers);

                // ------------------------------------
                // 受付状況
                // ------------------------------------

                let status = "";

                if (bodyText.includes("受付中")) {
                    status = "受付中";
                } else if (bodyText.includes("予定枚数終了")) {
                    status = "予定枚数終了";
                } else if (bodyText.includes("受付終了")) {
                    status = "受付終了";
                } else if (bodyText.includes("受付前")) {
                    status = "受付前";
                }

                // ------------------------------------
                // 配信情報
                //
                // 配信詳細ページにはアクセスしない
                // 一覧ページの情報だけで判定
                // ------------------------------------

                const matchingStreaming =
                    streamingEvents.find((streaming) => {

                        const normalTitle =
                            extractTitle(event.text);

                        const streamingTitle =
                            extractTitle(streaming.text);

                        return (
                            normalTitle !== "" &&
                            streamingTitle !== "" &&
                            normalTitle === streamingTitle
                        );
                    });

                const detail = time
                    ? `開演 ${time}`
                    : "";

                // ------------------------------------
                // イベント作成
                // ------------------------------------

                const eventData = {
                    id: `EPLUS_${extractEventKey(event.href)}`,
                    date,
                    time,
                    title,
                    category: "ライブ",
                    place,
                    performers,
                    source: "e+",
                    url: event.href,
                    status,
                    detail,
                };

                events.push(eventData);

                console.log("===== ライブ =====");
                console.log(eventData);

            } finally {

                await detailPage.close();
            }
        }

        // ========================================
        // ④ 配信
        //
        // 配信詳細ページにはアクセスしない
        // 一覧ページの情報だけで作成
        // ========================================

        for (const streaming of streamingEvents) {

            console.log("===== 配信 =====");
            console.log(streaming.href);

            const date =
                extractDate(streaming.text);

            const title =
                extractTitle(streaming.text);

            const timeMatch =
                streaming.text.match(
                    /配信開始[：:]\s*(\d{1,2}:\d{2})/
                );

            const time =
                timeMatch
                    ? timeMatch[1]
                    : "";

            const streamingEvent = {
                id: `EPLUS_STREAMING_${extractEventKey(streaming.href)}`,
                date,
                time,
                title,
                category: "配信",
                place: "",
                performers: "",
                source: "e+",
                url: streaming.href,
                status: "開催予定",
                detail: [],
            };

            events.push(streamingEvent);

            console.log(streamingEvent);
        }

        console.log("===== e+取得完了 =====");
        console.log("登録件数:", events.length);

        console.table(events);

        return events;

    } finally {

        await browser.close();
    }
}