import type { Empire } from "./types";

// Approximate locations of major cities of the Abbasid Caliphate near its
// political and cultural peak (c. 850 AD, the Islamic Golden Age under
// al-Mutawakkil), and the goods that moved along its Indian Ocean, Silk Road
// and Mediterranean trade networks.

export const abbasidCaliphate: Empire = {
  id: "abbasid",
  name: "Abbasid Caliphate",
  period: "The caliphate at its cultural peak, c. 850 AD",

  cities: [
    { id: "baghdad", name: "Baghdad", lng: 44.3661, lat: 33.3152 },
    { id: "basra", name: "Basra", lng: 47.814, lat: 30.5085 },
    { id: "siraf", name: "Siraf", lng: 52.3167, lat: 27.6333 },
    { id: "damascus", name: "Damascus", lng: 36.2765, lat: 33.5138 },
    { id: "cairo", name: "Cairo", lng: 31.2357, lat: 30.0444 },
    { id: "alexandria", name: "Alexandria", lng: 29.9187, lat: 31.2001 },
    { id: "kairouan", name: "Kairouan", lng: 10.0963, lat: 35.6781 },
    { id: "mecca", name: "Mecca", lng: 39.8579, lat: 21.4225 },
    { id: "sanaa", name: "Sana'a", lng: 44.2075, lat: 15.3694 },
    { id: "samarkand", name: "Samarkand", lng: 66.9597, lat: 39.627 },
    { id: "bukhara", name: "Bukhara", lng: 64.4207, lat: 39.7747 },
    { id: "merv", name: "Merv", lng: 62.1994, lat: 37.6528 },
    { id: "constantinople", name: "Constantinople", lng: 28.9784, lat: 41.0082 },
    { id: "guangzhou", name: "Guangzhou", lng: 113.2644, lat: 23.1291 },
    { id: "mogadishu", name: "Mogadishu", lng: 45.3182, lat: 2.0469 },
  ],

  categories: [
    { key: "spices", label: "Spices", good: "Spices via the Persian Gulf and Indian Ocean", color: 0xef6c00, arcHeightScale: 0.22 },
    { key: "silk", label: "Silk", good: "Silk from Central Asia and China", color: 0xc2185b, arcHeightScale: 0.28 },
    { key: "paper", label: "Paper", good: "Papermaking technology from China", color: 0x1976d2, arcHeightScale: 0.34 },
    { key: "frankincenseMyrrh", label: "Frankincense & Myrrh", good: "Incense from South Arabia", color: 0xbf6b4d, arcHeightScale: 0.4 },
    { key: "glassCeramics", label: "Glass & Ceramics", good: "Glassware and ceramics", color: 0x00acc1, arcHeightScale: 0.46 },
    { key: "textiles", label: "Textiles", good: "Egyptian linen and Khorasani cotton", color: 0xd9a441, arcHeightScale: 0.52 },
    { key: "eastAfrica", label: "East African Trade", good: "Ivory, gold and mangrove timber from the Swahili coast", color: 0x4e342e, arcHeightScale: 0.58 },
  ],

  tradeRoutes: [
    // Spices (Indian Ocean trade via the Persian Gulf)
    { from: "siraf", to: "basra", category: "spices" },
    { from: "basra", to: "baghdad", category: "spices" },
    { from: "mogadishu", to: "siraf", category: "spices" },

    // Silk
    { from: "guangzhou", to: "siraf", category: "silk" },
    { from: "samarkand", to: "baghdad", category: "silk" },
    { from: "baghdad", to: "constantinople", category: "silk" },

    // Paper (the spread of papermaking after the Battle of Talas, 751 AD)
    { from: "samarkand", to: "bukhara", category: "paper" },
    { from: "bukhara", to: "merv", category: "paper" },
    { from: "merv", to: "baghdad", category: "paper" },

    // Frankincense & myrrh (the ancient South Arabian incense route)
    { from: "sanaa", to: "mecca", category: "frankincenseMyrrh" },
    { from: "mecca", to: "damascus", category: "frankincenseMyrrh" },
    { from: "damascus", to: "baghdad", category: "frankincenseMyrrh" },

    // Glass & ceramics
    { from: "damascus", to: "baghdad", category: "glassCeramics" },
    { from: "alexandria", to: "baghdad", category: "glassCeramics" },
    { from: "baghdad", to: "siraf", category: "glassCeramics" },

    // Textiles
    { from: "cairo", to: "alexandria", category: "textiles" },
    { from: "kairouan", to: "alexandria", category: "textiles" },
    { from: "merv", to: "baghdad", category: "textiles" },

    // East African trade
    { from: "mogadishu", to: "basra", category: "eastAfrica" },
    { from: "mogadishu", to: "siraf", category: "eastAfrica" },
  ],
};
