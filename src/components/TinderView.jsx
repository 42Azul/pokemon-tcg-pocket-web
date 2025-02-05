import React, { useState, useEffect } from "react";
import TinderBar from "./TinderBar";

export default function TinderView({ cards, collection, onUpdate }) {
  const [selectedSet, setSelectedSet] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchTrigger, setSearchTrigger] = useState(0); // 🔥 Added back search trigger
  const [index, setIndex] = useState(0);
  const [typedNumber, setTypedNumber] = useState("");
  const [isSearching, setIsSearching] = useState(false); // 🔥 Tracks search bar focus

  const tinderCards = cards.filter((c) => selectedSet === "All" || c.set === selectedSet);

  useEffect(() => {
    if (index >= tinderCards.length) {
      setIndex(Math.max(0, tinderCards.length - 1));
    }
  }, [tinderCards.length]);

  useEffect(() => {
    if (!tinderCards.length) return;
    const card = tinderCards[index];
    setTypedNumber(String(collection[card.code] || 0));
  }, [index, tinderCards, collection]);

  // 🔥 Find next matching card when Enter is pressed
  useEffect(() => {
    if (!searchTerm || !tinderCards.length) return;

    let foundIndex = -1;
    const start = index + 1;
    for (let i = 0; i < tinderCards.length; i++) {
      const idx = (start + i) % tinderCards.length;
      const c = tinderCards[idx];

      if (c.cardName.toLowerCase().includes(searchTerm.toLowerCase()) || c.code.toLowerCase().includes(searchTerm.toLowerCase())) {
        foundIndex = idx;
        break;
      }
    }

    if (foundIndex !== -1 && foundIndex !== index) {
      setIndex(foundIndex);
    } else {
      alert(`No further matches for: ${searchTerm}`);
    }
  }, [searchTerm, searchTrigger]); // 🔥 Ensures Enter triggers search even if the term is unchanged

  // 🔥 Disable Tinder mode if searching
  useEffect(() => {
    if (isSearching) return;

    function handleKeyDown(e) {
      if (e.key === "ArrowRight") handleNext();
      else if (e.key === "ArrowLeft") handlePrev();
      else if (/\d/.test(e.key)) {
        setTypedNumber((prev) => {
          const newVal = (prev + e.key).slice(0, 4);
          updateCollection(newVal);
          return newVal;
        });
      } else if (e.key === "Backspace") {
        setTypedNumber((prev) => {
          const newVal = prev.slice(0, -1);
          updateCollection(newVal);
          return newVal;
        });
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [index, typedNumber, tinderCards, isSearching]); // 🔥 Prevent changes when searching

  function updateCollection(strValue) {
    if (!tinderCards.length || isSearching) return;
    const card = tinderCards[index];
    let num = parseInt(strValue || "0", 10);
    if (isNaN(num) || num < 0) num = 0;
    if (num > 9999) num = 9999;
    onUpdate(card.code, num);
  }

  function handleNext() {
    if (!isSearching && index < tinderCards.length - 1) setIndex(index + 1);
  }

  function handlePrev() {
    if (!isSearching && index > 0) setIndex(index - 1);
  }

  if (!tinderCards.length) {
    return (
      <div className="p-4 bg-white rounded-md shadow">
        <TinderBar
          sets={["A1", "A1a", "A2", "P-A"]}
          selectedSet={selectedSet}
          onSetChange={setSelectedSet}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          setSearchTrigger={setSearchTrigger} // 🔥 Allow Enter to trigger search again
          setIsSearching={setIsSearching} // 🔥 Disable Tinder mode
        />
        <p className="text-center text-gray-700 mt-4">No cards for this set!</p>
      </div>
    );
  }

  const card = tinderCards[index];
  const displayedQty = typedNumber || "0";
  const isZero = parseInt(displayedQty, 10) === 0;

  return (
    <div className="bg-white rounded-md shadow p-4">
      {/* Tinder Bar (Set Filter + Search) */}
      <TinderBar
        sets={["A1", "A1a", "A2", "P-A"]}
        selectedSet={selectedSet}
        onSetChange={setSelectedSet}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        setSearchTrigger={setSearchTrigger} // 🔥 Allow Enter to trigger search again
        setIsSearching={setIsSearching} // 🔥 Disable Tinder mode
      />

      {/* Tinder Card */}
      <div className="flex flex-col items-center w-80 mx-auto mb-6">
        <div className="w-full">
          <div className={`relative w-full pt-[120%] overflow-hidden rounded-md bg-gray-100 ${isZero ? "opacity-60" : ""}`}>
            <img src={card.imageUrl} alt={card.code} className="absolute inset-0 w-full h-full object-contain" />
          </div>

          <div className="mt-4 text-center w-full">
            <p className="font-bold text-base mb-1">{card.cardName} ({card.code})</p>
            {card.rarity && <p className="text-sm text-gray-600">Rarity: {card.rarity}</p>}
            {card.booster && <p className="text-xs italic text-gray-500 mb-2">Booster: {card.booster}</p>}
            {/* Quantity Output */}
            {displayedQty && <p className="text-lg font-bold text-blue-500">{displayedQty}</p>}

            {/* Navigation Buttons */}
            <div className="flex justify-center gap-3 mt-4">
              <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400" onClick={handlePrev} disabled={index === 0 || isSearching}>← Prev</button>
              <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400" onClick={handleNext} disabled={index === tinderCards.length - 1 || isSearching}>Next →</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
