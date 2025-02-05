import React, { useState } from "react";
import { encodeCollection, decodeCollection } from "../services/EncodingService";

export default function ImportExportView({ cards, collection, setCollection }) {
  const [encodedStr, setEncodedStr] = useState("");

  function handleDecode() {
    try {
      const parsed = JSON.parse(encodedStr);
      setCollection(decodeCollection(parsed, cards));
      alert("Collection imported successfully!");
    } catch {
      alert("Error importing collection. Check format.");
    }
  }

  function handleDownload() {
    const jsonStr = JSON.stringify(encodeCollection(collection, cards));
    const blob = new Blob([jsonStr], { type: "text/plain" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "collection.txt";
    link.click();
  }

  function handleResetAll() {
    if (window.confirm("Are you sure you want to reset ALL cards to 0?")) {
      const newColl = { ...collection };
      for (const key of Object.keys(newColl)) newColl[key] = 0;
      setCollection(newColl);
    }
  }

  return (
    <div className="bg-white shadow p-4 rounded-md">
      <h2 className="text-2xl font-bold mb-3">📂 Import / Export Collection</h2>

      {/* 📜 JSON Text Area */}
      <textarea
        className="border w-full p-2 rounded mb-3"
        rows={4}
        placeholder="Paste encoded JSON here..."
        value={encodedStr}
        onChange={(e) => setEncodedStr(e.target.value)}
      />

      {/* 🛠️ Actions */}
      <div className="flex gap-2">
        <button onClick={handleDecode} className="bg-orange-500 text-white px-3 py-1 rounded hover:bg-orange-600">
          Decode (Import)
        </button>
        <button onClick={handleDownload} className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600">
          Download Collection
        </button>
        <button onClick={handleResetAll} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">
          Full Reset
        </button>
      </div>
    </div>
  );
}
