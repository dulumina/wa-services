const { User, ApiKey } = require('../../models');
const { v4: uuidv4 } = require('uuid');

async function seedAdmin() {
  try {
    console.log('🌱 Seeding admin user...');

    // Check if admin exists
    const existingAdmin = await User.findOne({ where: { username: 'admin' } });
    if (existingAdmin) {
      console.log('⚠️ Admin user already exists. Skipping.');
      return;
    }

    // Create admin user
    const admin = await User.create({
      username: 'admin',
      email: 'admin@example.com',
      password: 'password123', // Will be hashed by hook
      role: 'admin'
    });

    console.log('✅ Admin user created!');

    // Create default API key for admin
    await ApiKey.create({
      userId: admin.id,
      key: `wa_${uuidv4().replace(/-/g, '')}`,
      label: 'Default Admin Key',
      isActive: true
    });

    console.log('✅ Default API key created for admin!');
  } catch (error) {
    console.error('❌ Error seeding admin:', error);
    throw error;
  }
}

module.exports = seedAdmin;
