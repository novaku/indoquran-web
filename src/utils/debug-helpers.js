/**
 * Debug helper functions for MySQL queries
 * This can be used in scripts outside of the main application
 */
export function logSqlQuery(query, values) {
  const timestamp = new Date().toISOString();
  console.log(`\x1b[36m[MYSQL ${timestamp}]\x1b[0m ${query}`, values ? `\nParams: ${JSON.stringify(values)}` : '');
}
