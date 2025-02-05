import React from "react";

export default function TinderBar({
  sets,
  selectedSet,
  onSetChange,
  searchTerm,
  setSearchTerm,
  setIsSearching,
  setSearchTrigger
}) {
  function handleKeyDown(e) {
    if (e.key === "Enter") {
      setSearchTerm(e.target.value.trim());
      setSearchTrigger((prev) => prev + 1);
    }
  }

  return (
    <div className="bg-white shadow p-3 rounded-md mb-4">
      <div className="flex flex-wrap gap-4 items-center">
        {/* Set Filter */}
        <select
          className="border rounded p-1"
          value={selectedSet}
          onChange={(e) => onSetChange(e.target.value)}
        >
          <option value="All">All Sets</option>
          {sets.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        {/* "Find Next" Search */}
        <input
          type="text"
          placeholder="Search & Enter"
          className="border rounded p-1"
          onKeyDown={handleKeyDown}
          defaultValue={searchTerm}
          onFocus={() => setIsSearching(true)}
          onBlur={(e) => {
            setIsSearching(false);
            // Re-sync the searchTerm if user typed something without pressing Enter
            // so that if they typed text and left the field, it doesn't stay in limbo
            if (e.target.value.trim() !== searchTerm) {
              setSearchTerm(e.target.value.trim());
            }
          }}
        />
      </div>
    </div>
  );
}
