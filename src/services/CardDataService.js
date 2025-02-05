// src/services/CardDataService.js
import cardDatabase from "../data/cardDatabase.json";

export function getAllLocalCards() {
  let allCards = [];

  for (const [setCode, setInfo] of Object.entries(cardDatabase)) {
    const { cards } = setInfo;
    // For each card, compute the local image path
    // e.g. code = "A1/0" => "A1_0.webp"
    const expandedCards = cards.map((c) => {
      const fileName = c.code.replace("/", "_") + ".webp";
      const imageUrl = `/card_images/${fileName}`;
      return {
        ...c,
        set: setCode, // e.g. "A1"
        number: parseInt(c.code.split("/")[1], 10),
        imageUrl,
      };
    });
    allCards = allCards.concat(expandedCards);
  }

  // Sort globally if needed
  allCards.sort((a, b) => {
    const setCmp = a.set.localeCompare(b.set);
    if (setCmp !== 0) return setCmp;
    return a.number - b.number;
  });

  return allCards;
}
