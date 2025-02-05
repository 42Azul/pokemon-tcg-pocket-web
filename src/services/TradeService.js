// src/services/TradeService.js
export function compareCollections(collectionA, collectionB, cards) {
    const possibleTrades = [];
    const rarityMap = {};
    for (const card of cards) {
      rarityMap[card.code] = card.rarity || "";
    }
  
    // Gather all codes
    const allCodes = new Set([...Object.keys(collectionA), ...Object.keys(collectionB)]);
  
    // For each code that user A has duplicates, see if user B has a same-rarity duplicate
    // and user A is missing that card.
    for (const codeA of allCodes) {
      const aQty = collectionA[codeA] || 0;
      const bQty = collectionB[codeA] || 0;
      if (aQty > 1 && bQty === 0) {
        const rarityA = rarityMap[codeA];
        // find a codeB that b has extras, a doesn't have, same rarity
        const codeB = [...Object.keys(collectionB)].find((c) => {
          const cQty = collectionB[c] || 0;
          const aHas = collectionA[c] || 0;
          return cQty > 1 && aHas === 0 && rarityMap[c] === rarityA;
        });
        if (codeB) {
          possibleTrades.push({
            fromA: { cardCode: codeA, quantity: aQty },
            fromB: { cardCode: codeB, quantity: collectionB[codeB] },
          });
        }
      }
    }
  
    return possibleTrades;
  }
  