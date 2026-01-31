const { Sequelize } = require('sequelize');
require('dotenv').config();

// Create Sequelize instance
const sequelize = new Sequelize(
  process.env.DB_NAME || 'vivento_events',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '143@Nellore', // Fallback to hardcoded password
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: false,
      freezeTableName: true
    }
  }
);

// Test database connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ MySQL database connected successfully');
    console.log('🏛️ Database:', process.env.DB_NAME || 'vivento_events');
    console.log('🌐 Host:', process.env.DB_HOST || 'localhost');
    console.log('🔌 Port:', process.env.DB_PORT || 3306);
  } catch (error) {
    console.error('❌ MySQL connection failed:', error.message);
    console.log('🚨 Database connection error - possible causes:');
    console.log('   1. MySQL server is not running');
    console.log('   2. Incorrect database credentials');
    console.log('   3. Database does not exist');
    console.log('   4. Network connectivity issues');
    console.log('💡 Please check your MySQL server and database configuration');
  }
};

// Sync database (create tables)
const syncDatabase = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('📊 Database tables synchronized successfully');
  } catch (error) {
    console.error('❌ Database sync failed:', error.message);
  }
};

module.exports = {
  sequelize,
  testConnection,
  syncDatabase
};