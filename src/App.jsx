// src/App.jsx
import { Box,  } from "@chakra-ui/react";
import EditorComponent from "./components/EditorComponent";
import Sidebar from "./sidebar";
import { EditorProvider } from "./Context/EditorContext";
import MenuBar from "./components/MenuBar";
import Component from "./components/RightSidebar";
import ActivityBar from "./components/ActivityBar";
import Tabs from "./components/Tab";

function App() {
  return (
    <EditorProvider>
      <div className="h-screen flex flex-col overflow-hidden">
        <MenuBar />
        <div className="flex-1 flex overflow-hidden">
          <ActivityBar />
          <Sidebar />
          <div className="flex-1 flex flex-col overflow-hidden min-w-0 bg-gray-900">
            <Tabs />
            <EditorComponent />
          </div>
        </div>
      </div>
    </EditorProvider>
  );
}

export default App;
