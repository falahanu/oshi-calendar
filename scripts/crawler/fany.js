import { chromium } from "playwright";

export async function getFanyEvents() {

    const browser = await chromium.launch({
        headless: false,
    });

    const page = await browser.newPage();

    await page.goto(
        "https://ticket.fany.lol/search/event?keywords=%E3%83%A4%E3%83%BC%E3%83%AC%E3%83%B3%E3%82%BA"
    );

    await page.waitForTimeout(5000);

    //const bodyText = await page.locator("body").innerText();

    //console.log(bodyText);
    const links = await page.locator("a").all();

    console.log("リンク数：" + links.length);

    // for (const link of links) {

    //     const text = await link.innerText();
    //     const href = await link.getAttribute("href");

    //     if (
    //         href &&
    //         href.includes("/reception/")
    //     ) {
    //         console.log("----------------");
    //         console.log("タイトル:", text);
    //         console.log("URL:", href);
    //     }
    // }

    const firstUrl = "https://ticket.fany.lol/reception/60362/49303";

    await page.goto(firstUrl);

    await page.waitForTimeout(3000);

    const bodyText = await page.locator("body").innerText();

    console.log(bodyText);

    await browser.close();


}
