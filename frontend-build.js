#!/usr/bin/env node
// This script builds and serves only the frontend portion of the application
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import express from 'express';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🚀 Starting frontend-only build and deployment');

try {
  // Build the frontend using Vite
  console.log('🔨 Building the frontend application...');
  execSync('npx vite build', {
    stdio: 'inherit',
  });
  
  // Create an express server to serve the frontend
  const app = express();
  
  // Serve static files from the dist directory
  app.use(express.static(path.join(__dirname, 'dist/public')));
  
  // For all routes, serve the index.html file (SPA routing)
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist/public/index.html'));
  });
  
  // Start the server
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ Frontend server running on port ${PORT}`);
    console.log(`🌐 Your application is available at: https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`);
  });
} catch (error) {
  console.error('❌ Frontend deployment failed:', error);
  process.exit(1);
}