import express from "express";
import cors from "cors";
import { exec } from "child_process";

const app = express();

app.use(cors());

app.post("/crawl", (req, res) => {

  console.log("スクレイピング開始");

  exec("node scripts/runCrawler.js", (error, stdout, stderr) => {

    if (error) {

      console.error(stderr);

      return res.status(500).json({
        success: false,
        message: stderr
      });

    }

    console.log(stdout);

    res.json({
      success: true
    });

  });

});

app.post("/createPublicJson", (req, res) => {

  console.log("公開JSON作成開始");

  exec("node scripts/createPublicJson.js", (error, stdout, stderr) => {

    if (error) {

      console.error(stderr);

      return res.status(500).json({
        success: false,
        message: stderr
      });

    }

    console.log(stdout);

    res.json({
      success: true
    });

  });

});

app.listen(3001, () => {

  console.log("Server Start");
  console.log("http://localhost:3001");

});