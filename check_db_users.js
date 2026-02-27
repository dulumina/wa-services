const { User } = require('./models');
const sequelize = require('./config/database');

async function check() {
  try {
    await sequelize.authenticate();
    const users = await User.findAll();
    console.log('Users in DB:', JSON.stringify(users.map(u => ({id: u.id, username: u.username})), null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
check();
