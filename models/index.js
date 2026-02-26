const User = require('./User');
const Device = require('./Device');
const ApiKey = require('./ApiKey');
const Webhook = require('./Webhook');

// User - Device
User.hasMany(Device, { foreignKey: 'userId', as: 'devices' });
Device.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User - ApiKey
User.hasMany(ApiKey, { foreignKey: 'userId', as: 'apiKeys' });
ApiKey.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// User - Webhook
User.hasMany(Webhook, { foreignKey: 'userId', as: 'webhooks' });
Webhook.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = {
  User,
  Device,
  ApiKey,
  Webhook
};
