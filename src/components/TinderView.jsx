// src/components/TinderView.jsx
import React, { useState, useEffect } from "react";

export default function TinderView({ cards, collection, onUpdate }) {
  const [index, setIndex] = useState(0);
  const [typedNumber, setTypedNumber] = useState("");
  const [swipeDirection, setSwipeDirection] = useState("");

  // Sync quantity when switching cards
  useEffect(() => {
    if (!cards.length) return;
    const card = cards[index];
    const qty = collection[card.code] || 0;
    setTypedNumber(String(qty));
  }, [index, cards, collection]);

  if (!cards.length) {
    return <p className="text-center text-gray-700">No cards in this filter!</p>;
  }

  const card = cards[index];

  // Handles digit typing + Backspace deletion
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "ArrowLeft") {
        handlePrev();
      } else if (e.key === "Backspace") {
        setTypedNumber((prev) => {
          const newVal = prev.slice(0, -1);
          updateCollection(newVal);
          return newVal;
        });
      } else if (/\d/.test(e.key)) {
        setTypedNumber((prev) => {
          const newVal = (prev + e.key).slice(0, 4); // Max 4 digits
          updateCollection(newVal);
          return newVal;
        });
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [index, typedNumber, cards]);

  // Update collection
  function updateCollection(strValue) {
    let num = parseInt(strValue, 10);
    if (isNaN(num) || num < 0) num = 0;
    if (num > 9999) num = 9999;
    onUpdate(card.code, num);
  }

  function handleNext() {
    if (index < cards.length - 1) {
      setSwipeDirection("left");
      setTimeout(() => {
        setIndex((prev) => prev + 1);
        setSwipeDirection("");
      }, 250);
    }
  }

  function handlePrev() {
    if (index > 0) {
      setSwipeDirection("right");
      setTimeout(() => {
        setIndex((prev) => prev - 1);
        setSwipeDirection("");
      }, 250);
    }
  }

  const displayedQty = typedNumber === "" ? "0" : typedNumber;
  const isZero = parseInt(displayedQty, 10) === 0;

  return (
    <div className="flex flex-col items-center w-72 bg-white rounded-lg shadow-lg p-6 mb-12 mx-auto">
      {/* The swipeable card */}
      <div className={`tinder-card w-full ${swipeDirection}`} key={card.code}>
        {/* Image */}
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

        {/* Card info & quantity input */}
        <div className="mt-4 text-center w-full">
          <p className="font-bold text-base mb-1">
            {card.cardName} ({card.code})
          </p>
          {card.rarity && (
            <p className="text-sm text-gray-600">Rarity: {card.rarity}</p>
          )}
          {card.booster && (
            <p className="text-xs italic text-gray-500 mb-2">
              Booster: {card.booster}
            </p>
          )}

          <div className="flex items-center justify-center gap-2 mt-2">
            <label className="font-semibold text-base">Quantity:</label>
            <span className="px-3 py-1 text-lg font-semibold bg-blue-100 border border-blue-400 rounded-md">
              {displayedQty}
            </span>
          </div>

          <p className="mt-2 text-xs text-gray-500">
            <em>Type digits (0-9) / Backspace to correct, ← / → to navigate</em>
          </p>

          {/* Navigation Buttons */}
          <div className="flex justify-center gap-3 mt-4">
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
              onClick={handlePrev}
              disabled={index === 0}
            >
              ← Prev
            </button>
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
              onClick={handleNext}
              disabled={index === cards.length - 1}
            >
              Next →
            </button>
          </div>
        </div>
      </div>

      {/* Card count */}
      <div className="w-full flex justify-center items-center mt-6">
        <p className="bg-gray-200 text-gray-700 px-6 py-2 rounded-md shadow-sm text-base font-semibold">
          Card {index + 1} of {cards.length}
        </p>
      </div>
    </div>
  );
}
