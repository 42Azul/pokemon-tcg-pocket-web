// src/services/EncodingService.js
import pako from "pako";

/**
 * Encode the entire collection into { expansionCode: compressedBase64, ... }
 * using pako (zlib) compression for each expansion's quantities.
 */
export function encodeCollection(collection, allCards) {
  const setsMap = groupCardsBySet(allCards);
  const output = {};

  for (const setCode of Object.keys(setsMap).sort()) {
    const cardsInSet = setsMap[setCode];

    if (!cardsInSet.length) continue;

    // Convert card quantities to an array
    const quantities = cardsInSet.map((card) => {
      let q = collection[card.code] || 0;
      return q > 63 ? 63 : q; // Cap at 63 copies
    });

    // Convert to Uint8Array
    const quantityBuffer = new Uint8Array(quantities);

    // Compress using pako (zlib)
    const compressedData = pako.deflate(quantityBuffer, { level: 9 });

    // Convert compressed binary data to Base64
    output[setCode] = uint8ToBase64(compressedData);
  }

  return output;
}

/**
 * Decode an object { expansionCode: base64String } into a standard collection object.
 */
export function decodeCollection(encodedObj, allCards) {
  const setsMap = groupCardsBySet(allCards);
  const newCollection = {};

  for (const [setCode, base64Data] of Object.entries(encodedObj)) {
    const cardsInSet = setsMap[setCode];
    if (!cardsInSet) continue;

    // Convert Base64 to compressed Uint8Array
    const compressedData = base64ToUint8(base64Data);

    // Decompress using pako (zlib)
    const quantityBuffer = pako.inflate(compressedData);

    // Convert to an array of quantities
    const quantities = Array.from(quantityBuffer);

    // Assign to the corresponding cards
    for (let i = 0; i < cardsInSet.length; i++) {
      const card = cardsInSet[i];
      const q = quantities[i] || 0;
      if (q > 0) {
        newCollection[card.code] = q;
      }
    }
  }

  return newCollection;
}

/**
 * Utility: Group an array of allCards by set.
 */
function groupCardsBySet(allCards) {
  const setsMap = {};
  for (const card of allCards) {
    if (!setsMap[card.set]) {
      setsMap[card.set] = [];
    }
    setsMap[card.set].push(card);
  }

  for (const setCode of Object.keys(setsMap)) {
    setsMap[setCode].sort((a, b) => a.number - b.number);
  }

  return setsMap;
}

/**
 * Convert a Uint8Array to base64
 */
function uint8ToBase64(bytes) {
  return btoa(String.fromCharCode(...bytes));
}

/**
 * Convert a base64 to Uint8Array
 */
function base64ToUint8(base64) {
  return new Uint8Array(
    atob(base64)
      .split("")
      .map((char) => char.charCodeAt(0))
  );
}
