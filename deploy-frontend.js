#!/usr/bin/env node
/**
 * This script builds and deploys only the frontend part of WillTank
 * It creates a production-ready build and serves it with Express
 */
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import express from 'express';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

console.log('🚀 Starting WillTank Frontend Production Deployment');
console.log('🔒 Backend code will not be exposed in this deployment');

// Set environment to production
process.env.NODE_ENV = 'production';

// Create .env file in client directory with required env variables
console.log('📋 Setting up required environment variables...');
if (process.env.CLERK_PUBLISHABLE_KEY) {
  const envContent = `VITE_CLERK_PUBLISHABLE_KEY=${process.env.CLERK_PUBLISHABLE_KEY}\n`;
  fs.writeFileSync(path.join(__dirname, 'client/.env'), envContent);
  console.log('✅ Created client/.env file with Clerk publishable key');
} else {
  console.warn('⚠️ CLERK_PUBLISHABLE_KEY environment variable is missing!');
  console.warn('   Authentication with Clerk may not work properly.');
}

try {
  // Step 1: Build the frontend with environment variables
  console.log('📦 Building frontend assets...');
  // Pass the environment variables to the build process
  const buildEnv = {
    ...process.env,
    VITE_CLERK_PUBLISHABLE_KEY: process.env.CLERK_PUBLISHABLE_KEY || '',
  };
  
  console.log(`🔑 Using Clerk key: ${buildEnv.VITE_CLERK_PUBLISHABLE_KEY ? 'Found (masked for security)' : 'MISSING'}`);
  
  execSync('npx vite build', {
    stdio: 'inherit',
    env: buildEnv
  });
  
  const app = express();
  const PORT = process.env.PORT || 3000;
  
  // Step 2: Serve static assets from the dist/public directory
  console.log('🌐 Setting up static file serving...');
  app.use(express.static(path.join(__dirname, 'dist/public')));
  
  // Step 3: Set up SPA routing (all routes serve index.html)
  app.get('*', (req, res) => {
    console.log(`📄 Serving index.html for path: ${req.path}`);
    res.sendFile(path.join(__dirname, 'dist/public/index.html'));
  });
  
  // Step 4: Start the server
  app.listen(PORT, '0.0.0.0', () => {
    console.log('\n✅ WillTank Frontend Successfully Deployed!');
    console.log(`🔗 Your application is available at: https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`);
    console.log('🌟 This is a production deployment with only frontend code exposed');
    console.log('📱 All client-side routes will work correctly');
    console.log('\n⚠️ Note: API calls will fail as this is frontend-only. Use your backend API separately if needed.\n');
  });
} catch (error) {
  console.error('❌ Frontend deployment failed:', error);
  process.exit(1);
}