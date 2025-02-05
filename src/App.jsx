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
import ImportExportView from "./components/ImportExportView";

export default function App() {
  const [cards, setCards] = useState([]);
  const [collection, setCollection] = useState(loadCollection());
  const [mode, setMode] = useState("grid");

  // Grid-specific controls
  const [selectedSet, setSelectedSet] = useState("All");
  const [hideZero, setHideZero] = useState(false);
  const [hideCompleted, setHideCompleted] = useState(false);
  const [sortMode, setSortMode] = useState("default");
  const [cardWidth, setCardWidth] = useState(120);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    setCards(getAllLocalCards());
  }, []);

  useEffect(() => {
    saveCollection(collection);
  }, [collection]);

  function handleUpdate(cardCode, quantity) {
    setCollection((prev) => updateCardQuantity(prev, cardCode, quantity));
  }

  // 📋 **Copy Collection to Clipboard**
  function handleCopyToClipboard() {
    const jsonStr = JSON.stringify(encodeCollection(collection, cards));
    navigator.clipboard.writeText(jsonStr).then(() => alert("Collection copied to clipboard!"));
  }

  // **Filter Cards for Grid View** (optional pre-filter if you want)
  const filteredCards = cards.filter((card) => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (!card.cardName.toLowerCase().includes(q) && !card.code.toLowerCase().includes(q)) {
        return false;
      }
    }
    if (selectedSet !== "All" && card.set !== selectedSet) return false;
    const qty = collection[card.code] || 0;
    if (hideZero && qty === 0) return false;
    if (hideCompleted && qty > 0) return false;
    return true;
  });

  if (sortMode === "quantity") {
    filteredCards.sort((a, b) => (collection[b.code] || 0) - (collection[a.code] || 0));
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* --- Main Nav Bar (sticky) --- */}
      <div className="fixed top-0 left-0 w-full bg-white shadow-md z-50">
        <div className="max-w-4xl mx-auto p-3 flex flex-wrap items-center justify-between">
          {/* Title */}
          <h1 className="text-xl font-bold tracking-wide text-blue-600">
            Pokémon TCG Collection
          </h1>

          {/* View Mode Selection */}
          <div className="flex gap-2">
            {["grid", "tinder", "trade", "stats", "importExport"].map((view) => (
              <button
                key={view}
                onClick={() => setMode(view)}
                className={`px-3 py-1 rounded ${
                  mode === view ? "bg-blue-500 text-white" : "bg-gray-200 hover:bg-gray-300"
                }`}
              >
                {view === "importExport" ? "Import/Export" : view.charAt(0).toUpperCase() + view.slice(1)}
              </button>
            ))}
          </div>

          {/* Copy to Clipboard */}
          <button
            onClick={handleCopyToClipboard}
            className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
          >
            📋 Copy Collection
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto pt-20 p-4">
        {mode === "grid" && (
          <CardGrid
            cards={filteredCards}
            collection={collection}
            onUpdate={handleUpdate}
            cardWidth={cardWidth}
            setCardWidth={setCardWidth}
            selectedSet={selectedSet}
            setSelectedSet={setSelectedSet}
            hideZero={hideZero}
            setHideZero={setHideZero}
            hideCompleted={hideCompleted}
            setHideCompleted={setHideCompleted}
            sortMode={sortMode}
            setSortMode={setSortMode}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        )}

        {mode === "tinder" && (
          <TinderView
            cards={cards}
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
        {mode === "importExport" && (
          <ImportExportView
            cards={cards}
            collection={collection}
            setCollection={setCollection}
          />
        )}
      </div>
    </div>
  );
}
