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
      settings: {
        theme: localStorage.getItem('editorTheme') ?? 'github-dark',
        fontSize: localStorage.getItem('fontSize') ?? 16,
        lineWrapping: localStorage.getItem('lineWrapping') !== 'false',
        isZoom: localStorage.getItem('isZoom'),
      }
    },
    ui: {
      panel: {
        folder: true,
        chat: false,
        settings: false,
      },
      sidebarVisible: localStorage.getItem('sidebarVisible') !== 'false',
      chatPanelVisible: false,
      settingsPanelVisible: false,
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
        setSettings: {
          setTheme: (value) => {
            console.log('suja', { value })
            localStorage.setItem('editorTheme', value);
            set((state) => {
              state.editor.settings.theme = value;
            });
          },
          setLineWrapping: (value) => {
            localStorage.setItem('lineWrapping', value);
            set((state) => {
              state.editor.settings.lineWrapping = value;
            });
          },
          setFontSize: (value) => {
            localStorage.setItem("fontSize", value)
            set((state) => { state.editor.settings.fontSize = value })
          },
          setIsZoom: (value) => {
            localStorage.setItem("isZoom", value)
            set((state) => { state.editor.settings.isZoom = value })
          }
        },
      },
      setUI: {
        setPanel: ((prop, value) => {
          set((state) => {

            state.ui.panel[prop] = value
            if (prop === "folder") {
              state.ui.panel.settings = false
              state.ui.panel.chat = false
            } else if (prop === "settings") {
              state.ui.panel.folder = false
              state.ui.panel.chat = false
            } else {
              state.ui.panel.settings = false
              state.ui.panel.folder = false
            }
          })

        }),
        setSidebarVisible: (value) => {
          localStorage.setItem('sidebarVisible', value);
          set((state) => {
            state.ui.sidebarVisible = value;
          });
        },
        setChatPanelVisible: createSetter('ui.chatPanelVisible'),
        setSettingsPanelVisible: createSetter('ui.settingsPanelVisible'),
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