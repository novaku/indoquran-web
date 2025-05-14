#!/usr/bin/env node
/**
 * Script to enable detailed MySQL query logging in the IndoQuran project
 */
const fs = require('fs');
const path = require('path');

// Configuration
const dbFilePath = path.join(__dirname, '..', 'src', 'lib', 'db.ts');
const logFilePath = path.join(__dirname, '..', 'logs', 'mysql_queries.log');
const backupFilePath = dbFilePath + '.bak';

console.log('Enabling detailed MySQL query logging...');

// Create log directory if it doesn't exist
const logsDir = path.dirname(logFilePath);
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
  console.log(`Created logs directory: ${logsDir}`);
}

// Create empty log file if it doesn't exist
if (!fs.existsSync(logFilePath)) {
  fs.writeFileSync(logFilePath, '-- MySQL Query Log Start --\n', 'utf8');
  console.log(`Created log file: ${logFilePath}`);
}

// Backup original db.ts file
if (fs.existsSync(dbFilePath)) {
  fs.copyFileSync(dbFilePath, backupFilePath);
  console.log(`Backed up original file to: ${backupFilePath}`);
  
  // Read the file content
  let dbFileContent = fs.readFileSync(dbFilePath, 'utf8');
  
  // Check if logging code is already added
  if (!dbFileContent.includes('logQuery')) {
    // Define the code to add for query logging
    const loggingCode = `
// Query logging function
const logQuery = (query: string, params?: any[]) => {
  const timestamp = new Date().toISOString();
  const formattedQuery = params 
    ? \`[\${timestamp}] \${query} -- Params: \${JSON.stringify(params)}\` 
    : \`[\${timestamp}] \${query}\`;
  
  // Log to console if debug is enabled
  if (process.env.LOG_LEVEL === 'DEBUG') {
    logger.debug('MySQL Query', { query, params });
  }
  
  // Always append to the SQL log file
  try {
    fs.appendFileSync(
      path.join(process.cwd(), 'logs', 'mysql_queries.log'), 
      formattedQuery + '\\n\\n', 
      'utf8'
    );
  } catch (err) {
    logger.error('Failed to write to SQL log file', err);
  }
};

// Create MySQL connection pool with query logging
const pool = mysql.createPool({
  ...poolConfig,
  queryFormat: function (query, values) {
    // Log the query
    logQuery(query, values);
    
    // Default query formatter from mysql2
    if (!values) return query;
    return query.replace(/\\::(\\w+)/g, function (txt, key) {
      if (values.hasOwnProperty(key)) {
        return this.escape(values[key]);
      }
      return txt;
    }.bind(this));
  }
});`;
  
    // Find the position to insert the code (before pool creation)
    const insertPosition = dbFileContent.indexOf('// Create MySQL connection pool');
    if (insertPosition === -1) {
      console.error('Could not find suitable position to insert logging code!');
      process.exit(1);
    }
    
    // Add imports
    if (!dbFileContent.includes('import fs from')) {
      // Add fs and path imports at the top (after the last import)
      const lastImportPosition = dbFileContent.lastIndexOf('import');
      const lastImportEndPosition = dbFileContent.indexOf(';', lastImportPosition) + 1;
      
      const importsToAdd = `
import fs from 'fs';
import path from 'path';`;
      
      dbFileContent = 
        dbFileContent.slice(0, lastImportEndPosition) + 
        importsToAdd + 
        dbFileContent.slice(lastImportEndPosition);
    }
    
    // Insert logging code
    dbFileContent = 
      dbFileContent.slice(0, insertPosition) + 
      loggingCode + 
      dbFileContent.slice(insertPosition);
      
    // Comment out the original pool creation
    dbFileContent = dbFileContent.replace(
      'const pool = mysql.createPool(poolConfig);',
      '// Original pool creation - replaced with logging version\n// const pool = mysql.createPool(poolConfig);'
    );
    
    // Write the modified content back to the file
    fs.writeFileSync(dbFilePath, dbFileContent, 'utf8');
    console.log('Added query logging code to db.ts');
  } else {
    console.log('Query logging is already enabled in db.ts');
  }
  
  console.log('\nMySQL query logging has been enabled!');
  console.log(`Queries will be logged to: ${logFilePath}`);
  console.log('You need to restart your application for changes to take effect.');
} else {
  console.error(`Error: Database file not found at ${dbFilePath}`);
}
