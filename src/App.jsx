// src/App.jsx
import React, { useEffect, useState } from "react";
import { getAllLocalCards } from "./services/CardDataService";
import {
  loadCollection,
  saveCollection,
  updateCardQuantity,
} from "./services/CollectionService";
import { encodeCollection, decodeCollection } from "./services/EncodingService";

import CardGrid from "./components/CardGrid";
import TinderView from "./components/TinderView";
import TradeView from "./components/TradeView";
import StatsView from "./components/StatsView";

export default function App() {
  const [cards, setCards] = useState([]);
  const [collection, setCollection] = useState(loadCollection());

  // UI Controls
  const [selectedSet, setSelectedSet] = useState("All");
  const [hideZero, setHideZero] = useState(false);
  const [hideCompleted, setHideCompleted] = useState(false);
  const [sortMode, setSortMode] = useState("default");
  const [cardWidth, setCardWidth] = useState(100);
  const [encodedStr, setEncodedStr] = useState("");
  const [mode, setMode] = useState("grid");

  useEffect(() => {
    // Load all local cards
    const localCards = getAllLocalCards();
    setCards(localCards);
  }, []);

  useEffect(() => {
    // Save collection whenever it changes
    saveCollection(collection);
  }, [collection]);

  // Helper to update single card
  function handleUpdate(cardCode, quantity) {
    setCollection((prev) => updateCardQuantity(prev, cardCode, quantity));
  }

  // Filter logic
  const filteredCards = cards.filter((card) => {
    if (selectedSet !== "All" && card.set !== selectedSet) return false;
    const qty = collection[card.code] || 0;
    if (hideZero && qty === 0) return false;
    if (hideCompleted && qty > 0) return false;
    return true;
  });

  // Sort logic (descending by quantity if "quantity")
  if (sortMode === "quantity") {
    filteredCards.sort((a, b) => {
      const qA = collection[a.code] || 0;
      const qB = collection[b.code] || 0;
      return qB - qA;
    });
  }

  // Encode/Decode
  function handleEncode() {
    const encodedObj = encodeCollection(collection, cards);
    setEncodedStr(JSON.stringify(encodedObj));
  }
  function handleDecode() {
    try {
      const parsed = JSON.parse(encodedStr);
      const newColl = decodeCollection(parsed, cards);
      setCollection(newColl);
    } catch (err) {
      console.error("Decode failed:", err);
    }
  }

  // Reset ALL cards in the collection to 0
  function handleResetAll() {
    const confirmed = window.confirm(
      "Are you sure you want to reset ALL cards to 0?"
    );
    if (!confirmed) return;

    // newCollection: set every card key to 0
    const newCollection = { ...collection };
    for (const cardCode of Object.keys(newCollection)) {
      newCollection[cardCode] = 0;
    }
    setCollection(newCollection);
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6 font-sans">
      <h1 className="text-3xl font-bold text-center mb-8">
        Pokémon TCG Pocket Collection
      </h1>

      {/* Controls */}
      <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
        {/* View Mode */}
        <div>
          <label className="font-semibold mr-1">View Mode:</label>
          <select
            className="border rounded p-1"
            value={mode}
            onChange={(e) => setMode(e.target.value)}
          >
            <option value="grid">Grid Mode</option>
            <option value="tinder">Tinder Mode</option>
            <option value="trade">Trade Mode</option>
            <option value="stats">Stats Mode</option>
          </select>
        </div>

        {/* Select Set */}
        <div>
          <label className="font-semibold mr-1">Set:</label>
          <select
            className="border rounded p-1"
            value={selectedSet}
            onChange={(e) => setSelectedSet(e.target.value)}
          >
            <option value="All">All</option>
            <option value="A1">A1</option>
            <option value="A1a">A1a</option>
            <option value="A2">A2</option>
            <option value="P-A">P-A</option>
          </select>
        </div>

        {/* Hide Zero */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="hideZero"
            checked={hideZero}
            onChange={(e) => setHideZero(e.target.checked)}
            className="mr-1"
          />
          <label htmlFor="hideZero" className="font-semibold">
            Hide Zero
          </label>
        </div>

        {/* Hide Completed */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="hideCompleted"
            checked={hideCompleted}
            onChange={(e) => setHideCompleted(e.target.checked)}
            className="mr-1"
          />
          <label htmlFor="hideCompleted" className="font-semibold">
            Hide Completed
          </label>
        </div>

        {/* Sort By Quantity */}
        <div>
          <label className="font-semibold mr-1">Sort By:</label>
          <select
            className="border rounded p-1"
            value={sortMode}
            onChange={(e) => setSortMode(e.target.value)}
          >
            <option value="default">Default</option>
            <option value="quantity">By Quantity</option>
          </select>
        </div>

        {/* Dynamic card size (only for grid mode) */}
        {mode === "grid" && (
          <div>
            <label className="font-semibold mr-1">Card Size: {cardWidth}px</label>
            <input
              type="range"
              min={50}
              max={200}
              value={cardWidth}
              onChange={(e) => setCardWidth(parseInt(e.target.value, 10))}
            />
          </div>
        )}

        {/* RESET ALL Button */}
        <button
          onClick={handleResetAll}
          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Reset All to 0
        </button>
      </div>

      {/* Main View */}
      {mode === "grid" && (
        <CardGrid
          cards={filteredCards}
          collection={collection}
          onUpdate={handleUpdate}
          cardWidth={cardWidth}
        />
      )}
      {mode === "tinder" && (
        <TinderView
          cards={filteredCards}
          collection={collection}
          onUpdate={handleUpdate}
        />
      )}
      {mode === "trade" && (
        <TradeView
          yourCollection={collection}
          cards={cards}
        />
      )}
      {mode === "stats" && (
        <StatsView cards={cards} collection={collection} />
      )}

      {/* Export / Import */}
      <div className="mx-auto mt-10 max-w-md text-center">
        <h3 className="text-xl font-semibold mb-2">Export / Import Collection</h3>
        <textarea
          className="border w-full p-2 rounded"
          rows={3}
          placeholder="Paste encoded JSON here..."
          value={encodedStr}
          onChange={(e) => setEncodedStr(e.target.value)}
        />
        <div className="mt-4 space-x-2">
          <button
            className="px-4 py-2 bg-green-500 text-white font-semibold rounded hover:bg-green-600"
            onClick={handleEncode}
          >
            Encode
          </button>
          <button
            className="px-4 py-2 bg-blue-500 text-white font-semibold rounded hover:bg-blue-600"
            onClick={handleDecode}
          >
            Decode
          </button>
        </div>
      </div>
    </div>
  );
}
