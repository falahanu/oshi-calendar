const EVENT_TITLE_PATTERN = /^(.+?)のチケット購入・予約は/;

// ==========================================
// OCR設定
// ==========================================

const OCR_WORKER_PATH = chrome.runtime.getURL("worker.min.js");
const OCR_LANG_PATH = chrome.runtime.getURL("tessdata/");
const OCR_CORE_PATH = chrome.runtime.getURL("tesscore/");

let ocrWorker = null;

// ==========================================
// OCR Workerを取得
// ==========================================

async function getOcrWorker() {

    if (ocrWorker) {
        return ocrWorker;
    }

    console.log("===== OCR Worker 起動 =====");

    ocrWorker = await Tesseract.createWorker("jpn", 1, {
        workerPath: OCR_WORKER_PATH,
        langPath: OCR_LANG_PATH,
        corePath: OCR_CORE_PATH,
        logger: message => {
            console.log("OCR:", message);
        }
    });

    console.log("===== OCR Worker 起動完了 =====");

    return ocrWorker;
}

// ==========================================
// ページ内画像をOCR
// ==========================================

async function getOcrText() {

    const images = Array.from(document.images);

    console.log("===== ページ内画像数 =====");
    console.log(images.length);

    const targets = images
        .filter(img => {
            return (
                img.complete &&
                img.naturalWidth >= 300 &&
                img.naturalHeight >= 200 &&
                img.src &&
                !img.src.startsWith("data:")
            );
        })
        .slice(0, 5);

    console.log("===== OCR対象画像数 =====");
    console.log(targets.length);

    if (targets.length === 0) {
        return "";
    }

    const worker = await getOcrWorker();

    let ocrText = "";

    for (let i = 0; i < targets.length; i++) {

        try {

            console.log(`===== OCR開始 ${i + 1}/${targets.length} =====`);
            console.log(targets[i].src);

            const result = await worker.recognize(targets[i]);

            const text = result.data.text || "";

            console.log(`===== OCR結果 ${i + 1} =====`);
            console.log(text);

            ocrText += "\n" + text;

        } catch (error) {

            console.warn(`OCR画像 ${i + 1} の取得に失敗しました`);
            console.warn(error);

        }
    }

    return ocrText;
}

// ==========================================
// OCR文字列からイベント情報を補完
// ==========================================

function supplementFromOcr(pageInfo, ocrText) {

    if (!ocrText) {
        return pageInfo;
    }

    console.log("===== OCRから情報補完開始 =====");

    // ========================================
    // 開催日
    // ========================================

    if (!pageInfo.date) {

        let dateMatch = ocrText.match(
            /(\d{4})年\s*(\d{1,2})月\s*(\d{1,2})日/
        );

        if (!dateMatch) {

            dateMatch = ocrText.match(
                /(\d{4})[\/\-\.]\s*(\d{1,2})[\/\-\.]\s*(\d{1,2})/
            );

        }

        if (dateMatch) {

            pageInfo.date =
                dateMatch[1] +
                "-" +
                String(dateMatch[2]).padStart(2, "0") +
                "-" +
                String(dateMatch[3]).padStart(2, "0");

            console.log("OCRで開催日を取得:", pageInfo.date);
        }
    }

    // ========================================
    // 開場・開演
    // ========================================

    if (!pageInfo.detail) {

        const timeMatch = ocrText.match(
            /(\d{1,2}:\d{2})\s*開場[\s\S]{0,20}?(\d{1,2}:\d{2})\s*開演/
        );

        if (timeMatch) {

            pageInfo.detail =
                `開場 ${timeMatch[1]} / 開演 ${timeMatch[2]}`;

            console.log("OCRで開場・開演を取得:", pageInfo.detail);

        } else {

            const openMatch = ocrText.match(
                /(\d{1,2}:\d{2})\s*開場/
            );

            const startMatch = ocrText.match(
                /(\d{1,2}:\d{2})\s*開演/
            );

            if (openMatch && startMatch) {

                pageInfo.detail =
                    `開場 ${openMatch[1]} / 開演 ${startMatch[1]}`;

                console.log("OCRで開場・開演を取得:", pageInfo.detail);

            } else if (openMatch) {

                pageInfo.detail =
                    `開場 ${openMatch[1]}`;

                console.log("OCRで開場時刻を取得:", pageInfo.detail);

            } else if (startMatch) {

                pageInfo.detail =
                    `開演 ${startMatch[1]}`;

                console.log("OCRで開演時刻を取得:", pageInfo.detail);

            }
        }
    }

    // ========================================
    // 会場
    // ========================================

    if (!pageInfo.place) {

        const placeMatch = ocrText.match(
            /会場\s*[\r\n]+\s*([^\r\n]+)/
        );

        if (placeMatch) {

            pageInfo.place = placeMatch[1].trim();

            console.log("OCRで会場を取得:", pageInfo.place);
        }
    }

    // ========================================
    // 出演者
    // ========================================

    if (!pageInfo.performers) {

        const performersMatch = ocrText.match(
            /出演者\s*[\r\n]+\s*([^\r\n]+)/
        );

        if (performersMatch) {

            pageInfo.performers =
                performersMatch[1].trim();

            console.log("OCRで出演者を取得:", pageInfo.performers);
        }
    }

    console.log("===== OCRから情報補完完了 =====");

    return pageInfo;
}

// ==========================================
// メッセージ受信
// ==========================================

chrome.runtime.onMessage.addListener(
    (message, sender, sendResponse) => {

        console.log("===== content.js メッセージ受信 =====");
        console.log(message);

        if (message.type !== "GET_PAGE_INFO") {
            return;
        }

        (async () => {

            try {

                let text = document.body.innerText || "";
                const title = document.title || "";
                const url = location.href;

                console.log("===== 推し活マネージャー =====");

                // ========================================
                // ページタイトルからイベント名を取得
                // ========================================

                let eventTitle = "";

                const titleMatch = title.match(
                    EVENT_TITLE_PATTERN
                );

                if (titleMatch) {
                    eventTitle = titleMatch[1].trim();
                }

                // titleから取れなかった場合の予備
                if (!eventTitle) {

                    const h1 = document.querySelector("h1");

                    if (h1) {
                        eventTitle = h1.textContent.trim();
                    }
                }

                // ========================================
                // チケット情報タブを開く
                // ========================================

                let ticketText = "";

                const ticketTab = document.querySelector(
                    'li[data-tab="event-ticket"]'
                );

                if (ticketTab) {

                    console.log("===== チケット情報タブを確認 =====");

                    ticketTab.click();

                    await new Promise(resolve =>
                        setTimeout(resolve, 100)
                    );

                    ticketText =
                        document.documentElement.innerText || "";

                    console.log("===== チケット情報取得 =====");
                    console.log(
                        "開場:",
                        ticketText.includes("開場")
                    );
                    console.log(
                        "開演:",
                        ticketText.includes("開演")
                    );

                } else {

                    console.log("===== チケット情報タブなし =====");

                }

                // ========================================
                // 開催日
                // ========================================

                let date = "";

                const dateMatch = text.match(
                    /(\d{4})年(\d{1,2})月(\d{1,2})日(?:([月火水木金土日]))?/
                );

                if (dateMatch) {

                    date =
                        dateMatch[1] +
                        "-" +
                        String(dateMatch[2]).padStart(2, "0") +
                        "-" +
                        String(dateMatch[3]).padStart(2, "0");
                }

                // ==========================================
                // 開場・開演
                // チケット情報タブのHTMLから取得
                // ==========================================

                let detail = "";

                const timeMatch = ticketText.match(
                    /開場\s*(\d{1,2}:\d{2})\s*\/\s*開演\s*(\d{1,2}:\d{2})/
                );

                if (timeMatch) {

                    detail =
                        `開場 ${timeMatch[1]} / 開演 ${timeMatch[2]}`;

                } else {

                    const openingMatch = ticketText.match(
                        /開場\s*(\d{1,2}:\d{2})/
                    );

                    const startingMatch = ticketText.match(
                        /開演\s*(\d{1,2}:\d{2})/
                    );

                    if (openingMatch && startingMatch) {

                        detail =
                            `開場 ${openingMatch[1]} / 開演 ${startingMatch[1]}`;

                    } else if (openingMatch) {

                        detail =
                            `開場 ${openingMatch[1]}`;

                    } else if (startingMatch) {

                        detail =
                            `開演 ${startingMatch[1]}`;
                    }
                }

                console.log("===== 開場・開演取得結果 =====");
                console.log(detail);

                // ========================================
                // 会場
                // ========================================

                let place = "";

                const placeMatch = text.match(
                    /会場\s*\n([^\n]+)/
                );

                if (placeMatch) {
                    place = placeMatch[1].trim();
                }

                // ========================================
                // 出演者
                // ========================================

                let performers = "";

                const performersMatch = text.match(
                    /出演者\s*\n([^\n]+)/
                );

                if (performersMatch) {
                    performers =
                        performersMatch[1].trim();
                }

                // ========================================
                // カテゴリ
                // ========================================

                const category = "ライブ";

                // ========================================
                // HTML取得結果
                // ========================================

                const pageInfo = {
                    heading: eventTitle,
                    title: eventTitle,
                    url,
                    date,
                    category,
                    place,
                    performers,
                    detail
                };

                console.log(
                    "===== HTMLから取得したイベント情報 ====="
                );
                console.log(pageInfo);

                // ========================================
                // OCR
                //
                // HTMLで取得できない項目を画像から補完
                // ========================================

                let ocrText = "";

                const needsOcr =
                    !pageInfo.date ||
                    !pageInfo.place ||
                    !pageInfo.performers ||
                    !pageInfo.detail ||
                    (
                        pageInfo.detail.startsWith("開場 ") &&
                        !pageInfo.detail.includes("開演")
                    );

                if (needsOcr) {

                    try {

                        ocrText = await getOcrText();

                        supplementFromOcr(
                            pageInfo,
                            ocrText
                        );

                    } catch (ocrError) {

                        console.warn(
                            "===== OCR処理に失敗しました ====="
                        );
                        console.warn(ocrError);

                        // OCR失敗しても通常取得は成功扱い
                    }
                }

                // ========================================
                // 最終結果
                // ========================================

                console.log(
                    "===== 最終取得イベント情報 ====="
                );
                console.log(pageInfo);

                sendResponse(pageInfo);

            } catch (error) {

                console.error(
                    "===== ページ情報取得に失敗しました ====="
                );
                console.error(error);

                sendResponse({
                    heading: "",
                    title: "",
                    url: location.href,
                    date: "",
                    category: "ライブ",
                    place: "",
                    performers: "",
                    detail: ""
                });
            }

        })();

        return true;
    }
);