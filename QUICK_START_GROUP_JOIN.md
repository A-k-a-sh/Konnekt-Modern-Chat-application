# Quick Start - Testing Group Join Requests

## 🚀 5-Minute Test Guide

### Prerequisites
- Backend running on port 4000
- Frontend running on port 5173
- 2 browser windows/tabs available

---

## Test Flow (Step by Step)

### **Step 1: Start Servers** (if not already running)

```bash
# Terminal 1 - Backend
cd BackEnd
node index.js
# Wait for: "Server running on port 4000"

# Terminal 2 - Frontend  
cd FrontEnd
npm run dev
# Wait for: "Local: http://localhost:5173"
```

---

### **Step 2: Login as Regular User (Browser 1)**

1. Open http://localhost:5173
2. Click on any user in the login modal
3. Select **User 4 (D)** - email: d@example.com
4. You'll see the chat interface

**Verify:** Check backend console shows:
```
User 4 registered with socket [socket-id]
```

---

### **Step 3: Search for a Group**

1. Click the **search icon** (magnifying glass) in left sidebar
2. In the modal, click the **"GROUP"** button
3. You'll see list of all groups

**What you should see:**
- "Code Warriors" (Group 1) - Shows **"Join"** button (User D not in this group)
- "Design Heads" (Group 2) - Shows **"Join"** button  
- "Tech Talk" (Group 3) - Shows **"Join"** button

---

### **Step 4: Send Join Request**

1. Find **"Code Warriors"** (Group 1)
2. Click the **"Join"** button
3. **Instantly** the button changes to:
   - Yellow **"Pending"** badge
   - Red **"Cancel"** button

**Backend console should show:**
```
Group join request from User 4 to Group 1
Emitting groupJoinRequestUpdate to group room 1
```

---

### **Step 5: Login as Admin (Browser 2)**

1. Open http://localhost:5173 in **incognito/private window** (or different browser)
2. Select **User 1 (Akash)** - Admin of Group 1
3. Wait for interface to load

**Verify:** Backend shows:
```
User 1 registered with socket [different-socket-id]
```

---

### **Step 6: View Join Request (Admin View)**

1. In left sidebar, go to **"GROUPS"** section (click "GROUPS" text or icon)
2. Click on **"Code Warriors"** group
3. Click the **info icon** (ℹ️) in top-right of chat area
4. A right panel opens - click **"Requests"** tab

**What you should see:**
- Badge on "Requests" tab showing **"1"**
- User D's join request with:
  - Profile picture
  - Name: "D"
  - Email: "d@example.com"
  - Two buttons: **"Approve"** (green) and **"Reject"** (red)

---

### **Step 7: Approve the Request**

1. Click the **"Approve"** button for User D
2. Watch the magic happen! ✨

**Browser 2 (Admin - Akash):**
- Request disappears from Requests tab
- Go to **"Members"** tab
- User D now appears in members list
- Member count increases

**Browser 1 (User D):**
- Browser notification: **"Join Request Approved - You have been added to Code Warriors"**
- **"Code Warriors"** appears in left sidebar under Groups section
- Can now click and chat in the group!

**Backend console:**
```
User 4 approved for Group 1
Emitting groupMemberUpdate to group room 1
Emitting joinRequestApproved to User 4
```

---

### **Step 8: Test Cancel Request (Optional)**

Want to test canceling? Follow these steps:

**In Browser 1 (User D):**
1. Click search → Groups
2. Find "Design Heads" (Group 2)
3. Click **"Join"** → Button changes to "Pending" + "Cancel"
4. Click **"Cancel"** → Button changes back to "Join"

**In Browser 2 (if User 1 is admin of Group 2):**
- If you had the Requests tab open, you'd see the request appear and disappear in real-time!

---

### **Step 9: Test Rejection (Optional)**

**Setup:** Send another join request from User D to any group

**In Browser 2 (Admin):**
1. Go to that group's Requests tab
2. Click **"Reject"** button

**In Browser 1 (User D):**
- Browser notification: **"Join Request Rejected"**
- Group still shows "Join" button (can try again)
- Group does NOT appear in sidebar

---

## 🎯 Success Criteria

After completing steps 1-7, you should have:

✅ User D successfully joined "Code Warriors"  
✅ Real-time updates working (no page refresh needed)  
✅ Browser notifications appearing  
✅ Group appearing in User D's sidebar  
✅ Backend console showing all socket events  
✅ Admin seeing member count increase  

---

## 🐛 Troubleshooting

### "Join button not changing to Pending"
- Check browser console for errors
- Verify socket connection: `socket.connected` should be `true`
- Ensure backend is running on port 4000

### "Admin not seeing request"
- Check if admin is logged into correct user (User 1 = admin of Group 1)
- Verify backend console shows "User registered" for both users
- Try refreshing admin's browser

### "No browser notification"
- Browser may have blocked notifications
- Click browser's address bar lock icon → Allow notifications
- Test again

### "Group not appearing after approval"
- Check backend console for errors
- Verify `joinRequestApproved` event was emitted
- Try refreshing User D's browser

---

## 📊 Current Test Data

**Groups:**
1. **Code Warriors** (Admin: User 1 - Akash)
   - Members: Akash, B, C
   - Has 1 pending request from User D (pre-loaded)

2. **Design Heads** (Admin: User 3 - C)
   - Members: Akash, C, B
   - No pending requests

3. **Tech Talk** (Admin: User 2 - B)
   - Members: B
   - No pending requests

**Users:**
- User 1 (Akash) - Admin of Group 1, member of Groups 1,2
- User 2 (B) - Admin of Group 3, member of Groups 1,2,3
- User 3 (C) - Admin of Group 2, member of Groups 1,2
- User 4 (D) - Not in any group (perfect for testing!)
- User 5 (E) - Not in any group

---

## 🎬 Next Tests to Try

1. **Multiple Requests:**
   - Login as User 4, 5 in different browsers
   - Both send requests to same group
   - Admin approves/rejects each

2. **Concurrent Actions:**
   - Two admins logged in
   - Both can see and manage requests
   - Test simultaneous approvals

3. **Edge Cases:**
   - Try to approve non-existent request
   - Try joining already-joined group
   - Cancel and immediately re-send request

---

## ✅ You're All Set!

The feature is **fully working**. Refer to these docs for more:
- `GROUP_JOIN_FEATURE_GUIDE.md` - Complete feature documentation
- `GROUP_JOIN_FEATURE_SUMMARY.md` - Implementation overview
