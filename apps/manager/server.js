import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";
import { exec } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());

const scriptsDir = path.resolve(__dirname, "../../scripts");

const runCrawlerPath = path.join(
  scriptsDir,
  "runCrawler.js"
);

const createPublicJsonPath = path.join(
  scriptsDir,
  "createPublicJson.js"
);

app.post("/crawl", (req, res) => {

  console.log("===== スクレイピング開始 =====");

  exec(`node "${runCrawlerPath}"`, (error, stdout, stderr) => {

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

  console.log("===== 公開JSON作成開始 =====");

  exec(
    `node "${createPublicJsonPath}"`,
    (error, stdout, stderr) => {

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

    }
  );

});

app.listen(3001, () => {

  console.log("Server Start");
  console.log("http://localhost:3001");

});