const mongoose = require('mongoose');
const Admin = require('../models/Admin');
require('dotenv').config();

const initAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const adminUsername = process.env.ADMIN_NAME;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminUsername || !adminPassword) {
      console.error('❌ ADMIN_NAME and ADMIN_PASSWORD must be set in .env file');
      process.exit(1);
    }

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ username: adminUsername });
    
    if (existingAdmin) {
      console.log(`✅ Admin account already exists: ${adminUsername}`);
      console.log('   To update password, delete the admin from database and run this script again');
    } else {
      // Create new admin
      const admin = new Admin({
        username: adminUsername,
        password: adminPassword,
        role: 'admin',
        isActive: true
      });

      await admin.save();
      console.log(`✅ Admin account created successfully: ${adminUsername}`);
    }

    console.log('\n📋 Admin Login Details:');
    console.log(`   Username: ${adminUsername}`);
    console.log(`   Password: ${adminPassword}`);
    console.log('\n🔗 Admin Panel URL: http://localhost:5173/admin');

  } catch (error) {
    console.error('❌ Error initializing admin:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('📤 Disconnected from MongoDB');
  }
};

// Run the script
initAdmin();
