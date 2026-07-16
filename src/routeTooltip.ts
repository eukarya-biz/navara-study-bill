import type { RouteHoverTarget } from "./utils/routeHover";
import { toCssHex } from "./legend";

const TOOLTIP_ID = "route-tooltip";
const CURSOR_OFFSET_X = 16;
const CURSOR_OFFSET_Y = 20;

type TooltipRefs = {
  root: HTMLDivElement;
  swatch: HTMLElement;
  good: HTMLElement;
  cities: HTMLElement;
};

let refs: TooltipRefs | undefined;

function ensureTooltip(): TooltipRefs {
  if (refs) return refs;

  const root = document.createElement("div");
  root.id = TOOLTIP_ID;
  root.className = "route-tooltip";

  const swatch = document.createElement("span");
  swatch.className = "route-tooltip__swatch";

  const text = document.createElement("span");
  text.className = "route-tooltip__text";

  const good = document.createElement("span");
  good.className = "route-tooltip__good";

  const cities = document.createElement("span");
  cities.className = "route-tooltip__cities";

  text.append(good, cities);
  root.append(swatch, text);
  document.body.appendChild(root);

  refs = { root, swatch, good, cities };
  return refs;
}

export function showRouteTooltip(target: RouteHoverTarget, clientX: number, clientY: number): void {
  const { root, swatch, good, cities } = ensureTooltip();
  root.style.left = `${clientX + CURSOR_OFFSET_X}px`;
  root.style.top = `${clientY + CURSOR_OFFSET_Y}px`;
  root.classList.add("route-tooltip--visible");
  swatch.style.backgroundColor = toCssHex(target.color);
  good.textContent = `${target.categoryLabel} · ${target.mode === "sea" ? "Sea" : "Land"}`;
  cities.textContent = `${target.fromName} → ${target.toName}`;
}

export function hideRouteTooltip(): void {
  refs?.root.classList.remove("route-tooltip--visible");
}
