import React, { createContext, useContext, useMemo, useCallback, useEffect } from 'react';
import { useAppActions, useNotificationActions } from '../stores/appStore';
import { useSocket } from './SocketProvider';
import { SocketEvent } from '../types/socket';
import { useStoreActions } from '../editorStore';
import { useStore } from '../editorStore';
import { useUserStore } from '../stores/userStore';

const FileContext = createContext(null);

export const useFile = () => {
    const context = useContext(FileContext);
    if (!context) {
        throw new Error('useFile must be used within a FileProvider');
    }
    return context;
};

export const FileProvider = ({ children }) => {
    const { setDrawing } = useAppActions();
    const { socket } = useSocket();
    const { addNotification } = useNotificationActions();
    const { files } = useStore();
    const { user } = useUserStore();
    const { setFiles, setEditor } = useStoreActions();

    const saveDrawing = useCallback(async (drawingData) => {
        try {
            const blob = new Blob([JSON.stringify(drawingData)], { type: 'application/json' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `drawing-${Date.now()}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Error saving drawing:', error);
        }
    }, []);

    const loadDrawing = useCallback(async () => {
        try {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            
            input.onchange = async (e) => {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                        try {
                            const drawingData = JSON.parse(event.target.result);
                            setDrawing.setData(drawingData);
                        } catch (error) {
                            console.error('Error parsing drawing file:', error);
                        }
                    };
                    reader.readAsText(file);
                }
            };
            
            input.click();
        } catch (error) {
            console.error('Error loading drawing:', error);
        }
    }, [setDrawing]);

    // Event handlers for file operations
    const handleFileStructureSync = useCallback((data) => {
        console.log('File structure synced:', data);
        setFiles.setOpen(data.openFiles);
        setFiles.setActive(data.activeFile);
        setFiles.setCurrent(data.activeFile)
        setEditor.setContent(data.text);
    }, [setFiles, setEditor]);

    const handleRequestFileContent = useCallback((data) => {
        console.log('Requesting file content:', data);
    }, [setEditor]);

    const handleUserJoined = useCallback(async(user) => {
        console.log('User joined:', user);
        // The user object comes nested inside the data parameter from socket event
        const { user: userData } = user;
        addNotification(`${userData.username} has joined the room`, 'info', 4000);
        
        // Convert FileHandle objects to serializable format before sending
        const serializableOpenFiles = files.open.map(fileHandle => ({
            name: fileHandle.name,
            kind: fileHandle.kind,
            // Add any other needed properties that are serializable
        }));
        
        const serializableActiveFile = files.active ? {
            name: files.active.name,
            kind: files.active.kind
        } : null;
        const file = await files.active.getFile();
    const text = await file.text();

        console.log('Sending serialized file structure:', serializableOpenFiles, serializableActiveFile);
        
        socket.emit(SocketEvent.SYNC_FILE_STRUCTURE, {
            openFiles: serializableOpenFiles,
            activeFile: serializableActiveFile,
            text,
            socketId: userData.socketId,
        });
    }, [addNotification, files, socket]);

    const handleFileRequestFromPeer = useCallback(async ({ fileName }) => {
        console.log('Peer requested file:', fileName);
        // Find the requested file from open files
        const requestedFile = files.open.find(file => file.name === fileName);
        
        if (requestedFile) {
            const file = await requestedFile.getFile();
            const text = await file.text();
            
            // Send the file content back through the server
            socket.emit(SocketEvent.SEND_FILE_CONTENT, {
                fileHandle: {name: requestedFile.name, kind: requestedFile.kind},
                roomId: user.currentRoomId,
                text,
                success: true
            });
        } else {
            socket.emit(SocketEvent.SEND_FILE_CONTENT, {
                fileHandle: {name: null, kind: null},
                roomId: user.currentRoomId,
                success: false,
                error: 'File not found'
            });
        }
    }, [files.open, socket, user.currentRoomId]);

    // Register socket event listeners
    useEffect(() => {
        socket.once(SocketEvent.SYNC_FILE_STRUCTURE, handleFileStructureSync);
        socket.on(SocketEvent.RESYNC_FILE_STRUCTURE, handleFileStructureSync);
        socket.on(SocketEvent.USER_JOINED, handleUserJoined);
        // socket.on(SocketEvent.REQUEST_FILE_CONTENT, handleRequestFileContent);
        socket.on(SocketEvent.FILE_REQUESTED_FROM_PEER, handleFileRequestFromPeer);
        // socket.on(SocketEvent.DIRECTORY_CREATED, handleDirCreated);
        // socket.on(SocketEvent.DIRECTORY_UPDATED, handleDirUpdated);
        // socket.on(SocketEvent.DIRECTORY_RENAMED, handleDirRenamed);
        // socket.on(SocketEvent.DIRECTORY_DELETED, handleDirDeleted);
        // socket.on(SocketEvent.FILE_CREATED, handleFileCreated);
        // socket.on(SocketEvent.FILE_UPDATED, handleFileUpdated);
        // socket.on(SocketEvent.FILE_RENAMED, handleFileRenamed);
        // socket.on(SocketEvent.FILE_DELETED, handleFileDeleted);

        return () => {
            socket.off(SocketEvent.RESYNC_FILE_STRUCTURE, handleFileStructureSync);
            socket.off(SocketEvent.USER_JOINED, handleUserJoined);
            // socket.off(SocketEvent.REQUEST_FILE_CONTENT, handleRequestFileContent);
            socket.off(SocketEvent.FILE_REQUESTED_FROM_PEER, handleFileRequestFromPeer);
            // socket.off(SocketEvent.DIRECTORY_CREATED, handleDirCreated);
            // socket.off(SocketEvent.DIRECTORY_UPDATED, handleDirUpdated);
            // socket.off(SocketEvent.DIRECTORY_RENAMED, handleDirRenamed);
            // socket.off(SocketEvent.DIRECTORY_DELETED, handleDirDeleted);
            // socket.off(SocketEvent.FILE_CREATED, handleFileCreated);
            // socket.off(SocketEvent.FILE_UPDATED, handleFileUpdated);
            // socket.off(SocketEvent.FILE_RENAMED, handleFileRenamed);
            // socket.off(SocketEvent.FILE_DELETED, handleFileDeleted);
        };
    }, [handleFileStructureSync, handleUserJoined, handleRequestFileContent, handleFileRequestFromPeer, socket]);

    // Add this new useEffect after your existing useEffect
    useEffect(() => {
        console.log(socket, user?.currentRoomId, files.open.length > 0, files.active);
        if (socket && user?.currentRoomId && (files.open.length > 0 || files.active)) {
            const serializableOpenFiles = files.open.map(fileHandle => ({
                name: fileHandle.name,
                kind: fileHandle.kind,
            }));
            
            const serializableActiveFile = files.active ? {
                name: files.active.name,
                kind: files.active.kind
            } : null;

            socket.emit(SocketEvent.RESYNC_FILE_STRUCTURE, {
                openFiles: serializableOpenFiles,
                activeFile: serializableActiveFile,
                roomId: user.currentRoomId
            });
        }
    }, [files.open, files.active, socket, user?.currentRoomId]);

    const value = useMemo(() => ({
        saveDrawing,
        loadDrawing
    }), [saveDrawing, loadDrawing]);

    return (
        <FileContext.Provider value={value}>
            {children}
        </FileContext.Provider>
    );
};

export default FileContext; 