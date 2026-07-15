import type { MeshHandle } from "@navara/three";
import type { ArclineMeshDesc } from "@navara/three_default_descs";

import type { Empire } from "./data/types";

const LEGEND_ID = "trade-legend";

function toCssHex(color: number): string {
  return `#${color.toString(16).padStart(6, "0")}`;
}

/**
 * Renders a floating legend panel listing each trade-goods category with a
 * color swatch and a checkbox that toggles that category's arc-line mesh.
 * Replaces any previously rendered legend, so this can be called again each
 * time the active empire changes.
 */
export function createLegend(
  empire: Empire,
  meshHandles: Map<string, MeshHandle<ArclineMeshDesc>>,
): void {
  document.getElementById(LEGEND_ID)?.remove();

  const panel = document.createElement("aside");
  panel.id = LEGEND_ID;
  panel.className = "trade-legend";

  // Start collapsed on narrow (mobile) screens so the panel doesn't cover
  // most of the map; tapping the header toggles it either way.
  const startsCollapsed = window.matchMedia("(max-width: 640px)").matches;
  panel.classList.toggle("trade-legend--collapsed", startsCollapsed);

  const header = document.createElement("button");
  header.type = "button";
  header.className = "trade-legend__header";
  header.setAttribute("aria-expanded", String(!startsCollapsed));
  header.addEventListener("click", () => {
    const collapsed = panel.classList.toggle("trade-legend--collapsed");
    header.setAttribute("aria-expanded", String(!collapsed));
  });

  const headerText = document.createElement("span");
  headerText.className = "trade-legend__header-text";

  const title = document.createElement("h1");
  title.className = "trade-legend__title";
  title.textContent = `${empire.name} Trade Routes`;
  headerText.appendChild(title);

  const subtitle = document.createElement("p");
  subtitle.className = "trade-legend__subtitle";
  subtitle.textContent = empire.period;
  headerText.appendChild(subtitle);

  const chevron = document.createElement("span");
  chevron.className = "trade-legend__chevron";
  chevron.setAttribute("aria-hidden", "true");

  header.append(headerText, chevron);
  panel.appendChild(header);

  const list = document.createElement("ul");
  list.className = "trade-legend__list";

  for (const category of empire.categories) {
    const item = document.createElement("li");
    item.className = "trade-legend__item";

    const label = document.createElement("label");

    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.checked = true;
    checkbox.addEventListener("change", () => {
      const handle = meshHandles.get(category.key);
      if (handle) {
        handle.visible = checkbox.checked;
      }
    });

    const swatch = document.createElement("span");
    swatch.className = "trade-legend__swatch";
    swatch.style.backgroundColor = toCssHex(category.color);

    const text = document.createElement("span");
    text.className = "trade-legend__text";

    const name = document.createElement("span");
    name.className = "trade-legend__name";
    name.textContent = category.label;

    const good = document.createElement("span");
    good.className = "trade-legend__good";
    good.textContent = category.good;

    text.append(name, good);
    label.append(checkbox, swatch, text);
    item.appendChild(label);
    list.appendChild(item);
  }

  panel.appendChild(list);
  document.body.appendChild(panel);
}
