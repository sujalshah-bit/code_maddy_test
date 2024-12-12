import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

const createUserStore = (set) => {
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
    user: {
      username: localStorage.getItem('username') || '',
      currentRoomId: null,
      isValid: false,
      isSharer: false,
    },
    actions: {
      setUser: {
        setUsername: (username) => {
          localStorage.setItem('username', username);
          set((state) => {
            state.user.username = username;
          });
        },
        setCurrentRoomId: createSetter('user.currentRoomId'),
        setIsValid: createSetter('user.isValid'),
        setIsSharer: createSetter('user.isSharer'),
      },
      resetUser: () => {
        localStorage.removeItem('username');
        set((state) => {
          state.user = {
            username: '',
            isSharer: false,
            currentRoomId: null,
            isValid: false,
          };
        });
      },
    },
  };
};

const useUserStore = create(immer(createUserStore));
const useUserActions = () => useUserStore((state) => state.actions);

export { useUserStore, useUserActions }; 