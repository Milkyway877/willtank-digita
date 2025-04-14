// This script is used by Vercel to build only the frontend part of the application
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Detect Vercel deployment
const isVercel = process.env.VERCEL === '1';

if (isVercel) {
  console.log('🚀 Running build for Vercel deployment (frontend only)');
  
  try {
    // Only build the frontend using Vite
    console.log('📦 Building frontend with Vite...');
    execSync('npx vite build', {
      stdio: 'inherit',
    });
    
    console.log('✅ Frontend build completed successfully');
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
} else {
  console.log('🚀 Running normal build process');
  
  try {
    // Run the regular build command for non-Vercel environments
    execSync('npm run build', {
      stdio: 'inherit',
    });
    
    console.log('✅ Build completed successfully');
  } catch (error) {
    console.error('❌ Build failed:', error);
    process.exit(1);
  }
}