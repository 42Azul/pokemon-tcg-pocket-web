// src/components/TradeView.jsx
import React, { useState } from "react";
import { decodeCollection } from "../services/EncodingService";
import { compareCollections } from "../services/TradeService";

// The expansions we have. You can adapt as needed.
const ALL_EXPANSIONS = ["A1", "A1a", "A2", "P-A"];

export default function TradeView({ yourCollection, cards }) {
  const [yourCode, setYourCode] = useState("");
  const [theirCode, setTheirCode] = useState("");
  const [tradeResults, setTradeResults] = useState([]);
  const [error, setError] = useState("");

  // For expansions checkboxes
  const [expansionsMe, setExpansionsMe] = useState(() =>
    // Default: all expansions selected
    ALL_EXPANSIONS.reduce((acc, ex) => ({ ...acc, [ex]: true }), {})
  );
  const [expansionsThem, setExpansionsThem] = useState(() =>
    ALL_EXPANSIONS.reduce((acc, ex) => ({ ...acc, [ex]: true }), {})
  );

  function handleExpansionChangeMe(ex, isChecked) {
    setExpansionsMe((prev) => ({ ...prev, [ex]: isChecked }));
  }
  function handleExpansionChangeThem(ex, isChecked) {
    setExpansionsThem((prev) => ({ ...prev, [ex]: isChecked }));
  }

  function handleCompare() {
    setError("");

    // 1) Build the actual local collections
    let yourColl = yourCollection;
    let theirColl;

    // 2) Decode if code provided (yours)
    try {
      if (yourCode.trim()) {
        const parsedYours = JSON.parse(yourCode);
        yourColl = decodeCollection(parsedYours, cards);
      }
    } catch (err) {
      setError("Could not parse your code. Please ensure it's valid JSON.");
      setTradeResults([]);
      return;
    }

    // 3) Decode if code provided (theirs)
    try {
      if (!theirCode.trim()) {
        setError("Please provide the other player's collection code.");
        setTradeResults([]);
        return;
      }
      const parsedTheirs = JSON.parse(theirCode);
      theirColl = decodeCollection(parsedTheirs, cards);
    } catch (err) {
      setError("Could not parse their code. Please ensure it's valid JSON.");
      setTradeResults([]);
      return;
    }

    // 4) Filter expansions
    const filteredYourColl = filterByExpansions(yourColl, expansionsMe);
    const filteredTheirColl = filterByExpansions(theirColl, expansionsThem);

    // 5) Compare
    const trades = compareCollections(filteredYourColl, filteredTheirColl, cards);

    if (trades.length === 0) {
      setError("No fair trades found.");
      setTradeResults([]);
    } else {
      setError("");
      setTradeResults(trades);
    }
  }

  return (
    <div className="trade-view max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold text-center mb-4">Trade Mode</h2>
      <p className="text-center text-gray-600 text-sm mb-6">
        Compare your collection with another player's and see possible 1:1 trades!
      </p>

      {/* Expansions & Input Fields */}
      <div className="flex flex-col lg:flex-row gap-6 mb-6 justify-center">
        {/* YOUR SIDE */}
        <div className="bg-blue-50 p-4 rounded-md flex-1">
          <h3 className="text-lg font-bold mb-2 text-blue-700 text-center">YOUR SIDE</h3>

          <div className="flex flex-wrap gap-3 mb-3 justify-center">
            {ALL_EXPANSIONS.map((ex) => (
              <label key={ex} className="inline-flex items-center text-sm">
                <input
                  type="checkbox"
                  checked={expansionsMe[ex]}
                  onChange={(e) => handleExpansionChangeMe(ex, e.target.checked)}
                  className="mr-1"
                />
                {ex}
              </label>
            ))}
          </div>

          <label className="font-semibold mb-1">Your Collection Code (optional)</label>
          <textarea
            rows={4}
            className="border p-2 rounded w-full shadow-sm focus:ring-2 focus:ring-blue-300"
            placeholder="Leave empty to use your local collection"
            value={yourCode}
            onChange={(e) => setYourCode(e.target.value)}
          />
        </div>

        {/* THEIR SIDE */}
        <div className="bg-pink-50 p-4 rounded-md flex-1">
          <h3 className="text-lg font-bold mb-2 text-pink-700 text-center">THEIR SIDE</h3>

          <div className="flex flex-wrap gap-3 mb-3 justify-center">
            {ALL_EXPANSIONS.map((ex) => (
              <label key={ex} className="inline-flex items-center text-sm">
                <input
                  type="checkbox"
                  checked={expansionsThem[ex]}
                  onChange={(e) => handleExpansionChangeThem(ex, e.target.checked)}
                  className="mr-1"
                />
                {ex}
              </label>
            ))}
          </div>

          <label className="font-semibold mb-1">Their Collection Code</label>
          <textarea
            rows={4}
            className="border p-2 rounded w-full shadow-sm focus:ring-2 focus:ring-pink-300"
            placeholder="Paste the other player's code"
            value={theirCode}
            onChange={(e) => setTheirCode(e.target.value)}
          />
        </div>
      </div>

      {/* Compare Button */}
      <div className="text-center">
        <button
          className="bg-blue-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-600 transition"
          onClick={handleCompare}
        >
          Compare Collections
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-red-500 font-bold mt-3 text-center">{error}</p>
      )}

      {/* Trade Results */}
      {tradeResults.length > 0 && (
        <div className="trade-results flex flex-col gap-6 mt-6">
          {tradeResults.map((trade, idx) => {
            const fromA = trade.fromA;
            const fromB = trade.fromB;

            const cardA = cards.find((c) => c.code === fromA.cardCode) || {};
            const cardB = cards.find((c) => c.code === fromB.cardCode) || {};

            return (
              <div
                key={idx}
                className="trade-result-item flex flex-col sm:flex-row items-center justify-between gap-6 border p-4 rounded-lg shadow-md bg-gray-50 hover:bg-gray-100 transition"
              >
                {/* YOUR CARD */}
                <div className="trade-card flex items-center gap-4">
                  <img
                    src={cardA.imageUrl}
                    alt={fromA.cardCode}
                    className="w-20 h-auto rounded shadow-md"
                  />
                  <div className="trade-card-info text-sm">
                    <p className="font-semibold">{cardA.cardName || fromA.cardCode}</p>
                    {cardA.rarity && (
                      <span className="inline-block bg-yellow-300 text-gray-800 text-xs font-bold px-2 py-1 rounded">
                        {cardA.rarity}
                      </span>
                    )}
                    <p className="mt-1 text-xs text-gray-600">
                      Qty:{" "}
                      <span className="font-semibold px-2 py-1 bg-blue-200 rounded">
                        {fromA.quantity}
                      </span>
                    </p>
                  </div>
                </div>

                {/* MIDDLE INDICATOR */}
                <div className="flex flex-col items-center text-gray-700 text-base font-bold">
                  <span>SWAP</span>
                  <i className="fas fa-exchange-alt text-2xl text-blue-500"></i>
                </div>

                {/* THEIR CARD */}
                <div className="trade-card flex items-center gap-4">
                  <img
                    src={cardB.imageUrl}
                    alt={fromB.cardCode}
                    className="w-20 h-auto rounded shadow-md"
                  />
                  <div className="trade-card-info text-sm">
                    <p className="font-semibold">{cardB.cardName || fromB.cardCode}</p>
                    {cardB.rarity && (
                      <span className="inline-block bg-yellow-300 text-gray-800 text-xs font-bold px-2 py-1 rounded">
                        {cardB.rarity}
                      </span>
                    )}
                    <p className="mt-1 text-xs text-gray-600">
                      Qty:{" "}
                      <span className="font-semibold px-2 py-1 bg-blue-200 rounded">
                        {fromB.quantity}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/**
 * Filters a collection to only include expansions the user has checked.
 */
function filterByExpansions(collection, expansionsChecked) {
  // expansionsChecked is like { A1: true, A1a: false, A2: true, P-A: true }
  // We'll only keep codes whose set is "checked"
  const result = {};
  for (const [code, qty] of Object.entries(collection)) {
    const setCode = code.split("/")[0]; // e.g. "A1"
    if (expansionsChecked[setCode]) {
      result[code] = qty;
    }
  }
  return result;
}
