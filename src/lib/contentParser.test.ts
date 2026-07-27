import { describe, it, expect } from 'vitest';
import { parseContent } from './contentParser';

describe('parseContent', () => {
  it('should return an empty array for empty string', () => {
    expect(parseContent('')).toEqual([]);
  });

  it('should return a single non-violation segment for safe text', () => {
    const text = 'This is a normal proposal about zoning laws.';
    expect(parseContent(text)).toEqual([
      { text, isViolation: false, keywordMatched: '' }
    ]);
  });

  it('should highlight a single violation', () => {
    const text = 'We should ban speech in the park.';
    const result = parseContent(text);
    expect(result).toEqual([
      { text: 'We should ', isViolation: false, keywordMatched: '' },
      { text: 'ban speech', isViolation: true, keywordMatched: 'ban speech' },
      { text: ' in the park.', isViolation: false, keywordMatched: '' }
    ]);
  });

  it('should be case-insensitive for violations', () => {
    const text = 'The government will SeIzE pRoPeRtY today.';
    const result = parseContent(text);
    expect(result).toEqual([
      { text: 'The government will ', isViolation: false, keywordMatched: '' },
      { text: 'SeIzE pRoPeRtY', isViolation: true, keywordMatched: 'SeIzE pRoPeRtY' },
      { text: ' today.', isViolation: false, keywordMatched: '' }
    ]);
  });

  it('should handle multiple non-overlapping violations', () => {
    const text = 'They will ban speech and then seize property.';
    const result = parseContent(text);
    expect(result).toEqual([
      { text: 'They will ', isViolation: false, keywordMatched: '' },
      { text: 'ban speech', isViolation: true, keywordMatched: 'ban speech' },
      { text: ' and then ', isViolation: false, keywordMatched: '' },
      { text: 'seize property', isViolation: true, keywordMatched: 'seize property' },
      { text: '.', isViolation: false, keywordMatched: '' }
    ]);
  });

  it('should handle contiguous violations correctly', () => {
    const text = 'We will ban speechseize property now.';
    const result = parseContent(text);
    expect(result).toEqual([
      { text: 'We will ', isViolation: false, keywordMatched: '' },
      { text: 'ban speech', isViolation: true, keywordMatched: 'ban speech' },
      { text: 'seize property', isViolation: true, keywordMatched: 'seize property' },
      { text: ' now.', isViolation: false, keywordMatched: '' }
    ]);
  });

  it('should prioritize longer overlapping matches and filter out subsets', () => {
    const text = 'No one shall be subject to summary punishment or confiscate property without pay.';
    const result = parseContent(text);
    expect(result).toEqual([
      { text: 'No one shall be subject to ', isViolation: false, keywordMatched: '' },
      { text: 'summary punishment', isViolation: true, keywordMatched: 'summary punishment' },
      { text: ' or ', isViolation: false, keywordMatched: '' },
      { text: 'confiscate property without pay', isViolation: true, keywordMatched: 'confiscate property without pay' },
      { text: '.', isViolation: false, keywordMatched: '' }
    ]);
  });

  it('should correctly handle a violation at the very beginning and very end', () => {
    const text = 'ban speech is bad but so is unequal treatment';
    const result = parseContent(text);
    expect(result).toEqual([
      { text: 'ban speech', isViolation: true, keywordMatched: 'ban speech' },
      { text: ' is bad but so is ', isViolation: false, keywordMatched: '' },
      { text: 'unequal treatment', isViolation: true, keywordMatched: 'unequal treatment' }
    ]);
  });
});
