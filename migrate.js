import { execSync } from 'child_process';

try {
  // Force push the schema without interactive prompts
  console.log('Migrating database schema...');
  execSync('npx drizzle-kit push --force', { stdio: 'inherit' });
  console.log('Migration completed successfully!');
} catch (error) {
  console.error('Migration failed:', error);
  process.exit(1);
}