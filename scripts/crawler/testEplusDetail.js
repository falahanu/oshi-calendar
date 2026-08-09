import { chromium } from "playwright";

const URL = "https://eplus.jp/sf/word/0000075407";
const PERFORMERS = "ヤーレンズ";

export async function getEplusEvents(url, performers = "") {
    const browser = await chromium.launch({
        headless: false,
    });

    const page = await browser.newPage();

    console.log("===== e+取得開始 =====");

    try {
        // ========================================
        // ① 検索結果ページを1回だけ取得
        // ========================================

        await page.goto(url, {
            waitUntil: "domcontentloaded",
            timeout: 30000,
        });

        await page.waitForTimeout(1500);

        const eventLinks = await page.locator("a").evaluateAll((links) => {
            return links
                .map((link) => ({
                    text: link.innerText.trim(),
                    href: link.href,
                }))
                .filter(
                    (item) =>
                        item.text &&
                        item.href.includes("/sf/detail/")
                );
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

            return `${match[1]}-${String(match[2]).padStart(2, "0")}-${String(
                match[3]
            ).padStart(2, "0")}`;
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
        // URLからID用文字列を取得
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
        // 詳細ページから出演者を取得
        //
        // 詳細ページへのアクセスは
        // 通常公演1件につき1回だけ
        // ========================================

        function extractPerformers(bodyText) {
            const lines = bodyText
                .split("\n")
                .map((line) => line.trim())
                .filter(Boolean);

            const index = lines.findIndex(
                (line) => line === "出演"
            );

            if (index === -1) {
                return performers;
            }

            const candidates = [];

            // 「出演」の直後にある出演者情報を取得
            for (
                let i = index + 1;
                i < Math.min(index + 8, lines.length);
                i++
            ) {
                const line = lines[i];

                if (!line) {
                    continue;
                }

                // 明らかに出演者ではない情報は除外
                if (
                    line.includes("チケット") ||
                    line.includes("会場") ||
                    line.includes("開演") ||
                    line.includes("料金") ||
                    line.includes("受付") ||
                    line.includes("2026/") ||
                    line.includes("2025/")
                ) {
                    continue;
                }

                candidates.push(line);
            }

            // 「リニア」「ヤーレンズ、トット」など、
            // 出演者らしい文字列をまとめる
            const performerLines = candidates.filter((line) => {
                return (
                    line.length <= 100 &&
                    !line.includes("チケット情報") &&
                    !line.includes("東京都")
                );
            });

            if (performerLines.length === 0) {
                return performers;
            }

            // 重複除去
            const unique = [...new Set(performerLines)];

            // 「出演」の直後に並ぶ出演者情報から、
            // 実際の出演者名がまとまっている行を優先
            const combined = unique.find(
                (line) =>
                    line.includes("、") ||
                    line.includes(",")
            );

            if (combined) {
                return combined;
            }

            return unique.join("、");
        }

        // ========================================
        // ③ 通常公演
        //
        // 詳細ページはここで1回だけ取得
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

                // 詳細ページ本文
                const bodyText =
                    await detailPage.locator("body").innerText();

                // ------------------------------------
                // 出演者
                // ------------------------------------

                const detailPerformers =
                    extractPerformers(bodyText);

                console.log("===== 詳細ページ出演者 =====");
                console.log(detailPerformers);

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
                // 同じ公演の配信があるか
                //
                // 検索結果ページだけで判定
                // 配信詳細ページにはアクセスしない
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

                // ------------------------------------
                // イベントID
                // ------------------------------------

                const eventKey =
                    extractEventKey(event.href);

                // ------------------------------------
                // ライブイベント
                // ------------------------------------

                const liveEvent = {
                    id: `EPLUS_${eventKey}`,
                    date,
                    time,
                    title,
                    category: "ライブ",
                    place,
                    performers: detailPerformers,
                    url: event.href,
                    status: "開催予定",
                    source: "e+",
                    detail: matchingStreaming
                        ? "配信情報あり"
                        : "",
                    management: "自動",
                };

                events.push(liveEvent);

                console.log("===== ライブ =====");
                console.log(liveEvent);

            } finally {
                await detailPage.close();
            }
        }

        // ========================================
        // ④ 配信
        //
        // 配信詳細ページにはアクセスしない
        // 検索結果ページの情報だけで作成
        // ========================================

        for (const streaming of streamingEvents) {
            console.log("===== 配信 =====");
            console.log(streaming.href);

            const date =
                extractDate(streaming.text);

            const title =
                extractTitle(streaming.text);

            // 配信開始時間
            const timeMatch =
                streaming.text.match(
                    /配信開始[：:]\s*(\d{1,2}:\d{2})/
                );

            const time =
                timeMatch
                    ? timeMatch[1]
                    : "";

            const eventKey =
                extractEventKey(streaming.href);

            const streamingEvent = {
                id: `EPLUS_STREAMING_${eventKey}`,
                date,
                time,
                title,
                category: "配信",
                place: "",
                performers,
                url: streaming.href,
                status: "開催予定",
                source: "e+",
                detail: "",
                management: "自動",
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

// ========================================
// テスト実行
// ========================================

getEplusEvents(URL, PERFORMERS)
    .then((events) => {
        console.log("===== 最終イベント =====");

        console.dir(events, {
            depth: null,
        });
    })
    .catch((error) => {
        console.error("===== e+取得エラー =====");
        console.error(error);
    });