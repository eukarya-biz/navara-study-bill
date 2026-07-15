import type { Empire } from "./types";

// Approximate locations of major cities and trading partners of the Qing
// dynasty near its greatest territorial extent (c. 1760 AD, after the
// Qianlong Emperor's conquest of Dzungaria and the Tarim Basin), and the
// goods that moved along its maritime and overland trade routes.

export const qingDynasty: Empire = {
  id: "qing",
  name: "Qing Dynasty",
  period: "China at its territorial peak, c. 1760 AD",

  cities: [
    { id: "beijing", name: "Beijing", lng: 116.4074, lat: 39.9042 },
    { id: "nanjing", name: "Nanjing", lng: 118.7969, lat: 32.0603 },
    { id: "suzhou", name: "Suzhou", lng: 120.6519, lat: 31.3989 },
    { id: "hangzhou", name: "Hangzhou", lng: 120.1551, lat: 30.2741 },
    { id: "jingdezhen", name: "Jingdezhen", lng: 117.1786, lat: 29.2686 },
    { id: "guangzhou", name: "Guangzhou", lng: 113.2644, lat: 23.1291 },
    { id: "macau", name: "Macau", lng: 113.5439, lat: 22.1987 },
    { id: "shanghai", name: "Shanghai", lng: 121.4737, lat: 31.2304 },
    { id: "kashgar", name: "Kashgar", lng: 75.9877, lat: 39.4704 },
    { id: "lhasa", name: "Lhasa", lng: 91.1409, lat: 29.652 },
    { id: "urga", name: "Urga", lng: 106.9057, lat: 47.8864 },
    { id: "kyakhta", name: "Kyakhta", lng: 106.45, lat: 50.35 },
    { id: "manila", name: "Manila", lng: 120.9842, lat: 14.5995 },
    { id: "nagasaki", name: "Nagasaki", lng: 129.8737, lat: 32.7503 },
  ],

  categories: [
    { key: "tea", label: "Tea", good: "Tea, overland to Russia and by sea to Canton", color: 0x2e7d32, arcHeightScale: 0.22 },
    { key: "silk", label: "Silk", good: "Silk from the Jiangnan weaving cities", color: 0xc2185b, arcHeightScale: 0.28 },
    { key: "porcelain", label: "Porcelain", good: "Blue-and-white porcelain", color: 0x0288d1, arcHeightScale: 0.34 },
    { key: "silver", label: "Silver", good: "Silver from the Manila galleon and Japan trades", color: 0xb0bec5, arcHeightScale: 0.4 },
    { key: "cottonTextiles", label: "Cotton & Textiles", good: "Cotton cloth", color: 0xd9a441, arcHeightScale: 0.46 },
    { key: "jadeGems", label: "Jade & Gems", good: "Jade from Khotan and Tibetan gemstones", color: 0x8e24aa, arcHeightScale: 0.52 },
    { key: "furs", label: "Furs", good: "Furs from Mongolia and Manchuria", color: 0x5d4037, arcHeightScale: 0.58 },
  ],

  tradeRoutes: [
    // Tea
    { from: "hangzhou", to: "guangzhou", category: "tea" },
    { from: "guangzhou", to: "macau", category: "tea" },
    { from: "suzhou", to: "kyakhta", category: "tea" },

    // Silk
    { from: "suzhou", to: "guangzhou", category: "silk" },
    { from: "hangzhou", to: "nanjing", category: "silk" },
    { from: "nanjing", to: "beijing", category: "silk" },

    // Porcelain
    { from: "jingdezhen", to: "guangzhou", category: "porcelain" },
    { from: "jingdezhen", to: "nanjing", category: "porcelain" },
    { from: "guangzhou", to: "macau", category: "porcelain" },

    // Silver (the Manila galleon trade and Nagasaki trade)
    { from: "manila", to: "guangzhou", category: "silver" },
    { from: "macau", to: "guangzhou", category: "silver" },
    { from: "nagasaki", to: "guangzhou", category: "silver" },

    // Cotton & textiles
    { from: "shanghai", to: "guangzhou", category: "cottonTextiles" },
    { from: "nanjing", to: "shanghai", category: "cottonTextiles" },

    // Jade & gems
    { from: "kashgar", to: "beijing", category: "jadeGems" },
    { from: "lhasa", to: "beijing", category: "jadeGems" },

    // Furs
    { from: "urga", to: "beijing", category: "furs" },
    { from: "kyakhta", to: "beijing", category: "furs" },
  ],
};
