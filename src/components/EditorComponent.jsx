// src/components/EditorComponent.jsx
import React, { useRef } from "react";
import { Box, Button, Center, Flex, Text } from "@chakra-ui/react";
import Editor from "@monaco-editor/react";
import useStore from "../store";
import Tabs from "./Tab";
import { getLanguageFromFileExtension } from "../util/util";

function EditorComponent({activefiles , updateFile}) {
  const editorRef = useRef(null);
  const {
    currentFile,
    content,
    setCurrentFile,
    setContent,
    setLanguage,
    language,
    openFiles,
    setOpenFiles,
    setActiveFile,
  } = useStore((state) => ({
    currentFile: state.currentFile,
    content: state.content,
    setCurrentFile: state.setCurrentFile,
    setContent: state.setContent,
    setLanguage: state.setLanguage,
    language: state.language,
    setOpenFiles: state.setOpenFiles,
    setActiveFile: state.setActiveFile,
  }));

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monaco.editor.defineTheme("dark-theme", {
      base: "vs-dark",
      inherit: true,
      rules: [
        { token: "", foreground: "d4d4d4" },
        { token: "invalid", foreground: "ff3333" },
        { token: "emphasis", fontStyle: "italic" },
        { token: "strong", fontStyle: "bold" },
        { token: "variable", foreground: "abb0b6" },
        { token: "variable.predefined", foreground: "abb0b6" },
        { token: "constant", foreground: "f08c36" },
        { token: "comment", foreground: "6a9955", fontStyle: "italic" },
        { token: "number", foreground: "b5cea8" },
        { token: "number.hex", foreground: "b5cea8" },
        { token: "regexp", foreground: "4dbf99" },
        { token: "annotation", foreground: "9b9b9b" },
        { token: "type", foreground: "9b9b9b" },
        { token: "delimiter", foreground: "abb0b6" },
        { token: "delimiter.html", foreground: "abb0b6" },
        { token: "delimiter.xml", foreground: "abb0b6" },
        { token: "tag", foreground: "ce9178" },
        { token: "tag.id.jade", foreground: "ce9178" },
        { token: "tag.class.jade", foreground: "ce9178" },
        { token: "meta.scss", foreground: "ce9178" },
        { token: "metatag", foreground: "ce9178" },
        { token: "metatag.content.html", foreground: "86b300" },
        { token: "metatag.html", foreground: "ce9178" },
        { token: "metatag.xml", foreground: "ce9178" },
        { token: "metatag.php", fontStyle: "bold" },
        { token: "key", foreground: "9b9b9b" },
        { token: "string.key.json", foreground: "9b9b9b" },
        { token: "string.value.json", foreground: "86b300" },
        { token: "attribute.name", foreground: "f08c36" },
        { token: "attribute.value", foreground: "0451A5" },
        { token: "attribute.value.number", foreground: "abb0b6" },
        { token: "attribute.value.unit", foreground: "86b300" },
        { token: "attribute.value.html", foreground: "86b300" },
        { token: "attribute.value.xml", foreground: "86b300" },
        { token: "string", foreground: "86b300" },
        { token: "string.html", foreground: "86b300" },
        { token: "string.sql", foreground: "86b300" },
        { token: "string.yaml", foreground: "86b300" },
        { token: "keyword", foreground: "c586c0" },
        { token: "keyword.json", foreground: "c586c0" },
        { token: "keyword.flow", foreground: "c586c0" },
        { token: "keyword.flow.scss", foreground: "c586c0" },
        { token: "operator.scss", foreground: "778899" },
        { token: "operator.sql", foreground: "778899" },
        { token: "operator.swift", foreground: "778899" },
        { token: "predefined.sql", foreground: "FF00FF" },
      ],
      colors: {
        "editor.background": "#1e1e1e",
        "editor.foreground": "#d4d4d4",
        "editorIndentGuide.background": "#404040",
        "editorIndentGuide.activeBackground": "#707070",
      },
    });

    monaco.editor.setTheme("dark-theme");

    // Set TypeScript compiler options
    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      target: monaco.languages.typescript.ScriptTarget.ESNext,
      module: monaco.languages.typescript.ModuleKind.ESNext,
    });

    // Add additional configurations if needed
    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
    });
  };

  const openFile = async () => {
    try {
      const [fileHandle] = await window.showOpenFilePicker();
      const file = await fileHandle.getFile();
      const text = await file.text();
      const language = getLanguageFromFileExtension(file.name);

      setCurrentFile(fileHandle);
      setContent(text);
      setLanguage(language);
      setActiveFile(fileHandle);

      if (openFiles) {
        const fileNames = openFiles.map((file) => file.name);
        if (!fileNames.includes(fileHandle.name)) {
          setOpenFiles([...openFiles, fileHandle]);
        }
      } else {
        setOpenFiles([fileHandle]);
      }
      if (editorRef.current) {
        editorRef.current.setValue(text);
      }
    } catch (error) {
      console.error("Error opening file:", error);
    }
  };

  const saveFile = async () => {
    if (currentFile) {
      const writable = await currentFile.createWritable();
      await writable.write(editorRef.current.getValue());
      await writable.close();
    } else {
      saveFileAs();
    }
  };

  const saveFileAs = async () => {
    try {
      const newFileHandle = await window.showSaveFilePicker();
      const writable = await newFileHandle.createWritable();
      await writable.write(editorRef.current.getValue());
      await writable.close();
      setCurrentFile(newFileHandle);
    } catch (error) {
      console.error("Error saving file:", error);
    }
  };

  return (
    <Flex direction="column" height="100vh">
      <Flex bg="gray.800" color="white" padding={2}>
        <Button onClick={openFile}>Open File</Button>
        <Button onClick={saveFile}>Save</Button>
        <Button onClick={saveFileAs}>Save As</Button>

        <Tabs updateFile={updateFile}  activefiles={activefiles} />
      </Flex>
      {content ? (
        <Editor
          height="90vh"
          // theme="vs-dark"
          language={language} // Use the language from the store
          value={content}
          onMount={handleEditorDidMount}
          onChange={(value) => setContent(value)}
        />
      ) : (
        <Flex
          padding={4}
          color={"gray.600"}
          height="100vh"
          fontSize={"xx-large"}
          alignItems={"center"}
          justifyContent={"center"}
        >
          <Text>Open file to start coding🥰</Text>
        </Flex>
      )}
    </Flex>
  );
}

export default EditorComponent;
