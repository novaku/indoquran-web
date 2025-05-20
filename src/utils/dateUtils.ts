
/**
 * Format a date string into a readable format
 * @param dateStr Date string to format
 * @returns Formatted date string
 */
export function formatDate(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return dateStr;
    }
    
    // Format: 20 Mei 2023, 14:30
    return new Intl.DateTimeFormat('id', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch (error) {
    console.error('Error formatting date:', error);
    return dateStr;
  }
}