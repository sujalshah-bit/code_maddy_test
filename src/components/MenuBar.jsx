// src/components/MenuBar.jsx

import  { useEffect, useState } from "react";
import { getLanguageFromFileExtension } from "../util/util";
import { useStoreActions, useStore } from "../editorStore";
import { useEditor } from "../Context/EditorContext";

const MenuBar = () => {
  const { editorRef } = useEditor();
  const { files } = useStore();
  const { setFiles, setEditor } = useStoreActions();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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
    closeMenu()
  };

  const saveFile = async () => {
    if (files.current) {
      const writable = await files.current.createWritable();
      console.log(files.current)
      await writable.write(editorRef.current.getValue());
      await writable.close();
    } else {
      saveFileAs();
    }
    closeMenu()
  };

  const saveFileAs = async () => {
    try {
      const newFileHandle = await window.showSaveFilePicker();
      const writable = await newFileHandle.createWritable();
      await writable.write(editorRef.current.getValue());
      await writable.close();
      setFiles.setCurrent(newFileHandle);
    } catch (error) {
      console.error("Error saving file:", error);
    }
    closeMenu()
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
      setFiles.setOpen([]);
    } catch (error) {
      console.error("Error opening folder:", error);
    }
    closeMenu()
  };

  const toggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  // Inside your MenuBar component
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Ensure clicks inside the menu don't close it
      if (isMenuOpen && !event.target.closest(".menu") && !event.target.closest(".menu-item")) {
        closeMenu();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <div className="w-full flex bg-gray-900 text-white relative">
      <img
        src="https://placehold.co/20"
        className="mx-2"
        width={20}
        height={10}
        alt=""
      />
      <div className="p-2 w-96 text-gray-400">
        <button
          onClick={toggleMenu}
          className="hover:bg-white hover:bg-opacity-25 rounded w-10 outline-none hover:text-white"
        >
          File
        </button>

        {isMenuOpen && (
          <div className="absolute top-full left-15 mt-2 bg-gray-800 rounded shadow-lg z-10">
            <div className="flex flex-col">
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
              <div className="border-t border-gray-700" />
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
        )}
      </div>
    </div>
  );
};

export default MenuBar;
