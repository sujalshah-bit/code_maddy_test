import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
const createStore = (set, get) => {
 const createSetter = (key) => (value) => 
   set((state) => {
     const keys = key.split('.');
     let current = state;
     for (let i = 0; i < keys.length - 1; i++) {
       current = current[keys[i]];
     }
     current[keys[keys.length - 1]] = typeof value === 'function' 
       ? value(current[keys[keys.length - 1]]) 
       : value;
   });
  return {
   users: {
     list: [],
     current: null,
     isSharer: false,
     status: 'INITIAL',
   },
   drawing: {
     data: null,
   },
   chat: {
    messages: [],
    messageCounter: 0,
   },
   errors: {
     list: [],
   },
   notifications: {
     errors: [],
     success: [],
     info: [],
     warning: [],
   },
   actions: {
     setUsers: {
       setList: createSetter('users.list'),
       setCurrent: createSetter('users.current'),
       setIsSharer: createSetter('users.isSharer'),
       setStatus: createSetter('users.status'),
     },
     setDrawing: {
       setData: createSetter('drawing.data'),
     },
     setChat: {
      setMessages: createSetter('chat.messages'),
      setMessageCounter: createSetter('chat.messageCounter'),
     },
     setErrors: {
       addError: (error) => set((state) => {
         state.errors.list.push({
           id: Date.now(),
           message: error,
           timestamp: new Date(),
         });
       }),
       clearError: (id) => set((state) => {
         state.errors.list = state.errors.list.filter(error => error.id !== id);
       }),
       clearAllErrors: () => set((state) => {
         state.errors.list = [];
       }),
     },
     notifications: {
       addNotification: (message, type = 'info', duration = 3000) => set((state) => {
         const notification = {
           id: Date.now(),
           message,
           timestamp: new Date(),
           duration,
         };
         state.notifications[type].push(notification);
       }),
       clearNotification: (id, type) => set((state) => {
         state.notifications[type] = state.notifications[type].filter(
           notification => notification.id !== id
         );
       }),
       clearAllNotifications: () => set((state) => {
         state.notifications = {
           errors: [],
           success: [],
           info: [],
           warning: [],
         };
       }),
     },
     resetState: () => set((state) => {
       state.users = {
         list: [],
         current: null,
         status: 'INITIAL',
       };
       state.drawing = {
         data: null,
       };
       state.errors = {
         list: [],
       };
       state.notifications = {
         errors: [],
         success: [],
         info: [],
         warning: [],
       };
     }),
     logState: () => {
       console.log('Current State:', JSON.parse(JSON.stringify(get())));
     },
   },
  };
};

// create the hooks for the store and actions
const useAppStore = create(immer(createStore));
const useAppActions = () => useAppStore((state) => state.actions);
const useNotificationActions = () => useAppStore((state) => state.actions.notifications);

export { useAppStore, useAppActions, useNotificationActions };