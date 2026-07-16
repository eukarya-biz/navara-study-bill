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

  // Territory outline sourced from the historical-basemaps dataset
  // (world_800.geojson, GPL-3.0 - see README) and simplified for the globe.
  territory: [
    [[69.74,26.384],[68.865,24.481],[68.072,23.675],[67.316,24.093],[67.154,24.652],[66.654,24.784],[66.701,25.114],[66.432,25.489],[64.851,25.206],[64.238,25.211],[64.059,25.401],[63.404,25.165],[61.344,25.027],[60.298,25.323],[59.031,25.308],[58.744,25.536],[57.9,25.541],[57.255,25.793],[56.79,26.974],[56.431,27.107],[55.425,26.963],[54.646,26.391],[52.891,27.052],[52.41,27.581],[51.35,28.036],[50.702,29.134],[50.705,29.401],[50.132,30.066],[49.321,30.103],[49.222,30.477],[48.946,30.388],[48.714,30],[47.957,29.948],[47.996,29.49],[47.614,29.272],[48.129,29.268],[48.855,27.523],[49.244,27.479],[49.152,27.372],[49.322,27.162],[50.122,26.738],[49.934,26.483],[50.076,26.312],[49.937,25.956],[50.147,25.536],[50.382,25.461],[50.778,24.471],[50.968,24.436],[50.847,25.265],[51.217,26.066],[51.587,25.609],[51.606,24.987],[51.288,24.411],[51.291,24.281],[51.606,24.203],[51.586,24.003],[54.276,24.11],[56.367,26.236],[56.405,25.861],[56.161,25.473],[56.366,25.455],[56.405,24.82],[56.794,24.268],[57.904,23.571],[58.628,23.458],[59.837,22.279],[58.861,21.114],[58.512,20.421],[57.931,20.401],[57.806,20.172],[57.839,19.035],[56.904,18.817],[56.258,17.977],[55.561,17.937],[55.29,17.676],[55.195,17.149],[54.911,16.97],[54.084,17.019],[52.894,16.61],[52.238,16.1],[52.135,15.687],[51.313,15.247],[49.334,14.633],[48.765,14.098],[48.036,14.045],[46.601,13.401],[45.826,13.405],[44.964,12.825],[44.063,12.614],[43.341,13.127],[43.348,13.851],[42.796,15.47],[42.884,15.985],[42.535,17.071],[41.629,18.047],[40.694,19.869],[39.764,20.407],[39.167,21.219],[39.056,22.572],[38.49,23.613],[37.201,24.658],[37.218,25.167],[36.669,26.017],[35.436,27.73],[35.112,28.072],[34.764,28.097],[35.073,29.419],[34.764,29.247],[34.241,27.759],[33.331,28.551],[32.648,29.852],[32.318,29.54],[32.649,28.766],[33.354,27.91],[33.929,26.564],[35.19,24.4],[32.514,23.733],[30.819,23.659],[29.345,24.028],[27.352,24.135],[25.046,28.016],[21.679,28.082],[19.316,28.42],[19.125,30.199],[19.664,30.442],[20.117,30.957],[19.942,31.611],[20.068,32.037],[20.516,32.388],[21.673,32.816],[22.923,32.558],[23.153,32.139],[24.816,31.907],[25.258,31.438],[26.143,31.491],[28.966,30.785],[29.249,30.754],[30.099,31.232],[30.996,31.469],[31.717,31.388],[32.077,31.014],[33.917,31.07],[34.501,31.621],[35.349,33.744],[35.873,34.422],[35.796,35.271],[35.607,35.418],[35.856,35.835],[35.665,36.134],[36.095,36.482],[36.082,36.622],[35.891,36.771],[35.221,36.388],[34.662,36.648],[37.349,38.834],[40.629,39.884],[41.278,41.28],[41.68,41.793],[48.238,39.949],[48.959,40.146],[48.631,41.195],[49.087,41.453],[49.605,40.687],[50.19,40.57],[50.467,40.262],[50.031,40.347],[49.573,40.176],[49.403,39.485],[49.488,39.294],[49.339,39.283],[49.275,39.017],[49.041,39.145],[48.946,38.836],[48.745,37.727],[48.837,37.511],[50.039,37.225],[50.561,36.686],[51.417,36.456],[53.8,36.679],[54.067,36.942],[54.868,36.806],[61.107,38.699],[61.452,39.274],[60.877,40.656],[58.69,42.727],[58.69,44.108],[61.452,45.259],[63.524,45.029],[67.207,41.691],[68.588,40.656],[69.969,40.54],[70.89,41.001],[71.695,40.886],[73.192,39.965],[73.192,37.318],[73.652,35.246],[72.271,32.369],[72.041,30.182],[69.74,26.384]],
  ],

  categories: [
    { key: "spices", label: "Spices", good: "Spices via the Persian Gulf and Indian Ocean", color: 0xef6c00, arcHeightScale: 0.22, traceKey: "spices" },
    { key: "silk", label: "Silk", good: "Silk from Central Asia and China", color: 0xc2185b, arcHeightScale: 0.28, traceKey: "silk" },
    { key: "paper", label: "Paper", good: "Papermaking technology from China", color: 0x1976d2, arcHeightScale: 0.34, traceKey: "paper" },
    { key: "frankincenseMyrrh", label: "Frankincense & Myrrh", good: "Incense from South Arabia", color: 0xbf6b4d, arcHeightScale: 0.4 },
    { key: "glassCeramics", label: "Glass & Ceramics", good: "Glassware and ceramics", color: 0x00acc1, arcHeightScale: 0.46 },
    { key: "textiles", label: "Textiles", good: "Egyptian linen and Khorasani cotton", color: 0xd9a441, arcHeightScale: 0.52, traceKey: "textiles" },
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
