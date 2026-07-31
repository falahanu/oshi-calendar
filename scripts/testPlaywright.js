import { chromium } from "playwright";

async function test() {
  const browser = await chromium.launch({
    headless: false,
  });

  const page = await browser.newPage();

  await page.goto(
    "https://ticket.fany.lol/search/event?keywords=%E3%83%A4%E3%83%BC%E3%83%AC%E3%83%B3%E3%82%BA"
  );

  // ページが十分表示されるまで待つ
  await page.waitForTimeout(5000);

  // ページ内の文字を全部取得
  const bodyText = await page.locator("body").innerText();

  console.log(bodyText);

  await browser.close();
}

test();