/**
 * Utility function to highlight parts of text that match a search query
 * Returns an array of objects with text and isHighlighted properties
 */
export function highlightText(text: string, query: string): Array<{ text: string, isHighlighted: boolean }> {
  if (!query || !text) {
    return [{ text, isHighlighted: false }];
  }

  // Escape special regex characters in the query
  const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  
  // Create a case-insensitive regex to match the query
  const regex = new RegExp(`(${escapedQuery})`, 'gi');
  
  // Split the text by the regex matches
  const parts = text.split(regex);
  
  // Map each part to determine if it should be highlighted
  return parts.map(part => ({
    text: part,
    isHighlighted: regex.test(part)
  }));
}
