import type { Empire } from "./types";

// Approximate locations of major cities/ports of the Roman Empire at its
// territorial peak under Trajan (c. 117 AD), and the goods that moved
// between them along its major sea and land trade routes.

export const romanEmpire: Empire = {
  id: "roman",
  name: "Roman Empire",
  period: "The empire at its territorial peak, c. 117 AD",

  cities: [
    { id: "roma", name: "Roma", lng: 12.4964, lat: 41.9028 },
    { id: "puteoli", name: "Puteoli", lng: 14.1197, lat: 40.8236 },
    { id: "alexandria", name: "Alexandria", lng: 29.9187, lat: 31.2001 },
    { id: "carthago", name: "Carthago", lng: 10.3236, lat: 36.8528 },
    { id: "syracusae", name: "Syracusae", lng: 15.2866, lat: 37.0755 },
    { id: "leptisMagna", name: "Leptis Magna", lng: 14.2919, lat: 32.6382 },
    { id: "gades", name: "Gades", lng: -6.2926, lat: 36.5271 },
    { id: "corduba", name: "Corduba", lng: -4.7794, lat: 37.8882 },
    { id: "barcino", name: "Barcino", lng: 2.1734, lat: 41.3851 },
    { id: "massilia", name: "Massilia", lng: 5.3698, lat: 43.2965 },
    { id: "lugdunum", name: "Lugdunum", lng: 4.8357, lat: 45.764 },
    { id: "londinium", name: "Londinium", lng: -0.1276, lat: 51.5072 },
    { id: "coloniaAgrippina", name: "Colonia Agrippina", lng: 6.9603, lat: 50.9375 },
    { id: "olisipo", name: "Olisipo", lng: -9.1393, lat: 38.7223 },
    { id: "antiochia", name: "Antiochia", lng: 36.1622, lat: 36.2021 },
    { id: "palmyra", name: "Palmyra", lng: 38.2842, lat: 34.5509 },
    { id: "petra", name: "Petra", lng: 35.4444, lat: 30.3285 },
    { id: "berenice", name: "Berenice", lng: 35.482, lat: 23.9022 },
    { id: "byzantium", name: "Byzantium", lng: 28.9784, lat: 41.0082 },
    { id: "ephesus", name: "Ephesus", lng: 27.3639, lat: 37.9412 },
    { id: "corinthus", name: "Corinthus", lng: 22.933, lat: 37.9058 },
    { id: "tyrus", name: "Tyrus", lng: 35.1936, lat: 33.2704 },
  ],

  // Each category gets its own arc-height scale so that routes sharing an
  // endpoint (e.g. many categories converge on Roma) fan out into visually
  // separated arcs instead of stacking exactly on top of one another.
  categories: [
    { key: "grain", label: "Grain", good: "Wheat (the Annona)", color: 0xf2c14e, arcHeightScale: 0.22 },
    { key: "wineOil", label: "Wine & Oil", good: "Wine and olive oil", color: 0xa4243b, arcHeightScale: 0.28 },
    { key: "garum", label: "Garum", good: "Fish sauce (garum)", color: 0x2a9d8f, arcHeightScale: 0.34 },
    { key: "silkSpice", label: "Silk & Spice", good: "Silk, spices and incense", color: 0xd62839, arcHeightScale: 0.4 },
    { key: "metals", label: "Metals & Ore", good: "Tin, silver, lead and copper", color: 0x8d99ae, arcHeightScale: 0.46 },
    { key: "marble", label: "Marble & Stone", good: "Marble and building stone", color: 0x90e0ef, arcHeightScale: 0.52 },
    { key: "textileDye", label: "Textiles & Dye", good: "Wool, textiles and Tyrian purple", color: 0x7209b7, arcHeightScale: 0.58 },
  ],

  tradeRoutes: [
    // Grain (the Annona - Rome's state-subsidized grain dole)
    { from: "alexandria", to: "roma", category: "grain" },
    { from: "alexandria", to: "puteoli", category: "grain" },
    { from: "carthago", to: "roma", category: "grain" },
    { from: "syracusae", to: "roma", category: "grain" },
    { from: "leptisMagna", to: "roma", category: "grain" },

    // Wine & olive oil
    { from: "gades", to: "roma", category: "wineOil" },
    { from: "corduba", to: "roma", category: "wineOil" },
    { from: "barcino", to: "roma", category: "wineOil" },
    { from: "massilia", to: "lugdunum", category: "wineOil" },
    { from: "gades", to: "londinium", category: "wineOil" },

    // Garum (fermented fish sauce, a Roman culinary staple)
    { from: "olisipo", to: "roma", category: "garum" },
    { from: "leptisMagna", to: "roma", category: "garum" },
    { from: "gades", to: "roma", category: "garum" },

    // Silk & spice (the eastern trade: Silk Road overland + Indian Ocean/Red Sea)
    { from: "palmyra", to: "antiochia", category: "silkSpice" },
    { from: "antiochia", to: "roma", category: "silkSpice" },
    { from: "berenice", to: "alexandria", category: "silkSpice" },
    { from: "alexandria", to: "roma", category: "silkSpice" },
    { from: "petra", to: "antiochia", category: "silkSpice" },
    { from: "petra", to: "alexandria", category: "silkSpice" },

    // Metals & ore
    { from: "londinium", to: "roma", category: "metals" },
    { from: "corduba", to: "roma", category: "metals" },
    { from: "coloniaAgrippina", to: "roma", category: "metals" },

    // Marble & building stone
    { from: "ephesus", to: "roma", category: "marble" },
    { from: "byzantium", to: "roma", category: "marble" },

    // Textiles & dye
    { from: "tyrus", to: "roma", category: "textileDye" },
    { from: "corinthus", to: "roma", category: "textileDye" },
  ],
};
