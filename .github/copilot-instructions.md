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
- **`RightContext.jsx`** - Chat area-specific state (selected messages, message area ref using Map with automatic cleanup)

**Auto-login**: `AllContext` mocks login as userId=1 (Akash) for development convenience.

**Socket Hooks** (modular architecture in `hooks/`):
- `useSocketConnection` - Initial registration, user info hydration
- `useSocketMessage` - Incoming message listener with browser notifications
- `useChangeMessage` - Message edit/delete event handler
- `useIsOnline` - Real-time presence detection
- `useSelectedMessageDelete` - Bulk message deletion

**Socket Service** (`services/socket.service.js`): Exports singleton socket instance initialized with `VITE_SOCKET_URL`

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
cp .env.example .env  # First time only - configure your values
node index.js  # No hot-reload, restart manually after changes

# Terminal 2 - Frontend  
cd FrontEnd
cp .env.example .env  # First time only - add Cloudinary credentials
npm run dev    # Vite dev server with HMR at http://localhost:5173
```

**Environment Setup:**
- Backend requires `.env` with PORT, CORS_ORIGINS, SOCKET_ORIGINS
- Frontend requires `.env` with VITE_SOCKET_URL and Cloudinary credentials
- See `.env.example` files for required variables

### Socket Event Debugging
- Check `BackEnd/index.js` console logs for event registration
- Frontend socket instance: `import { socket } from './SocketConnection.js'`
- Add `console.log` in respective handler files to trace event flow

### Adding New Socket Events
1. Create handler in `BackEnd/socketHandler/` or extend existing
2. Register in `BackEnd/index.js` connection callback
3. Emit from frontend via `socket.emit('eventName', payload)` using utilities in `utils/socketEmitters.util.js`
4. Listen in frontend via dedicated custom hook in `hooks/` directory (follow pattern from existing socket hooks)

## Project-Specific Conventions

### File Naming & Organization
- **Frontend components**: PascalCase `.jsx` files (e.g., `ModalImageShow.jsx`)
- **Backend handlers**: camelCase `.js` files (e.g., `groupOperations.js`)
- **Context hooks**: Export `useContextName` alongside Context (e.g., `useAllContext`)
- **Modular architecture**:
  - `hooks/` - Custom React hooks (useSocketConnection, useSocketMessage, etc.)
  - `services/` - External integrations (socket.service.js, cloudinary.service.js)
  - `utils/` - Pure utility functions (socketEmitters.util.js, dateTime.util.js)
  - `constants/` - App-wide constants (app.constants.js)
- **Barrel exports**: Each directory has `index.js` for clean imports
  - Import hooks: `import { useSocketMessage } from '../hooks'`
  - Import services: `import { socket, uploadToCloudinary } from '../services'`
  - Import utils: `import { deleteMsg, formatDateTime } from '../utils'`

### Data Structure Patterns
- **User objects**: Always include `{userId, userName, email, bio, image}` for consistency
- **Group objects**: Include `{groupId, groupName, adminId, groupImage, groupMembers[], groupJoinRequests[]}`
- **Connected users**: Stored as `connected_to[]` array in user object, hydrated on register event
- **Group hydration**: `AllContext` hydrates groups with full user details via `hydrateGroups()` helper

### Media Handling
Cloudinary integration via environment variables:
- **Configuration**: `FrontEnd/.env` contains all Cloudinary credentials
- **Upload preset**: Defined in VITE_CLOUDINARY_UPLOAD_PRESET
- **Folder**: Defined in VITE_CLOUDINARY_FOLDER
- **Resource types**: `image`, `video`, `raw` (for documents)
- **Service**: All upload/delete operations in `services/cloudinary.service.js`
- **Download**: File download utilities in `services/cloudinaryDownload.service.js`
- Returns `{url, public_id, resource_type}` for embedding in messages

**Security**: All credentials now in `.env` files (not committed to git)

### Styling Approach
- **Tailwind utility-first** for layout/spacing
- **Component CSS modules** for complex styles (e.g., `Right.css`, `Left.css`, `Modal.css`)
- **Material-UI (Joy UI) + Ant Design** for specific components - check imports before adding new UI libs

## Integration Points

### REST API Endpoints (Express)
- `GET /api/users` - Returns `AllUserInfo` array
- `GET /api/groups` - Returns `AllGroupData` array  
- `GET /link-preview?url=...` - Open Grconfigured in `vite.config.js`)

### CORS Configuration
Backend uses environment variables for allowed origins:
- `CORS_ORIGINS` - Comma-separated list for Express CORS
- `SOCKET_ORIGINS` - Comma-separated list for Socket.IO
- Update `BackEnd/.env` when adding new origins (e.g., production domains)
Backend allows origins: `localhost:5173`, `192.16via `useSocketMessage` hook to update `allMessages` state

**Socket Hooks:**
- `useSocketConnection` - Initial registration and user info
- `useSocketMessage` - Listens for new messages
- `useChangeMessage` - Handles message edits/deletes
- `useIsOnline` - Real-time presence detectionUpdate both `index.js` and Socket.IO config when adding new origins.

### Socket Connection Lifecycle
1. Frontend registers user on mount via `useSocketConnection` custom hook
2. Backend assigns `socket.id` to `users[userId]` map
3. Backend joins user to all group rooms from `joined_groups[]`
4. Backend emits `getLoggedInUserInfo` with hydrated connected users and groups
5. Frontend listens for `receivedMessage` events to update `allMessages` state via `useSocketMessage` hook

**Socket Hooks:**
- `useSocketConnection` - Initial registration and user info
- `useSocketMessage` - Listens for new messages with browser notifications
- `useChangeMessage` - Handles message edits/deletes
- `useIsOnline` - Real-time presence detection
- `useSelectedMessageDelete` - Bulk message deletion

**Socket Emitters** (`utils/socketEmitters.util.js`):
- `deleteMsg` - Delete single message
- `editMsg` - Edit message content
- `handleSubmit` - Send new message (private/group)
- `delSelectedMsg` - Delete multiple selected messages

## Common Gotchas

- **Duplicate messages**: Backend should emit to sender separately from receivers to avoid double display - check `message.js` logic
- **Group room names**: Using `groupId` as room identifier (not `groupName`) for uniqueness
- **Context re-renders**: `AllContext` wraps entire app - avoid unnecessary state updates
- **Socket cleanup**: All socket hooks implement proper cleanup functions
- **Ref management**: Message refs use Map with automatic cleanup (via `setMessageRef` callback)
- **Notification permissions**: Browser notification logic in `useSocketMessage` hook - requires user permission grant

## Testing User Flows

**Mock users** (see `AllUserInfo.js`):
- UserID 1 (Akash) - auto-logged in, connected to B & C
- UserID 2 (B) - connected to Akash & D  
- UserID 3 (C) - Designer, admin of "Design Heads"

**To test multi-user chat**: Open multiple browsers/incognito windows and manually trigger login for different users by modifying `AllContext` mock login.

---

**When modifying**: Keep socket event names consistent across frontend/backend. Update both `emit` and `on` listeners when renaming events.
