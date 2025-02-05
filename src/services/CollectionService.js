// src/services/CollectionService.js

const STORAGE_KEY = "pokemonCollection";

// Load user collection from localStorage
export function loadCollection() {
  const storedData = localStorage.getItem(STORAGE_KEY);
  return storedData ? JSON.parse(storedData) : {};
}

// Save collection to localStorage
export function saveCollection(collection) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(collection));
}

// Update a specific card quantity
export function updateCardQuantity(collection, cardCode, quantity) {
  const newCollection = { ...collection };
  if (quantity <= 0) {
    delete newCollection[cardCode]; // Remove if 0
  } else {
    newCollection[cardCode] = quantity;
  }
  return newCollection;
}
