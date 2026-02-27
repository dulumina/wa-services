const { Device } = require('./models');
const sequelize = require('./config/database');

async function check() {
  try {
    await sequelize.authenticate();
    const devices = await Device.findAll();
    console.log('Devices in DB:', JSON.stringify(devices, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
check();
