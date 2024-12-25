export const USER_STATUS = {
    INITIAL: 'INITIAL',
    CONNECTING: 'CONNECTING',
    JOINED: 'JOINED',
    CONNECTION_FAILED: 'CONNECTION_FAILED'
};

export const User = {
    username: '',
    socketId: '',
    status: USER_STATUS.INITIAL
};

export const RemoteUser = {
    username: '',
    socketId: ''
};

export const USER_CONNECTION_STATUS = {
    OFFLINE: "offline",
    ONLINE: "online",
}
