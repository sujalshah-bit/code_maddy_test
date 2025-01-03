// src/sidebar.jsx
import { useEffect, useState, useRef, useMemo } from "react";
import { useStore, useStoreActions } from "../editorStore";
import { getLanguageFromFileExtension } from "../util/util";
import {
  Braces,
  ChevronDown,
  ChevronRight,
  Code,
  Database,
  File,
  FolderOpen,
  FileImage,
  Folder,
  Music,
  Plus,
  Video,
} from "lucide-react";
import { useSocket } from "../Context/SocketProvider";
import { SocketEvent } from "../types/socket";
import { useUserStore } from "../stores/userStore";
import { useAppStore } from "../stores/appStore";

function Sidebar() {
  const { files, folders, editor, ui } = useStore();
  const { socket } = useSocket();
  const { user } = useUserStore();
  const { users } = useAppStore();
  const { setFiles, setEditor, setFolders } = useStoreActions();
  const [parentFolder, setParentFolder] = useState(null);
  const [rootHandler, setRootHandler] = useState(null);
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    node: null, // to track which node was right-clicked
  });
  const [isResizing, setIsResizing] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(256); // 16rem = 256px
  const sidebarRef = useRef(null);
  const MIN_WIDTH = 160; // 10rem
  const MAX_WIDTH = 480; // 30rem

  const getFileIcon = (fileName) => {
    const extension = fileName.split(".").pop()?.toLowerCase();
    switch (extension) {
      case "html":
      case "css":
      case "js":
      case "ts":
      case "jsx":
      case "tsx":
        return <Code className="w-[20px] h-4 text-yellow-400" />;
      case "png":
      case "jpg":
      case "jpeg":
      case "gif":
      case "svg":
        return <FileImage className="w-4 h-4 text-green-400" />;
      case "mp3":
      case "wav":
        return <Music className="w-4 h-4 text-purple-400" />;
      case "mp4":
      case "mov":
        return <Video className="w-4 h-4 text-red-400" />;
      case "json":
      case "xml":
        return <Braces className="w-4 h-4 text-yellow-500" />;
      case "sqlite":
      case "SQL":
        return <Database className="w-4 h-4  text-blue-400" />;
      case "md":
        return <File className="w-4 h-4  text-[#493628]" />;
      default:
        return <File className="w-4 h-4 text-gray-400" />;
    }
  };

  const addNewFile = async (isRootNode) => {
    if (!parentFolder && !rootHandler) {
      console.error("Parent folder is not selected.");
      return;
    }

    const fileName = prompt("Enter the new file name:");
    if (!fileName) {
      console.error("No file name provided.");
      return;
    }

    // Check permission to write
    const permissionGranted = await verifyPermission(
      parentFolder ? parentFolder.handle : rootHandler,
      true
    );
    if (!permissionGranted) {
      alert("Permission to write to the folder was denied.");
      return;
    }

    try {
      // Create the new file
      const newFileHandle = await (parentFolder
        ? parentFolder.handle
        : rootHandler
      ).getFileHandle(fileName, { create: true });
      console.log(newFileHandle);
      const addNewFileObj = {
        file: fileName,
        parentNode: parentFolder|| rootHandler,
        action: "ADD_NEW_FILE",
        fileHandle: newFileHandle,
      };
      console.log(addNewFileObj);
      updateTree(addNewFileObj,isRootNode);
      await handleFileClick(newFileHandle);
      console.log("New file created:", fileName);
    } catch (error) {
      console.error("Error creating new file:", error);
      alert("Failed to create new file. Please try again.");
    }
  };

  const addNewFolder = async (isRootNode) => {
    if (!parentFolder && !rootHandler) {
      console.error("Parent folder is not selected.");
      return;
    }
    const folderName = prompt("Enter the new folder name:");
    if (!folderName) return;

    try {
      const newFolderHandle = await (parentFolder
        ? parentFolder.handle
        : rootHandler
      ).getDirectoryHandle(folderName, { create: true });
      const newFolder = {
        name: folderName,
        kind: "directory",
        handle: newFolderHandle,
        children: [],
      };

      updateTree({
        parentNode: parentFolder|| rootHandler,
        action: "ADD_NEW_FOLDER",
        newFolder,
      },isRootNode);

      console.log("New Folder created:", newFolder);
    } catch (error) {
      console.error("Error creating new folder:", error);
      alert("Failed to create new folder. Please try again.");
    }
  };

  const updateTree = ({ file, parentNode, action, fileHandle, newFolder },isRootNode) => {
    if (!files.tree.length) {
      console.error("No directory loaded");
      return;
    }
    let updateTreeWithChildren;
    if (action === "ADD_NEW_FILE") {
      if (!fileHandle) return;
      updateTreeWithChildren = (tree) => {
        if(isRootNode){
          const currentChildren = tree;
          const files = currentChildren.filter((child) => child.kind === "file")
          const directories = currentChildren.filter((child) => child.kind === "directory")
          files.push({ kind: "file", name: file, handle: fileHandle });
          console.log(files);
          files.sort((a, b) => a.name.localeCompare(b.name))
          return [...directories, ...files];
        }
        return tree.map((n) => {
          if (n.name === parentNode.name && n.kind === "directory") {
            const currentChildren = [...n.children];
            const files = currentChildren.filter((child) => child.kind === "file")
            const directories = currentChildren.filter((child) => child.kind === "directory")

            files.push({ kind: "file", name: file, handle: fileHandle });
            files.sort((a, b) => a.name.localeCompare(b.name))
            return {
              ...n,
              children: [...directories, ...files],
            };
          } else if (n.children) {
            // If this is a directory, recursively check its children
            return { ...n, children: updateTreeWithChildren(n.children) };
          }
          return n; // Return the node as-is if it's not the one to update
        });
      };
    }else{
      // Update the file tree
      updateTreeWithChildren = (tree) => {
        if(isRootNode){
          const currentChildren = tree;
          const files = currentChildren.filter((child) => child.kind === "file")
          const directories = currentChildren.filter((child) => child.kind === "directory")
          directories.push(newFolder);
          directories.sort((a, b) => a.name.localeCompare(b.name))
          return [...directories, ...files];
        }
        return tree.map((node) => {
          if (node === parentNode) {
            const currentChildren = [...(node.children || [])];
            const files = currentChildren.filter((child) => child.kind === "file")
            const directories = currentChildren.filter((child) => child.kind === "directory")

            directories.push(newFolder);
            directories.sort((a, b) => a.name.localeCompare(b.name))

            return { ...node, children: [...directories, ...files] };
          } else if (node.children) {
            return {
              ...node,
              children: updateTreeWithChildren(node.children),
            };
          }
          return node;
        });
      };
    }
    console.log(files.tree);

    const updateTreeStructure = updateTreeWithChildren(files.tree);
    setFiles.setTree(updateTreeStructure);
  };

  async function verifyPermission(fileHandle, withWrite) {
    const opts = {};
    if (withWrite) {
      opts.mode = "readwrite";
    }

    // Check if the fileHandle is for a directory
    if (fileHandle.kind === "directory") {
      // Directories do not support queryPermission/requestPermission
      console.log(
        "Directory handle does not support permission query. Skipping permission check."
      );
      return true;
    }

    // Check if we already have permission for files
    if (
      typeof fileHandle.queryPermission === "function" &&
      (await fileHandle.queryPermission(opts)) === "granted"
    ) {
      return true;
    }

    // Request permission to the file
    if (
      typeof fileHandle.requestPermission === "function" &&
      (await fileHandle.requestPermission(opts)) === "granted"
    ) {
      return true;
    }

    // The user did not grant permission
    return false;
  }

  const readDirectory = async (directoryHandle, is_array = false) => {
    const directories = [];
    const files = [];
    console.log(is_array ? directoryHandle : null);

    for await (const entry of is_array
      ? directoryHandle
      : directoryHandle.values()) {
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

    // Combine sorted directories and files
    return [...directories, ...files];
  };

  const toggleFolder = async (node, is_array) => {
    const newExpandedState = { ...folders.expanded };

    if (!newExpandedState[node.name]) {
      // If the folder is not expanded, expand it and load its children
      const children = await readDirectory(node.handle, is_array);

      // Recursively update the tree to find the correct node to expand
      const updateTreeWithChildren = (tree) => {
        return tree.map((n) => {
          if (n.name === node.name && n.kind === "directory") {
            return { ...n, children }; // Update the current node with new children
          } else if (n.children) {
            // If this is a directory, recursively check its children
            return { ...n, children: updateTreeWithChildren(n.children) };
          }
          return n; // Return the node as-is if it's not the one to update
        });
      };

      const updatedTree = updateTreeWithChildren(files.tree);
      setFiles.setTree(updatedTree);
    } else {
      // If collapsing a folder, recursively collapse all its children
      const collapseChildren = (tree) => {
        return tree.reduce((acc, n) => {
          if (n.kind === "directory") {
            acc[n.name] = false; // Collapse the folder
            if (n.children) {
              return { ...acc, ...collapseChildren(n.children) }; // Recursively collapse subfolders
            }
          }
          return acc;
        }, {});
      };

      const collapsedChildrenState = collapseChildren(node.children || []);
      // Merge collapsed children state into the existing expanded state
      Object.assign(newExpandedState, collapsedChildrenState);
    }

    // Toggle the expanded state of the current folder
    newExpandedState[node.name] = !newExpandedState[node.name];
    setFolders.setExpanded(newExpandedState);
  };

  const serializableOpenFiles = (file) => {
    // Filter out the file you want to skip and then map
    return files.open
        .filter((fileHandle) => fileHandle.name !== file.name) // Exclude the file with the same name
        .map((fileHandle) => ({
            name: fileHandle.name, // The name of the file
            kind: fileHandle.kind  // The kind of the file
        }));
};

const serializableActiveFile = useMemo(() => 
    files.active
        ? { name: files.active.name, kind: files.active.kind }
        : null, 
    [files.active]
);

  const handleFileClick = async (fileHandle) => {
    const file = await fileHandle.getFile();
    const text = await file.text();
    setFiles.setCurrent(fileHandle);
    setEditor.setContent(text);
    const language = getLanguageFromFileExtension(file.name);
    setEditor.setLanguage(language);
    setFiles.setActive(fileHandle);
    const fileNames = files.open.map((file) => file.name);
    if (!fileNames.includes(fileHandle.name)) {
      setFiles.setOpen([...files.open, fileHandle]);
    }
   if(users.list.length > 1){
    const file = { name: fileHandle.name, kind: fileHandle.kind };
    console.log(serializableOpenFiles(file))
    socket.emit(SocketEvent.RESYNC_FILE_STRUCTURE, {
      openFiles: [...serializableOpenFiles(file), file],
      activeFile: { name: fileHandle.name, kind: fileHandle.kind },
      roomId: user.currentRoomId,
  });
   }
  };

  const handleContextMenuAction = async (action, isRootNode) => {
    switch (action) {
      case "newFile":
        // Add logic to create a new file inside the right-clicked folder
        await addNewFile(isRootNode);
        break;
      case "newFolder":
        // Add logic to create a new folder inside the right-clicked folder
        await addNewFolder(isRootNode);
        break;
      default:
        break;
    }
    setContextMenu({ visible: false, x: 0, y: 0, node: null }); // Close the context menu
  };

  const ContextMenu = ({ x, y, onAction, isRootNode }) => (
    <div
      style={{ top: y, left: x, position: "absolute", zIndex: 1000 }}
      className="bg-gray-800 text-gray-300 shadow-lg rounded-md py-1 w-48"
    >
      {contextMenu.node.kind === "file" ? null : (
        <>
          <div
            onClick={() => onAction("newFile", isRootNode)}
            className="px-4 py-2 hover:bg-gray-700"
          >
            New File
          </div>
          <div
            onClick={() => onAction("newFolder", isRootNode)}
            className="px-4 py-2 hover:bg-gray-700"
          >
            New Folder
          </div>
        </>
      )}
      {contextMenu.node.kind === "file" ? (
        <div
          onClick={() => onAction("rename")}
          className="px-4 py-2 hover:bg-gray-700"
        >
          Rename
        </div>
      ) : null}
    </div>
  );

  const renderTree = (nodes, level = 0) => (
    <ul>
      {nodes.map((node, index) => {
        const isCurrentFile = node.kind === "file" && files.current?.name === node.name;
        
        return (
          <li
            key={index}
            className={`my-2 ${node.kind === "directory" ? "ml-4" : "ml-9"}`}
          >
            <div
              data-file-name={node.name}
              className={`flex items-center space-x-1 cursor-pointer group
                ${isCurrentFile && files.open.length > 1 ? 'bg-blue-500/20 text-blue-400' : 'hover:bg-gray-800'}
                transition-colors duration-150 ease-in-out`}
              onClick={(e) => {
                e.preventDefault();
                if (node.kind === "directory") {
                  setParentFolder(node);
                  setRootHandler(null);
                  toggleFolder(node);
                } else {
                  console.log('file clicked')
                  handleFileClick(node.handle);
                }
              }}
              onContextMenu={(e) => {
                e.preventDefault();
                setParentFolder(node);
                setRootHandler(null);
                setContextMenu({
                  visible: true,
                  x: e.pageX,
                  y: e.pageY,
                  node: node,
                  isRootNode: false,
                });
              }}
            >
              {node.kind === "directory" ? (
                <>
                  {folders.expanded[node.name] ? (
                    <>
                      <ChevronDown className="w-4 h-4 text-gray-500 group-hover:text-gray-400" />
                      <FolderOpen className="w-4 h-4 text-blue-400 group-hover:text-blue-300" />
                    </>
                  ) : (
                    <>
                      <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-gray-400" />
                      <Folder className="w-4 h-4 text-blue-400 group-hover:text-blue-300" />
                    </>
                  )}
                </>
              ) : (
                <span>
                  {getFileIcon(node.name)}
                </span>
              )}
              <span className={`text-sm truncate ${
                isCurrentFile && files.open.length >= 1 ? 'text-blue-400 font-medium' : 'text-gray-300'
              }`}>
                {node.name}
              </span>
            </div>
            {node.kind === "directory" &&
              node.children &&
              folders.expanded[node.name] &&
              renderTree(node.children, level + 1)}
          </li>
        );
      })}
    </ul>
  );

  useEffect(() => {
    console.log(files.open);
  }, [files.open]);

  useEffect(() => {
    const handleClickOutside = () => {
      if (contextMenu.visible) {
        setContextMenu({ visible: false, x: 0, y: 0, node: null });
      }
    };

    window.addEventListener("click", handleClickOutside);

    return () => window.removeEventListener("click", handleClickOutside);
  }, [contextMenu]);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;

      const newWidth = e.clientX;
      if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH) {
        setSidebarWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);


  if (!ui.panel.folder) return null;

  return (
    <div
      ref={sidebarRef}
      style={{ width: sidebarWidth }}
      className={`h-full bg-gray-900 text-white flex flex-col overflow-hidden relative transition-all duration-200 border border-gray-800 ${
        ui.panel.folder ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="p-4 flex-1 overflow-y-auto scrollbar-thin">
        <h2 className="text-xl font-semibold mb-4 flex items-center justify-between">
          <span className="truncate">Project Explorer</span>
          {editor.directoryHandle && (
            <div className="flex space-x-1 ml-2 flex-shrink-0">
              <button
                title="Add a new file"
                onClick={(e) => {
                  e.stopPropagation();
                  addNewFile();
                }}
                className="p-1 hover:bg-gray-700 rounded"
              >
                <Plus className="w-4 h-4 text-gray-400" />
              </button>
              <button
                title="Add a new folder"
                onClick={(e) => {
                  e.stopPropagation();
                  addNewFolder();
                }}
                className="p-1 hover:bg-gray-700 rounded"
              >
                <Folder className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          )}
        </h2>

        {editor.directoryHandle && (
          <h2
            onClick={(e) => {
              e.preventDefault();
              setRootHandler(editor.directoryHandle);
              setParentFolder(null);

            }}
            onContextMenu={(e) => {
              e.preventDefault();
              setParentFolder(null);
              setRootHandler(editor.directoryHandle);
              setContextMenu({
                visible: true,
                x: e.pageX,
                y: e.pageY,
                node: editor.directoryHandle,
                isRootNode: true,
              });
            }}
            className="cursor-pointer "
          >
            {editor.directoryHandle.name}
          </h2>
        )}
        <div className="flex-1 overflow-y-auto">
          {files.tree.length > 0 && renderTree(files.tree)}
          {contextMenu.visible && (
            <ContextMenu
              x={contextMenu.x}
              y={contextMenu.y}
              onAction={handleContextMenuAction}
              isRootNode={contextMenu.isRootNode}
            />
          )}
        </div>
      </div>

      <div
        className="absolute right-0 top-0 bottom-0 w-1 cursor-ew-resize hover:bg-blue-500 opacity-0 hover:opacity-100 "
        onMouseDown={(e) => {
          e.preventDefault();
          setIsResizing(true);
        }}
      />
    </div>
  );
}

export default Sidebar;
