// src/sidebar.jsx
import { useEffect, useState } from "react";
import { useStore, useStoreActions } from "./editorStore";
import { getLanguageFromFileExtension } from "./util/util";
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

function Sidebar() {
  const { files, folders, editor } = useStore();
  const { setFiles, setEditor, setFolders } = useStoreActions();
  const [parentFolder, setParentFolder] = useState(null);
  const [rootHandler, setRootHandler] = useState(null);
  const [contextMenu, setContextMenu] = useState({
    visible: false,
    x: 0,
    y: 0,
    node: null, // to track which node was right-clicked
  });

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

  const addNewFile = async () => {
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
        node: parentFolder,
        action: "ADD_NEW_FILE",
        fileHandle: newFileHandle,
      };
      console.log(addNewFileObj);
      updateTree(addNewFileObj);
      await handleFileClick(newFileHandle);
      console.log("New file created:", fileName);
    } catch (error) {
      console.error("Error creating new file:", error);
      alert("Failed to create new file. Please try again.");
    }
  };

  const addNewFolder = async () => {
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

      // Update the file tree
      const updateTreeWithNewFolder = (tree) => {
        return tree.map((node) => {
          if (node === parentFolder) {
            return { ...node, children: [...(node.children || []), newFolder] };
          } else if (node.children) {
            return {
              ...node,
              children: updateTreeWithNewFolder(node.children),
            };
          }
          return node;
        });
      };

      const updatedTree = updateTreeWithNewFolder(files.tree);
      setFiles.setTree(updatedTree);

      // Expand the parent folder
      // toggleFolder(parentFolder)
      console.log("New file created:", newFolder);
      // setFolders.setExpanded({ ...folders.expanded, [parentFolder.name]: true });
    } catch (error) {
      console.error("Error creating new folder:", error);
      alert("Failed to create new folder. Please try again.");
    }
  };

  const updateTree = ({ file, node, action, fileHandle }) => {
    if (!files.tree.length) {
      console.error("No directory loaded");
      return;
    }
    let updateTreeWithChildren;
    if (action === "rename") {
      updateTreeWithChildren = (tree) => {
        return tree.map((n) => {
          if (n.name === node.name && n.kind === "file") {
            return { ...n, name: file }; // Update the current node with new children
          } else if (n.children) {
            // If this is a directory, recursively check its children
            return { ...n, children: updateTreeWithChildren(n.children) };
          }
          return n; // Return the node as-is if it's not the one to update
        });
      };
    } else {
      if (!fileHandle) return;
      updateTreeWithChildren = (tree) => {
        console.log({ file, node });
        return tree.map((n) => {
          if (n.name === node.name && n.kind === "directory") {
            console.log(n);
            return { ...n, children: [...n.children, fileHandle] };
          } else if (n.children) {
            // If this is a directory, recursively check its children
            return { ...n, children: updateTreeWithChildren(n.children) };
          }
          return n; // Return the node as-is if it's not the one to update
        });
      };
    }

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

  const handleFileClick = async (fileHandle) => {
    console.dir(files.tree);
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
  };

  const renameFile = async (node) => {
    const renameFile = prompt("Enter the rename file name:");
    if (!renameFile) {
      console.error("No file name provided.");
      return;
    }
    if (renameFile.trim() === node.name) {
      console.log("File is already of same name");
      return;
    }

    try {
      // Create the new file
      await node.handle.move(renameFile);
      const updateRename = {
        file: renameFile,
        node,
        action: "rename",
      };
      updateTree(updateRename);

      // await refreshExplorer();

      console.log("rename file created:", renameFile);
    } catch (error) {
      console.error("Error creating new file:", error);
      alert("Failed to create new file. Please try again.");
    }
  };

  const handleContextMenuAction = async (action) => {
    switch (action) {
      case "newFile":
        // Add logic to create a new file inside the right-clicked folder
        await addNewFile();
        break;
      case "newFolder":
        // Add logic to create a new folder inside the right-clicked folder
        await addNewFolder();
        break;
      case "rename":
        // Add logic to rename the file/folder
        await renameFile(contextMenu.node);
        break;
      default:
        break;
    }
    setContextMenu({ visible: false, x: 0, y: 0, node: null }); // Close the context menu
  };

  const ContextMenu = ({ x, y, onAction }) => (
    <div
      style={{ top: y, left: x, position: "absolute", zIndex: 1000 }}
      className="bg-gray-800 text-gray-300 shadow-lg rounded-md py-1 w-48"
    >
      {contextMenu.node.kind === "file" ? null : (
        <>
          <div
            onClick={() => onAction("newFile")}
            className="px-4 py-2 hover:bg-gray-700"
          >
            New File
          </div>
          <div
            onClick={() => onAction("newFolder")}
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
      {nodes.map((node, index) => (
        <li
          key={index}
          className={`my-2 ${node.kind === "directory" ? "ml-4" : "ml-9"}`}
        >
          <div
            className="flex items-center space-x-1 cursor-pointer"
            onClick={(e) => {
              e.preventDefault();
              if (node.kind === "directory") {
                setParentFolder(node);
                setRootHandler(null);
                toggleFolder(node);
              } else {
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
                node: node, // Keep track of the clicked node
              });
            }}
          >
            {node.kind === "directory" ? (
              <>
                {folders.expanded[node.name] ? (
                  <>
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                    <FolderOpen className="w-4 h-4 text-blue-400" />
                  </>
                ) : (
                  <>
                    <ChevronRight className="w-4 h-4 text-gray-500" />
                    <Folder className="w-4 h-4 text-blue-400" />
                  </>
                )}
              </>
            ) : (
              getFileIcon(node.name)
            )}
            <span className="text-sm text-gray-300 truncate">{node.name}</span>
          </div>
          {node.kind === "directory" &&
            node.children &&
            folders.expanded[node.name] &&
            renderTree(node.children, level + 1)}
        </li>
      ))}
    </ul>
  );

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
    console.dir(parentFolder);
  }, [parentFolder]);

  return (
    <div className="min-w-64 h-[680px] bg-gray-900 text-white p-4 ">
      <h2 className="text-xl font-semibold mb-4">
        Project Explorer
        {editor.directoryHandle && (
          <div
            onClick={(e) => {
              e.preventDefault();
              setRootHandler(editor.directoryHandle);
              setParentFolder(null);
            }}
            className="cursor-pointer"
          >
            {editor.directoryHandle.name}
          </div>
        )}
        <div className="ml-auto flex space-x-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              addNewFile();
            }}
            className="p-1 hover:bg-gray-700 rounded"
          >
            <Plus className="w-3 h-3 text-gray-400" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              addNewFolder();
            }}
            className="p-1 hover:bg-gray-700 rounded"
          >
            <Folder className="w-3 h-3 text-gray-400" />
          </button>
        </div>
      </h2>
      <div className="min-w-60  h-[550px] overflow-y-auto">
        {files.tree.length > 0 && renderTree(files.tree)}
        {contextMenu.visible && (
          <ContextMenu
            x={contextMenu.x}
            y={contextMenu.y}
            onAction={handleContextMenuAction}
          />
        )}
      </div>
    </div>
  );
}

export default Sidebar;
