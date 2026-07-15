import type { Empire } from "./types";

// Approximate locations of major Silk Road cities and khanate capitals of
// the Mongol Empire near its greatest contiguous extent (c. 1279 AD, when
// Kublai Khan completed the conquest of Song China), and the goods that
// moved across it under the Pax Mongolica.

export const mongolEmpire: Empire = {
  id: "mongol",
  name: "Mongol Empire",
  period: "The empire near its greatest extent, c. 1279 AD",

  cities: [
    { id: "karakorum", name: "Karakorum", lng: 102.845, lat: 47.198 },
    { id: "khanbaliq", name: "Khanbaliq", lng: 116.4074, lat: 39.9042 },
    { id: "hangzhou", name: "Hangzhou", lng: 120.1551, lat: 30.2741 },
    { id: "quanzhou", name: "Quanzhou", lng: 118.589, lat: 24.9139 },
    { id: "guangzhou", name: "Guangzhou", lng: 113.2644, lat: 23.1291 },
    { id: "kashgar", name: "Kashgar", lng: 75.9877, lat: 39.4704 },
    { id: "almaliq", name: "Almaliq", lng: 81.32, lat: 43.93 },
    { id: "samarkand", name: "Samarkand", lng: 66.9597, lat: 39.627 },
    { id: "bukhara", name: "Bukhara", lng: 64.4207, lat: 39.7747 },
    { id: "balkh", name: "Balkh", lng: 66.897, lat: 36.7551 },
    { id: "baghdad", name: "Baghdad", lng: 44.3661, lat: 33.3152 },
    { id: "tabriz", name: "Tabriz", lng: 46.2919, lat: 38.08 },
    { id: "sarai", name: "Sarai", lng: 47.5, lat: 46.8 },
    { id: "novgorod", name: "Novgorod", lng: 31.2742, lat: 58.5256 },
    { id: "kiev", name: "Kiev", lng: 30.5234, lat: 50.4501 },
  ],

  categories: [
    { key: "silkTextiles", label: "Silk & Textiles", good: "Silk woven in China", color: 0xc2185b, arcHeightScale: 0.22 },
    { key: "spicesIncense", label: "Spices & Incense", good: "Spices and incense via maritime and overland routes", color: 0xef6c00, arcHeightScale: 0.28 },
    { key: "paperPrinting", label: "Paper & Printing", good: "Paper and printing technology", color: 0x1976d2, arcHeightScale: 0.34 },
    { key: "horsesLivestock", label: "Horses & Livestock", good: "Steppe horses and livestock", color: 0x8d6e63, arcHeightScale: 0.4 },
    { key: "furs", label: "Furs", good: "Furs from the Rus principalities and Siberia", color: 0x455a64, arcHeightScale: 0.46 },
    { key: "preciousMetals", label: "Precious Metals & Gems", good: "Gold, silver and gemstones", color: 0xffd54f, arcHeightScale: 0.52 },
    { key: "porcelain", label: "Porcelain & Ceramics", good: "Chinese porcelain", color: 0x00acc1, arcHeightScale: 0.58 },
  ],

  tradeRoutes: [
    // Silk & textiles
    { from: "hangzhou", to: "khanbaliq", category: "silkTextiles" },
    { from: "khanbaliq", to: "karakorum", category: "silkTextiles" },
    { from: "karakorum", to: "samarkand", category: "silkTextiles" },
    { from: "samarkand", to: "baghdad", category: "silkTextiles" },
    { from: "baghdad", to: "tabriz", category: "silkTextiles" },

    // Spices & incense
    { from: "quanzhou", to: "guangzhou", category: "spicesIncense" },
    { from: "guangzhou", to: "kashgar", category: "spicesIncense" },
    { from: "kashgar", to: "samarkand", category: "spicesIncense" },
    { from: "tabriz", to: "sarai", category: "spicesIncense" },

    // Paper & printing
    { from: "khanbaliq", to: "kashgar", category: "paperPrinting" },
    { from: "kashgar", to: "bukhara", category: "paperPrinting" },
    { from: "bukhara", to: "baghdad", category: "paperPrinting" },

    // Horses & livestock
    { from: "karakorum", to: "kashgar", category: "horsesLivestock" },
    { from: "kashgar", to: "balkh", category: "horsesLivestock" },
    { from: "balkh", to: "samarkand", category: "horsesLivestock" },
    { from: "almaliq", to: "kashgar", category: "horsesLivestock" },

    // Furs
    { from: "novgorod", to: "sarai", category: "furs" },
    { from: "sarai", to: "samarkand", category: "furs" },
    { from: "kiev", to: "sarai", category: "furs" },

    // Precious metals & gems
    { from: "balkh", to: "baghdad", category: "preciousMetals" },
    { from: "baghdad", to: "tabriz", category: "preciousMetals" },
    { from: "tabriz", to: "sarai", category: "preciousMetals" },

    // Porcelain & ceramics
    { from: "hangzhou", to: "quanzhou", category: "porcelain" },
    { from: "quanzhou", to: "baghdad", category: "porcelain" },
    { from: "guangzhou", to: "baghdad", category: "porcelain" },
  ],
};
