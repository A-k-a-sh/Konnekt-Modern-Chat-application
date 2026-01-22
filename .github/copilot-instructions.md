# ChapApp - AI Coding Assistant Instructions

## Architecture Overview

**ChapApp** is a real-time chat application with a monorepo structure:
- **BackEnd/** - Express + Socket.IO server (port 4000)
- **FrontEnd/** - React + Vite SPA (port 5173) with Tailwind CSS

**Core Communication Pattern**: Socket.IO bidirectional events between server and client. Backend maintains in-memory state via `AllUserInfo.js` and `AllGroupData.js` (no database).

## Key Architectural Decisions

### Socket.IO Event-Driven Architecture
Backend socket handlers are modularized in `BackEnd/socketHandler/`:
- `register.js` - User authentication, room joining, broadcasting online status
- `message.js` - Private and group message routing using room-based emit
- `messageUtil.js` - Message deletion, editing, bulk operations
- `groupOperations.js` - Group join requests, approvals, member management
- `isOnline.js` - Real-time presence detection

**Pattern**: Each handler exports a function `(io, socket, users, groupRooms) => {...}` and registers event listeners. All handlers are initialized in `BackEnd/index.js` on connection.

### Frontend State Management
Three React Contexts manage global state:
- **`AllContext.jsx`** - User info, messages, online status, all users/groups data. Fetches initial data from `/api/users` and `/api/groups` on mount.
- **`PanelContext.jsx`** - UI panel visibility (modals, sidebars)
- **`RightContext.jsx`** - Chat area-specific state (selected messages, message area ref)

**Auto-login**: `AllContext` mocks login as userId=1 (Akash) for development convenience.

### Message Routing Logic
- **Private chats**: Backend emits to both sender and receiver socket IDs via `users[userId]` mapping
- **Group chats**: Backend emits to group room via `io.to(groupRooms[groupId])` 
- **Message structure**: `{msgId, sender, receiver, msg, mediaLinks, reply, time, chatType, groupId, forwardFrom}`
- Frontend filters `allMessages` array by `chatType` and IDs in `Right.jsx` using `useMemo`

## Critical Development Workflows

### Starting the Application
```bash
# Terminal 1 - Backend
cd BackEnd
node index.js  # No hot-reload, restart manually after changes

# Terminal 2 - Frontend  
cd FrontEnd
npm run dev    # Vite dev server with HMR at http://localhost:5173
```

### Socket Event Debugging
- Check `BackEnd/index.js` console logs for event registration
- Frontend socket instance: `import { socket } from './SocketConnection.js'`
- Add `console.log` in respective handler files to trace event flow

### Adding New Socket Events
1. Create handler in `BackEnd/socketHandler/` or extend existing
2. Register in `BackEnd/index.js` connection callback
3. Emit from frontend via `socket.emit('eventName', payload)`
4. Listen in frontend via `socket.on('eventName', callback)` in `SocketConnection.js` custom hooks

## Project-Specific Conventions

### File Naming & Organization
- **Frontend components**: PascalCase `.jsx` files (e.g., `ModalImageShow.jsx`)
- **Backend handlers**: camelCase `.js` files (e.g., `groupOperations.js`)
- **Context hooks**: Export `useContextName` alongside Context (e.g., `useAllContext`)
- **Socket utilities**: Organized in `FrontEnd/src/root/Pages/Right Side/SocketConnection.js`

### Data Structure Patterns
- **User objects**: Always include `{userId, userName, email, bio, image}` for consistency
- **Group objects**: Include `{groupId, groupName, adminId, groupImage, groupMembers[], groupJoinRequests[]}`
- **Connected users**: Stored as `connected_to[]` array in user object, hydrated on register event
- **Group hydration**: `AllContext` hydrates groups with full user details via `hydrateGroups()` helper

### Media Handling
Cloudinary integration via `cloudinaryUpload.js`:
- **Upload preset**: `ChatAppMedia` 
- **Folder**: `ChatApp`
- **Resource types**: `image`, `video`, `raw` (for documents)
- Returns `{url, public_id, resource_type}` for embedding in messages

**Critical**: Credentials exposed in `cloudinaryUpload.js` - externalize to env variables for production

### Styling Approach
- **Tailwind utility-first** for layout/spacing
- **Component CSS modules** for complex styles (e.g., `Right.css`, `Left.css`, `Modal.css`)
- **Material-UI (Joy UI) + Ant Design** for specific components - check imports before adding new UI libs

## Integration Points

### REST API Endpoints (Express)
- `GET /api/users` - Returns `AllUserInfo` array
- `GET /api/groups` - Returns `AllGroupData` array  
- `GET /link-preview?url=...` - Open Graph scraper for URL previews
- All proxied via Vite proxy (`/api` → `http://localhost:4000`)

### CORS Configuration
Backend allows origins: `localhost:5173`, `192.168.0.104:5173`, ngrok tunnel. Update both `index.js` and Socket.IO config when adding new origins.

### Socket Connection Lifecycle
1. Frontend registers user on mount via `useSocketConnection` custom hook
2. Backend assigns `socket.id` to `users[userId]` map
3. Backend joins user to all group rooms from `joined_groups[]`
4. Backend emits `getLoggedInUserInfo` with hydrated connected users and groups
5. Frontend listens for `receivedMessage` events to update `allMessages` state

## Common Gotchas

- **Message duplication**: Sender receives their own message via separate emit to avoid showing messages twice - check `message.js` logic
- **Group room names**: Using `groupId` as room identifier (not `groupName`) for uniqueness
- **Context re-renders**: `AllContext` wraps entire app - avoid unnecessary state updates
- **Socket cleanup**: `SocketConnection.js` hooks return cleanup functions - ensure proper unmounting
- **Notification permissions**: Browser notification logic in `handleSocketMessage` - requires user permission grant

## Testing User Flows

**Mock users** (see `AllUserInfo.js`):
- UserID 1 (Akash) - auto-logged in, connected to B & C
- UserID 2 (B) - connected to Akash & D  
- UserID 3 (C) - Designer, admin of "Design Heads"

**To test multi-user chat**: Open multiple browsers/incognito windows and manually trigger login for different users by modifying `AllContext` mock login.

---

**When modifying**: Keep socket event names consistent across frontend/backend. Update both `emit` and `on` listeners when renaming events.
