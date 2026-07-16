import type { Empire } from "./data/types";

const TIMELINE_ID = "timeline-scrubber";

export function createTimelineScrubber(
  empires: Empire[],
  activeId: string,
  onSelect: (empire: Empire) => void,
): void {
  document.getElementById(TIMELINE_ID)?.remove();

  const activeIndex = Math.max(
    0,
    empires.findIndex((empire) => empire.id === activeId),
  );
  const active = empires[activeIndex];

  const panel = document.createElement("div");
  panel.id = TIMELINE_ID;
  panel.className = "timeline-scrubber";

  const label = document.createElement("div");
  label.className = "timeline-scrubber__label";

  const name = document.createElement("span");
  name.className = "timeline-scrubber__name";
  name.textContent = active.name;

  const period = document.createElement("span");
  period.className = "timeline-scrubber__period";
  period.textContent = active.period;

  label.append(name, period);
  panel.appendChild(label);

  // Reflecting the new activeId is the caller's job (it re-renders whatever
  // else changed with the empire too, e.g. the legend) - so this only calls
  // onSelect and trusts a fresh createTimelineScrubber call will follow.
  const commit = (index: number) => {
    const empire = empires[index];
    if (!empire || empire.id === activeId) return;
    onSelect(empire);
  };

  const track = document.createElement("div");
  track.className = "timeline-scrubber__track";

  const input = document.createElement("input");
  input.type = "range";
  input.className = "timeline-scrubber__input";
  input.min = "0";
  input.max = String(empires.length - 1);
  input.step = "1";
  input.value = String(activeIndex);
  input.setAttribute("aria-label", "Select empire era");
  input.addEventListener("input", () => commit(Number(input.value)));
  track.appendChild(input);

  const ticks = document.createElement("div");
  ticks.className = "timeline-scrubber__ticks";

  empires.forEach((empire, index) => {
    const tick = document.createElement("button");
    tick.type = "button";
    tick.className = "timeline-scrubber__tick";
    if (empire.id === activeId) {
      tick.classList.add("timeline-scrubber__tick--active");
    }
    tick.textContent = empire.name;
    tick.addEventListener("click", () => commit(index));
    ticks.appendChild(tick);
  });

  track.appendChild(ticks);
  panel.appendChild(track);
  document.body.appendChild(panel);
}
