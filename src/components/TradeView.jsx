import React, { useState } from "react";
import { decodeCollection } from "../services/EncodingService";
import { compareCollections } from "../services/TradeService";
import { Html5QrcodeScanner } from "html5-qrcode";

const ALL_EXPANSIONS = ["A1", "A1a", "A2", "P-A"];

export default function TradeView({ yourCollection, cards }) {
  const [yourCode, setYourCode] = useState("");
  const [theirCode, setTheirCode] = useState("");
  const [tradeResults, setTradeResults] = useState([]);
  const [error, setError] = useState("");
  const [scanning, setScanning] = useState(false);

  const [expansionsMe, setExpansionsMe] = useState(() =>
    ALL_EXPANSIONS.reduce((acc, ex) => ({ ...acc, [ex]: true }), {})
  );
  const [expansionsThem, setExpansionsThem] = useState(() =>
    ALL_EXPANSIONS.reduce((acc, ex) => ({ ...acc, [ex]: true }), {})
  );

  function handleScanQR() {
    setScanning(true);
    const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 });
    scanner.render(
      (decodedText) => {
        setScanning(false);
        setTheirCode(decodedText);
        scanner.clear();
      },
      (errorMessage) => {
        console.log("QR scan error: ", errorMessage);
      }
    );
  }

  function handleCompare() {
    setError("");
    let yourColl = yourCollection;
    let theirColl;

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

    const filteredYourColl = filterByExpansions(yourColl, expansionsMe);
    const filteredTheirColl = filterByExpansions(theirColl, expansionsThem);
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

      <div className="flex flex-col lg:flex-row gap-6 mb-6 justify-center">
        <div className="bg-blue-50 p-4 rounded-md flex-1">
          <h3 className="text-lg font-bold mb-2 text-blue-700 text-center">YOUR SIDE</h3>
          <textarea
            rows={4}
            className="border p-2 rounded w-full shadow-sm focus:ring-2 focus:ring-blue-300"
            placeholder="Leave empty to use your local collection"
            value={yourCode}
            onChange={(e) => setYourCode(e.target.value)}
          />
        </div>

        <div className="bg-pink-50 p-4 rounded-md flex-1">
          <h3 className="text-lg font-bold mb-2 text-pink-700 text-center">THEIR SIDE</h3>
          <textarea
            rows={4}
            className="border p-2 rounded w-full shadow-sm focus:ring-2 focus:ring-pink-300"
            placeholder="Paste the other player's code or scan QR"
            value={theirCode}
            onChange={(e) => setTheirCode(e.target.value)}
          />
          <button onClick={handleScanQR} className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 w-full mt-2">
            Scan QR Code
          </button>
          {scanning && <div id="reader" className="mt-3"></div>}
        </div>
      </div>

      <div className="text-center">
        <button
          className="bg-blue-500 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-600 transition"
          onClick={handleCompare}
        >
          Compare Collections
        </button>
      </div>

      {error && <p className="text-red-500 font-bold mt-3 text-center">{error}</p>}
    </div>
  );
}

function filterByExpansions(collection, expansionsChecked) {
  const result = {};
  for (const [code, qty] of Object.entries(collection)) {
    const setCode = code.split("/")[0];
    if (expansionsChecked[setCode]) {
      result[code] = qty;
    }
  }
  return result;
}
