/**
 * Database Synchronization Script
 * Run with: npm run db:sync
 */

const sequelize = require("../config/database");
const models = require("../models");

async function syncDatabase() {
  try {
    console.log("🔄 Starting database synchronization...");

    // Sync all models (force: false to avoid dropping tables)
    await sequelize.sync({ force: false });

    console.log("✅ Database synchronized successfully!");

    // Optional: Verify connection
    await sequelize.authenticate();
    console.log("✅ Database connection verified!");

    process.exit(0);
  } catch (error) {
    console.error("❌ Database synchronization failed:", error);
    process.exit(1);
  }
}

syncDatabase();
