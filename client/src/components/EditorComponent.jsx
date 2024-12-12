/* eslint-disable react/prop-types */
// src/components/EditorComponent.jsx
import { Flex, Text } from "@chakra-ui/react";
import Editor from "@monaco-editor/react";
import { useStore, useStoreActions } from "../editorStore";

import { useEditor } from "../Context/EditorContext";

function EditorComponent() {
  const { editorRef } = useEditor();
  const { files, editor } = useStore();
  const { setEditor } = useStoreActions();

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
