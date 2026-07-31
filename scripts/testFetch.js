import axios from "axios";
import * as cheerio from "cheerio";

async function test() {

    const url =
        "https://ticket.fany.lol/search/event?keywords=%E3%83%A4%E3%83%BC%E3%83%AC%E3%83%B3%E3%82%BA";

    const response = await axios.get(url);

    const $ = cheerio.load(response.data);

    console.log($("title").text());
    $("a").each((index, element) => {
        const text = $(element).text().trim();
        const href = $(element).attr("href");

        if (text) {
            console.log("----------------");
            console.log(text);
            console.log(href);
        }
    });
}

test();