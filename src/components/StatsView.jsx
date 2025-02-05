import React, { useState, useEffect } from "react";
import {
    Chart as ChartJS,
    BarElement,
    CategoryScale,
    LinearScale,
    Tooltip,
    Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

// Register Chart.js components
ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const ALL_EXPANSIONS = ["A1", "A1a", "A2", "P-A"];
const ALL_RARITIES = ["◊", "◊◊", "◊◊◊", "☆", "☆☆", "☆☆☆", "♛"];
const NO_RARITY_LABEL = "No Rarity";
const NO_BOOSTER_LABEL = "No Booster";

// Larger color palette
const COLOR_PALETTE = [
    "#ec407a", "#42a5f5", "#ffee58", "#ab47bc", "#26a69a", "#ffa726",
    "#7e57c2", "#78909c", "#66bb6a", "#ef5350", "#d81b60", "#5c6bc0",
    "#ffca28", "#8d6e63", "#26c6da", "#8e24aa", "#6d4c41", "#29b6f6",
    "#f44336", "#33691e"
];

/**
 * A Stats View with:
 * - Expansion checkboxes (+ ALL/NONE buttons)
 * - Rarity checkboxes (+ ALL/NONE buttons)
 * - Bar chart of expansions vs boosters
 * - Tables per expansion
 * - Recommendations & Trivia sections
 */
export default function StatsView({ cards, collection }) {
    // 1) Expansions
    const [expansionsFilter, setExpansionsFilter] = useState(() =>
        ALL_EXPANSIONS.reduce((acc, ex) => ({ ...acc, [ex]: true }), {})
    );
    // 2) Rarities (includes "No Rarity")
    const [raritiesFilter, setRaritiesFilter] = useState(() => {
        const all = [...ALL_RARITIES, NO_RARITY_LABEL];
        return all.reduce((acc, r) => ({ ...acc, [r]: true }), {});
    });

    // --- Toggle expansions ---
    function toggleExpansion(ex) {
        setExpansionsFilter((prev) => ({ ...prev, [ex]: !prev[ex] }));
    }
    function selectAllExpansions() {
        const newState = {};
        ALL_EXPANSIONS.forEach((ex) => (newState[ex] = true));
        setExpansionsFilter(newState);
    }
    function deselectAllExpansions() {
        const newState = {};
        ALL_EXPANSIONS.forEach((ex) => (newState[ex] = false));
        setExpansionsFilter(newState);
    }

    // --- Toggle rarities ---
    function toggleRarity(r) {
        setRaritiesFilter((prev) => ({ ...prev, [r]: !prev[r] }));
    }
    function selectAllRarities() {
        const newState = {};
        Object.keys(raritiesFilter).forEach((r) => (newState[r] = true));
        setRaritiesFilter(newState);
    }
    function deselectAllRarities() {
        const newState = {};
        Object.keys(raritiesFilter).forEach((r) => (newState[r] = false));
        setRaritiesFilter(newState);
    }

    // Active expansions
    const activeExpansions = ALL_EXPANSIONS.filter((ex) => expansionsFilter[ex]);

    // Check if a given rarity is active
    function isRarityActive(r) {
        if (!r || !r.trim()) {
            return raritiesFilter[NO_RARITY_LABEL] === true;
        }
        return raritiesFilter[r] === true;
    }

    // Filter by expansions + rarities
    let filteredCards = cards.filter(
        (c) => activeExpansions.includes(c.set) && isRarityActive(c.rarity)
    );
    // Mark no-rarity as a uniform label
    filteredCards = filteredCards.map((c) => ({
        ...c,
        _rarity: c.rarity && c.rarity.trim() ? c.rarity : NO_RARITY_LABEL,
    }));

    // Collect boosters from filtered
    const boostersInUse = Array.from(
        new Set(filteredCards.map((c) => c.booster || NO_BOOSTER_LABEL))
    );

    // Assign a color to each booster
    const colorMap = {};
    boostersInUse.forEach((booster, i) => {
        colorMap[booster] =
            booster === NO_BOOSTER_LABEL
                ? "#9e9e9e"
                : COLOR_PALETTE[i % COLOR_PALETTE.length];
    });

    //-----------------------------------
    // Bar Chart (expansions vs boosters)
    //-----------------------------------
    const chartDatasets = boostersInUse.map((booster) => ({
        label: booster,
        data: activeExpansions.map((ex) => {
            // Number of cards in ex with booster
            return filteredCards.filter(
                (c) => c.set === ex && (c.booster || NO_BOOSTER_LABEL) === booster
            ).length;
        }),
        backgroundColor: colorMap[booster],
    }));

    const chartData = {
        labels: activeExpansions,
        datasets: chartDatasets,
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: { position: "top" },
            tooltip: {
                callbacks: {
                    label: (ctx) => `${ctx.dataset.label}: ${ctx.parsed.y} cards`,
                },
            },
        },
        scales: {
            x: { stacked: false },
            y: {
                beginAtZero: true,
                title: { display: true, text: "Number of Cards (Absolute)" },
            },
        },
    };

    //-----------------------------------
    // Tables per expansion
    //-----------------------------------
    const expansionTables = activeExpansions.map((ex) => {
        const expansionsCards = filteredCards.filter((c) => c.set === ex);
        const boostersInExpansion = Array.from(
            new Set(expansionsCards.map((c) => c.booster || NO_BOOSTER_LABEL))
        );

        return (
            <div key={ex} className="border rounded-lg shadow-lg mb-6 p-4">
                <h3 className="text-xl font-semibold text-white bg-blue-600 p-2 rounded-md text-center mb-2">
                    {ex} Expansion Stats
                </h3>
                {/* Make the table scroll horizontally on small screens */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left border mt-3 min-w-[600px]">
                        <thead>
                            <tr className="bg-gray-200">
                                <th className="p-2">Booster</th>
                                <th className="p-2 text-center">Owned</th>
                                <th className="p-2 text-center">Total</th>
                                <th className="p-2 text-center">Duplicates</th>
                                <th className="p-2 text-center">Completion %</th>
                            </tr>
                        </thead>
                        <tbody>
                            {boostersInExpansion.map((booster) => {
                                const relevant = expansionsCards.filter(
                                    (c) => (c.booster || NO_BOOSTER_LABEL) === booster
                                );
                                const total = relevant.length;
                                const owned = relevant.filter((c) => (collection[c.code] || 0) > 0).length;
                                const duplicates = relevant.reduce(
                                    (sum, c) => sum + Math.max((collection[c.code] || 0) - 1, 0),
                                    0
                                );
                                const pct = total > 0 ? ((owned / total) * 100).toFixed(1) : "0.0";

                                return (
                                    <tr key={booster} className="border-b last:border-0">
                                        <td className="p-2">{booster}</td>
                                        <td className="p-2 text-center">{owned}</td>
                                        <td className="p-2 text-center">{total}</td>
                                        <td className="p-2 text-center">{duplicates}</td>
                                        <td className="p-2 text-center">
                                            <div className="relative w-28 h-4 bg-gray-200 rounded-md overflow-hidden mx-auto">
                                                <div
                                                    className="absolute left-0 top-0 h-full bg-green-500"
                                                    style={{ width: `${pct}%` }}
                                                />
                                                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
                                                    {pct}%
                                                </span>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    });

    //-----------------------------------
    // Trivia & Recommendations
    //-----------------------------------
    // Create a card-code -> qty map
    const codeMap = new Map();
    filteredCards.forEach((c) => {
        codeMap.set(c.code, collection[c.code] || 0);
    });

    // 1) Most Repeated Card
    let mostRepeatedCard = null;
    let maxQty = 0;
    for (let [code, qty] of codeMap.entries()) {
        if (qty > maxQty) {
            maxQty = qty;
            mostRepeatedCard = code;
        }
    }
    const cardObjMostRepeated = filteredCards.find((x) => x.code === mostRepeatedCard);

    // 2) Largest duplicates per rarity
    const maxDupByRarity = {};
    filteredCards.forEach((c) => {
        const r = c._rarity;
        const qty = codeMap.get(c.code);
        const dups = Math.max(qty - 1, 0);
        if (!maxDupByRarity[r] || dups > maxDupByRarity[r].duplicates) {
            maxDupByRarity[r] = { code: c.code, duplicates: dups, cardObj: c };
        }
    });

    // 3) First Missing Card by Rarity
    const missingByRarity = {};
    filteredCards
        .filter((c) => codeMap.get(c.code) === 0)
        .forEach((c) => {
            const r = c._rarity;
            if (!missingByRarity[r]) {
                missingByRarity[r] = { code: c.code, cardObj: c };
            }
        });

    // 4) Booster recommendation (the booster with the most missing cards)
    let recommendedBooster = null;
    let maxMissingCount = -1;
    boostersInUse.forEach((booster) => {
        const relevant = filteredCards.filter(
            (c) => (c.booster || NO_BOOSTER_LABEL) === booster
        );
        const missingCount = relevant.filter((c) => codeMap.get(c.code) === 0).length;
        if (missingCount > maxMissingCount && booster !== NO_BOOSTER_LABEL) {
            maxMissingCount = missingCount;
            recommendedBooster = booster;
        }
    });

    return (
        <div className="stats-view max-w-6xl mx-auto bg-white p-4 sm:p-6 rounded shadow">
            <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-center">Stats View</h1>

            {/* FILTERS */}
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-center gap-4 mb-6">
                {/* Expansions Filter */}
                <div className="p-3 border rounded bg-gray-50 flex-1 lg:max-w-[300px]">
                    <h3 className="font-semibold mb-2 text-center">Expansions</h3>
                    <div className="flex flex-wrap gap-2 justify-center">
                        {ALL_EXPANSIONS.map((ex) => (
                            <label key={ex} className="inline-flex items-center text-sm">
                                <input
                                    type="checkbox"
                                    className="mr-1"
                                    checked={expansionsFilter[ex]}
                                    onChange={() => toggleExpansion(ex)}
                                />
                                {ex}
                            </label>
                        ))}
                    </div>
                    <div className="flex gap-2 mt-2 justify-center">
                        <button
                            className="px-2 py-1 bg-green-500 text-white rounded text-sm"
                            onClick={selectAllExpansions}
                        >
                            All
                        </button>
                        <button
                            className="px-2 py-1 bg-red-500 text-white rounded text-sm"
                            onClick={deselectAllExpansions}
                        >
                            None
                        </button>
                    </div>
                </div>

                {/* Rarities Filter */}
                <div className="p-3 border rounded bg-gray-50 flex-1 lg:max-w-[300px]">
                    <h3 className="font-semibold mb-2 text-center">Rarities</h3>
                    <div className="flex flex-wrap gap-2 justify-center">
                        {Object.keys(raritiesFilter).map((r) => (
                            <label key={r} className="inline-flex items-center text-sm">
                                <input
                                    type="checkbox"
                                    className="mr-1"
                                    checked={raritiesFilter[r]}
                                    onChange={() => toggleRarity(r)}
                                />
                                {r}
                            </label>
                        ))}
                    </div>
                    <div className="flex gap-2 mt-2 justify-center">
                        <button
                            className="px-2 py-1 bg-green-500 text-white rounded text-sm"
                            onClick={selectAllRarities}
                        >
                            All
                        </button>
                        <button
                            className="px-2 py-1 bg-red-500 text-white rounded text-sm"
                            onClick={deselectAllRarities}
                        >
                            None
                        </button>
                    </div>
                </div>
            </div>

            {/* CHART */}
            {activeExpansions.length > 0 && chartDatasets.length > 0 ? (
                <div className="relative mb-6 w-full max-w-[100%] flex justify-center">
                    <div className="w-full sm:w-3/4 md:w-2/3 lg:w-1/2">
                        <Bar data={chartData} options={{
                            ...chartOptions,
                            maintainAspectRatio: true,
                            aspectRatio: 2
                        }} />
                    </div>
                </div>
            ) : (
                <p className="text-center text-gray-500 mb-6">No data with current filters.</p>
            )}


            {/* TABLES PER EXPANSION */}
            {expansionTables}

            {/* RECOMMENDATIONS */}
            <div className="bg-gray-50 p-4 rounded shadow mb-6">
                <h3 className="text-xl font-semibold mb-3 text-center">Recommendations</h3>
                {recommendedBooster && maxMissingCount > 0 ? (
                    <p className="text-center">
                        <strong>Best Booster to Open:</strong>{" "}
                        <span className="text-blue-600">{recommendedBooster}</span>{" "}
                        (Missing {maxMissingCount} cards)
                    </p>
                ) : (
                    <p className="text-center">
                        All cards collected or no booster stands out with missing cards!
                    </p>
                )}
            </div>

            {/* TRIVIA */}
            <div className="bg-gray-50 p-4 rounded shadow">
                <h3 className="text-xl font-semibold mb-3 text-center">Trivia</h3>

                <div className="flex flex-col gap-4">
                    {/* 1) Most Repeated Card */}
                    <div>
                        <h4 className="font-bold mb-2">Most Repeated Card</h4>
                        {cardObjMostRepeated && maxQty > 1 ? (
                            <div className="inline-flex items-center gap-2 border rounded p-2">
                                <img
                                    src={cardObjMostRepeated.imageUrl || "placeholder.jpg"}
                                    alt={cardObjMostRepeated.cardName}
                                    className="w-16 h-16 object-contain"
                                />
                                <div>
                                    <p className="font-semibold">{cardObjMostRepeated.cardName}</p>
                                    <p>Code: {mostRepeatedCard}</p>
                                    <p>Quantity: {maxQty}</p>
                                </div>
                            </div>
                        ) : (
                            <p>No card repeated above 1 copy in the current filter set.</p>
                        )}
                    </div>

                    {/* 2) Largest duplicates per rarity */}
                    <div>
                        <h4 className="font-bold mb-2">Largest Duplicates per Rarity</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                            {Object.keys(maxDupByRarity).map((r) => {
                                const info = maxDupByRarity[r];
                                if (!info || info.duplicates <= 0) return null;
                                const cardObj = info.cardObj;
                                return (
                                    <div
                                        key={r}
                                        className="flex items-center gap-2 border rounded p-2"
                                    >
                                        <img
                                            src={cardObj.imageUrl || "placeholder.jpg"}
                                            alt={info.code}
                                            className="w-16 h-16 object-contain"
                                        />
                                        <div className="text-sm">
                                            <p className="font-semibold">{r}</p>
                                            <p>Card: {cardObj.cardName}</p>
                                            <p>Code: {info.code}</p>
                                            <p>Duplicates: {info.duplicates}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* 3) First Missing Card by Rarity */}
                    <div>
                        <h4 className="font-bold mb-2">First Missing Card by Rarity</h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                            {(() => {
                                // Build a small list from the missingByRarity object
                                const entries = Object.keys(missingByRarity).map((r) => {
                                    const info = missingByRarity[r];
                                    return (
                                        <div
                                            key={r}
                                            className="flex items-center gap-2 border rounded p-2"
                                        >
                                            <img
                                                src={info.cardObj.imageUrl || "placeholder.jpg"}
                                                alt={info.cardObj.cardName}
                                                className="w-16 h-16 object-contain"
                                            />
                                            <div className="text-sm">
                                                <p className="font-semibold">{r}</p>
                                                <p>Missing: {info.cardObj.cardName}</p>
                                                <p>Code: {info.code}</p>
                                            </div>
                                        </div>
                                    );
                                });

                                return entries.length
                                    ? entries
                                    : <p>It seems you own all cards (by rarity) under these filters!</p>;
                            })()}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
