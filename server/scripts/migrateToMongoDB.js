import dotenv from 'dotenv';
import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import User from '../models/User.js';
import Leave from '../models/Leave.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env') });

const migrateData = async () => {
  try {
    console.log('🚀 Starting migration to MongoDB...\n');

    // Connect to MongoDB
    console.log('📡 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB\n');

    // Read db.json
    console.log('📖 Reading db.json...');
    const dbPath = path.join(__dirname, '../database/db.json');
    const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    console.log(`✅ Found ${dbData.users.length} users and ${dbData.leaves.length} leaves\n`);

    // Clear existing data (optional - comment out if you want to keep existing MongoDB data)
    console.log('🗑️  Clearing existing MongoDB data...');
    await User.deleteMany({});
    await Leave.deleteMany({});
    console.log('✅ Cleared existing data\n');

    // Migrate Users
    console.log('👥 Migrating users...');
    const userIdMap = {}; // Map old IDs to new MongoDB IDs
    
    for (const user of dbData.users) {
      const newUser = new User({
        name: user.name,
        email: user.email,
        password: user.password,
        role: user.role,
        stream: user.stream,
        rollNumber: user.rollNumber,
        createdAt: user.createdAt
      });
      
      const savedUser = await newUser.save();
      userIdMap[user.id] = savedUser._id.toString();
      console.log(`  ✓ Migrated user: ${user.name} (${user.email})`);
    }
    console.log(`✅ Migrated ${dbData.users.length} users\n`);

    // Migrate Leaves
    console.log('📋 Migrating leaves...');
    for (const leave of dbData.leaves) {
      const newLeave = new Leave({
        userId: leave.userId, // Keep the original userId as string for compatibility
        userName: leave.userName,
        userEmail: leave.userEmail,
        rollNumber: leave.rollNumber,
        stream: leave.stream,
        leaveType: leave.leaveType,
        requestType: leave.requestType || 'traditional',
        startDate: leave.startDate,
        endDate: leave.endDate,
        selectedDates: leave.selectedDates || [],
        selectedDatesCount: leave.selectedDatesCount || 0,
        reason: leave.reason,
        status: leave.status,
        attachment: leave.attachment,
        submittedAt: leave.submittedAt,
        updatedAt: leave.updatedAt
      });
      
      await newLeave.save();
      console.log(`  ✓ Migrated leave: ${leave.userName} - ${leave.leaveType} (${leave.status})`);
    }
    console.log(`✅ Migrated ${dbData.leaves.length} leaves\n`);

    // Verify migration
    console.log('🔍 Verifying migration...');
    const userCount = await User.countDocuments();
    const leaveCount = await Leave.countDocuments();
    console.log(`  Users in MongoDB: ${userCount}`);
    console.log(`  Leaves in MongoDB: ${leaveCount}`);

    if (userCount === dbData.users.length && leaveCount === dbData.leaves.length) {
      console.log('\n✅ Migration completed successfully!');
      console.log('\n📝 Next steps:');
      console.log('  1. Update your .env file with your actual MongoDB password');
      console.log('  2. The routes have been updated to use MongoDB');
      console.log('  3. Restart your server');
      console.log('  4. Test all functionality');
      console.log('\n⚠️  Keep db.json as backup until you verify everything works!');
    } else {
      console.log('\n⚠️  Warning: Migration count mismatch!');
    }

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error(error);
  } finally {
    await mongoose.connection.close();
    console.log('\n📡 Disconnected from MongoDB');
  }
};

// Run migration
migrateData();
