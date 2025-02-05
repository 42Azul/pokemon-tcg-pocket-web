// src/components/CardGrid.jsx
import React from "react";
import CardItem from "./CardItem";

export default function CardGrid({ cards, collection, onUpdate, cardWidth }) {
  if (!cards || cards.length === 0) {
    return <p className="text-center text-gray-500">No cards to display.</p>;
  }

  // We'll dynamically set the grid columns using inline style
  // This sets a min width of cardWidth, and 1fr as the max
  const gridStyle = {
    gridTemplateColumns: `repeat(auto-fill, minmax(${cardWidth}px, 1fr))`,
  };

  return (
    <div className="p-4 grid gap-4" style={gridStyle}>
      {cards.map((card) => (
        <CardItem
        key={card.code}
        card={card}
        quantity={collection[card.code] || 0}
        onUpdate={onUpdate}
        cardWidth={cardWidth} // Pass card size to scale buttons
      />
      
      ))}
    </div>
  );
}
