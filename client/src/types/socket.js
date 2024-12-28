import { Socket } from "socket.io-client"

const SocketEvent = {
    JOIN_REQUEST: "join-request",
    JOIN_ACCEPTED: "join-accepted",
    USER_JOINED: "user-joined",
    REQUEST_FILE_CONTENT: "request-file-content",
    FILE_REQUESTED_FROM_PEER: "file-requested-from-peer",
    REQUEST_FILE_CONTENT_RESPONSE: "request-file-content-response",
    ROOM_FULL: "room-full",
    SEND_FILE_CONTENT: "send-file-content",
    USER_DISCONNECTED: "user-disconnected",
    SYNC_FILE_STRUCTURE: "sync-file-structure",
    RESYNC_FILE_STRUCTURE: "resync-file-structure",
    RESYNC_OPEN_FILES: "resync-open-files",
    DIRECTORY_CREATED: "directory-created",
    DIRECTORY_UPDATED: "directory-updated",
    DIRECTORY_RENAMED: "directory-renamed",
    DIRECTORY_DELETED: "directory-deleted",
    FILE_CREATED: "file-created",
    FILE_UPDATED: "file-updated",
    FILE_RENAMED: "file-renamed",
    FILE_DELETED: "file-deleted",
    USER_OFFLINE: "offline",
    USER_ONLINE: "online",
    SEND_MESSAGE: "send-message",
    RECEIVE_MESSAGE: "receive-message",
    TYPING_START: "typing-start",
    TYPING_PAUSE: "typing-pause",
    USERNAME_EXISTS: "username-exists",
    REQUEST_DRAWING: "request-drawing",
    SYNC_DRAWING: "sync-drawing",
    DRAWING_UPDATE: "drawing-update",
}

const SocketContext = {
    socket: Socket
}

export { SocketEvent, SocketContext }
