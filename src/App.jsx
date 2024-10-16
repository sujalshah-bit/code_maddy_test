// src/App.jsx
import { Box,  } from "@chakra-ui/react";
import EditorComponent from "./components/EditorComponent";
import Sidebar from "./sidebar";
import { EditorProvider } from "./Context/EditorContext";
import MenuBar from "./components/MenuBar";

function App() {
  return (
    <EditorProvider >
      <div className="overflow-hidden">
      <MenuBar />
      <div className="flex overflow-hidden">
        <Sidebar />
        <Box flex="1">
          <EditorComponent />
        </Box>
      </div>
      </div>
    </EditorProvider>
  );
}

export default App;
