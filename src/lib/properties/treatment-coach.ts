import { asPreferenceList } from "./service-options";
import type { IceRiskReport } from "../weather/ice-risk";

export type CoachTip = {
  title: string;
  detail: string;
  tone: "ice" | "fire" | "forest" | "gold";
};

export function treatmentCoach(
  preferences: unknown,
  risk: IceRiskReport | null,
): CoachTip[] {
  const prefs = new Set(asPreferenceList(preferences));
  const tips: CoachTip[] = [];

  if (prefs.has("unsalted") && prefs.has("salted")) {
    tips.push({
      title: "Salted and unsalted are both on",
      detail: "Tell the crew which surfaces get salt. Use special instructions so nobody guesses.",
      tone: "gold",
    });
  }

  if (prefs.has("pets_on_site") && prefs.has("salted") && !prefs.has("unsalted")) {
    tips.push({
      title: "Pets + rock salt",
      detail: "Paws hate rock salt. Switch the walk to unsalted, sand, or a pet-safe melt.",
      tone: "fire",
    });
  }

  if (prefs.has("new_concrete") && prefs.has("salted")) {
    tips.push({
      title: "New concrete does not love salt",
      detail: "Check unsalted or magnesium for the first winter on fresh concrete or interlock.",
      tone: "fire",
    });
  }

  if (prefs.has("heated_driveway") && (prefs.has("salted") || prefs.has("calcium"))) {
    tips.push({
      title: "Heated driveway flagged",
      detail: "Skip heavy chloride over heating loops. Clearing plus sand is usually enough.",
      tone: "gold",
    });
  }

  if (prefs.has("unsalted") && risk && (risk.level === "high" || risk.level === "severe")) {
    tips.push({
      title: "Unsalted on an ice night",
      detail: "Good for pets and wells. Add sand so the slope still has grip.",
      tone: "ice",
    });
  }

  if (prefs.has("salted") && risk && risk.level === "severe") {
    tips.push({
      title: "Rock salt may stall",
      detail: "On freezing rain, calcium or bagged ice melt works further below zero.",
      tone: "ice",
    });
  }

  if (prefs.has("steep_grade") && !prefs.has("sand") && !prefs.has("salted") && !prefs.has("ice_melt")) {
    tips.push({
      title: "Steep grade, no traction plan",
      detail: "Tick sand or a melt so the crew knows you want grip, not just a scrape.",
      tone: "forest",
    });
  }

  if (prefs.has("ice_dam_history") && !prefs.has("roof_salt_pucks")) {
    tips.push({
      title: "This roof already ice-dams",
      detail: "Add salt pucks on the eaves. Clearing the driveway will not stop a leak at the gutter.",
      tone: "gold",
    });
  }

  if (prefs.has("roof_salt_pucks") && risk && risk.iceDamWatch) {
    tips.push({
      title: "Ice-dam watch tonight",
      detail: "Freeze-thaw plus snow on the roof. Pucks belong on the eaves and valleys, not the peak.",
      tone: "ice",
    });
  }

  if (prefs.has("solar_or_skylight") && prefs.has("roof_salt_pucks")) {
    tips.push({
      title: "Keep pucks off the glass",
      detail: "Write the panel and skylight locations in roof notes so melt stays on the shingles.",
      tone: "gold",
    });
  }

  if (tips.length === 0) {
    tips.push({
      title: "Your treatment file is clean",
      detail: "No conflicts. The crew will follow the boxes you ticked.",
      tone: "forest",
    });
  }

  return tips.slice(0, 3);
}
