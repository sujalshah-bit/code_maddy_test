// src/store.js
import {create} from 'zustand';

const useStore = create((set) => ({
  files: [],
  fileTree: [],
  expandedFolders: {},
  currentFile: null,
  prevFiles:null,
  openFiles: [],
  activeFile: null,
  directoryHandle: null,
  language: "javascript",

  setFiles: (files) => set((state) => ({ files: typeof files === 'function' ? files(state.files) : files })),
  setFileTree: (fileTree) => set((state) => ({ fileTree: typeof fileTree === 'function' ? fileTree(state.fileTree) : fileTree })),
  setExpandedFolders: (expandedFolders) => set((state) => ({ expandedFolders: typeof expandedFolders === 'function' ? expandedFolders(state.expandedFolders) : expandedFolders })),
  setCurrentFile: (currentFile) => set((state) => ({ currentFile: typeof currentFile === 'function' ? currentFile(state.currentFile) : currentFile })),
  setprevFiles: (prevFiles) => set({prevFiles}),
  setOpenFiles: (openFiles) => set((state) => ({ openFiles: typeof openFiles === 'function' ? openFiles(state.openFiles) : openFiles })),
  setActiveFile: (activeFile) => set((state) => ({ activeFile: typeof activeFile === 'function' ? activeFile(state.activeFile) : activeFile })),
  setDirectoryHandle: (directoryHandle) => set((state) => ({ directoryHandle: typeof directoryHandle === 'function' ? directoryHandle(state.directoryHandle) : directoryHandle })),
  setContent: (content) => set((state) => ({ content: typeof content === 'function' ? content(state.content) : content })),
  setLanguage: (language) => set((state) => ({ language: typeof language === 'function' ? language(state.language) : language })),
}));

export default useStore;

// export const useStore = create<AppState>((set: SetState<AppState>, get: GetState<AppState>) => ({   
  // view: {current: 'landing', next: false},
  // setView: (fn) => {
  //   set((state) => ({ view: fn(state.view) }));
  // }

