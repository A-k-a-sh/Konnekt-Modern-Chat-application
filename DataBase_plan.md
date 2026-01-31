# ChapApp - Complete Database Schema & Features Plan

## Technology: **MongoDB** (NoSQL)
**Reasoning:** Real-time chat apps benefit from MongoDB's:
- Flexible schema for dynamic message content (media, replies, reactions)
- High write throughput for messages
- Easy horizontal scaling
- Native array operations for group members, reactions
- Change streams for real-time sync

---

## 🎯 IMPLEMENTATION STRATEGY: Phased Approach

### Phase 0: CORE MIGRATION (🚀 IMPLEMENTING NOW - Week 1-2)
**Goal:** Migrate from in-memory to MongoDB with minimal features

**Collections to Create:**
1. **users** - Basic user data (userId, userName, email, passwordHash, bio, image, connectedUsers, joinedGroups, status, lastSeen)
2. **messages** - Core messaging (msgId, senderId, receiverId, groupId, content, mediaLinks, timestamp, replyTo, isDeleted, deletedFor)
3. **groups** - Group management (groupId, groupName, groupImage, adminId, members[], joinRequests[], description, createdAt)

**Features to Migrate:**
- ✅ User profiles
- ✅ Private messaging
- ✅ Group messaging
- ✅ Edit/delete messages
- ✅ Media upload (Cloudinary)
- ✅ Group join requests
- ✅ Online status (keep Socket.IO, add DB persistence)

**NOT in Phase 0:**
- ❌ Reactions, read receipts, typing indicators (Phase 1)
- ❌ Message search, pagination (Phase 1)
- ❌ Notifications system (Phase 2)
- ❌ Video calls, E2EE (Phase 3+)

---

## 1. Core Collections/Tables (Phase 0 - Simplified)

### 1.1 Users Collection (Phase 0 - Simplified)
```javascript
{
  _id: ObjectId,
  userId: Number (unique, indexed),        // Keep as Number for compatibility
  userName: String (indexed),
  email: String (unique, indexed),
  passwordHash: String,                    // bcrypt hash
  bio: String,
  image: String (Cloudinary URL),
  
  // Status & Presence (Phase 0)
  status: String (enum: 'online', 'offline'), // default: 'offline'
  lastSeen: Date (indexed),
  socketId: String,                        // Current socket connection
  
  // Relationships (Phase 0)
  connected_to: [Number],                  // Array of userIds (keep old naming)
  joinedGroups: [Number],                  // Array of groupIds (keep old naming)
  
  // Metadata
  createdAt: Date (default: Date.now),
  updatedAt: Date (default: Date.now)
}

// Phase 0 Indexes
db.users.createIndex({ userId: 1 }, { unique: true })
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ userName: "text" })
db.users.createIndex({ connected_to: 1 })

// Add in Phase 1+:
// - blockedUsers, settings, phoneNumber, customStatus, etc.
```

---

### 1.2 Messages Collection (Phase 0 - Simplified)
```javascript
{
  _id: ObjectId,
  msgId: String (unique, indexed),
  
  // Participants (reference by ID only)
  senderId: Number (indexed),
  receiverId: Number (indexed),           // null for group messages
  groupId: Number (indexed),               // null for private messages
  
  // Message Type
  chatType: String (enum: 'private', 'group'), (indexed)
  
  // Content (Phase 0)
  msg: String,                             // Message text (keep old naming)
  mediaLinks: [{
    url: String,
    public_id: String (Cloudinary),
    resource_type: String (enum: 'image', 'video', 'raw')
  }],
  
  // Features (Phase 0)
  reply: {                                 // Keep old naming
    msgId: String,
    content: String (max 100 chars preview)
  },
  
  forwardFrom: {                           // Keep old naming
    msgId: String,
    senderId: Number
  },
  
  // Status (Phase 0 - keep simple)
  isDeleted: Boolean (default: false),
  deletedFor: [Number],                    // Array of userIds who deleted
  
  // Metadata
  time: Date (indexed),                    // Keep old naming
  createdAt: Date (default: Date.now),
  updatedAt: Date
}

// Phase 0 Indexes
db.messages.createIndex({ msgId: 1 }, { unique: true })
db.messages.createIndex({ senderId: 1, receiverId: 1, time: -1 })
db.messages.createIndex({ groupId: 1, time: -1 })
db.messages.createIndex({ chatType: 1, time: -1 })
db.messages.createIndex({ time: -1 })

// Add in Phase 1+:
// - reactions, readBy, deliveredTo, editHistory, isPinned, etc.
```

---

### 1.3 Groups Collection
```javascript
{
  _id: ObjectId,
  groupId: String (unique, indexed),
  groupName: String (indexed),
  groupImage: String (Cloudinary URL),
  description: String,
  
  // Administration
  adminId: String, // Primary admin
  moderators: [String], // Array of userIds with moderator permissions
  
  // Members
  members: [{
    userId: String,
    userName: String,
    userImage: String,
    role: String (enum: 'admin', 'moderator', 'member'),
    joinedAt: Date,
    addedBy: String,
    permissions: {
      canSendMessages: Boolean,
      canSendMedia: Boolean,
      canAddMembers: Boolean,
      canRemoveMembers: Boolean,
      canPinMessages: Boolean,
      canEditGroupInfo: Boolean
    }
  }],
  
  // Join Requests
  joinRequests: [{
    userId: String,
    userName: String,
    userImage: String,
    email: String,
    requestedAt: Date,
    message: String // Optional request message
  }],
  
  // Banned Users
  bannedUsers: [{
    userId: String,
    bannedBy: String,
    bannedAt: Date,
    reason: String
  }],
  
  // Settings
  settings: {
    privacy: String (enum: 'public', 'private', 'invite-only'),
    approvalRequired: Boolean,
    whoCanSend: String (enum: 'all', 'admins-only'),
    whoCanAddMembers: String (enum: 'all', 'admins', 'admins-moderators'),
    maxMembers: Number,
    mutedUntil: Date // Group mute for all members
  },
  
  // Features
  pinnedMessages: [{
    msgId: String,
    pinnedBy: String,
    pinnedAt: Date
  }],
  
  // Metadata
  createdAt: Date,
  updatedAt: Date,
  isActive: Boolean,
  isDeleted: Boolean,
  
  // Stats
  messageCount: Number,
  mediaCount: Number,
  memberCount: Number
}

// Indexes
db.groups.createIndex({ groupId: 1 }, { unique: true })
db.groups.createIndex({ groupName: "text" })
db.groups.createIndex({ "members.userId": 1 })
db.groups.createIndex({ adminId: 1 })
```

---

### 1.4 Conversations Collection (Chat Metadata)
```javascript
{
  _id: ObjectId,
  conversationId: String (unique, indexed),
  
  // Participants
  participants: [String], // Array of userIds (sorted, indexed)
  chatType: String (enum: 'private', 'group'),
  groupId: String, // if group chat
  
  // Per-User Settings
  participantSettings: [{
    userId: String,
    isMuted: Boolean,
    mutedUntil: Date,
    isPinned: Boolean,
    pinnedAt: Date,
    isArchived: Boolean,
    archivedAt: Date,
    customName: String, // Custom chat name for user
    notifications: Boolean
  }],
  
  // Last Message Info (for quick retrieval)
  lastMessage: {
    msgId: String,
    senderId: String,
    senderName: String,
    content: String,
    messageType: String,
    timestamp: Date
  },
  
  // Unread Counts per User
  unreadCounts: [{
    userId: String,
    count: Number,
    lastReadMsgId: String
  }],
  
  // Draft Messages
  drafts: [{
    userId: String,
    content: String,
    updatedAt: Date
  }],
  
  // Typing Indicators
  typingUsers: [{
    userId: String,
    userName: String,
    timestamp: Date
  }],
  
  // Metadata
  createdAt: Date,
  updatedAt: Date,
  lastActivityAt: Date (indexed)
}

// Indexes
db.conversations.createIndex({ conversationId: 1 }, { unique: true })
db.conversations.createIndex({ participants: 1 })
db.conversations.createIndex({ "participantSettings.userId": 1 })
db.conversations.createIndex({ lastActivityAt: -1 })
```

---

### 1.5 Notifications Collection
```javascript
{
  _id: ObjectId,
  notificationId: String (unique),
  
  // Target
  userId: String (indexed),
  
  // Content
  type: String (enum: 'message', 'group-invite', 'group-join-request', 'mention', 'reaction', 'group-role-change', 'friend-request'),
  title: String,
  message: String,
  
  // Related Entities
  relatedUserId: String,
  relatedUserName: String,
  relatedGroupId: String,
  relatedMessageId: String,
  
  // Data
  data: Object, // Additional metadata
  
  // Status
  isRead: Boolean (indexed),
  readAt: Date,
  
  // Actions
  actionUrl: String,
  actions: [{
    label: String,
    action: String,
    url: String
  }],
  
  // Metadata
  createdAt: Date (indexed),
  expiresAt: Date
}

// Indexes
db.notifications.createIndex({ notificationId: 1 }, { unique: true })
db.notifications.createIndex({ userId: 1, isRead: 1, createdAt: -1 })
db.notifications.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })
```

---

### 1.6 Sessions Collection (For authentication)
```javascript
{
  _id: ObjectId,
  sessionId: String (unique),
  userId: String (indexed),
  
  // Device Info
  deviceInfo: {
    deviceType: String,
    deviceName: String,
    browser: String,
    os: String,
    ipAddress: String
  },
  
  // Token
  refreshToken: String,
  accessToken: String,
  
  // Status
  isActive: Boolean,
  lastActivity: Date,
  
  // Metadata
  createdAt: Date,
  expiresAt: Date
}

// Indexes
db.sessions.createIndex({ sessionId: 1 }, { unique: true })
db.sessions.createIndex({ userId: 1 })
db.sessions.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })
```

---

### 1.7 Media Collection (Centralized media tracking)
```javascript
{
  _id: ObjectId,
  mediaId: String (unique),
  
  // Cloudinary Info
  publicId: String,
  url: String,
  secureUrl: String,
  resourceType: String,
  format: String,
  
  // File Info
  fileName: String,
  fileSize: Number,
  mimeType: String,
  width: Number,
  height: Number,
  duration: Number,
  
  // Metadata
  uploadedBy: String,
  uploadedAt: Date,
  
  // Usage
  messageIds: [String], // Messages using this media
  usageCount: Number,
  
  // Status
  isDeleted: Boolean,
  deletedAt: Date
}

// Indexes
db.media.createIndex({ mediaId: 1 }, { unique: true })
db.media.createIndex({ publicId: 1 })
db.media.createIndex({ uploadedBy: 1 })
```

---

## 2. Additional Features to Implement

### 2.1 Message Features
✅ Already Implemented:
- Send/receive text messages
- Edit messages
- Delete messages
- Forward messages
- Reply to messages
- Media sharing (images, videos, documents)
- Link previews

🆕 New Features to Add:
- **Message Reactions** - React with emojis (👍❤️😂😮😢🙏)
- **Message Threading** - Reply in threads for organized discussions
- **Voice Messages** - Record and send audio
- **Disappearing Messages** - Auto-delete after time period
- **Message Scheduling** - Send messages at scheduled time
- **Message Templates** - Save frequently used messages
- **Text Formatting** - Bold, italic, strikethrough, code blocks
- **Polls/Surveys** - Create polls in groups
- **Location Sharing** - Share current location
- **Contact Sharing** - Share contact cards
- **Message Pinning** - Pin important messages
- **Message Starring** - Star/bookmark messages for quick access
- **Read Receipts** - Show who read the message (with privacy controls)
- **Delivery Status** - Sent → Delivered → Read indicators
- **Typing Indicators** - Show "User is typing..."
- **Message Search** - Full-text search across all chats
- **Export Chat** - Export conversation as PDF/TXT

### 2.2 User Features
✅ Already Implemented:
- User profiles (name, email, bio, image)
- Online status
- Connected users list

🆕 New Features to Add:
- **Authentication** - JWT-based login/signup
- **Password Reset** - Email-based password recovery
- **2FA/MFA** - Two-factor authentication
- **Email Verification** - Verify email on signup
- **Profile Privacy Settings** - Control who sees profile info
- **Custom Status** - Set custom status messages
- **Last Seen Privacy** - Hide/show last seen time
- **User Blocking** - Block abusive users
- **Friend Requests** - Send/accept connection requests
- **User Search** - Search users by name/email
- **Active Sessions** - View and manage active devices
- **Account Deactivation** - Temporarily deactivate account
- **Account Deletion** - Permanently delete account with data

### 2.3 Group Features
✅ Already Implemented:
- Create groups
- Group admin
- Group members
- Join requests/approvals
- Group chat

🆕 New Features to Add:
- **Group Roles** - Admin, Moderator, Member with permissions
- **Group Invite Links** - Generate shareable invite links
- **Group QR Code** - QR code for easy joining
- **Group Description** - Rich text description
- **Group Rules** - Pin group rules/guidelines
- **Group Events** - Schedule group events/meetings
- **Group Polls** - Create polls for decision making
- **Group Announcements** - Admin-only broadcast channel
- **Group Stats** - Member activity, message stats
- **Member Management** - Promote, demote, remove, ban members
- **Group Privacy** - Public, Private, Secret groups
- **Group Categories/Tags** - Categorize groups
- **Sub-groups** - Create channels within groups
- **Group File Storage** - Shared file repository
- **Group Calendar** - Shared calendar for events
- **Member Permissions** - Fine-grained permissions per member
- **Auto-delete for Inactive Groups** - Archive old groups
- **Group Discovery** - Discover public groups

### 2.4 Chat Management
🆕 New Features to Add:
- **Chat Folders** - Organize chats into folders (Personal, Work, etc.)
- **Chat Archiving** - Archive old conversations
- **Chat Muting** - Mute notifications for specific chats
- **Chat Pinning** - Pin important chats to top
- **Chat Export** - Download entire conversation
- **Chat Backup** - Cloud backup of chats
- **Chat Restore** - Restore deleted messages (within timeframe)
- **Chat Transfer** - Transfer chat ownership
- **Unread Counter** - Badge showing unread count
- **Mention Counter** - Badge showing @mentions
- **Draft Messages** - Save draft messages
- **Quick Replies** - Predefined quick response buttons

### 2.5 Media & Files
✅ Already Implemented:
- Image upload
- Video upload
- Document upload
- Cloudinary integration

🆕 New Features to Add:
- **Voice Messages** - Record and send audio clips
- **Video Messages** - Record short video messages
- **Image Editor** - Crop, filter, draw on images before sending
- **GIF Support** - Send animated GIFs
- **Sticker Packs** - Custom sticker collections
- **File Preview** - Preview docs/PDFs in-app
- **Media Gallery** - View all media from a chat
- **File Management** - Organize and search files
- **Compression Settings** - Auto-compress large media
- **Media Auto-Download** - Settings for auto-downloading media

### 2.6 Notifications
🆕 New Features to Add:
- **Push Notifications** - Web Push API / FCM
- **Email Notifications** - Email digests of missed messages
- **SMS Notifications** - SMS for critical alerts
- **Notification Preferences** - Granular notification settings
- **Do Not Disturb** - DND mode with scheduling
- **Mention Notifications** - Special alerts for @mentions
- **Keyword Alerts** - Notify on specific keywords
- **Notification Sounds** - Custom notification sounds
- **Notification Grouping** - Group similar notifications

### 2.7 Security & Privacy
🆕 New Features to Add:
- **End-to-End Encryption** - E2EE for messages (Signal protocol)
- **Message Encryption** - Encrypt messages at rest
- **Self-Destructing Messages** - Messages that auto-delete
- **Screenshot Detection** - Notify when screenshot taken
- **Incognito Mode** - Private browsing mode
- **Report User** - Report abusive behavior
- **Spam Detection** - Auto-detect and filter spam
- **Content Moderation** - AI-based content filtering
- **Activity Log** - Log of account activities
- **Login Alerts** - Notify on new device logins
- **Suspicious Activity Detection** - AI-based security monitoring

### 2.8 Advanced Features
🆕 New Features to Add:
- **Video Calls** - WebRTC 1-on-1 video calls
- **Voice Calls** - WebRTC 1-on-1 audio calls
- **Group Video Calls** - Multi-party video conferencing
- **Screen Sharing** - Share screen during calls
- **Live Location** - Share real-time location
- **Bots & Integrations** - Custom bots and third-party integrations
- **Webhooks** - Webhook support for external services
- **API Access** - REST API for developers
- **Chatbots** - AI chatbots for customer support
- **Translation** - Auto-translate messages
- **Voice-to-Text** - Transcribe voice messages
- **Smart Replies** - AI-suggested quick replies
- **Message Insights** - Analytics and message stats
- **Cross-Platform Sync** - Sync across devices
- **Offline Mode** - Queue messages when offline
- **Progressive Web App** - Install as native app

---

## 3. Database Indexes Strategy

### High Priority Indexes
```javascript
// Users
db.users.createIndex({ userId: 1 }, { unique: true })
db.users.createIndex({ email: 1 }, { unique: true })
db.users.createIndex({ lastSeen: -1 })
db.users.createIndex({ connectedUsers: 1 })

// Messages
db.messages.createIndex({ msgId: 1 }, { unique: true })
db.messages.createIndex({ senderId: 1, receiverId: 1, timestamp: -1 })
db.messages.createIndex({ groupId: 1, timestamp: -1 })
db.messages.createIndex({ timestamp: -1 })
db.messages.createIndex({ "content": "text" })

// Groups
db.groups.createIndex({ groupId: 1 }, { unique: true })
db.groups.createIndex({ "members.userId": 1 })

// Conversations
db.conversations.createIndex({ participants: 1 })
db.conversations.createIndex({ lastActivityAt: -1 })

// Notifications
db.notifications.createIndex({ userId: 1, isRead: 1, createdAt: -1 })
```

---

## 4. Implementation Phases

### Phase 1: Core Setup (Week 1-2)
- Set up MongoDB/PostgreSQL
- Implement User authentication (JWT)
- Migrate current in-memory data to DB
- Basic CRUD for Users, Messages, Groups

### Phase 2: Message Enhancements (Week 3-4)
- Message reactions
- Read receipts
- Delivery status
- Typing indicators
- Message search

### Phase 3: Group Features (Week 5-6)
- Group roles & permissions
- Group invite links
- Member management
- Group settings

### Phase 4: Media & Files (Week 7)
- Voice messages
- File management
- Media gallery
- File preview

### Phase 5: Notifications (Week 8)
- Push notifications
- Email notifications
- Notification preferences

### Phase 6: Advanced Features (Week 9-12)
- Video/voice calls (WebRTC)
- End-to-end encryption
- Bots & integrations
- Analytics

---

## 5. API Endpoints to Create

### Authentication
```
POST   /api/auth/signup
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh-token
POST   /api/auth/forgot-password
POST   /api/auth/reset-password
POST   /api/auth/verify-email
POST   /api/auth/resend-verification
```

### Users
```
GET    /api/users              - Get all users
GET    /api/users/:userId      - Get user by ID
PUT    /api/users/:userId      - Update user
DELETE /api/users/:userId      - Delete user
GET    /api/users/search       - Search users
POST   /api/users/connect      - Send connection request
PUT    /api/users/block        - Block user
GET    /api/users/:userId/status - Get online status
```

### Messages
```
GET    /api/messages?conversationId=xxx    - Get messages
POST   /api/messages                        - Send message
PUT    /api/messages/:msgId                 - Edit message
DELETE /api/messages/:msgId                 - Delete message
POST   /api/messages/:msgId/reaction        - Add reaction
POST   /api/messages/:msgId/forward         - Forward message
GET    /api/messages/search                 - Search messages
POST   /api/messages/:msgId/pin             - Pin message
POST   /api/messages/:msgId/star            - Star message
```

### Groups
```
GET    /api/groups             - Get all groups
POST   /api/groups             - Create group
GET    /api/groups/:groupId    - Get group details
PUT    /api/groups/:groupId    - Update group
DELETE /api/groups/:groupId    - Delete group
POST   /api/groups/:groupId/members         - Add member
DELETE /api/groups/:groupId/members/:userId - Remove member
POST   /api/groups/:groupId/join            - Join group
POST   /api/groups/:groupId/leave           - Leave group
GET    /api/groups/:groupId/requests        - Get join requests
POST   /api/groups/:groupId/requests/approve - Approve request
POST   /api/groups/:groupId/requests/reject - Reject request
PUT    /api/groups/:groupId/members/:userId/role - Update member role
```

### Conversations
```
GET    /api/conversations              - Get all conversations
GET    /api/conversations/:id          - Get conversation
POST   /api/conversations              - Create conversation
PUT    /api/conversations/:id/mute     - Mute conversation
PUT    /api/conversations/:id/pin      - Pin conversation
PUT    /api/conversations/:id/archive  - Archive conversation
DELETE /api/conversations/:id          - Delete conversation
PUT    /api/conversations/:id/read     - Mark as read
```

### Notifications
```
GET    /api/notifications              - Get notifications
PUT    /api/notifications/:id/read     - Mark as read
PUT    /api/notifications/read-all     - Mark all as read
DELETE /api/notifications/:id          - Delete notification
```

### Media
```
POST   /api/media/upload              - Upload media
GET    /api/media/:conversationId     - Get media from conversation
DELETE /api/media/:mediaId            - Delete media
```

---

## 6. Socket Events (Additions)

### Current Events (Keep these)
```
- register
- message
- receivedMessage
- deleteMessage
- editMessage
- isOnline
- getLoggedInUserInfo
```

### New Socket Events
```
// Typing
- typing           → { conversationId, userId, userName }
- stopTyping       → { conversationId, userId }

// Reactions
- addReaction      → { msgId, userId, emoji }
- removeReaction   → { msgId, userId, emoji }

// Read Receipts
- messageRead      → { msgId, userId, timestamp }
- messagesRead     → { conversationId, userId, lastMsgId }

// Presence
- userOnline       → { userId, status }
- userOffline      → { userId, lastSeen }
- userStatusChange → { userId, status }

// Calls
- callOffer        → { callId, from, to, type, offer }
- callAnswer       → { callId, answer }
- callReject       → { callId }
- callEnd          → { callId }
- iceCandidate     → { callId, candidate }

// Group Events
- userJoinedGroup  → { groupId, userId, userName }
- userLeftGroup    → { groupId, userId }
- groupUpdated     → { groupId, changes }
- userRoleChanged  → { groupId, userId, newRole }

// Notifications
- notification     → { notification }
```

---

## 7. Environment Variables

```env
# Database
MONGODB_URI=mongodb://localhost:27017/chapapp
# or
POSTGRES_URI=postgresql://user:password@localhost:5432/chapapp

# Authentication
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_SECRET=your-refresh-token-secret
REFRESH_TOKEN_EXPIRES_IN=30d

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email (for notifications)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@chapapp.com

# Push Notifications
VAPID_PUBLIC_KEY=your-public-key
VAPID_PRIVATE_KEY=your-private-key
FCM_SERVER_KEY=your-fcm-key

# Server
PORT=4000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Socket.IO
SOCKET_ORIGINS=http://localhost:5173,http://192.168.1.x:5173

# CORS
CORS_ORIGINS=http://localhost:5173,http://192.168.1.x:5173

# Security
BCRYPT_ROUNDS=10
SESSION_SECRET=your-session-secret

# Redis (for caching & sessions)
REDIS_URL=redis://localhost:6379

# WebRTC (for video calls)
TURN_SERVER_URL=turn:your-turn-server.com
TURN_USERNAME=username
TURN_PASSWORD=password
```

---

## 8. Migration Strategy

### Step 1: Set up Database
```bash
# Install MongoDB
npm install mongoose

# Or PostgreSQL
npm install pg sequelize
```

### Step 2: Create Models
Create Mongoose schemas or Sequelize models for each collection

### Step 3: Seed Initial Data
Migrate data from `AllUserInfo.js` and `AllGroupData.js` to database

### Step 4: Update Backend
- Replace in-memory operations with DB queries
- Add authentication middleware
- Implement new API endpoints

### Step 5: Update Frontend
- Add authentication flow (login/signup)
- Implement new features incrementally
- Update socket event handlers

---

## 9. Performance Optimization

### Caching Strategy
- **Redis** for:
  - Online users list
  - Active conversations
  - Unread counts
  - Session data
  - Rate limiting

### Message Pagination
- Load messages in chunks (50-100 per page)
- Implement infinite scroll
- Cache recent messages in memory

### Image Optimization
- Generate thumbnails for images
- Lazy load images
- Use Cloudinary's transformation API

### Database Optimization
- Proper indexing (see section 3)
- Aggregation pipelines for stats
- Connection pooling
- Read replicas for scaling

---

## 10. Security Checklist

- ✅ Password hashing (bcrypt)
- ✅ JWT authentication
- ✅ HTTPS only in production
- ✅ Input validation & sanitization
- ✅ Rate limiting
- ✅ XSS protection
- ✅ CSRF protection
- ✅ SQL injection prevention (parameterized queries)
- ✅ File upload validation
- ✅ Cloudinary signed uploads
- ✅ Environment variable security
- ✅ Session management
- ✅ CORS configuration
- ⬜ End-to-end encryption (future)
- ⬜ 2FA (future)

---

## Summary

This database schema provides a **production-ready foundation** for ChapApp with:

✅ **Scalability** - Designed to handle millions of messages
✅ **Performance** - Optimized indexes and caching strategy
✅ **Features** - 50+ new features planned across 8 categories
✅ **Security** - Comprehensive security measures
✅ **Flexibility** - Easy to extend with new features

**Recommended Tech Stack:**
- **Database:** MongoDB (primary) + Redis (caching)
- **Backend:** Node.js + Express + Socket.IO
- **Auth:** JWT + bcrypt
- **File Storage:** Cloudinary
- **Real-time:** Socket.IO
- **Future:** WebRTC for calls, AI for smart features

**Next Steps:**
1. Choose database (MongoDB recommended)
2. Set up authentication
3. Migrate existing data
4. Implement features phase-by-phase
5. Add tests
6. Deploy to production

Would you like me to start implementing any specific feature or help with the database setup?
