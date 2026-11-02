const US_STATES: Record<string, string> = {
  alabama: "Alabama", alaska: "Alaska", arizona: "Arizona", arkansas: "Arkansas",
  california: "California", colorado: "Colorado", connecticut: "Connecticut",
  delaware: "Delaware", florida: "Florida", georgia: "Georgia", hawaii: "Hawaii",
  idaho: "Idaho", illinois: "Illinois", indiana: "Indiana", iowa: "Iowa",
  kansas: "Kansas", kentucky: "Kentucky", louisiana: "Louisiana", maine: "Maine",
  maryland: "Maryland", massachusetts: "Massachusetts", michigan: "Michigan",
  minnesota: "Minnesota", mississippi: "Mississippi", missouri: "Missouri",
  montana: "Montana", nebraska: "Nebraska", nevada: "Nevada",
  "new hampshire": "New Hampshire", "new jersey": "New Jersey", "new mexico": "New Mexico",
  "new york": "New York", "north carolina": "North Carolina", "north dakota": "North Dakota",
  ohio: "Ohio", oklahoma: "Oklahoma", oregon: "Oregon", pennsylvania: "Pennsylvania",
  "rhode island": "Rhode Island", "south carolina": "South Carolina", "south dakota": "South Dakota",
  tennessee: "Tennessee", texas: "Texas", utah: "Utah", vermont: "Vermont",
  virginia: "Virginia", washington: "Washington", "west virginia": "West Virginia",
  wisconsin: "Wisconsin", wyoming: "Wyoming",
};

const STATE_ABBRS: Record<string, string> = {
  AL: "Alabama", AK: "Alaska", AZ: "Arizona", AR: "Arkansas", CA: "California",
  CO: "Colorado", CT: "Connecticut", DE: "Delaware", FL: "Florida", GA: "Georgia",
  HI: "Hawaii", ID: "Idaho", IL: "Illinois", IN: "Indiana", IA: "Iowa", KS: "Kansas",
  KY: "Kentucky", LA: "Louisiana", ME: "Maine", MD: "Maryland", MA: "Massachusetts",
  MI: "Michigan", MN: "Minnesota", MS: "Mississippi", MO: "Missouri", MT: "Montana",
  NE: "Nebraska", NV: "Nevada", NH: "New Hampshire", NJ: "New Jersey", NM: "New Mexico",
  NY: "New York", NC: "North Carolina", ND: "North Dakota", OH: "Ohio", OK: "Oklahoma",
  OR: "Oregon", PA: "Pennsylvania", RI: "Rhode Island", SC: "South Carolina",
  SD: "South Dakota", TN: "Tennessee", TX: "Texas", UT: "Utah", VT: "Vermont",
  VA: "Virginia", WA: "Washington", WV: "West Virginia", WI: "Wisconsin", WY: "Wyoming",
};

// Two-letter codes that are also everyday English words.
// These only count when written like an address: "Bloomington, IN".
const AMBIGUOUS_ABBRS = new Set(["AL", "CO", "DE", "HI", "ID", "IN", "LA", "MA", "ME", "OH", "OK", "OR", "PA"]);

export function detectState(text: string): string | null {
  const lower = text.toLowerCase();
  // Check full state names (longer names first to avoid partial matches)
  const sorted = Object.keys(US_STATES).sort((a, b) => b.length - a.length);
  for (const name of sorted) {
    if (lower.includes(name)) {
      return US_STATES[name];
    }
  }
  // Check abbreviations: must be written in capitals, e.g. "TX"
  for (const match of text.matchAll(/(,\s*)?\b([A-Z]{2})\b/g)) {
    const [, comma, abbr] = match;
    if (!STATE_ABBRS[abbr]) continue;
    if (AMBIGUOUS_ABBRS.has(abbr) && !comma) continue;
    return STATE_ABBRS[abbr];
  }
  return null;
}