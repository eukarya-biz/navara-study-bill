import type { Empire } from "./data/types";

const SWITCHER_ID = "empire-switcher";

/**
 * Renders a floating tab bar for choosing which empire's trade routes are
 * shown. Replaces any previously rendered switcher, so this can be called
 * again to reflect a new active empire.
 */
export function createEmpireSwitcher(
  empires: Empire[],
  activeId: string,
  onSelect: (empire: Empire) => void,
): void {
  document.getElementById(SWITCHER_ID)?.remove();

  const panel = document.createElement("div");
  panel.id = SWITCHER_ID;
  panel.className = "empire-switcher";

  for (const empire of empires) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "empire-switcher__button";
    button.textContent = empire.name;
    if (empire.id === activeId) {
      button.setAttribute("aria-current", "true");
    }

    button.addEventListener("click", () => {
      if (button.getAttribute("aria-current") === "true") return;
      onSelect(empire);
      createEmpireSwitcher(empires, empire.id, onSelect);
    });

    panel.appendChild(button);
  }

  document.body.appendChild(panel);
}
