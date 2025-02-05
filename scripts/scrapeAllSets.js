// scrapeAllSetsParallel.js
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";    // needed for __dirname in ESM
import { load } from "cheerio";        // named import
import axios from "axios";
import pLimit from "p-limit";         // npm install p-limit if needed

// Because we're in ESM, define __dirname:
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = "https://pocket.limitlesstcg.com/cards";
const DATABASE_FILE = path.join("../src/data", "cardDatabase.json");

// 1. Load existing database
const cardDatabase = JSON.parse(fs.readFileSync(DATABASE_FILE, "utf8"));

// Create a concurrency limit (change 5 as needed)
const limit = pLimit(5);

async function scrapeCard(setCode, cardNumber) {
  const url = `${BASE_URL}/${setCode}/${cardNumber}`;
  try {
    const resp = await axios.get(url);
    if (resp.status !== 200) return null;

    const html = resp.data;
    const $ = load(html);

    // 1) Card Name
    const cardName = $("section.card-page-main .card-text-name a").text().trim();

    // 2) Rarity & Subpack
    const printsDetails = $(".card-prints-current .prints-current-details span")
      .last()
      .text()
      .trim();

    const normalized = printsDetails.replace(/\s+/g, " ").trim();
    // e.g. "#1 · ◊ · Mewtwo pack"
    const parts = normalized.split("·").map((p) => p.trim()).filter(Boolean);

    let rarity = parts.length >= 2 ? parts[1] : "";
    let booster = parts.length >= 3 ? parts[2] : "";
    //We remove the "pack" word from the booster
    booster = booster.replace(" pack", "").trim();

    //If we are in P-A, then there is no rarity, and the rarity is the booster
    if (setCode === "P-A") {
      rarity = booster;
      booster = "";
    }

    //If rarity contains the word crown, we replace it by the unicode symbol of the crown
    if (rarity.includes("Crown")) {
      rarity = "♛";
    }

    console.log(`✅ [${setCode}] ${cardNumber}: ${cardName}, Rarity=${rarity}, booster=${booster}`);
    return {
      cardName: cardName || "",
      rarity: rarity || "",
      booster: booster || "",
    };
  } catch (error) {
    console.log(`❌ [${setCode}] Error for ${setCode}/${cardNumber}:`, error.message);
    return null;
  }
}

async function scrapeMissingData() {
  const tasks = [];

  // 2. Iterate sets in cardDatabase
  for (const setCode of Object.keys(cardDatabase)) {
    console.log(`🔍 Checking set: ${setCode}...`);

    for (const card of cardDatabase[setCode].cards) {
      const numberPart = card.code.split("/")[1];
      if (!numberPart) continue;

      // If data already known, skip
      if (card.cardName && card.rarity && card.subbooster) {
        continue;
      }

      // Prepare a promise for scraping in parallel (with concurrency limit)
      const task = limit(async () => {
        const scrapedData = await scrapeCard(setCode, numberPart);
        if (scrapedData) {
          // Update our card object
          card.cardName = scrapedData.cardName || card.cardName;
          card.rarity = scrapedData.rarity || card.rarity;
          card.subbooster = scrapedData.booster || card.subbooster;
        }
      });

      tasks.push(task);
    }
  }

  // Execute all scraping tasks in parallel (respecting concurrency limit).
  await Promise.allSettled(tasks);

  // 3. Save changes
  fs.writeFileSync(DATABASE_FILE, JSON.stringify(cardDatabase, null, 2));
  console.log(`✅ Updated ${DATABASE_FILE} with scraped data`);
}

// Entry point
scrapeMissingData();
