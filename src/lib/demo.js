// Demo mode (build with DEMO_MODE=true): a built-in garden that covers every
// season, so there's always something to sow or coming up. Seeds are
// read-only; frost dates can be changed for the visit (kept in memory).

/* global __DEMO_MODE__ */
export const IS_DEMO = typeof __DEMO_MODE__ !== "undefined" && __DEMO_MODE__;
export const REPO_URL = "https://github.com/treyhardin/seed-ledger";

const isoDaysAgo = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
};

const FALL = { plant_direction: "before", plant_anchor: "first_frost" };
const SPRING_BEFORE = { plant_direction: "before", plant_anchor: "last_frost" };
const SPRING_AFTER = { plant_direction: "after", plant_anchor: "last_frost" };

const SEEDS = [
  // Fall greens and roots
  { name: "Bloomsdale Spinach", variety: "Long Standing", source: "Baker Creek", sun: "partial", depth_in: 0.5, spacing_in: 3, seeds_per_hole: 2, days_to_germ: 7, days_to_germ_max: 14, days_to_maturity: 45, soil_temp_min: 45, soil_temp_max: 75, plant_weeks: 4, plant_weeks_max: 8, ...FALL, plant2_weeks: 4, plant2_weeks_max: 6, plant2_direction: "before", plant2_anchor: "last_frost", notes: "Frost-sweetened in fall; can overwinter for an early spring cut." },
  { name: "Astro Arugula", source: "Johnny's", sun: "partial,shade", depth_in: 0.25, spacing_in: 4, days_to_germ: 5, days_to_germ_max: 7, days_to_maturity: 38, plant_weeks: 3, plant_weeks_max: 8, ...FALL, notes: "Fast and shade-tolerant. Cut-and-come-again." },
  { name: "Tatsoi", source: "Kitazawa", sun: "partial", depth_in: 0.25, spacing_in: 6, days_to_maturity: 45, plant_weeks: 5, plant_weeks_max: 9, ...FALL },
  { name: "Mâche", variety: "Verte de Cambrai", sun: "shade", depth_in: 0.25, spacing_in: 3, days_to_germ: 10, days_to_germ_max: 14, days_to_maturity: 50, plant_weeks: 4, plant_weeks_max: 9, ...FALL, notes: "Extremely cold-hardy; overwinters for late-winter salads." },
  { name: "Danvers Carrot", source: "Botanical Interests", sun: "full,partial", depth_in: 0.25, spacing_in: 2, seeds_per_hole: 3, days_to_germ: 10, days_to_germ_max: 21, days_to_maturity: 70, soil_temp_min: 45, soil_temp_max: 85, plant_weeks: 12, plant_weeks_max: 16, ...FALL },
  { name: "Detroit Dark Red Beet", sun: "full,partial", depth_in: 0.5, spacing_in: 3, days_to_maturity: 58, plant_weeks: 10, plant_weeks_max: 14, ...FALL, plant2_weeks: 2, plant2_weeks_max: 4, plant2_direction: "before", plant2_anchor: "last_frost" },
  { name: "Long Island Brussels Sprouts", sun: "full", depth_in: 0.5, spacing_in: 18, days_to_maturity: 100, start_method: "indoors", transplant_notes: "Transplant at 4–6 weeks, into rich soil.", plant_weeks: 16, plant_weeks_max: 20, ...FALL },
  { name: "Music Garlic", variety: "Hardneck", source: "Filaree Farm", sun: "full", depth_in: 2, spacing_in: 6, days_to_maturity: 240, plant_weeks: 2, plant_weeks_max: 4, ...FALL, harvest_weeks: 8, harvest_direction: "after", harvest_anchor: "last_frost", notes: "Mulch with straw. Harvest when the lower leaves brown." },
  { name: "Winter Rye", sun: "full,partial", depth_in: 1, spacing_in: 1, plant_weeks: 1, plant_weeks_max: 2, ...FALL, harvest_weeks: 0, harvest_direction: "before", harvest_anchor: "last_frost", notes: "Cover crop. Cut down and turn in around last frost." },
  // Late winter, started indoors
  { name: "Walla Walla Onion", sun: "full", depth_in: 0.25, spacing_in: 4, days_to_maturity: 110, start_method: "indoors", transplant_notes: "Trim tops to 4 inches; transplant 2–4 weeks before last frost.", plant_weeks: 10, plant_weeks_max: 12, ...SPRING_BEFORE },
  { name: "King Richard Leek", sun: "full", depth_in: 0.25, spacing_in: 6, days_to_maturity: 105, start_method: "indoors", plant_weeks: 12, plant_weeks_max: 14, ...SPRING_BEFORE },
  { name: "Early Jalapeño", sun: "full", depth_in: 0.25, spacing_in: 12, days_to_germ: 10, days_to_germ_max: 21, days_to_maturity: 70, soil_temp_min: 70, soil_temp_max: 90, start_method: "indoors", transplant_notes: "Harden off a week; transplant 2 weeks after last frost.", plant_weeks: 8, plant_weeks_max: 10, ...SPRING_BEFORE },
  { name: "Cherokee Purple Tomato", sun: "full", depth_in: 0.25, spacing_in: 24, days_to_maturity: 80, start_method: "indoors", transplant_notes: "Bury the stem deep when transplanting.", plant_weeks: 6, plant_weeks_max: 8, ...SPRING_BEFORE },
  // Spring and summer
  { name: "Sugar Snap Pea", sun: "full,partial", depth_in: 1, spacing_in: 2, days_to_maturity: 60, plant_weeks: 4, plant_weeks_max: 6, ...SPRING_BEFORE, plant2_weeks: 10, plant2_weeks_max: 12, plant2_direction: "before", plant2_anchor: "first_frost" },
  { name: "Buttercrunch Lettuce", sun: "partial", depth_in: 0.25, spacing_in: 8, days_to_maturity: 55, plant_weeks: 2, plant_weeks_max: 4, ...SPRING_BEFORE, plant2_weeks: 8, plant2_weeks_max: 10, plant2_direction: "before", plant2_anchor: "first_frost" },
  { name: "Genovese Basil", sun: "full", depth_in: 0.25, spacing_in: 8, days_to_maturity: 60, plant_weeks: 1, plant_weeks_max: 3, ...SPRING_AFTER },
  { name: "Pickling Cucumber", sun: "full", depth_in: 0.5, spacing_in: 12, seeds_per_hole: 2, days_to_maturity: 55, soil_temp_min: 65, soil_temp_max: 90, plant_weeks: 2, plant_weeks_max: 4, ...SPRING_AFTER },
  { name: "Rattlesnake Pole Bean", sun: "full", depth_in: 1, spacing_in: 4, days_to_maturity: 65, plant_weeks: 1, plant_weeks_max: 3, ...SPRING_AFTER },
  { name: "Provider Bush Bean", sun: "full", depth_in: 1, spacing_in: 3, days_to_maturity: 50, plant_weeks: 2, plant_weeks_max: 10, ...SPRING_AFTER, notes: "Sow every 2–3 weeks for a steady supply." },
  { name: "Black Beauty Zucchini", sun: "full", depth_in: 1, spacing_in: 24, seeds_per_hole: 2, days_to_maturity: 50, plant_weeks: 2, plant_weeks_max: 4, ...SPRING_AFTER },
];

// In the ground right now, planted relative to today so progress looks current.
const GROWING = [
  { name: "Lacinato Kale", sun: "partial", depth_in: 0.5, spacing_in: 12, days_to_maturity: 60, plant_weeks: 8, plant_weeks_max: 10, ...FALL, planted_date: isoDaysAgo(20) },
  { name: "French Breakfast Radish", sun: "partial", depth_in: 0.5, spacing_in: 2, days_to_maturity: 25, plant_weeks: 6, plant_weeks_max: 9, ...FALL, planted_date: isoDaysAgo(10) },
];

export function demoSeeds() {
  return [...SEEDS, ...GROWING].map((s, i) => ({
    id: i + 1, start_method: "direct", planted_date: null, harvested_date: null, ...s,
  }));
}

export const DEMO_SETTINGS = {
  last_frost: "04-15", first_frost: "11-15", zone: "7b", location: "Demo garden", onboarded: "1",
};
