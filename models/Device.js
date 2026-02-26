const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Device = sequelize.define('Device', {
  id: {
    type: DataTypes.STRING, // Using the session id (e.g. phone number or custom string)
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  description: {
    type: DataTypes.STRING
  },
  phoneNumber: {
    type: DataTypes.STRING
  },
  status: {
    type: DataTypes.ENUM('connected', 'disconnected', 'authenticating'),
    defaultValue: 'disconnected'
  },
  ready: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
});

module.exports = Device;
