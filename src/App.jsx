// src/App.jsx
import React, { useState } from "react";
import { Box, Flex } from "@chakra-ui/react";
import EditorComponent from "./components/EditorComponent";
import Sidebar from "./sidebar";

function App() {
  const [activefiles, setActivefiles] = useState([]);

  const updateFile = (file) => {
    const filterFiles = activefiles.filter((elm) => elm.name !== file.name);
    filterFiles.push(file);
    setActivefiles(filterFiles);
  };

  return (
    <Flex>
      <Sidebar activefiles={activefiles} updateFile={updateFile} />
      <Box flex="1">
        <EditorComponent activefiles={activefiles} updateFile={updateFile} />
      </Box>
    </Flex>
  );
}

export default App;
