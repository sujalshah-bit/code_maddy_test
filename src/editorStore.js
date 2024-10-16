// src/editorStore.js
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
    files: {
      list: [],
      tree: [],
      open: [],
      active: null,
      current: null,
      prev: null,
    },
    folders: {
      expanded: {},
    },
    editor: {
      language: "javascript",
      directoryHandle: null,
      content: null,
    },
    actions: {
      setFiles: {
        setList: createSetter('files.list'),
        setTree: createSetter('files.tree'),
        setOpen: createSetter('files.open'),
        setActive: createSetter('files.active'),
        setCurrent: createSetter('files.current'),
        setPrev: createSetter('files.prev'),
      },
      setFolders: {
        setExpanded: createSetter('folders.expanded'),
      },
      setEditor: {
        setLanguage: createSetter('editor.language'),
        setContent: createSetter('editor.content'),
        setDirectoryHandle: createSetter('editor.directoryHandle'),
      },
      resetState: () => set((state) => {
        state.files = {
          list: [],
          tree: [],
          open: [],
          active: null,
          current: null,
          prev: null,
        };
        state.folders = { expanded: {} };
        state.editor = {
          language: "javascript",
          directoryHandle: null,
        };
      }),
      logState: () => {
        console.log('Current State:', JSON.parse(JSON.stringify(get())));
      },
    },
  };
};

const useStore = create(immer(createStore));

// Create a hook for actions
const useStoreActions = () => useStore((state) => state.actions);

export { useStore, useStoreActions };