/**
 * Database Seeding Script
 * Run with: npm run db:seed
 */

const sequelize = require('../config/database');
const adminSeeder = require('../database/seeders/adminSeeder');

async function runSeeders() {
  try {
    console.log('🔄 Starting database seeding...');
    
    // Ensure connection is valid
    await sequelize.authenticate();
    console.log('✅ Database connection verified!');

    // Run seeders
    await adminSeeder();

    console.log('✅ Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  }
}

runSeeders();
