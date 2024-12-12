import React, { useCallback, useContext, useEffect, useMemo } from 'react';
import { io } from 'socket.io-client';
// import { toast } from 'react-hot-toast';
import SocketContext from './SocketContext';
import { SocketEvent } from '../types/socket';
import { USER_STATUS } from '../types/user';
// import { useAppContext } from './AppContext';
import { useAppStore, useAppActions, useNotificationActions } from '../stores/appStore';

export const useSocket = () => {
    const context = useContext(SocketContext);
    if (!context) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
};

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';

export const SocketProvider = ({ children }) => {
    const { drawing } = useAppStore();
    const { setUsers, setDrawing } = useAppActions();
    const {  addNotification } = useNotificationActions();

    // Initialize socket with memoization
    const socket = useMemo(
        () => io(BACKEND_URL, {
            reconnectionAttempts: 2
        }),
        []
    );

    // Error handler
    const handleError = useCallback(() => {
        addNotification('Failed to connect to the server', 'errors');
        setUsers.setStatus(USER_STATUS.CONNECTION_FAILED);
    }, [addNotification, setUsers]);

    // Username existence handler
    const handleUsernameExist = useCallback(() => {
        setUsers.setStatus(USER_STATUS.INITIAL);
        addNotification('The username you chose already exists in the room. Please choose a different username.', 'errors');
    }, [addNotification, setUsers]);

    // Room full handler
    const handleRoomFull = useCallback(() => {
        setUsers.setStatus(USER_STATUS.INITIAL);
        addNotification('The room is full. Please choose a different room.', 'errors');
    }, [addNotification, setUsers]);

    // Join acceptance handler
    const handleJoiningAccept = useCallback(({ user, users }) => {
        setUsers.setCurrent(user);
        setUsers.setList(users);
        setUsers.setStatus(USER_STATUS.JOINED);

        if (users.length > 1) {
            console.log('Syncing data, please wait...');
        }
    }, [setUsers]);

    // User disconnection handler
    const handleUserLeft = useCallback(({ user }) => {
        console.log(`${user.username} left the room`);
        setUsers(prevUsers => 
            prevUsers.filter(u => u.username !== user.username)
        );
    }, [setUsers]);

    // Drawing request handler
    const handleRequestDrawing = useCallback(({ socketId }) => {
        socket.emit(SocketEvent.SYNC_DRAWING, { socketId, drawing });
    }, [socket, drawing]);

    // Drawing sync handler
    const handleDrawingSync = useCallback(({ drawingData }) => {
        setDrawing.setData(drawingData);
    }, [setDrawing]);

    // Socket event listeners
    useEffect(() => {
        const eventHandlers = {
            'connect_error': handleError,
            'connect_failed': handleError,
            [SocketEvent.USERNAME_EXISTS]: handleUsernameExist,
            [SocketEvent.ROOM_FULL]: handleRoomFull,
            [SocketEvent.JOIN_ACCEPTED]: handleJoiningAccept,
            [SocketEvent.USER_DISCONNECTED]: handleUserLeft,
            [SocketEvent.REQUEST_DRAWING]: handleRequestDrawing,
            [SocketEvent.SYNC_DRAWING]: handleDrawingSync
        };

        // Register all event listeners
        Object.entries(eventHandlers).forEach(([event, handler]) => {
            socket.on(event, handler);
        });

        // Cleanup function
        return () => {
            Object.keys(eventHandlers).forEach(event => {
                socket.off(event);
            });
        };
    }, [socket, handleError, handleUsernameExist, handleJoiningAccept, handleUserLeft, handleRequestDrawing, handleDrawingSync, handleRoomFull]);

    // Helper functions for common socket operations
    const socketActions = useMemo(() => ({
        joinRoom: (userData) => {
            socket.emit(SocketEvent.JOIN_REQUEST, userData);
        },
        sendMessage: (message) => {
            socket.emit(SocketEvent.SEND_MESSAGE, message);
        },
        updateDrawing: (drawingData) => {
            socket.emit(SocketEvent.DRAWING_UPDATE, drawingData);
        },
        disconnect: () => {
            socket.disconnect();
        }
    }), [socket]);

    const value = useMemo(() => ({
        socket,
        ...socketActions
    }), [socket, socketActions]);

    return (
        <SocketContext.Provider value={value}>
            {children}
        </SocketContext.Provider>
    );
}; 