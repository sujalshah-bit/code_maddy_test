/* eslint-disable react/prop-types */
// src/components/EditorComponent.jsx
import { Flex, Text } from "@chakra-ui/react";
import Editor from "@monaco-editor/react";
import { useStore, useStoreActions } from "../editorStore";

import { useEditor } from "../Context/EditorContext";
import { useMemo, useRef, useState } from "react";
import useUserActivity from "../hooks/useUserActivity";
import { SocketEvent } from "../types/socket";
import { useSocket } from "../Context/SocketProvider";
import { useUserStore } from "../stores/userStore";
import { useAppStore } from "../stores/appStore";
import { initializeFloatingName } from "../../tooltip";
import { FloatingNameWidget } from '../../tooltip';
import { useDebounce } from "../hooks/useDebounce";
function EditorComponent() {
  const typingTimeoutRef = useRef(null);
  const contentTimeoutRef = useRef(null);
  useUserActivity();
  const { editorRef } = useEditor();
  const { user } = useUserStore();
  const { users } = useAppStore();
  const { files, editor } = useStore();
  const { setEditor } = useStoreActions();
  const { socket } = useSocket();
  const [timeOut, setTimeOut] = useState(setTimeout(() => {}, 0));
  const [cursorPosition, setCursorPosition] = useState({
    lineNumber: 1,
    column: 1,
  });
//   const remoteUser = (
//     () => useAppStore.getState().users.list.filter((u) =>{
//       console.log(u, user)
//       return u.username !== user.username
//     }),
//     [user],
// )
  const [selection, setSelection] = useState(null);

  // Create debounced handlers
  const handleTypingStart = useDebounce((changes, position, selection) => {
    socket.emit(SocketEvent.TYPING_START, {
      changes,
      cursorPosition: position,
      selection: selection,
    });
  }, 100); // 100ms delay for typing status

  const handleContentUpdate = useDebounce((newContent) => {
    socket.emit(SocketEvent.FILE_UPDATED, {
      file: { 
        name: useStore.getState().files.active.name, 
        kind: useStore.getState().files.active.kind 
      },
      newContent,
      roomId: user?.currentRoomId,
    });
  }, 500); // 500ms delay for content updates

  const handleTypingPause = useDebounce(() => {
    socket.emit(SocketEvent.TYPING_PAUSE);
  }, 1000); // 2s delay for typing pause


  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    // initializeFloatingName(editor)
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

    // Track cursor position changes
    editor.onDidChangeCursorPosition((e) => {
      setCursorPosition(e.position);
      // console.log("CURSOR CHANGE:", cursorPosition)
    });

    // Track selection changes
    editor.onDidChangeCursorSelection((e) => {
      // Your existing selection tracking code
  setSelection({
    startLineNumber: e.selection.startLineNumber,
    startColumn: e.selection.startColumn,
    endLineNumber: e.selection.endLineNumber,
    endColumn: e.selection.endColumn,
  });
});
    
    // Content change handling with optimized debouncing
    editor.onDidChangeModelContent((e) => {
      console.log('changed')
      const newContent = editor.getValue();
      setEditor.setContent(newContent);
      socket.emit(SocketEvent.TYPING_START, { cursorPosition });
      socket.emit(SocketEvent.FILE_UPDATED, { 
          file: { name: files.active.name, kind: files.active.kind },
          newContent,
          roomId: user.currentRoomId,
      });
      
      clearTimeout(timeOut);
      setTimeOut(setTimeout(() => socket.emit(SocketEvent.TYPING_PAUSE), 1000));
      
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

  // Optional: Add methods to expose cursor and selection information
  const getCursorInfo = () => ({
    position: cursorPosition,
    selection: selection,
  });

  return (
    <Flex direction="column" height="100%" className="overflow-hidden">
      {files.open.length > 0 &&
      editor.content !== undefined &&
      editor.content !== null ? (
        <div className="flex-1">
          <Editor
            height="100%"
            language={editor.language}
            value={editor.content}
            onMount={handleEditorDidMount}
            onChange={(value) => setEditor.setContent(value)}
            options={{
              // Add these options for better cursor and selection handling
              cursorBlinking: "smooth",
              cursorSmoothCaretAnimation: true,
              selectionHighlight: true,
              occurrencesHighlight: true,
              renderWhitespace: "selection",
            }}
          />
        </div>
      ) : (
        <Flex
          padding={4}
          color="gray.600"
          height="100%"
          fontSize={{ base: "lg", md: "xl", lg: "2xl" }}
          alignItems="center"
          justifyContent="center"
        >
          <Text>Open file to start coding🥰</Text>
        </Flex>
      )}
    </Flex>
  );
}

export default EditorComponent;
