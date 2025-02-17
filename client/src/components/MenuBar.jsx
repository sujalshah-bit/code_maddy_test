// src/components/MenuBar.jsx

import { getLanguageFromFileExtension } from "../util/util";
import { useStoreActions, useStore } from "../editorStore";
import { useUserStore } from "../stores/userStore";
import { SocketEvent } from "../types/socket";
import { useSocket } from "../Context/SocketProvider";
import { useAppStore, useNotificationActions } from "../stores/appStore";
import { Diameter, Menu, X } from "lucide-react";

const MenuBar = () => {
  const { addNotification } = useNotificationActions();
  const { files, editor, ui } = useStore();
  const {
    user,
    actions: { setUser },
  } = useUserStore();
  const { users, dimension, actions, isMobileMenuOpen } = useAppStore();
  const { socket } = useSocket();
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
      const roomFull = users.list.length > 1;

      if (roomFull) {
        socket.emit(SocketEvent.RESYNC_FILE_STRUCTURE, {
          openFiles: [{ name: fileHandle.name, kind: fileHandle.kind }],
          activeFile: { name: fileHandle.name, kind: fileHandle.kind },
          roomId: user.currentRoomId,
        });
      }
    } catch (error) {
      console.error("Error opening file:", error);
    }
  };

  const saveFile = async () => {
    if (files.open.length === 0) {
      return;
    }
    if (files.current) {
      const writable = await files.current.createWritable();
      await writable.write(editor.content);
      await writable.close();
      addNotification(`${files.current.name} saved`, "success", 850);
    } else {
      saveFileAs();
    }
  };

  const saveFileAs = async () => {
    try {
      if (files.open.length === 0) {
        return;
      }
      const newFileHandle = await window.showSaveFilePicker();
      const writable = await newFileHandle.createWritable();
      await writable.write(editor.content);
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
    directoryHandle.children = [...directories, ...files];
    // Combine sorted directories and files
    return [...directories, ...files];
    // return directoryHandle;
  };

  const openFolder = async () => {
    try {
      console.log(window);
      const directoryHandle = await window.showDirectoryPicker();
      const fileTree = await readDirectory(directoryHandle);
      setFiles.setTree(fileTree);
      setEditor.setDirectoryHandle(directoryHandle);
      setEditor.setContent(null);
      setUI.setPanel("folder", true);
      setFiles.setOpen([]);
      setUser.setIsSharer(true);
    } catch (error) {
      console.error("Error opening folder:", error);
    }
  };

  const handleMenuClick = () => {
    actions.setIsMobileMenuOpen(!isMobileMenuOpen);
    if (!ui.panel.chat && !ui.panel.folder && !ui.panel.settings)
      setUI.setPanel("folder", true);
  };

  return (
    <div className="w-full flex bg-gray-900 text-white relative">
      {dimension.isMobile ? (
        <div className="relative">
        {isMobileMenuOpen ? (
          <X
            onClick={() => handleMenuClick()}
            className="mx-2 cursor-pointer my-2 transition-transform duration-100 ease-in-out transform rotate-180 opacity-100"
          />
        ) : (
          <Menu
            onClick={() => handleMenuClick()}
            className="mx-2 cursor-pointer my-2 transition-transform duration-100 ease-in-out transform rotate-0 opacity-100"
          />
        )}
      </div>
      
      ) : (
        <div className="w-full text-gray-400 ">
          <button
            onClick={openFile}
            className="menu-item px-1 md:px-4 md:py-2 hover:bg-gray-700 text-left"
          >
            Open File
          </button>
          <button
            onClick={openFolder}
            className="menu-item px-1 md:px-4 md:py-2 hover:bg-gray-700 text-left"
          >
            Open Folder
          </button>
          <button
            onClick={saveFile}
            className="menu-item px-1 md:px-4 md:py-2 hover:bg-gray-700 text-left"
          >
            Save
          </button>
          <button
            onClick={saveFileAs}
            className="menu-item px-1 md:px-4 md:py-2 hover:bg-gray-700 text-left"
          >
            Save As
          </button>
        </div>
      )}
    </div>
  );
};

export default MenuBar;
