#!/usr/bin/env node

/**
 * MySQL Query Analysis Tool
 * 
 * This script analyzes the MySQL query log to provide insights on query patterns
 */

const fs = require('fs');
const path = require('path');

// Configuration
const logFile = path.join(__dirname, '..', 'logs', 'mysql_queries.log');
const outputLimit = 10;

// Parse the log file
try {
  console.log('MySQL Query Analysis');
  console.log('====================\n');

  const logContent = fs.readFileSync(logFile, 'utf8');
  const queryPattern = /\[(.*?)\][\s\n]*(SELECT|INSERT|UPDATE|DELETE)([\s\S]*?)(?=\[\d{4}|\[20|$)/g;
  
  const queries = [];
  let match;
  
  while ((match = queryPattern.exec(logContent)) !== null) {
    const timestamp = match[1];
    const queryType = match[2];
    let queryBody = match[3].trim();
    
    // Extract params if available
    let params = [];
    const paramsMatch = queryBody.match(/-- Params: (.*?)$/);
    if (paramsMatch) {
      try {
        params = JSON.parse(paramsMatch[1]);
        queryBody = queryBody.replace(/-- Params: (.*?)$/, '').trim();
      } catch (e) {
        // Ignore parsing errors
      }
    }
    
    // Extract table name
    const tableMatch = queryBody.match(/FROM\s+(\w+)/i);
    const table = tableMatch ? tableMatch[1] : 'unknown';
    
    queries.push({
      timestamp,
      queryType,
      queryBody,
      table,
      params
    });
  }
  
  // Analysis: Query types
  console.log('Query Types:');
  const queryTypeCount = {};
  queries.forEach(q => {
    queryTypeCount[q.queryType] = (queryTypeCount[q.queryType] || 0) + 1;
  });
  
  Object.entries(queryTypeCount)
    .sort((a, b) => b[1] - a[1])
    .forEach(([type, count]) => {
      console.log(`  ${type}: ${count} queries (${((count / queries.length) * 100).toFixed(1)}%)`);
    });
  
  // Analysis: Tables queried
  console.log('\nTables Queried:');
  const tableCount = {};
  queries.forEach(q => {
    tableCount[q.table] = (tableCount[q.table] || 0) + 1;
  });
  
  Object.entries(tableCount)
    .sort((a, b) => b[1] - a[1])
    .forEach(([table, count]) => {
      console.log(`  ${table}: ${count} queries (${((count / queries.length) * 100).toFixed(1)}%)`);
    });
  
  // Analysis: Parameterized vs non-parameterized
  const parameterizedQueries = queries.filter(q => q.params && q.params.length > 0);
  console.log('\nParameterized Queries:');
  console.log(`  ${parameterizedQueries.length} queries (${((parameterizedQueries.length / queries.length) * 100).toFixed(1)}%)`);
  
  // Sample queries
  console.log('\nSample Queries (most recent):');
  queries.slice(-outputLimit).forEach((q, i) => {
    console.log(`\n[${i + 1}] ${q.queryType} from ${q.table} at ${q.timestamp}:`);
    
    // Print a simplified version of the query for readability
    const simplifiedQuery = q.queryBody
      .replace(/\n\s+/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .slice(0, 100) + (q.queryBody.length > 100 ? '...' : '');
    
    console.log(`  ${simplifiedQuery}`);
    
    if (q.params && q.params.length) {
      console.log(`  Params: ${JSON.stringify(q.params)}`);
    }
  });
  
  console.log('\nTotal Queries Analyzed:', queries.length);
  
} catch (error) {
  console.error('Error analyzing MySQL query logs:', error);
  process.exit(1);
}
