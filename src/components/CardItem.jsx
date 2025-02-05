// src/components/CardItem.jsx
import React, { useState, useEffect } from "react";

export default function CardItem({ card, quantity, onUpdate, cardWidth }) {
  const [inputValue, setInputValue] = useState(quantity || 0);

  // Keep local inputValue synced with the parent's quantity
  useEffect(() => {
    setInputValue(quantity);
  }, [quantity]);

  // Only allow digits
  function handleInputChange(e) {
    const val = e.target.value.replace(/\D/g, "");
    setInputValue(val);
  }

  function handleBlur() {
    const num = parseInt(inputValue, 10);
    if (!isNaN(num)) {
      onUpdate(card.code, num);
    } else {
      setInputValue(quantity); // revert
    }
  }

  function handleMinus() {
    const newQty = (quantity || 0) - 1;
    onUpdate(card.code, newQty < 0 ? 0 : newQty);
  }

  function handlePlus() {
    onUpdate(card.code, (quantity || 0) + 1);
  }

  // Scale button size based on card width
  const buttonSize = Math.max(12, cardWidth * 0.12); // 12px min, 12% of width max
  const fontSize = Math.max(14, cardWidth * 0.08); // Dynamic font scaling

  return (
    <div className="bg-white w-full rounded-lg shadow hover:shadow-md transition p-2 flex flex-col items-center relative">
      {/* Card Image with Grey Out for Zero */}
      <div
        className={`relative w-full h-0 pt-[140%] overflow-hidden rounded-md bg-gray-100 ${
          (quantity || 0) === 0 ? "opacity-60" : ""
        }`}
      >
        <img
          src={`./card_images/${card.code.replace("/", "_")}.webp`}
          alt={card.code}
          className="absolute inset-0 w-full h-full object-contain"
        />
      </div>

      {/* Card Details */}
      <div className="mt-2 w-full text-center">
        <p className="font-bold text-sm">{card.cardName} ({card.code})</p>
        {card.rarity && <p className="text-xs text-gray-600">Rarity: {card.rarity}</p>}
        {card.booster && (
          <p className="text-[0.75rem] italic text-gray-500">Booster: {card.booster}</p>
        )}
      </div>

      {/* Quantity Controls (Scaled) */}
      <div className="flex items-center justify-center gap-2 mt-2">
        <button
          className="bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          onClick={handleMinus}
          style={{
            width: `${buttonSize}px`,
            height: `${buttonSize}px`,
            fontSize: `${fontSize}px`
          }}
        >
          −
        </button>

        <input
          type="text"
          className="text-center border rounded font-semibold transition"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          style={{
            width: `${buttonSize * 2}px`,
            height: `${buttonSize * 0.8}px`,
            fontSize: `${fontSize}px`
          }}
        />

        <button
          className="bg-blue-500 text-white rounded hover:bg-blue-600 transition"
          onClick={handlePlus}
          style={{
            width: `${buttonSize}px`,
            height: `${buttonSize}px`,
            fontSize: `${fontSize}px`
          }}
        >
          +
        </button>
      </div>
    </div>
  );
}
