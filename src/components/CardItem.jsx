// src/components/CardItem.jsx
import React, { useState, useEffect } from "react";

export default function CardItem({ card, quantity, onUpdate, cardWidth }) {
  const [inputValue, setInputValue] = useState(quantity || 0);

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

  // Adjust minimum sizes to ensure visibility on small cards
  const buttonSize = Math.max(24, cardWidth * 0.15);
  const fontSize = Math.max(14, cardWidth * 0.08);

  return (
    <div
      className="bg-white w-full rounded-lg shadow hover:shadow-md transition 
                 flex flex-col items-center relative"
      style={{
        padding: cardWidth < 110 ? "0.5rem" : "1rem", // Increase padding if card is big
      }}
    >
      {/* Card Image with Grey Out for Zero */}
      <div
        className={`relative w-full h-0 pt-[140%] overflow-hidden 
                    rounded-md bg-gray-100 ${
                      (quantity || 0) === 0 ? "opacity-60" : ""
                    }`}
      >
        <img
          src={`./card_images/${card.code.replace("/", "_")}.webp`}
          alt={card.code}
          className="absolute inset-0 w-full h-full object-contain"
        />
      </div>

      {/* Card Details (consistent min heights for each line) */}
      <div className="mt-2 w-full text-center">
        <p className="font-bold text-sm">
          {card.cardName} ({card.code})
        </p>

        {/* Rarity row -- if none, leave blank space to keep layout consistent */}
        <p className="text-xs text-gray-600 min-h-[14px]">
          {card.rarity ? `Rarity: ${card.rarity}` : " "}
        </p>

        {/* Booster row -- if none, leave blank space */}
        <p className="text-[0.75rem] italic text-gray-500 min-h-[14px]">
          {card.booster ? `Booster: ${card.booster}` : " "}
        </p>
      </div>

      {/* Quantity Controls (Scaled) */}
      <div className="flex items-center justify-center gap-2 mt-2">
        {/* Minus Button (SVG) */}
        <button
          className="bg-blue-500 text-white rounded hover:bg-blue-600 transition 
                     flex items-center justify-center"
          onClick={handleMinus}
          style={{
            width: `${buttonSize}px`,
            height: `${buttonSize}px`,
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            className="w-3/4 h-3/4"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
          </svg>
        </button>

        {/* Quantity Input */}
        <input
          type="text"
          className="text-center border rounded font-semibold transition"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleBlur}
          style={{
            width: `${buttonSize * 2}px`,
            height: `${buttonSize * 0.8}px`,
            fontSize: `${fontSize}px`,
          }}
        />

        {/* Plus Button (SVG) */}
        <button
          className="bg-blue-500 text-white rounded hover:bg-blue-600 transition 
                     flex items-center justify-center"
          onClick={handlePlus}
          style={{
            width: `${buttonSize}px`,
            height: `${buttonSize}px`,
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            className="w-3/4 h-3/4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
