/**
 * Sanitizes HTML strings to prevent XSS attacks
 * 
 * @param html The HTML string to sanitize
 * @returns Sanitized string
 */
export function sanitizeHtml(html: string): string {
  if (!html) return '';
  
  // Replace potentially dangerous HTML entities
  return html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Validates text content for inappropriate content
 * This is a basic implementation, can be expanded with more checks
 * 
 * @param content Text content to validate
 * @returns boolean indicating if content passes validation
 */
export function validateContent(content: string): boolean {
  if (!content) return false;
  
  // Check for minimum length
  if (content.trim().length < 3) return false;
  
  // Check for potential spam or abusive patterns
  const spamPatterns = [
    /\b(viagra|cialis|sex|porn)\b/i,
    /\b(casino|gambling|bet|lottery)\b/i,
    /\b(make money fast|earn \$\d+|get rich)\b/i,
  ];
  
  for (const pattern of spamPatterns) {
    if (pattern.test(content)) return false;
  }
  
  return true;
}
