/* eslint-disable react/prop-types */
import { useRef, createContext, useContext } from "react";

// Create a context
export const EditorContext = createContext();

// Create a provider component
export const EditorProvider = ({ children }) => {
  const editorRef = useRef(null);

  return (
    <EditorContext.Provider value={{ editorRef }}>
      {children}
    </EditorContext.Provider>
  );
};

// Custom hook to use the context
export const useEditor = () => {
  return useContext(EditorContext);
};