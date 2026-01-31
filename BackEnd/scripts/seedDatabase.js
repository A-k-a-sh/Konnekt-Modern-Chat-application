require('dotenv').config();
const connectDB = require('../config/database');
const { User, Message, Group } = require('../models');
const AllUserInfo = require('../AllUserInfo');
const AllGroupData = require('../AllGroupData');
const bcrypt = require('bcryptjs');

const DEFAULT_PASSWORD = 'chapapp123'; // Default password for all seeded users

async function seedDatabase() {
    try {
        console.log('🌱 Starting database seeding...\n');

        // Connect to MongoDB
        await connectDB();

        // Clear existing data
        console.log('🗑️  Clearing existing data...');
        await User.deleteMany({});
        await Message.deleteMany({});
        await Group.deleteMany({});
        console.log('✅ Existing data cleared\n');

        // Seed Users
        console.log('👥 Seeding users...');
        const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10);
        
        const users = AllUserInfo.map(user => ({
            userId: user.userId,
            userName: user.userName,
            email: user.email,
            passwordHash: hashedPassword,
            bio: user.bio || '',
            image: user.image || '',
            status: 'offline',
            lastSeen: new Date(),
            socketId: null,
            // Extract just the userIds from connected_to (which might be objects)
            connected_to: (user.connected_to || []).map(conn => 
                typeof conn === 'object' ? conn.userId : conn
            ),
            // Extract just the groupIds from joined_groups
            joinedGroups: (user.joined_groups || []).map(grp =>
                typeof grp === 'object' ? grp.groupId : grp
            )
        }));

        await User.insertMany(users);
        console.log(`✅ Seeded ${users.length} users\n`);

        // Seed Groups
        console.log('👥 Seeding groups...');
        const groups = AllGroupData.map(group => ({
            groupId: group.groupId,
            groupName: group.groupName,
            groupImage: group.groupImage || '',
            description: group.description || '',
            adminId: group.adminId,
            groupMembers: group.groupMembers || [],
            groupJoinRequests: group.groupJoinRequests || []
        }));

        await Group.insertMany(groups);
        console.log(`✅ Seeded ${groups.length} groups\n`);

        // Note: Messages will be created as users chat, no need to seed empty messages
        console.log('📝 Messages will be created as users chat\n');

        // Display summary
        console.log('═══════════════════════════════════════════');
        console.log('✅ Database seeding completed successfully!');
        console.log('═══════════════════════════════════════════');
        console.log(`\n📊 Summary:`);
        console.log(`   Users: ${users.length}`);
        console.log(`   Groups: ${groups.length}`);
        console.log(`   Messages: 0 (will be created during chat)`);
        console.log(`\n🔐 Default Password: ${DEFAULT_PASSWORD}`);
        console.log(`\n💡 Next Steps:`);
        console.log(`   1. Update .env with MONGODB_URI`);
        console.log(`   2. Update index.js to connect to MongoDB`);
        console.log(`   3. Test login with any user email and password: ${DEFAULT_PASSWORD}`);
        console.log(`\n`);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
}

// Run seeding
seedDatabase();
