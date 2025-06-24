const puppeteer = require("puppeteer");
const fs = require("fs");
const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", async (req, res) => {
  try {
    process.env.PUPPETEER_EXECUTABLE_PATH = require("puppeteer").executablePath();
    const browser = await puppeteer.launch({
      headless: true,
      executablePath: "/usr/bin/google-chrome",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--disable-software-rasterizer"
      ]
    });

    const page = await browser.newPage();
    await page.goto("https://www.tiktok.com/search?q=viral%20gadgets", {
      waitUntil: "networkidle2",
    });

    await page.waitForTimeout(7000);

    const results = await page.evaluate(() => {
      const data = [];
      const videoCards = document.querySelectorAll("div[data-e2e='search-video-item']");
      videoCards.forEach((item) => {
        const caption = item.innerText;
        const videoLink = item.querySelector("a")?.href;
        const thumbnail = item.querySelector("img")?.src;
        if (videoLink) {
          data.push({ caption, videoLink, thumbnail });
        }
      });
      return data;
    });

    await browser.close();
    res.json(results);
  } catch (error) {
    console.error("❌ Scraper error:", error);
    res.status(500).send("Scraper failed.");
  }
});

app.listen(PORT, () => {
  console.log(`🟢 Scraper live on port ${PORT}`);
});
