import type { Empire } from "./types";

// Approximate locations of major ports and colonial hubs of the British
// Empire at its territorial peak (c. 1920, just after WWI), and the goods
// that moved between them - "the empire on which the sun never set".

export const britishEmpire: Empire = {
  id: "british",
  name: "British Empire",
  period: "The empire at its territorial peak, c. 1920 AD",

  cities: [
    { id: "london", name: "London", lng: -0.1276, lat: 51.5072 },
    { id: "liverpool", name: "Liverpool", lng: -2.9916, lat: 53.4084 },
    { id: "cardiff", name: "Cardiff", lng: -3.1791, lat: 51.4816 },
    { id: "gibraltar", name: "Gibraltar", lng: -5.3536, lat: 36.1408 },
    { id: "malta", name: "Malta", lng: 14.5146, lat: 35.8989 },
    { id: "cairo", name: "Cairo", lng: 31.2357, lat: 30.0444 },
    { id: "suez", name: "Suez", lng: 32.5498, lat: 29.9668 },
    { id: "aden", name: "Aden", lng: 45.0187, lat: 12.7855 },
    { id: "bombay", name: "Bombay", lng: 72.8777, lat: 19.076 },
    { id: "calcutta", name: "Calcutta", lng: 88.3639, lat: 22.5726 },
    { id: "colombo", name: "Colombo", lng: 79.8612, lat: 6.9271 },
    { id: "rangoon", name: "Rangoon", lng: 96.1951, lat: 16.8661 },
    { id: "singapore", name: "Singapore", lng: 103.8198, lat: 1.3521 },
    { id: "hongKong", name: "Hong Kong", lng: 114.1694, lat: 22.3193 },
    { id: "shanghai", name: "Shanghai", lng: 121.4737, lat: 31.2304 },
    { id: "capeTown", name: "Cape Town", lng: 18.4241, lat: -33.9249 },
    { id: "mombasa", name: "Mombasa", lng: 39.6682, lat: -4.0435 },
    { id: "lagos", name: "Lagos", lng: 3.3792, lat: 6.5244 },
    { id: "sydney", name: "Sydney", lng: 151.2093, lat: -33.8688 },
    { id: "wellington", name: "Wellington", lng: 174.7762, lat: -41.2865 },
    { id: "halifax", name: "Halifax", lng: -63.5752, lat: 44.6488 },
    { id: "kingston", name: "Kingston", lng: -76.8099, lat: 18.0179 },
  ],

  categories: [
    { key: "tea", label: "Tea", good: "Tea from China, India and Ceylon", color: 0x4caf50, arcHeightScale: 0.22, traceKey: "tea" },
    { key: "cottonTextiles", label: "Cotton & Textiles", good: "Raw cotton and Lancashire cloth", color: 0xd9a441, arcHeightScale: 0.28, traceKey: "textiles" },
    { key: "wool", label: "Wool", good: "Wool from Australia and New Zealand", color: 0xb0bec5, arcHeightScale: 0.34 },
    { key: "goldDiamonds", label: "Gold & Diamonds", good: "Gold and diamonds from Southern Africa", color: 0xffb300, arcHeightScale: 0.4, traceKey: "metals" },
    { key: "rubberTinSpice", label: "Rubber, Tin & Spice", good: "Rubber, tin and spices from Malaya and Ceylon", color: 0x00695c, arcHeightScale: 0.46 },
    { key: "opium", label: "Opium", good: "Opium from India to China", color: 0x6a1b9a, arcHeightScale: 0.52 },
    { key: "coal", label: "Coal", good: "Coal supplying the imperial coaling stations", color: 0x37474f, arcHeightScale: 0.58 },
    { key: "colonialProduce", label: "Colonial Produce", good: "Sugar, furs, palm oil, coffee and ivory", color: 0x8d2f23, arcHeightScale: 0.64 },
  ],

  tradeRoutes: [
    // Tea
    { from: "shanghai", to: "london", category: "tea" },
    { from: "colombo", to: "london", category: "tea" },
    { from: "calcutta", to: "london", category: "tea" },

    // Cotton & textiles
    { from: "bombay", to: "liverpool", category: "cottonTextiles" },
    { from: "cairo", to: "liverpool", category: "cottonTextiles" },
    { from: "liverpool", to: "calcutta", category: "cottonTextiles" },

    // Wool
    { from: "sydney", to: "london", category: "wool" },
    { from: "wellington", to: "london", category: "wool" },

    // Gold & diamonds
    { from: "capeTown", to: "london", category: "goldDiamonds" },

    // Rubber, tin & spice
    { from: "singapore", to: "london", category: "rubberTinSpice" },
    { from: "rangoon", to: "london", category: "rubberTinSpice" },
    { from: "colombo", to: "london", category: "rubberTinSpice" },

    // Opium (India to China, the trade that precipitated the Opium Wars)
    { from: "calcutta", to: "hongKong", category: "opium" },
    { from: "bombay", to: "hongKong", category: "opium" },
    { from: "hongKong", to: "shanghai", category: "opium" },

    // Coal, powering the steamship network's coaling stations
    { from: "cardiff", to: "gibraltar", category: "coal" },
    { from: "cardiff", to: "malta", category: "coal" },
    { from: "cardiff", to: "aden", category: "coal" },
    { from: "cardiff", to: "suez", category: "coal" },

    // Colonial produce
    { from: "kingston", to: "london", category: "colonialProduce" },
    { from: "halifax", to: "london", category: "colonialProduce" },
    { from: "lagos", to: "liverpool", category: "colonialProduce" },
    { from: "mombasa", to: "london", category: "colonialProduce" },
  ],
};
