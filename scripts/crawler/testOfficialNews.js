import { chromium } from "playwright";

const browser = await chromium.launch({
    headless: false,
});

const page = await browser.newPage();

await page.goto(
    "https://www.kdash.jp/news/archives/tag/%E3%83%A4%E3%83%BC%E3%83%AC%E3%83%B3%E3%82%BA",
    {
        waitUntil: "domcontentloaded",
        timeout: 30000,
    }
);

await page.waitForTimeout(3000);

const text = await page.locator("body").innerText();

console.log(text);

await browser.close();