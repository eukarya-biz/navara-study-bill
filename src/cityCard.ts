import type { City, TradeCategory } from "./data/types";
import type { CityRouteInfo } from "./utils/cityRoutes";
import { toCssHex } from "./legend";

const CITY_CARD_ID = "city-card";

export function closeCityCard(): void {
  document.getElementById(CITY_CARD_ID)?.remove();
}

/**
 * Renders a floating card listing every trade route running through a
 * clicked city. Replaces any previously open card, so this can be called
 * again each time a different city is clicked.
 */
export function createCityCard(
  city: City,
  routes: CityRouteInfo[],
  categoriesByKey: Map<string, TradeCategory>,
): void {
  closeCityCard();

  const card = document.createElement("aside");
  card.id = CITY_CARD_ID;
  card.className = "city-card";

  const header = document.createElement("div");
  header.className = "city-card__header";

  const title = document.createElement("h2");
  title.className = "city-card__title";
  title.textContent = city.name;
  header.appendChild(title);

  const closeButton = document.createElement("button");
  closeButton.type = "button";
  closeButton.className = "city-card__close";
  closeButton.setAttribute("aria-label", "Close");
  closeButton.textContent = "×";
  closeButton.addEventListener("click", () => closeCityCard());
  header.appendChild(closeButton);

  card.appendChild(header);

  const subtitle = document.createElement("p");
  subtitle.className = "city-card__subtitle";
  subtitle.textContent = routes.length === 1 ? "1 trade route" : `${routes.length} trade routes`;
  card.appendChild(subtitle);

  const list = document.createElement("ul");
  list.className = "city-card__list";

  for (const { route, otherCity, direction } of routes) {
    const category = categoriesByKey.get(route.category);
    if (!category) continue;

    const item = document.createElement("li");
    item.className = "city-card__route";

    const swatch = document.createElement("span");
    swatch.className = "city-card__route-swatch";
    swatch.style.backgroundColor = toCssHex(category.color);
    item.appendChild(swatch);

    const text = document.createElement("span");
    text.className = "city-card__route-text";

    const name = document.createElement("span");
    name.className = "city-card__route-name";
    name.textContent = `${direction === "outbound" ? "→" : "←"} ${otherCity.name}`;
    text.appendChild(name);

    const meta = document.createElement("span");
    meta.className = "city-card__route-meta";
    meta.textContent = `${category.label} · ${route.mode === "sea" ? "Sea" : "Land"}`;
    text.appendChild(meta);

    item.appendChild(text);
    list.appendChild(item);
  }

  card.appendChild(list);

  if (routes.length === 0) {
    const empty = document.createElement("p");
    empty.className = "city-card__empty";
    empty.textContent = "No trade routes recorded for this city.";
    card.appendChild(empty);
  }

  document.body.appendChild(card);
}
