import React, { useState } from "react";
import CardItem from "./CardItem";
import GridBar from "./GridBar";

export default function CardGrid({
  cards,
  collection,
  onUpdate,
  cardWidth,
  selectedSet,
  setSelectedSet,
  hideZero,
  setHideZero,
  hideCompleted,
  setHideCompleted,
  sortMode,
  setSortMode,
  searchQuery,
  setSearchQuery,
  setCardWidth
}) {
  const [selectedBoosters, setSelectedBoosters] = useState({});

  // Example booster-based filtering (if needed)
  const boostersChosen = Object.keys(selectedBoosters).filter((b) => selectedBoosters[b]);

  let finalCards = [...cards];
  if (selectedSet !== "All") {
    finalCards = finalCards.filter((c) => c.set === selectedSet);
  }
  if (boostersChosen.length > 0) {
    finalCards = finalCards.filter((c) => boostersChosen.includes(c.booster || "No Booster"));
  }
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    finalCards = finalCards.filter(
      (card) => card.cardName.toLowerCase().includes(q) || card.code.toLowerCase().includes(q)
    );
  }
  if (hideZero) {
    finalCards = finalCards.filter((c) => (collection[c.code] || 0) !== 0);
  }
  if (hideCompleted) {
    finalCards = finalCards.filter((c) => (collection[c.code] || 0) === 0);
  }
  if (sortMode === "quantity") {
    finalCards.sort((a, b) => (collection[b.code] || 0) - (collection[a.code] || 0));
  }

  const gridStyle = {
    gridTemplateColumns: `repeat(auto-fill, minmax(${cardWidth}px, 1fr))`,
  };

  return (
    <div className="relative">
      {/* GridBar, sticky below main nav */}
      <div className="sticky top-[64px] z-20 bg-gray-100 pb-2">
        <GridBar
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
          cardWidth={cardWidth}
          setCardWidth={setCardWidth}
          // Booster states (optional)
          selectedBoosters={selectedBoosters}
          setSelectedBoosters={setSelectedBoosters}
        />
      </div>

      {/* Cards */}
      {finalCards.length === 0 ? (
        <p className="text-center text-gray-500 mt-4">No cards match your filters.</p>
      ) : (
        <div className="mt-4 grid gap-4" style={gridStyle}>
          {finalCards.map((card) => (
            <CardItem
              key={card.code}
              card={card}
              quantity={collection[card.code] || 0}
              onUpdate={onUpdate}
              cardWidth={cardWidth}
            />
          ))}
        </div>
      )}
    </div>
  );
}
