import { useCallback } from 'react';
import { useSocket } from '../context/SocketProvider';
import { SocketEvent } from '../types/socket';

export const useSocketActions = () => {
    const { socket } = useSocket();

    const emitJoinRequest = useCallback((userData) => {
        socket.emit(SocketEvent.JOIN_REQUEST, userData);
    }, [socket]);

    const emitDrawingUpdate = useCallback((drawingData) => {
        socket.emit(SocketEvent.DRAWING_UPDATE, drawingData);
    }, [socket]);

    const emitMessage = useCallback((message) => {
        socket.emit(SocketEvent.SEND_MESSAGE, message);
    }, [socket]);

    return {
        emitJoinRequest,
        emitDrawingUpdate,
        emitMessage
    };
}; 