/**
 * Utility function to highlight parts of text that match a search query
 * Returns an array of objects with text and isHighlighted properties
 */
export function highlightText(text: string, query: string): Array<{ text: string, isHighlighted: boolean }> {
  // Handle invalid inputs
  if (!query || !text) {
    return [{ text, isHighlighted: false }];
  }

  const cleanQuery = query.trim().toLowerCase();
  if (cleanQuery === '') {
    return [{ text, isHighlighted: false }];
  }
  
  // Create result array
  const result: Array<{ text: string, isHighlighted: boolean }> = [];
  
  // Convert text to lowercase for case-insensitive matching
  const lowerText = text.toLowerCase();
  
  // Try to match the exact phrase first
  if (cleanQuery.length >= 2 && lowerText.includes(cleanQuery)) {
    // Process the full phrase
    let currentIndex = 0;
    let currentPosition = 0;
    
    while ((currentPosition = lowerText.indexOf(cleanQuery, currentIndex)) !== -1) {
      // Add the text before this match
      if (currentPosition > currentIndex) {
        result.push({
          text: text.substring(currentIndex, currentPosition),
          isHighlighted: false
        });
      }
      
      // Add the matching phrase (preserving original case)
      const matchEnd = currentPosition + cleanQuery.length;
      result.push({
        text: text.substring(currentPosition, matchEnd),
        isHighlighted: true
      });
      
      // Update indices for next iteration
      currentIndex = matchEnd;
    }
    
    // Add any remaining text after the last match
    if (currentIndex < text.length) {
      result.push({
        text: text.substring(currentIndex),
        isHighlighted: false
      });
    }
    
    return result;
  }
  
  // If full phrase is not found, try individual words (fallback)
  const words = cleanQuery.split(/\s+/).filter(word => word.length >= 2);
  
  if (words.length === 0) {
    return [{ text, isHighlighted: false }];
  }
  
  // Process the text
  const currentIndex = 0;
  const segments: Array<{ text: string, isHighlighted: boolean }> = [{ text, isHighlighted: false }];
  
  // For each word, process all existing segments
  for (const word of words) {
    const newSegments: Array<{ text: string, isHighlighted: boolean }> = [];
    
    for (const segment of segments) {
      // Only process non-highlighted segments
      if (segment.isHighlighted) {
        newSegments.push(segment);
        continue;
      }
      
      const segmentText = segment.text;
      const lowerSegmentText = segmentText.toLowerCase();
      let segmentIndex = 0;
      let matchPosition = 0;
      
      // Find all occurrences of this word in this segment
      while ((matchPosition = lowerSegmentText.indexOf(word, segmentIndex)) !== -1) {
        // Add text before match
        if (matchPosition > segmentIndex) {
          newSegments.push({
            text: segmentText.substring(segmentIndex, matchPosition),
            isHighlighted: false
          });
        }
        
        // Add the match
        const matchEnd = matchPosition + word.length;
        newSegments.push({
          text: segmentText.substring(matchPosition, matchEnd),
          isHighlighted: true
        });
        
        segmentIndex = matchEnd;
      }
      
      // Add remaining text
      if (segmentIndex < segmentText.length) {
        newSegments.push({
          text: segmentText.substring(segmentIndex),
          isHighlighted: false
        });
      }
    }
    
    segments.length = 0;
    segments.push(...newSegments);
  }
  
  return segments;
}
