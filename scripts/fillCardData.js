// fillCardData.js
// Usage: node fillCardData.js
// This script scans ./public/images/card_images/*.webp
// and creates (or updates) ./src/data/cardDatabase.json with the found cards.

import { existsSync, readFileSync, readdirSync, writeFileSync } from "fs";
import { join } from "path";

const CARD_IMAGES_DIR = join("../public", "card_images");
const OUTPUT_JSON = join("../src", "data", "cardDatabase.json");

// If you have existing data, load it; otherwise create an empty object
let cardDatabase = {};
if (existsSync(OUTPUT_JSON)) {
  cardDatabase = JSON.parse(readFileSync(OUTPUT_JSON, "utf8"));
}

const files = readdirSync(CARD_IMAGES_DIR).filter(f => f.endsWith(".webp"));

files.forEach(fileName => {
  // e.g. "A1_0.webp"
  // parse setCode = "A1", cardNumber = "0"
  const [setCode, numberWithExt] = fileName.split("_");
  if (!numberWithExt) return;

  const cardNumber = numberWithExt.replace(".webp", "");
  const code = `${setCode}/${cardNumber}`; // "A1/0"

  // If we don’t have the set in the DB yet, add it
  if (!cardDatabase[setCode]) {
    cardDatabase[setCode] = {
      name: setCode, // placeholder name
      cards: []
    };
  }

    cardDatabase[setCode].cards.push({
      code
    });
});

// Sort each set’s cards by the card number
Object.keys(cardDatabase).forEach(set => {
  cardDatabase[set].cards.sort((a, b) => {
    const numA = parseInt(a.code.split("/")[1], 10);
    const numB = parseInt(b.code.split("/")[1], 10);
    return numA - numB;
  });
});

// Write the final JSON
writeFileSync(OUTPUT_JSON, JSON.stringify(cardDatabase, null, 2));
console.log(`Updated ${OUTPUT_JSON} with ${files.length} card images found.`);
