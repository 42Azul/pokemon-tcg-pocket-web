import React from "react";

export default function GridBar({
  selectedSet,
  setSelectedSet,
  hideZero,
  setHideZero,
  hideCompleted,
  setHideCompleted,
  sortMode,
  setSortMode,
  cardWidth,
  setCardWidth,
  searchQuery,
  setSearchQuery
}) {
  return (
    <div className="bg-white shadow p-4 rounded-md mb-4">
      <div className="flex flex-wrap items-center gap-4">
        {/* Search */}
        <input
          type="text"
          className="border rounded p-1 w-40"
          placeholder="Search name or code..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        {/* Set Filter */}
        <select
          className="border rounded p-1"
          value={selectedSet}
          onChange={(e) => setSelectedSet(e.target.value)}
        >
          <option value="All">All Sets</option>
          <option value="A1">A1</option>
          <option value="A1a">A1a</option>
          <option value="A2">A2</option>
          <option value="P-A">P-A</option>
        </select>

        {/* Hide Zero / Hide Completed */}
        <label className="flex items-center space-x-1">
          <input
            type="checkbox"
            checked={hideZero}
            onChange={(e) => setHideZero(e.target.checked)}
          />
          <span>Hide Zero</span>
        </label>
        <label className="flex items-center space-x-1">
          <input
            type="checkbox"
            checked={hideCompleted}
            onChange={(e) => setHideCompleted(e.target.checked)}
          />
          <span>Hide Completed</span>
        </label>

        {/* Sort Mode */}
        <select
          className="border rounded p-1"
          value={sortMode}
          onChange={(e) => setSortMode(e.target.value)}
        >
          <option value="default">Default</option>
          <option value="quantity">By Quantity</option>
        </select>

        {/* Card Size Slider */}
        <div className="flex items-center space-x-2">
          <label className="whitespace-nowrap">Card Size: {cardWidth}px</label>
          <input
            type="range"
            min={100}
            max={180}
            value={cardWidth}
            onChange={(e) => setCardWidth(parseInt(e.target.value))}
          />
        </div>
      </div>
    </div>
  );
}
