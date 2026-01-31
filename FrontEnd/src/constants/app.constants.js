export const APP_CONSTANTS = {
    SOCKET_EVENTS: {
        CONNECT: 'connect',
        DISCONNECT: 'disconnect',
        REGISTER: 'register',
        MESSAGE: 'message',
        RECEIVED_MESSAGE: 'receivedMessage',
        DELETE_MESSAGE: 'deleteMessage',
        MESSAGE_DELETED: 'messageDeleted',
        EDIT_MESSAGE: 'editMessage',
        MESSAGE_EDITED: 'messageEdited',
        DEL_SELECTED_MSG: 'delSelectedMsg',
        IS_ONLINE: 'isOnline',
        USER_STATUS: 'userStatus',
        GET_LOGGED_IN_USER_INFO: 'getLoggedInUserInfo',
        GROUP_JOIN_REQUEST: 'groupJoinRequest',
        GROUP_JOIN_REQUEST_UPDATE: 'groupJoinRequestUpdate',
        GROUP_MEMBER_UPDATE: 'groupMemberUpdate',
        APPROVE_JOIN_REQUEST: 'approveJoinRequest',
        REJECT_JOIN_REQUEST: 'rejectJoinRequest',
        CANCEL_JOIN_REQUEST: 'cancelJoinRequest',
        JOIN_REQUEST_APPROVED: 'joinRequestApproved',
        JOIN_REQUEST_REJECTED: 'joinRequestRejected',
        JOIN_REQUEST_SENT: 'joinRequestSent',
        JOIN_REQUEST_CANCELED: 'joinRequestCanceled',
        LEAVE_GROUP: 'leaveGroup',
        LEFT_GROUP: 'leftGroup',
        REMOVE_MEMBER: 'removeMember',
        REMOVED_FROM_GROUP: 'removedFromGroup',
    },

    CHAT_TYPES: {
        PRIVATE: 'private',
        GROUP: 'group',
    },

    FILE_TYPES: {
        IMAGE: 'image',
        VIDEO: 'video',
        APPLICATION: 'application',
        RAW: 'raw',
    },

    NOTIFICATION: {
        PERMISSION_GRANTED: 'granted',
        PERMISSION_DENIED: 'denied',
        PERMISSION_DEFAULT: 'default',
    },

    ROUTES: {
        HOME: '/',
        GROUP: '/group',
    },

    API_ENDPOINTS: {
        USERS: '/api/users',
        GROUPS: '/api/groups',
        LINK_PREVIEW: '/link-preview',
    },

    FILE_EXTENSIONS: {
        PDF: { icon: 'fa-file-pdf', color: 'text-red-400' },
        TXT: { icon: 'fa-file-lines', color: 'text-gray-400' },
        DOC: { icon: 'fa-file-word', color: 'text-blue-400' },
        DOCX: { icon: 'fa-file-word', color: 'text-blue-400' },
        XLS: { icon: 'fa-file-excel', color: 'text-green-400' },
        XLSX: { icon: 'fa-file-excel', color: 'text-green-400' },
        PPT: { icon: 'fa-file-powerpoint', color: 'text-orange-400' },
        PPTX: { icon: 'fa-file-powerpoint', color: 'text-orange-400' },
        ZIP: { icon: 'fa-file-zipper', color: 'text-yellow-400' },
        RAR: { icon: 'fa-file-zipper', color: 'text-yellow-400' },
    },
};
