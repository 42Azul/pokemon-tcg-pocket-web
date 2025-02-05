// src/components/StatsView.jsx

import React, { useState } from "react";
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
const NO_BOOSTER_LABEL = "No Booster";

export default function StatsView({ cards, collection }) {
  const [expansionsFilter, setExpansionsFilter] = useState(() =>
    ALL_EXPANSIONS.reduce((acc, ex) => ({ ...acc, [ex]: true }), {})
  );
  const [raritiesFilter, setRaritiesFilter] = useState(() =>
    ALL_RARITIES.reduce((acc, r) => ({ ...acc, [r]: true }), {})
  );

  // Toggle expansions
  function toggleExpansion(ex) {
    setExpansionsFilter((prev) => ({ ...prev, [ex]: !prev[ex] }));
  }

  // Toggle rarities
  function toggleRarity(r) {
    setRaritiesFilter((prev) => ({ ...prev, [r]: !prev[r] }));
  }

  // expansions & rarities we want
  const activeExpansions = ALL_EXPANSIONS.filter((ex) => expansionsFilter[ex]);
  function isRarityActive(r) {
    if (!r) return raritiesFilter[""]; // fallback if empty
    return raritiesFilter[r] === true;
  }

  // 1) Collect boosters from active expansions + "No Booster" if missing
  const boosterSet = new Set();
  activeExpansions.forEach((ex) => {
    cards
      .filter((c) => c.set === ex && isRarityActive(c.rarity))
      .forEach((c) => {
        if (c.booster) {
          boosterSet.add(c.booster);
        } else {
          boosterSet.add(NO_BOOSTER_LABEL);
        }
      });
  });
  const allBoosters = Array.from(boosterSet);

  // 2) Color map for each booster, including "No Booster"
  const colorMap = {};
  allBoosters.forEach((booster, i) => {
    if (booster === NO_BOOSTER_LABEL) {
      // If "No Booster," let's color it grey
      colorMap[booster] = "#9e9e9e"; // e.g. material grey
    } else {
      // Otherwise, pick a color from the palette
      colorMap[booster] = getColorByIndex(i);
    }
  });

  // 3) Build chart data
  const expansionsLabels = activeExpansions; // X-Axis
  const boosterDatasets = allBoosters.map((booster) => {
    const dataPoints = expansionsLabels.map((ex) => {
      // All cards in ex with this booster + active rarities
      const exBoosterCards = cards.filter((c) => {
        const hasBooster = c.booster || NO_BOOSTER_LABEL;
        const boosterLabel = hasBooster === NO_BOOSTER_LABEL ? NO_BOOSTER_LABEL : c.booster;
        return (
          c.set === ex &&
          isRarityActive(c.rarity) &&
          boosterLabel === booster
        );
      });

      const total = exBoosterCards.length;
      let haveCount = 0;
      exBoosterCards.forEach((card) => {
        const qty = collection[card.code] || 0;
        if (qty > 0) {
          haveCount++;
        }
      });

      // compute % if total>0 else 0
      const percent = total > 0 ? (haveCount / total) * 100 : 0;
      return percent;
    });

    return {
      label: booster,
      data: dataPoints,
      backgroundColor: colorMap[booster],
      stack: "boosterStack", // important for stacked chart
    };
  });

  const chartData = {
    labels: expansionsLabels,
    datasets: boosterDatasets,
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: "top" },
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.dataset.label || "";
            const value = context.parsed.y.toFixed(1);
            return `${label}: ${value}%`;
          },
        },
      },
    },
    scales: {
      x: { stacked: true },
      y: {
        stacked: true,
        beginAtZero: true,
        max: 100,
        title: { display: true, text: "Completion (%)" },
      },
    },
  };

  return (
    <div className="stats-view max-w-4xl mx-auto bg-white p-6 rounded shadow">
      <h2 className="text-2xl font-bold mb-4 text-center">Stats View</h2>
      <p className="text-center text-sm text-gray-600 mb-6">
        Completion stats by expansions, boosters (including No Booster), & rarities
      </p>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-6 justify-center mb-6">
        {/* Expansion filter */}
        <div className="p-2 border rounded bg-gray-50">
          <h3 className="font-semibold mb-2 text-center">Expansions</h3>
          <div className="flex flex-wrap gap-2">
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
        </div>

        {/* Rarity filter */}
        <div className="p-2 border rounded bg-gray-50">
          <h3 className="font-semibold mb-2 text-center">Rarities</h3>
          <div className="flex flex-wrap gap-2">
            {ALL_RARITIES.map((r) => (
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
        </div>
      </div>

      {/* Chart */}
      {expansionsLabels.length === 0 ? (
        <p className="text-center text-gray-500">No expansions selected.</p>
      ) : allBoosters.length === 0 ? (
        <p className="text-center text-gray-500">
          No boosters found for the selected expansions/rarities.
        </p>
      ) : (
        <div className="overflow-auto">
          <Bar data={chartData} options={chartOptions} />
        </div>
      )}
    </div>
  );
}

/**
 * Return a distinct color for each booster, except "No Booster" uses grey.
 */
function getColorByIndex(i) {
  const colors = [
    "#EC407A",
    "#42A5F5",
    "#FFEE58",
    "#AB47BC",
    "#26A69A",
    "#FFA726",
    "#7E57C2",
    "#78909C",
    "#66BB6A",
    "#EF5350",
    // add more if needed
  ];
  return colors[i % colors.length];
}
