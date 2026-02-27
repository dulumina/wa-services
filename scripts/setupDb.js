/**
 * Database Setup Script
 * Run this script to create the database and user with proper permissions
 *
 * Usage: node scripts/setupDb.js
 *
 * Make sure your .env file has:
 * - DB_HOST=localhost
 * - DB_ADMIN_USER=postgres (or your admin username)
 * - DB_ADMIN_PASS=your_admin_password
 * - DB_NAME=wa_services
 * - DB_USER=wa_services
 * - DB_PASS=wa_services
 */

const { Client } = require("pg");
require("dotenv").config();

const setupDatabase = async () => {
  // Connect without database first to create it
  const adminClient = new Client({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_ADMIN_USER || "postgres",
    password: process.env.DB_ADMIN_PASS || "postgres",
    database: "postgres", // Connect to default database
    port: process.env.DB_PORT || 5432,
  });

  try {
    await adminClient.connect();
    console.log("Connected to PostgreSQL server");

    const dbName = process.env.DB_NAME || "wa_services";
    const dbUser = process.env.DB_USER || "wa_services";
    const dbPass = process.env.DB_PASS || "wa_services";

    // Check if database exists
    const dbCheck = await adminClient.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [dbName],
    );

    if (dbCheck.rows.length === 0) {
      // Create database
      await adminClient.query(`CREATE DATABASE ${dbName}`);
      console.log(`Database "${dbName}" created successfully`);
    } else {
      console.log(`Database "${dbName}" already exists`);
    }

    // Create or alter user with LOGIN permission
    const userCheck = await adminClient.query(
      "SELECT 1 FROM pg_roles WHERE rolname = $1",
      [dbUser],
    );

    if (userCheck.rows.length === 0) {
      // Create user with LOGIN permission
      await adminClient.query(
        `CREATE USER ${dbUser} WITH PASSWORD '${dbPass}' LOGIN`,
      );
      console.log(`User "${dbUser}" created with LOGIN permission`);
    } else {
      // Alter user to ensure LOGIN permission
      await adminClient.query(
        `ALTER USER ${dbUser} WITH LOGIN PASSWORD '${dbPass}'`,
      );
      console.log(`User "${dbUser}" updated with LOGIN permission`);
    }

    // Grant privileges on database
    await adminClient.query(
      `GRANT ALL PRIVILEGES ON DATABASE ${dbName} TO ${dbUser}`,
    );
    console.log(`Granted all privileges on "${dbName}" to "${dbUser}"`);

    await adminClient.end();

    // Now connect to the new database and set up schema
    const dbClient = new Client({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_ADMIN_USER || "postgres",
      password: process.env.DB_ADMIN_PASS || "postgres",
      database: dbName,
      port: process.env.DB_PORT || 5432,
    });

    await dbClient.connect();
    console.log(`Connected to database "${dbName}"`);

    // Create extensions if needed
    await dbClient.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    console.log("UUID extension ready");

    // Grant schema permissions
    await dbClient.query(`GRANT ALL ON SCHEMA public TO ${dbUser}`);
    await dbClient.query(
      `GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO ${dbUser}`,
    );
    await dbClient.query(
      `GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO ${dbUser}`,
    );
    console.log("Schema permissions granted");

    await dbClient.end();
    console.log("\n✅ Database setup completed successfully!");
    console.log("\nYou can now start the application with: npm start");
  } catch (error) {
    console.error("Database setup error:", error.message);

    if (error.message.includes("permission denied")) {
      console.log("\n⚠️  Please run as PostgreSQL superuser:");
      console.log('   psql -U postgres -c "CREATE DATABASE wa_services;"');
      console.log(
        "   psql -U postgres -c \"CREATE USER wa_services WITH PASSWORD 'wa_services' LOGIN;\"",
      );
      console.log(
        '   psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE wa_services TO wa_services;"',
      );
    }
    process.exit(1);
  }
};

setupDatabase();
