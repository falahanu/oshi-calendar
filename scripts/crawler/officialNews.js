import { chromium } from "playwright";

export async function getOfficialNewsEvents() {

    const browser = await chromium.launch({
        headless: false,
    });

    const page = await browser.newPage();

    const baseUrl =
        "https://www.kdash.jp/news/archives/tag/%E3%83%A4%E3%83%BC%E3%83%AC%E3%83%B3%E3%82%BA";

    const events = [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const oneYearLater = new Date(today);
    oneYearLater.setDate(
        oneYearLater.getDate() + 365
    );

    let pageNumber = 1;

    try {

        while (true) {

            const currentUrl =
                pageNumber === 1
                    ? baseUrl
                    : `${baseUrl}/page:${pageNumber}`;

            console.log(
                `公式ニュース ${pageNumber}ページ目を取得中...`
            );

            try {
                await page.goto(currentUrl, {
                    waitUntil: "domcontentloaded",
                    timeout: 10000,
                });
            } catch (error) {
                console.error(
                    `公式ニュース ${pageNumber}ページ目の取得に失敗しました。`
                );
                console.error(error.message);
                console.log("公式ニュースの取得を終了し、次の情報源へ進みます。");
                break;
            }
            await page.waitForTimeout(1500);

            const text = await page.locator("body").innerText();

            const lines = text
                .split("\n")
                .map(x => x.trim())
                .filter(x => x);

            let pageEventCount = 0;
            let futureEventCount = 0;
            let pastEventCount = 0;

            for (let i = 0; i < lines.length; i++) {

                const line = lines[i];

                const dateMatch = line.match(
                    /^(\d{4})\.(\d{2})\.(\d{2})/
                );

                if (!dateMatch) {
                    continue;
                }

                const date =
                    `${dateMatch[1]}/${dateMatch[2]}/${dateMatch[3]}`;

                const eventDate = new Date(
                    `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}`
                );

                eventDate.setHours(0, 0, 0, 0);

                /*
                 * 365日先より先は対象外
                 */
                if (eventDate > oneYearLater) {
                    continue;
                }

                /*
                 * 過去情報
                 */
                if (eventDate < today) {
                    pastEventCount++;
                    continue;
                }

                futureEventCount++;

                const nextLine = lines[i + 1] || "";
                const titleLine = lines[i + 2] || "";

                /*
                 * タイトル
                 */
                let title = titleLine
                    .replace(/^[［「]/, "")
                    .replace(/[］」]$/, "")
                    .trim();

                if (!title) {
                    title = nextLine;
                }

                /*
                 * カテゴリ
                 */
                let category = "その他";

                if (
                    nextLine.includes("開場") ||
                    nextLine.includes("開演")
                ) {
                    category = "ライブ";
                }
                else if (
                    nextLine.includes("テレビ")
                ) {
                    category = "テレビ";
                }
                else if (
                    nextLine.includes("ラジオ") ||
                    nextLine.includes("Podcast")
                ) {
                    category = "ラジオ";
                }

                /*
                 * 1部・2部を検索
                 */
                const part1Match = nextLine.match(
                    /[１1]部.*?開演\s*(\d{1,2}:\d{2})/
                );

                const part2Match = nextLine.match(
                    /[２2]部.*?開演\s*(\d{1,2}:\d{2})/
                );

                /*
                 * 1部・2部がある場合
                 */
                if (part1Match || part2Match) {

                    /*
                     * 場所
                     *
                     * 2部の開演時間の後ろが場所
                     */
                    let partPlace = "";

                    if (part2Match) {

                        const placeMatch = nextLine.match(
                            /[２2]部.*?開演\s*\d{1,2}:\d{2}\s*(.*)$/
                        );

                        if (placeMatch) {
                            partPlace = placeMatch[1].trim();
                        }

                    }

                    /*
                     * 1部
                     */
                    if (part1Match) {

                        events.push({
                            date,
                            title: `${title}【1部】`,
                            category,
                            place: partPlace,
                            performers: "ヤーレンズ",
                            source: "公式HP",
                            status: "開催予定",
                            detail: `開演 ${part1Match[1]}`
                        });

                        pageEventCount++;
                    }

                    /*
                     * 2部
                     */
                    if (part2Match) {

                        events.push({
                            date,
                            title: `${title}【2部】`,
                            category,
                            place: partPlace,
                            performers: "ヤーレンズ",
                            source: "公式HP",
                            status: "開催予定",
                            detail: `開演 ${part2Match[1]}`
                        });

                        pageEventCount++;
                    }

                }

                /*
                 * 1部・2部がない通常イベント
                 */
                else {

                    let time = "";
                    let place = "";

                    /*
                     * ライブ
                     */
                    if (category === "ライブ") {

                        const timeMatch =
                            nextLine.match(
                                /開演\s*(\d{1,2}:\d{2})/
                            );

                        if (timeMatch) {
                            time =
                                `開演 ${timeMatch[1]}`;
                        }

                        const lastOpeningIndex =
                            nextLine.lastIndexOf("開演");

                        if (lastOpeningIndex !== -1) {

                            place = nextLine
                                .substring(lastOpeningIndex)
                                .replace(
                                    /^開演\s*\d{1,2}:\d{2}/,
                                    ""
                                )
                                .trim();
                        }

                    }

                    /*
                     * テレビ・ラジオなど
                     */
                    else {

                        const timeMatch =
                            nextLine.match(
                                /\d{1,2}:\d{2}～\d{1,2}:\d{2}/
                            );

                        if (timeMatch) {
                            time = timeMatch[0];
                        }

                        place = nextLine
                            .replace(
                                /\d{1,2}:\d{2}～\d{1,2}:\d{2}/,
                                ""
                            )
                            .trim();
                    }

                    events.push({
                        date,
                        title,
                        category,
                        place,
                        performers: "ヤーレンズ",
                        source: "公式HP",
                        status: "開催予定",
                        detail: time
                    });

                    pageEventCount++;
                }

            }

            console.log(
                `このページ：${pageEventCount}件`
            );

            /*
             * このページに未来の情報がなく、
             * 過去情報が存在する場合は終了
             */
            if (
                futureEventCount === 0 &&
                pastEventCount > 0
            ) {

                console.log(
                    "過去の情報だけになったため取得終了"
                );

                break;
            }

            /*
             * 次ページが存在するか確認
             */
            const nextPageUrl =
                `${baseUrl}/page:${pageNumber + 1}`;

            const nextResponse =
                await page.request.get(nextPageUrl);

            if (!nextResponse.ok()) {

                console.log(
                    "次ページが存在しないため取得終了"
                );

                break;
            }

            pageNumber++;

        }

        console.log(
            `公式ニュース取得完了：${events.length}件`
        );

        console.table(events);

        return events;

    }
    finally {

        await browser.close();

    }
}