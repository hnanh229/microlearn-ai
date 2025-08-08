const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        console.log('[DB] Attempting to connect to MongoDB...');
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`✅ [DB] MongoDB Connected successfully!`);
        console.log(`   📍 Host: ${conn.connection.host}`);
        console.log(`   🗄️  Database: ${conn.connection.name}`);
        console.log(`   🔗 Connection State: ${conn.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);
    } catch (error) {
        console.error('❌ [DB] MongoDB connection error:', error.message);
        console.error('   Please check your MONGODB_URI in .env file');
        process.exit(1);
    }
};

module.exports = connectDB;
