// src/sidebar.jsx
import React from "react";
import { Box, Button, Flex, Text, VStack } from "@chakra-ui/react";
import useStore from "./store";
import { getLanguageFromFileExtension } from "./util/util";

function Sidebar() {
  const {
    fileTree,
    expandedFolders,
    setFileTree,
    setExpandedFolders,
    setCurrentFile,
    setDirectoryHandle,
    setContent,
    setLanguage,
    openFiles,
    setOpenFiles,
    setActiveFile,
  } = useStore((state) => ({
    fileTree: state.fileTree,
    expandedFolders: state.expandedFolders,
    setFileTree: state.setFileTree,
    setCurrentFile: state.setCurrentFile,
    setExpandedFolders: state.setExpandedFolders,
    setDirectoryHandle: state.setDirectoryHandle,
    setContent: state.setContent,
    setLanguage: state.setLanguage,
    openFiles: state.openFiles,
    setOpenFiles: state.setOpenFiles,
    setActiveFile: state.setActiveFile,
  }));

  const openFolder = async () => {
    try {
      const directoryHandle = await window.showDirectoryPicker();
      const fileTree = await readDirectory(directoryHandle);
      setFileTree(fileTree);
      setDirectoryHandle(directoryHandle);
      setContent(null)
      setOpenFiles([])
    } catch (error) {
      console.error("Error opening folder:", error);
    }
  };

  const readDirectory = async (directoryHandle) => {
    const entries = [];
    for await (const entry of directoryHandle.values()) {
      if (entry.kind === "file") {
        entries.push({ name: entry.name, kind: "file", handle: entry });
      } else if (entry.kind === "directory") {
        entries.push({ name: entry.name, kind: "directory", handle: entry, children: [] });
      }
    }
    return entries;
  };

  const toggleFolder = async (node) => {
    if (!expandedFolders[node.name]) {
      const children = await readDirectory(node.handle);
      node.children = children;
      setExpandedFolders({ ...expandedFolders, [node.name]: true });
    } else {
      setExpandedFolders({ ...expandedFolders, [node.name]: false });
    }
    setFileTree([...fileTree]); // Update the fileTree state to trigger re-render
  };

  const renderTree = (nodes) =>
    nodes.map((node, index) => (
      <Box key={index} ml={node.kind === "directory" ? 4 : 8}>
        {node.kind === "directory" ? (
          <>
            <Flex onClick={() => toggleFolder(node)} cursor="pointer" align="center">
              {expandedFolders[node.name] ? "D" : ">" }
              <Text ml={1}>{node.name}</Text>
            </Flex>
            {expandedFolders[node.name] && renderTree(node.children)}
          </>
        ) : (
          <Text cursor="pointer" onClick={() => handleFileClick(node.handle)}>{node.name}</Text>
        )}
      </Box>
    ));

    const handleFileClick = async (fileHandle) => {
      const file = await fileHandle.getFile();
      const text = await file.text();
      setCurrentFile(fileHandle);
      setContent(text);
      const language = getLanguageFromFileExtension(file.name);
      setLanguage(language);
      setActiveFile(fileHandle);
      const fileNames = openFiles.map(file => file.name);
      if (!fileNames.includes(fileHandle.name)) {
        setOpenFiles([...openFiles, fileHandle]);
      }
    };

  return (
    <Box width="200px" bg="gray.700" color="white" padding={2}>
      <Button onClick={openFolder} width="100%">Open Folder</Button>
      <VStack align="start" mt={4}>
        {renderTree(fileTree)}
      </VStack>
    </Box>
  );
}

export default Sidebar;
