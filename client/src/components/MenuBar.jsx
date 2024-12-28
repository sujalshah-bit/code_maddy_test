// src/components/MenuBar.jsx

import { getLanguageFromFileExtension } from "../util/util";
import { useStoreActions, useStore } from "../editorStore";
import { useEditor } from "../Context/EditorContext";
import { useUserStore } from "../stores/userStore";

const MenuBar = () => {
  const { editorRef } = useEditor();
  const { files } = useStore();
  const { actions: { setUser } } = useUserStore();
  const { setFiles, setEditor, setUI } = useStoreActions();
  const openFile = async () => {
    try {
      const [fileHandle] = await window.showOpenFilePicker();
      const file = await fileHandle.getFile();
      const text = await file.text();
      const language = getLanguageFromFileExtension(file.name);

      setFiles.setCurrent(fileHandle);
      setEditor.setContent(text);
      setEditor.setLanguage(language);
      setFiles.setActive(fileHandle);

      setUser.setIsSharer(true);

      setFiles.setOpen((prevOpenFiles) => {
        if (!prevOpenFiles.some((f) => f.name === fileHandle.name)) {
          return [...prevOpenFiles, fileHandle];
        }
        return prevOpenFiles;
      });

      if (editorRef.current) {
        editorRef.current.setValue(text);
      }
    } catch (error) {
      console.error("Error opening file:", error);
    }
  };

  const saveFile = async () => {
    if(files.open.length === 0){
      return;
    }
    if (files.current) {
      const writable = await files.current.createWritable();
      await writable.write(editorRef.current.getValue());
      await writable.close();
    } else {
      saveFileAs();
    }
  };

  const saveFileAs = async () => {
    try {
      if(files.open.length === 0){
        return;
      }
      const newFileHandle = await window.showSaveFilePicker();
      const writable = await newFileHandle.createWritable();
      await writable.write(editorRef.current.getValue());
      await writable.close();
      setFiles.setCurrent(newFileHandle);
    } catch (error) {
      console.error("Error saving file:", error);
    }
  };

  const readDirectory = async (directoryHandle) => {
    const directories = [];
    const files = [];
  
    for await (const entry of directoryHandle.values()) {
      if (entry.kind === "file") {
        files.push({ name: entry.name, kind: "file", handle: entry });
      } else if (entry.kind === "directory") {
        directories.push({
          name: entry.name,
          kind: "directory",
          handle: entry,
          children: [],
        });
      }
    }
  
    // Sort directories and files alphabetically by name
    directories.sort((a, b) => a.name.localeCompare(b.name));
    files.sort((a, b) => a.name.localeCompare(b.name));
    directoryHandle.children = [...directories, ...files]
    // Combine sorted directories and files
    return [...directories, ...files];
    // return directoryHandle;
  };

  const openFolder = async () => {
    try {
      const directoryHandle = await window.showDirectoryPicker();
      const fileTree = await readDirectory(directoryHandle);
      setFiles.setTree(fileTree);
      setEditor.setDirectoryHandle(directoryHandle);
      setEditor.setContent(null);
      setUI.setSidebarVisible(true);
      setUI.setChatPanelVisible(false);
      setFiles.setOpen([]);
      setUser.setIsSharer(true);
    } catch (error) {
      console.error("Error opening folder:", error);
    }
  };

  return (
    <div className="w-full flex bg-gray-900 text-white relative">
      <img
        src="https://placehold.co/20"
        className="mx-2"
        width={20}
        height={10}
        alt=""
      />
      <div className="w-full text-gray-400 ">
        <button
                onClick={openFile}
                className="menu-item px-4 py-2 hover:bg-gray-700 text-left"
              >
                Open File
              </button>
              <button
                onClick={openFolder}
                className="menu-item px-4 py-2 hover:bg-gray-700 text-left"
              >
                Open Folder
              </button>
              <button
                onClick={saveFile}
                className="menu-item px-4 py-2 hover:bg-gray-700 text-left"
              >
                Save
              </button>
              <button
                onClick={saveFileAs}
                className="menu-item px-4 py-2 hover:bg-gray-700 text-left"
              >
                Save As
              </button>
      </div>
    </div>
  );
};

export default MenuBar;
