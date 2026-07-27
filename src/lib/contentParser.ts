export interface Segment {
  text: string;
  isViolation: boolean;
  keywordMatched: string;
}

export const LAW1_VIOLATION_KEYWORDS = [
  "ban speech",
  "seize property",
  "warrantless search",
  "censor",
  "silence",
  "prohibit expression",
  "restrict press",
  "ban protest",
  "seize weapons",
  "confiscate guns",
  "ban firearms",
  "prohibit arms",
  "disarm citizens",
  "unreasonable search",
  "warrantless entry",
  "confiscate without",
  "without due process",
  "no trial",
  "summary punishment",
  "property without compensation",
  "confiscate property without pay",
  "discriminate against",
  "deny rights to",
  "separate but",
  "unequal treatment"
];

export function parseContent(text: string): Segment[] {
  if (!text) return [];

  const matches: { start: number; end: number; keyword: string }[] = [];
  const lowerText = text.toLowerCase();

  LAW1_VIOLATION_KEYWORDS.forEach(kw => {
    let index = lowerText.indexOf(kw.toLowerCase());
    while (index !== -1) {
      matches.push({
        start: index,
        end: index + kw.length,
        keyword: text.substring(index, index + kw.length),
      });
      index = lowerText.indexOf(kw.toLowerCase(), index + 1);
    }
  });

  // Sort matches by start index, then by length descending
  matches.sort((a, b) => {
    if (a.start !== b.start) {
      return a.start - b.start;
    }
    return (b.end - b.start) - (a.end - a.start);
  });

  // Filter out overlapping matches
  const nonOverlappingMatches: typeof matches = [];
  let lastEnd = 0;
  for (const match of matches) {
    if (match.start >= lastEnd) {
      nonOverlappingMatches.push(match);
      lastEnd = match.end;
    }
  }

  // Build segments
  const segments: Segment[] = [];
  let currentIndex = 0;
  for (const match of nonOverlappingMatches) {
    if (match.start > currentIndex) {
      segments.push({
        text: text.substring(currentIndex, match.start),
        isViolation: false,
        keywordMatched: "",
      });
    }
    segments.push({
      text: text.substring(match.start, match.end),
      isViolation: true,
      keywordMatched: match.keyword,
    });
    currentIndex = match.end;
  }

  if (currentIndex < text.length) {
    segments.push({
      text: text.substring(currentIndex),
      isViolation: false,
      keywordMatched: "",
    });
  }

  return segments;
}
