/**
 * GIAI ĐOẠN 4: DATABASE CONNECTION
 * Chương 8: MongoDB với Mongoose ODM
 */

const mongoose = require('mongoose');

/**
 * Kết nối MongoDB với error handling và retry logic
 */
const connectDatabase = async () => {
  try {
    console.log('Đang kết nối MongoDB...');
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      family: 4 // Use IPv4, skip trying IPv6
    });

    console.log(`MongoDB đã kết nối: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.name}`);
    
    // Listen for MongoDB events
    mongoose.connection.on('error', (error) => {
      console.error('MongoDB connection error:', error);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
    });

    return conn;
  } catch (error) {
    console.error('Không thể kết nối MongoDB:', error.message);
    
    // Retry connection after 5 seconds
    console.log('Thử kết nối lại sau 5 giây...');
    setTimeout(connectDatabase, 5000);
  }
};

/**
 * Graceful shutdown MongoDB connection
 */
const disconnectDatabase = async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection đã đóng');
  } catch (error) {
    console.error('Lỗi khi đóng MongoDB connection:', error);
  }
};

module.exports = {
  connectDatabase,
  disconnectDatabase
};
