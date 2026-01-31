# Quick Reference: Database Architecture

## 🎯 Current State: All Features Database-Connected

### Backend Architecture

```
┌─────────────────────────────────────────────────────┐
│                   MongoDB Database                   │
│         mongodb://localhost:27017/chapapp            │
└──────────────────┬──────────────────────────────────┘
                   │
    ┌──────────────┼──────────────┐
    │              │              │
┌───▼────┐   ┌────▼─────┐   ┌───▼─────┐
│ users  │   │  groups  │   │messages │
└────────┘   └──────────┘   └─────────┘
    │              │              │
    └──────────────┼──────────────┘
                   │
    ┌──────────────┴──────────────┐
    │                             │
┌───▼────────┐          ┌─────────▼─────┐
│  REST API  │          │  Socket.IO    │
│            │          │  Real-time    │
│ /api/users │          │  Events       │
│ /api/groups│          │               │
│ /api/messages         │ register      │
└────────────┘          │ message       │
                        │ isOnline      │
                        │ group ops     │
                        └───────────────┘
                               │
                        ┌──────▼────────┐
                        │   Frontend    │
                        │  React App    │
                        └───────────────┘
```

---

## 📁 File Status

### ✅ Connected to Database (Use These)

**Backend:**
- `models/User.js` - User model with auto-increment userId
- `models/Group.js` - Group model with auto-increment groupId
- `models/Message.js` - Message model with UUID msgId
- `socketHandler/*.js` - All 5 handlers use models
- `controllers/*.js` - All controllers query MongoDB
- `routes/*.js` - All routes connected

**Frontend:**
- `Context/AllContext.jsx` - Fetches from `/api/users` and `/api/groups`
- `services/message.service.js` - Message API calls
- `services/group.service.js` - Group CRUD operations
- `hooks/useMessageHistory.js` - Loads from database

### ⚠️ Deprecated (Don't Use in App Logic)

**Backend:**
- `AllUserInfo.js` - Only for `scripts/seedDatabase.js`
- `AllGroupData.js` - Only for `scripts/seedDatabase.js`

**Frontend:**
- `root/Pages/Left side/LeftGroupChat/groupData.js` - Unused, can delete

---

## 🔄 Data Flow Examples

### Example 1: Send Message
```
User clicks send
    ↓
socket.emit('message', {...})
    ↓
Backend: socketHandler/message.js
    ↓
Message.create() → MongoDB
    ↓
io.emit('receivedMessage', {...})
    ↓
Frontend: useSocketMessage hook
    ↓
setAllMessages([...existing, newMsg])
```

### Example 2: Load Chat History
```
User selects chat
    ↓
useMessageHistory hook
    ↓
fetchMessageHistory(chatType, id, page)
    ↓
GET /api/messages
    ↓
Backend: messageController.getMessages()
    ↓
Message.find().sort().limit() → MongoDB
    ↓
Returns paginated results
    ↓
Frontend displays messages
```

### Example 3: Create Group
```
User fills form + uploads image
    ↓
cloudinaryUpload(file) → Cloudinary
    ↓
createGroup({name, image, desc, adminId})
    ↓
POST /api/groups
    ↓
Backend: groupController.createGroup()
    ↓
Group.create() → MongoDB
    ↓
Returns new group
    ↓
socket.emit('register') to join room
    ↓
Frontend updates state
```

---

## 🔌 Socket Events (All DB-Connected)

| Event | Handler | Database Action |
|-------|---------|-----------------|
| `register` | register.js | Update user status, fetch user data |
| `message` | message.js | Save message to DB, emit to recipients |
| `deleteMessage` | messageUtil.js | Soft delete (add to deletedFor array) |
| `editMessage` | messageUtil.js | Update message content |
| `delSelectedMsg` | messageUtil.js | Bulk soft delete |
| `isOnline` | isOnline.js | Check user status in DB |
| `groupJoinRequest` | groupOperations.js | Add to group.groupJoinRequests |
| `approveJoinRequest` | groupOperations.js | Move to groupMembers, update user |
| `rejectJoinRequest` | groupOperations.js | Remove from groupJoinRequests |
| `disconnect` | index.js | Set user offline, clear socketId |

---

## 🗄️ Database Indexes (For Performance)

```javascript
// users collection
{ userId: 1 } - unique
{ email: 1 } - unique
{ status: 1 }

// groups collection
{ groupId: 1 } - unique

// messages collection
{ msgId: 1 } - unique
{ senderId: 1, receiverId: 1 }
{ groupId: 1 }
{ chatType: 1 }
{ time: -1 } - for sorting
```

---

## 🧪 How to Test Database Integration

### Test 1: Message Persistence
```bash
1. Send a message
2. Restart backend: Ctrl+C, then node index.js
3. Reload frontend
4. Message should still be there ✅
```

### Test 2: Group Creation
```bash
1. Create a new group with image
2. Check MongoDB: use chapapp; db.groups.find().pretty()
3. Should see the group with Cloudinary URL ✅
```

### Test 3: User Status
```bash
1. User A logs in
2. User B checks if A is online
3. User A closes browser
4. After disconnect event, A should be offline ✅
```

---

## 📊 MongoDB Shell Quick Commands

```bash
# Connect to database
mongosh mongodb://localhost:27017/chapapp

# View all users
db.users.find().pretty()

# View all groups
db.groups.find().pretty()

# View recent messages
db.messages.find().sort({time: -1}).limit(10).pretty()

# Count documents
db.users.countDocuments()
db.messages.countDocuments()

# Reset database (then run seed script)
db.users.deleteMany({})
db.groups.deleteMany({})
db.messages.deleteMany({})
```

---

## 🚀 Next Steps

Now that database is fully integrated, you can focus on:

1. **UI/UX improvements** - All data persists automatically
2. **Authentication flow** - JWT system ready, just needs login page
3. **Advanced features** - Search, notifications, media gallery
4. **Performance** - Add caching, optimize queries
5. **Deployment** - MongoDB Atlas for production

---

**Status**: ✅ All features connected to MongoDB  
**Last Verified**: January 31, 2026
