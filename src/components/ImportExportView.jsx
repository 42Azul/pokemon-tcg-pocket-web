import React, { useState, useRef } from "react";
import { encodeCollection, decodeCollection } from "../services/EncodingService";
import { QRCodeSVG } from "qrcode.react";
import { Html5QrcodeScanner } from "html5-qrcode";

export default function ImportExportView({ cards, collection, setCollection }) {
  const [encodedStr, setEncodedStr] = useState("");
  const [qrData, setQrData] = useState(null);
  const [scanning, setScanning] = useState(false);
  const qrRef = useRef(null);

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

  function handleGenerateQR() {
    const jsonStr = JSON.stringify(encodeCollection(collection, cards));
    setQrData(jsonStr);
  }

  function handleScanQR() {
    setScanning(true);
    const scanner = new Html5QrcodeScanner("reader", { fps: 10, qrbox: 250 });
    scanner.render(
      (decodedText) => {
        setScanning(false);
        setEncodedStr(decodedText);
        handleDecode();
        scanner.clear();
      },
      (errorMessage) => {
        console.log("QR scan error: ", errorMessage);
      }
    );
  }

  function handleResetAll() {
    if (window.confirm("Are you sure you want to reset ALL cards to 0?")) {
      const newColl = { ...collection };
      for (const key of Object.keys(newColl)) newColl[key] = 0;
      setCollection(newColl);
    }
  }

  return (
    <div className="bg-white shadow p-4 rounded-md max-w-3xl mx-auto w-full lg:w-2/3">
      <h2 className="text-xl font-bold mb-3 text-center">📂 Import / Export Collection</h2>

      <textarea
        className="border w-full p-2 rounded mb-3 text-sm"
        rows={4}
        placeholder="Paste encoded JSON here..."
        value={encodedStr}
        onChange={(e) => setEncodedStr(e.target.value)}
      />

      <div className="flex flex-wrap gap-2 mb-3 justify-center">
        <button onClick={handleDecode} className="bg-orange-500 text-white px-3 py-1 rounded hover:bg-orange-600 flex-1 min-w-[120px]">
          Decode (Import)
        </button>
        <button onClick={handleDownload} className="bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 flex-1 min-w-[120px]">
          Download Collection
        </button>
        <button onClick={handleResetAll} className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 flex-1 min-w-[120px]">
          Full Reset
        </button>
        <button onClick={handleGenerateQR} className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 flex-1 min-w-[120px]">
          Generate QR Code
        </button>
        <button onClick={handleScanQR} className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 flex-1 min-w-[120px]">
          Scan QR Code
        </button>
      </div>

      {qrData && (
        <div className="mt-3 flex justify-center" ref={qrRef}>
          <a href={`data:image/svg+xml,${encodeURIComponent(`<svg>${qrData}</svg>`)}`} download="qr_code.svg">
            <QRCodeSVG value={qrData} size={200} className="cursor-pointer" />
          </a>
        </div>
      )}

      {scanning && <div id="reader" className="mt-3"></div>}
    </div>
  );
}
