import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css"; // Import Tailwind CSS file
import theme from "./theme.js";
import { ChakraProvider } from "@chakra-ui/react";
import { SocketProvider } from "./Context/SocketProvider";
import { FileProvider } from "./Context/FileContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <SocketProvider>
        <FileProvider>
          <App />
        </FileProvider>
      </SocketProvider>
    </ChakraProvider>
  </React.StrictMode>
);
