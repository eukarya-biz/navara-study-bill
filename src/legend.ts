import type { Empire, TradeCategory } from "./data/types";

const LEGEND_ID = "trade-legend";

export function toCssHex(color: number): string {
  return `#${color.toString(16).padStart(6, "0")}`;
}

type VisibilityHandle = { visible: boolean };

export type LegendOptions = {
  /** Category keys visible on first render. Defaults to every category. */
  initialActiveKeys?: string[];
  /**
   * Called whenever the set of visible categories changes. `soloedTraceKey`
   * is set when the change came from the "trace" button (so the caller can
   * keep tracing that good across empire switches), and undefined for plain
   * checkbox toggles (a manual choice, not a trace).
   */
  onVisibilityChange?: (activeKeys: string[], soloedTraceKey?: string) => void;
};

/**
 * Renders a floating legend panel listing each trade-goods category with a
 * color swatch, a checkbox that toggles its meshes, and a "solo" button that
 * isolates it and surfaces which other empires traded the same good (via
 * `traceKey`). Replaces any previously rendered legend, so this can be
 * called again each time the active empire (or its active categories)
 * changes.
 */
export function createLegend(
  empire: Empire,
  meshHandles: Map<string, VisibilityHandle>,
  empires: Empire[],
  onJumpToEmpire: (target: Empire, traceKey: string) => void,
  options: LegendOptions = {},
): void {
  document.getElementById(LEGEND_ID)?.remove();

  const activeKeys = new Set(
    options.initialActiveKeys ?? empire.categories.map((category) => category.key),
  );

  function setVisible(key: string, visible: boolean) {
    const handle = meshHandles.get(key);
    if (handle) handle.visible = visible;
  }

  for (const category of empire.categories) {
    setVisible(category.key, activeKeys.has(category.key));
  }

  function soloCategory(category: TradeCategory) {
    setVisible(category.key, true);
    createLegend(empire, meshHandles, empires, onJumpToEmpire, {
      initialActiveKeys: [category.key],
      onVisibilityChange: options.onVisibilityChange,
    });
    options.onVisibilityChange?.([category.key], category.traceKey);
  }

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
    checkbox.checked = activeKeys.has(category.key);
    checkbox.addEventListener("change", () => {
      if (checkbox.checked) activeKeys.add(category.key);
      else activeKeys.delete(category.key);
      setVisible(category.key, checkbox.checked);
      options.onVisibilityChange?.([...activeKeys], undefined);
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

    const soloButton = document.createElement("button");
    soloButton.type = "button";
    soloButton.className = "trade-legend__solo";
    soloButton.title = `Show only ${category.label}`;
    soloButton.setAttribute("aria-label", `Show only ${category.label}`);
    soloButton.textContent = "trace";
    soloButton.addEventListener("click", () => soloCategory(category));
    item.appendChild(soloButton);

    list.appendChild(item);
  }

  panel.appendChild(list);

  // When exactly one category is active, surface other empires that trace
  // to the same good - whether the user got here via the solo button or a
  // cross-empire jump landed on a single pre-soloed category.
  const soloedCategory =
    activeKeys.size === 1
      ? empire.categories.find((category) => activeKeys.has(category.key))
      : undefined;

  const matches = soloedCategory?.traceKey
    ? empires.flatMap((other) => {
        if (other.id === empire.id) return [];
        const match = other.categories.find((c) => c.traceKey === soloedCategory.traceKey);
        return match ? [{ empire: other, category: match }] : [];
      })
    : [];

  if (matches.length > 0) {
    const strip = document.createElement("div");
    strip.className = "trade-legend__trace-strip";

    const stripLabel = document.createElement("span");
    stripLabel.className = "trade-legend__trace-strip-label";
    stripLabel.textContent = "Also traded by";
    strip.appendChild(stripLabel);

    const chips = document.createElement("div");
    chips.className = "trade-legend__trace-chips";

    for (const { empire: otherEmpire, category: otherCategory } of matches) {
      const chip = document.createElement("button");
      chip.type = "button";
      chip.className = "trade-legend__trace-chip";
      chip.textContent = otherEmpire.name;
      chip.addEventListener("click", () => {
        if (!otherCategory.traceKey) return;
        onJumpToEmpire(otherEmpire, otherCategory.traceKey);
      });
      chips.appendChild(chip);
    }

    strip.appendChild(chips);
    panel.appendChild(strip);
  }

  document.body.appendChild(panel);
}
