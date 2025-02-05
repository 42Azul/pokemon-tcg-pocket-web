import React, { useState, useEffect } from "react";
import TinderBar from "./TinderBar";

export default function TinderView({ cards, collection, onUpdate }) {
  const [selectedSet, setSelectedSet] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [searchTrigger, setSearchTrigger] = useState(0);
  const [index, setIndex] = useState(0);
  const [typedNumber, setTypedNumber] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const tinderCards = cards.filter((c) => selectedSet === "All" || c.set === selectedSet);

  // Ensure index doesn't go out of range
  useEffect(() => {
    if (index >= tinderCards.length) {
      setIndex(Math.max(0, tinderCards.length - 1));
    }
  }, [tinderCards.length]);

  // Sync typedNumber whenever current card changes
  useEffect(() => {
    if (!tinderCards.length) return;
    const card = tinderCards[index];
    setTypedNumber(String(collection[card.code] || 0));
  }, [index, tinderCards, collection]);

  // "Find next" match on search
  useEffect(() => {
    if (!searchTerm || !tinderCards.length) return;

    let foundIndex = -1;
    const start = index + 1;
    for (let i = 0; i < tinderCards.length; i++) {
      const idx = (start + i) % tinderCards.length;
      const c = tinderCards[idx];
      if (
        c.cardName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.code.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        foundIndex = idx;
        break;
      }
    }
    if (foundIndex !== -1 && foundIndex !== index) {
      setIndex(foundIndex);
    } else {
      alert(`No further matches for: ${searchTerm}`);
    }
  }, [searchTerm, searchTrigger]);

  // Handle keyboard arrows/digits for desktop
  useEffect(() => {
    if (isSearching) return; // Disable if the search input is focused

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
  }, [index, typedNumber, tinderCards, isSearching]);

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

  // For mobile: add plus/minus buttons
  function handlePlus() {
    let value = parseInt(typedNumber) || 0;
    value += 1;
    setTypedNumber(value.toString());
    updateCollection(value.toString());
  }

  function handleMinus() {
    let value = parseInt(typedNumber) || 0;
    if (value > 0) value -= 1;
    setTypedNumber(value.toString());
    updateCollection(value.toString());
  }

  function handleInputChange(e) {
    const val = e.target.value.replace(/\D/g, "");
    setTypedNumber(val);
    updateCollection(val);
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
          setSearchTrigger={setSearchTrigger}
          setIsSearching={setIsSearching}
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
      {/* Tinder Bar */}
      <TinderBar
        sets={["A1", "A1a", "A2", "P-A"]}
        selectedSet={selectedSet}
        onSetChange={setSelectedSet}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        setSearchTrigger={setSearchTrigger}
        setIsSearching={setIsSearching}
      />

      {/* Tinder Card */}
      <div className="flex flex-col items-center w-full sm:w-80 mx-auto mb-6">
        <div className="w-full">
          <div
            className={`relative w-full pt-[120%] overflow-hidden rounded-md bg-gray-100 ${
              isZero ? "opacity-60" : ""
            }`}
          >
            <img
              src={card.imageUrl}
              alt={card.code}
              className="absolute inset-0 w-full h-full object-contain"
            />
          </div>

          <div className="mt-4 text-center w-full">
            <p className="font-bold text-base mb-1">
              {card.cardName} ({card.code})
            </p>
            {card.rarity && <p className="text-sm text-gray-600">Rarity: {card.rarity}</p>}
            {card.booster && (
              <p className="text-xs italic text-gray-500 mb-2">Booster: {card.booster}</p>
            )}

            {/* Quantity Controls on Mobile/All devices */}
            <div className="flex justify-center items-center gap-3 mt-3">
              <button
                className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={handleMinus}
                disabled={isSearching}
              >
                −
              </button>
              <input
                type="text"
                value={displayedQty}
                onChange={handleInputChange}
                className="w-16 text-center border rounded py-1"
                disabled={isSearching}
              />
              <button
                className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={handlePlus}
                disabled={isSearching}
              >
                +
              </button>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-center gap-3 mt-4">
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
                onClick={handlePrev}
                disabled={index === 0 || isSearching}
              >
                ← Prev
              </button>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
                onClick={handleNext}
                disabled={index === tinderCards.length - 1 || isSearching}
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
